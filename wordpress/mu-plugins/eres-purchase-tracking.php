<?php
/**
 * Plugin Name: ERES · Evento de compra
 * Description: Entrega a /gracias del sitio en Astro los datos de un pedido pagado para que el navegador envíe Purchase (Meta) y purchase (GA4) una sola vez, con el mismo event_id que el CAPI de Meta for WooCommerce. Además retrasa ese CAPI hasta que el pedido está pagado.
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_PURCHASE_PAID_STATUSES = ['processing', 'completed'];
const ERES_PURCHASE_BROWSER_TRACKED_META = '_eres_purchase_tracked_browser';
// Metas de Meta for WooCommerce y de Google Analytics for WooCommerce: compartirlos es lo que deduplica.
const ERES_META_EVENT_ID_META = '_meta_event_id';
const ERES_META_BROWSER_TRACKED_META = '_meta_purchase_tracked_browser';
const ERES_GA_TRACKED_META = '_ga_tracked';
const ERES_META_UNPAID_PURCHASE_HOOKS = [
    'woocommerce_new_order' => 10,
    'woocommerce_process_shop_order_meta' => 20,
    'woocommerce_checkout_update_order_meta' => 30,
];

add_action('wp_loaded', 'eres_purchase_send_meta_capi_when_paid');
add_action('rest_api_init', 'eres_purchase_register_route');

// Meta for WooCommerce manda el CAPI al crear el pedido, todavía en "pending": un pago rechazado contaría como compra.
function eres_purchase_send_meta_capi_when_paid(): void
{
    $tracker = eres_purchase_meta_events_tracker();
    if ($tracker === null) {
        return;
    }

    foreach (ERES_META_UNPAID_PURCHASE_HOOKS as $hook => $priority) {
        remove_action($hook, [$tracker, 'inject_purchase_event'], $priority);
    }
    foreach (ERES_PURCHASE_PAID_STATUSES as $paid_status) {
        add_action("woocommerce_order_status_{$paid_status}", [$tracker, 'inject_purchase_event'], 10, 1);
    }
}

// El plugin guarda el tracker en una propiedad privada: se recupera desde el hook que registra.
function eres_purchase_meta_events_tracker(): ?object
{
    $hook = $GLOBALS['wp_filter']['woocommerce_new_order'] ?? null;
    if (!$hook instanceof WP_Hook) {
        return null;
    }

    foreach ($hook->callbacks as $callbacks) {
        foreach ($callbacks as $callback) {
            $function = $callback['function'];
            if (
                is_array($function)
                && $function[0] instanceof WC_Facebookcommerce_EventsTracker
                && $function[1] === 'inject_purchase_event'
            ) {
                return $function[0];
            }
        }
    }

    return null;
}

function eres_purchase_register_route(): void
{
    register_rest_route('eres/v1', '/order-tracking', [
        'methods' => 'POST',
        'callback' => 'eres_purchase_order_tracking',
        'permission_callback' => '__return_true',
        'args' => [
            'key' => ['type' => 'string', 'required' => true],
        ],
    ]);
}

function eres_purchase_order_tracking(WP_REST_Request $request)
{
    $order = eres_purchase_order_by_key(wc_clean((string)$request->get_param('key')));
    if ($order === null) {
        return new WP_Error('eres_order_not_found', 'Pedido no encontrado.', ['status' => 404]);
    }

    if (!$order->has_status(ERES_PURCHASE_PAID_STATUSES) || $order->get_meta(ERES_PURCHASE_BROWSER_TRACKED_META) === '1') {
        return ['track' => false, 'purchase' => null];
    }

    $event_id = eres_purchase_meta_event_id($order);
    $order->update_meta_data(ERES_PURCHASE_BROWSER_TRACKED_META, '1');
    $order->update_meta_data(ERES_META_BROWSER_TRACKED_META, true);
    $order->update_meta_data(ERES_GA_TRACKED_META, 1);
    $order->save();

    return ['track' => true, 'purchase' => eres_purchase_payload($order, $event_id)];
}

function eres_purchase_order_by_key(string $key): ?WC_Order
{
    $order_id = $key !== '' ? wc_get_order_id_by_order_key($key) : 0;
    $order = $order_id ? wc_get_order($order_id) : null;

    return $order instanceof WC_Order && $order->key_is_valid($key) ? $order : null;
}

function eres_purchase_meta_event_id(WC_Order $order): string
{
    $event_id = (string)$order->get_meta(ERES_META_EVENT_ID_META);
    if ($event_id === '') {
        $event_id = wp_generate_uuid4();
        $order->update_meta_data(ERES_META_EVENT_ID_META, $event_id);
    }

    return $event_id;
}

function eres_purchase_payload(WC_Order $order, string $event_id): array
{
    $items = [];
    foreach ($order->get_items() as $item) {
        $product = $item instanceof WC_Order_Item_Product ? $item->get_product() : null;
        if (!$product instanceof WC_Product) {
            continue;
        }

        $items[] = [
            'metaId' => eres_purchase_meta_content_id($product),
            'gaId' => eres_purchase_ga_item_id($product),
            'name' => $product->get_title(),
            'price' => (float)$order->get_item_total($item, true),
            'quantity' => $item->get_quantity(),
        ];
    }

    return [
        'transactionId' => (string)$order->get_order_number(),
        'eventId' => $event_id,
        'value' => (float)$order->get_total(),
        'currency' => $order->get_currency(),
        'tax' => (float)$order->get_total_tax(),
        'shipping' => (float)$order->get_shipping_total(),
        'coupon' => implode(',', $order->get_coupon_codes()),
        'items' => $items,
    ];
}

// Tienen que coincidir con los IDs que el CAPI del plugin y el catálogo de Meta usan para el mismo producto.
function eres_purchase_meta_content_id(WC_Product $product): string
{
    return class_exists('WC_Facebookcommerce_Utils')
        ? (string)WC_Facebookcommerce_Utils::get_fb_retailer_id($product)
        : (string)$product->get_id();
}

// Replica el identificador que el plugin de GA4 pone en begin_checkout: su clase no carga sus ajustes en una petición REST.
function eres_purchase_ga_item_id(WC_Product $product): string
{
    $settings = get_option('woocommerce_google_analytics_settings', []);
    $product_id = $product->is_type('variation') ? $product->get_parent_id() : $product->get_id();
    $identifier = (string)$product_id;
    if (($settings['ga_product_identifier'] ?? '') === 'product_sku') {
        $identifier = $product->get_sku() !== '' ? $product->get_sku() : "#{$product_id}";
    }

    return (string)apply_filters('woocommerce_ga_product_identifier', $identifier, $product);
}

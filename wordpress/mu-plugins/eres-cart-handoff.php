<?php
/**
 * Plugin Name: ERES · Traspaso de carrito
 * Description: Abre el checkout con el carrito armado en eresskinstudio.com. El sitio en Astro manda /checkout/?cart-token=<token> y este plugin copia ese carrito de la Store API a la sesión del navegador, y borra esa sesión de la Store API cuando el pedido se paga.
 * Version: 1.1.0
 * Requires PHP: 8.0
 */

use Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils;

defined('ABSPATH') || exit;

const ERES_CART_TOKEN_PARAM = 'cart-token';
const ERES_SESSION_KEYS_TO_COPY = ['cart', 'applied_coupons', 'coupon_discount_totals', 'coupon_discount_tax_totals'];
const ERES_HANDOFF_SOURCE_SESSION = 'eres_handoff_source_session';
const ERES_HANDOFF_ORDER_META = '_eres_handoff_source_session';
const ERES_PAID_ORDER_STATUSES = ['processing', 'on-hold', 'completed'];

add_action('template_redirect', 'eres_cart_handoff');
add_action('woocommerce_checkout_order_created', 'eres_cart_handoff_remember_source_in_order');
foreach (ERES_PAID_ORDER_STATUSES as $paid_status) {
    add_action("woocommerce_order_status_{$paid_status}", 'eres_cart_handoff_forget_source_of_paid_order', 10, 2);
}

function eres_cart_handoff(): void
{
    if (empty($_GET[ERES_CART_TOKEN_PARAM]) || !function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    $token = sanitize_text_field(wp_unslash($_GET[ERES_CART_TOKEN_PARAM]));
    $clean_url = remove_query_arg(ERES_CART_TOKEN_PARAM);

    $token_session_id = eres_cart_handoff_token_session_id($token);
    $token_session = $token_session_id !== null ? eres_cart_handoff_token_session($token_session_id) : null;
    if ($token_session !== null) {
        eres_cart_handoff_copy_session($token_session_id, $token_session);
    }

    wp_safe_redirect($clean_url, 302);
    exit;
}

function eres_cart_handoff_token_session_id(string $token): ?string
{
    if (!class_exists(CartTokenUtils::class) || !CartTokenUtils::validate_cart_token($token)) {
        return null;
    }

    $payload = CartTokenUtils::get_cart_token_payload($token);
    $session_id = is_array($payload) ? (string)($payload['user_id'] ?? '') : '';
    return $session_id !== '' ? $session_id : null;
}

function eres_cart_handoff_token_session(string $token_session_id): ?array
{
    if (!WC()->session) {
        return null;
    }

    $data = WC()->session->get_session($token_session_id);
    return is_array($data) && !empty($data['cart']) ? $data : null;
}

function eres_cart_handoff_copy_session(string $token_session_id, array $token_session): void
{
    $session = WC()->session;
    $session->set_customer_session_cookie(true);

    foreach (ERES_SESSION_KEYS_TO_COPY as $key) {
        if (isset($token_session[$key])) {
            $session->set($key, maybe_unserialize($token_session[$key]));
        }
    }
    $session->set(ERES_HANDOFF_SOURCE_SESSION, $token_session_id);

    WC()->cart->get_cart_from_session();
    $session->save_data();
}

function eres_cart_handoff_remember_source_in_order(WC_Order $order): void
{
    $session = WC()->session;
    $source_session_id = $session ? (string)$session->get(ERES_HANDOFF_SOURCE_SESSION, '') : '';
    if ($source_session_id === '') {
        return;
    }

    $order->update_meta_data(ERES_HANDOFF_ORDER_META, $source_session_id);
    $order->save();
    $session->set(ERES_HANDOFF_SOURCE_SESSION, null);
}

function eres_cart_handoff_forget_source_of_paid_order(int $order_id, $order = null): void
{
    $order = $order instanceof WC_Order ? $order : wc_get_order($order_id);
    if (!$order instanceof WC_Order) {
        return;
    }

    $source_session_id = (string)$order->get_meta(ERES_HANDOFF_ORDER_META);
    if ($source_session_id === '') {
        return;
    }

    // La pasarela puede confirmar el pago por webhook, sin la sesión del navegador cargada.
    $session = WC()->session instanceof WC_Session_Handler ? WC()->session : new WC_Session_Handler();
    if ($source_session_id !== (string)$session->get_customer_id()) {
        $session->delete_session($source_session_id);
    }

    $order->delete_meta_data(ERES_HANDOFF_ORDER_META);
    $order->save();
}

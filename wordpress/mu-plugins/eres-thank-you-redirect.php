<?php
/**
 * Plugin Name: ERES · Página de gracias
 * Description: Después del pago lleva a la clienta de la página "pedido recibido" de WooCommerce a /gracias del sitio en Astro, con el número de pedido. Se configura con la constante ERES_THANK_YOU_URL en wp-config.php (vacía = sin redirección).
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_THANK_YOU_DEFAULT_URL = 'https://eresskinstudio.com/gracias/';
const ERES_THANK_YOU_ORDER_PARAM = 'pedido';

// WooCommerce vacía el carrito de la sesión en template_redirect con prioridad 20: hay que redirigir después.
add_action('template_redirect', 'eres_thank_you_redirect', 30);

function eres_thank_you_redirect(): void
{
    if (!function_exists('is_order_received_page') || !is_order_received_page()) {
        return;
    }

    $target = eres_thank_you_url();
    $order = eres_thank_you_received_order();
    if ($target === '' || $order === null || $order->has_status('failed')) {
        return;
    }

    wp_redirect(add_query_arg(ERES_THANK_YOU_ORDER_PARAM, rawurlencode($order->get_order_number()), $target), 302);
    exit;
}

function eres_thank_you_url(): string
{
    return defined('ERES_THANK_YOU_URL') ? trim((string)ERES_THANK_YOU_URL) : ERES_THANK_YOU_DEFAULT_URL;
}

function eres_thank_you_received_order(): ?WC_Order
{
    global $wp;

    $order_id = absint($wp->query_vars['order-received'] ?? 0);
    $key = isset($_GET['key']) ? wc_clean(wp_unslash($_GET['key'])) : '';
    $order = $order_id ? wc_get_order($order_id) : null;

    return $order instanceof WC_Order && $key !== '' && $order->key_is_valid($key) ? $order : null;
}

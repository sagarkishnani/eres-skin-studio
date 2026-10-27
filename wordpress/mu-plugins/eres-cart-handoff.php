<?php
/**
 * Plugin Name: ERES · Traspaso de carrito
 * Description: Abre el checkout con el carrito armado en eresskinstudio.com. El sitio en Astro manda /checkout/?cart-token=<token> y este plugin copia ese carrito de la Store API a la sesión del navegador.
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

use Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils;

defined('ABSPATH') || exit;

const ERES_CART_TOKEN_PARAM = 'cart-token';
const ERES_SESSION_KEYS_TO_COPY = ['cart', 'applied_coupons', 'coupon_discount_totals', 'coupon_discount_tax_totals'];
const ERES_HANDOFF_SOURCE_SESSION = 'eres_handoff_source_session';
const ERES_HANDOFF_ORDER_META = '_eres_handoff_source_session';

add_action('template_redirect', 'eres_cart_handoff');
add_action('woocommerce_checkout_order_created', 'eres_cart_handoff_remember_source_in_order');

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

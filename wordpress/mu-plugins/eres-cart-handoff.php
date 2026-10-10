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

add_action('template_redirect', 'eres_cart_handoff');

function eres_cart_handoff(): void
{
    if (empty($_GET[ERES_CART_TOKEN_PARAM]) || !function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    $token = sanitize_text_field(wp_unslash($_GET[ERES_CART_TOKEN_PARAM]));
    $clean_url = remove_query_arg(ERES_CART_TOKEN_PARAM);

    $token_session = eres_cart_handoff_token_session($token);
    if ($token_session !== null) {
        eres_cart_handoff_copy_session($token_session);
    }

    wp_safe_redirect($clean_url, 302);
    exit;
}

function eres_cart_handoff_token_session(string $token): ?array
{
    if (!class_exists(CartTokenUtils::class) || !CartTokenUtils::validate_cart_token($token)) {
        return null;
    }

    $payload = CartTokenUtils::get_cart_token_payload($token);
    $session_id = is_array($payload) ? (string)($payload['user_id'] ?? '') : '';
    if ($session_id === '' || !WC()->session) {
        return null;
    }

    $data = WC()->session->get_session($session_id);
    return is_array($data) && !empty($data['cart']) ? $data : null;
}

function eres_cart_handoff_copy_session(array $token_session): void
{
    $session = WC()->session;
    $session->set_customer_session_cookie(true);

    foreach (ERES_SESSION_KEYS_TO_COPY as $key) {
        if (isset($token_session[$key])) {
            $session->set($key, maybe_unserialize($token_session[$key]));
        }
    }

    WC()->cart->get_cart_from_session();
    $session->save_data();
}

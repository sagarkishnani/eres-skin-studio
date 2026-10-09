<?php

defined('ABSPATH') || exit;

const ERES_CHECKOUT_CART_TOKEN_PARAM = 'cart-token';
const ERES_CHECKOUT_STOREFRONT_SHOP_PATH = '/productos';
const ERES_CHECKOUT_STOREFRONT_OPEN_CART_QUERY = 'carrito=abierto';

const ERES_CHECKOUT_ICONS = [
    'arrow-left' => '<path d="M19 12H5" stroke-linecap="round"/><path d="M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>',
    'shield' => '<path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>',
    'truck' => '<path d="M1 3h15v13H1z" stroke-linejoin="round"/><path d="M16 8h4l3 3v5h-7V8z" stroke-linejoin="round"/><circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="18.5" r="2"/>',
    'return' => '<path d="M3 12a9 9 0 019-9 9 9 0 016.4 2.6L21 8" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 3v5h-5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12a9 9 0 01-9 9 9 9 0 01-6.4-2.6L3 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 21v-5h5" stroke-linecap="round" stroke-linejoin="round"/>',
];

const ERES_CHECKOUT_WHATSAPP_ICON = '<svg viewBox="0 0 448 512" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';

add_filter('template_include', 'eres_checkout_template', PHP_INT_MAX);
// eres-cart-handoff carga el carrito del token en template_redirect con prioridad 10: sin el token en la URL ya se puede decidir.
add_action('template_redirect', 'eres_checkout_redirect_empty_cart_to_storefront', 5);

function eres_checkout_is_page(): bool
{
    return function_exists('is_checkout') && is_checkout();
}

function eres_checkout_is_order_pay(): bool
{
    return eres_checkout_is_page() && is_wc_endpoint_url('order-pay');
}

function eres_checkout_is_order_received(): bool
{
    return eres_checkout_is_page() && is_wc_endpoint_url('order-received');
}

function eres_checkout_is_form(): bool
{
    return eres_checkout_is_page() && !eres_checkout_is_order_pay() && !eres_checkout_is_order_received();
}

function eres_checkout_template(string $template): string
{
    return eres_checkout_is_page() ? ERES_CHECKOUT_DIR . '/templates/page.php' : $template;
}

function eres_checkout_storefront_url(): string
{
    return defined('ERES_STOREFRONT_URL') ? untrailingslashit(trim((string) ERES_STOREFRONT_URL)) : '';
}

function eres_checkout_back_url(): string
{
    $storefront = eres_checkout_storefront_url();

    return $storefront !== '' ? $storefront . ERES_CHECKOUT_STOREFRONT_SHOP_PATH : wc_get_page_permalink('shop');
}

function eres_checkout_edit_cart_url(): string
{
    $storefront = eres_checkout_storefront_url();

    return $storefront !== ''
        ? $storefront . ERES_CHECKOUT_STOREFRONT_SHOP_PATH . '?' . ERES_CHECKOUT_STOREFRONT_OPEN_CART_QUERY
        : wc_get_cart_url();
}

function eres_checkout_site_link(string $path): string
{
    $storefront = eres_checkout_storefront_url();

    return $storefront !== '' ? $storefront . $path : home_url($path);
}

function eres_checkout_redirect_empty_cart_to_storefront(): void
{
    if (eres_checkout_storefront_url() === '' || !eres_checkout_is_form() || !empty($_GET[ERES_CHECKOUT_CART_TOKEN_PARAM])) {
        return;
    }
    if (!WC()->cart || !WC()->cart->is_empty()) {
        return;
    }

    wp_redirect(eres_checkout_back_url(), 302);
    exit;
}

function eres_checkout_icon(string $name): string
{
    $paths = ERES_CHECKOUT_ICONS[$name] ?? '';

    return $paths === ''
        ? ''
        : '<svg class="eres-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' . $paths . '</svg>';
}

function eres_checkout_page_title(): string
{
    if (eres_checkout_is_order_pay()) {
        return 'Pagar pedido';
    }

    return eres_checkout_is_order_received() ? 'Pedido recibido' : 'Checkout';
}

const ERES_CHECKOUT_STYLE_HANDLE = 'eres-checkout-page';
const ERES_CHECKOUT_SCRIPT_HANDLE = 'eres-checkout-page';
const ERES_CHECKOUT_FOREIGN_STYLE_SOURCES = [
    '/themes/',
    '/plugins/elementor',
    '/uploads/elementor/',
    '/jet-',
    '/uploads/eres/',
    '/woocommerce/assets/css/woocommerce',
    'fonts.googleapis.com',
];

add_filter('woocommerce_enqueue_styles', 'eres_checkout_skip_woocommerce_styles');
add_action('wp', 'eres_checkout_skip_customizer_css');
add_action('wp_head', 'eres_checkout_preload_font', 1);
add_action('wp_enqueue_scripts', 'eres_checkout_enqueue_assets', 20);
add_action('wp_enqueue_scripts', 'eres_checkout_dequeue_foreign_styles', PHP_INT_MAX);
// Elementor y los plugins Jet encolan más hojas mientras pintan el cuerpo: se imprimen en wp_footer con prioridad 20.
add_action('wp_footer', 'eres_checkout_dequeue_foreign_styles', 1);

function eres_checkout_skip_woocommerce_styles($styles)
{
    return eres_checkout_is_page() ? [] : $styles;
}

function eres_checkout_skip_customizer_css(): void
{
    if (eres_checkout_is_page()) {
        remove_action('wp_head', 'wp_custom_css_cb', 101);
    }
}

function eres_checkout_preload_font(): void
{
    if (!eres_checkout_is_page()) {
        return;
    }

    printf(
        '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
        esc_url(eres_checkout_asset_url('fonts/dm-sans-latin-wght-normal.woff2'))
    );
}

function eres_checkout_enqueue_assets(): void
{
    if (!eres_checkout_is_page()) {
        return;
    }

    wp_enqueue_style(ERES_CHECKOUT_STYLE_HANDLE, eres_checkout_asset_url('checkout.css'), [], eres_checkout_asset_version('checkout.css'));
    wp_enqueue_script(ERES_CHECKOUT_SCRIPT_HANDLE, eres_checkout_asset_url('checkout.js'), ['jquery', 'wc-checkout'], eres_checkout_asset_version('checkout.js'), true);
    wp_localize_script(ERES_CHECKOUT_SCRIPT_HANDLE, 'eresCheckout', apply_filters('eres_checkout_script_settings', []));
}

function eres_checkout_dequeue_foreign_styles(): void
{
    if (!eres_checkout_is_page()) {
        return;
    }

    $styles = wp_styles();
    foreach ($styles->queue as $handle) {
        $source = (string) ($styles->registered[$handle]->src ?? '');
        if (eres_checkout_is_foreign_style($source)) {
            wp_dequeue_style($handle);
        }
    }
}

function eres_checkout_is_foreign_style(string $source): bool
{
    foreach (ERES_CHECKOUT_FOREIGN_STYLE_SOURCES as $fragment) {
        if (str_contains($source, $fragment)) {
            return true;
        }
    }

    return false;
}

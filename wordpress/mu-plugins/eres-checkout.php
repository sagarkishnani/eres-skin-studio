<?php
/**
 * Plugin Name: ERES · Checkout
 * Description: Muestra el checkout, el pago de un pedido y la página de pedido recibido con el diseño del sitio en Astro: plantilla propia, campos mínimos y entrega con recojo o envío a domicilio. Se configura en eres-checkout/config.php.
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_CHECKOUT_DIR = __DIR__ . '/eres-checkout';

function eres_checkout_config(): array
{
    static $config = null;
    if ($config === null) {
        $config = require ERES_CHECKOUT_DIR . '/config.php';
    }

    return apply_filters('eres_checkout_config', $config);
}

function eres_checkout_asset_url(string $path): string
{
    return plugins_url('eres-checkout/assets/' . $path, __FILE__);
}

function eres_checkout_asset_version(string $path): string
{
    return (string) filemtime(ERES_CHECKOUT_DIR . '/assets/' . $path);
}

require ERES_CHECKOUT_DIR . '/shell.php';
require ERES_CHECKOUT_DIR . '/fields.php';
require ERES_CHECKOUT_DIR . '/layout.php';
require ERES_CHECKOUT_DIR . '/validation.php';

<?php
/**
 * Plugin Name: ERES · Carrito sin caché
 * Description: Evita que LiteSpeed Cache guarde las respuestas de la Store API de WooCommerce (/wp-json/wc/store/…). Sin esto, el carrito de una clienta se sirve cacheado a todas las demás, junto con su Cart-Token.
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_STORE_API_ROUTE_PREFIX = '/wc/store/';

add_filter('rest_pre_dispatch', 'eres_store_api_skip_page_cache', 10, 3);

function eres_store_api_skip_page_cache($result, $server, $request)
{
    if (str_starts_with($request->get_route(), ERES_STORE_API_ROUTE_PREFIX)) {
        do_action('litespeed_control_set_nocache', 'Store API de WooCommerce: el carrito es por sesión');
        // El servidor LiteSpeed obedece esta cabecera aunque el plugin LiteSpeed Cache esté desactivado.
        header('X-LiteSpeed-Cache-Control: no-cache');
    }

    return $result;
}

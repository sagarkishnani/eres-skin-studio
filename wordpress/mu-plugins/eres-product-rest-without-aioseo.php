<?php
/**
 * Plugin Name: ERES · Productos sin campos de AIOSEO en la API
 * Description: Quita de la API REST de productos los campos que agrega All in One SEO (aioseo_head y compañía). AIOSEO los calcula con su generador de <head>, que no existe cuando WooCommerce arma un webhook en segundo plano: la entrega falla con "Call to a member function output() on null" y el sitio Astro nunca se redespliega.
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_REST_PRODUCT_OBJECT_TYPES = ['product', 'product_variation'];
const ERES_AIOSEO_FIELD_PREFIX = 'aioseo_';

add_action('rest_api_init', 'eres_remove_aioseo_product_rest_fields', PHP_INT_MAX);

function eres_remove_aioseo_product_rest_fields(): void
{
    global $wp_rest_additional_fields;

    foreach (ERES_REST_PRODUCT_OBJECT_TYPES as $objectType) {
        foreach (array_keys($wp_rest_additional_fields[$objectType] ?? []) as $field) {
            if (str_starts_with($field, ERES_AIOSEO_FIELD_PREFIX)) {
                unset($wp_rest_additional_fields[$objectType][$field]);
            }
        }
    }
}

<?php
/**
 * Plugin Name: ERES · Detalle de producto
 * Description: Agrega Beneficios, Ingredientes clave y Modo de uso a la edición del producto. El sitio en Astro los lee de meta_data en la API REST y los muestra en el acordeón de la ficha.
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_PRODUCT_FIELDS = [
    'eres_beneficios' => 'Beneficios',
    'eres_ingredientes' => 'Ingredientes clave',
    'eres_modo_uso' => 'Modo de uso',
];

add_action('woocommerce_product_options_general_product_data', 'eres_product_fields_render');
add_action('woocommerce_admin_process_product_object', 'eres_product_fields_save');

function eres_product_fields_render(): void
{
    echo '<div class="options_group">';
    foreach (ERES_PRODUCT_FIELDS as $key => $label) {
        woocommerce_wp_textarea_input([
            'id' => $key,
            'label' => $label,
            'description' => 'Texto plano. Los saltos de línea se respetan en la ficha.',
            'desc_tip' => true,
            'rows' => 5,
        ]);
    }
    echo '</div>';
}

// Se escribe sobre el objeto antes de su save(): así el webhook product.updated ya lleva los valores nuevos.
function eres_product_fields_save(WC_Product $product): void
{
    foreach (array_keys(ERES_PRODUCT_FIELDS) as $key) {
        if (!isset($_POST[$key])) {
            continue;
        }
        $value = sanitize_textarea_field(wp_unslash($_POST[$key]));
        if ($value === '') {
            $product->delete_meta_data($key);
        } else {
            $product->update_meta_data($key, $value);
        }
    }
}

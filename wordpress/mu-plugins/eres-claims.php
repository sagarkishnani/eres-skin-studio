<?php
/**
 * Plugin Name: ERES · Reclamos web
 * Description: Registra en WP Admin ("Reclamos web") los reclamos enviados desde /libro-de-reclamaciones del sitio en Astro. send-email.php los envía firmados con la constante ERES_CLAIMS_SECRET de wp-config.php (vacía = no recibe reclamos).
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_CLAIM_POST_TYPE = 'eres_claim';
const ERES_CLAIM_META_ROWS = '_eres_claim_rows';
const ERES_CLAIM_META_NAME = '_eres_claim_name';
const ERES_CLAIM_META_EMAIL = '_eres_claim_email';
const ERES_CLAIM_META_REQUEST_TYPE = '_eres_claim_request_type';
const ERES_CLAIM_META_STATUS = '_eres_claim_status';
const ERES_CLAIM_STATUSES = [
    'pendiente'  => 'Pendiente',
    'en-proceso' => 'En proceso',
    'atendido'   => 'Atendido',
];
const ERES_CLAIM_DEFAULT_STATUS = 'pendiente';
const ERES_CLAIM_CAPABILITY = 'manage_woocommerce';

add_action('init', 'eres_claims_register_post_type');

function eres_claims_register_post_type(): void
{
    register_post_type(ERES_CLAIM_POST_TYPE, [
        'labels' => [
            'name'               => 'Reclamos web',
            'singular_name'      => 'Reclamo',
            'menu_name'          => 'Reclamos web',
            'all_items'          => 'Todos los reclamos',
            'edit_item'          => 'Reclamo',
            'view_item'          => 'Ver reclamo',
            'search_items'       => 'Buscar reclamos',
            'not_found'          => 'No hay reclamos.',
            'not_found_in_trash' => 'No hay reclamos en la papelera.',
        ],
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_nav_menus'   => false,
        'show_in_admin_bar'   => false,
        'show_in_rest'        => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'menu_icon'           => 'dashicons-book-alt',
        'menu_position'       => 56,
        'supports'            => false,
        'map_meta_cap'        => true,
        'capabilities'        => eres_claims_capabilities(),
    ]);
}

function eres_claims_capabilities(): array
{
    $capabilities = array_fill_keys([
        'edit_posts',
        'edit_others_posts',
        'edit_published_posts',
        'edit_private_posts',
        'publish_posts',
        'read_private_posts',
        'delete_posts',
        'delete_others_posts',
        'delete_published_posts',
        'delete_private_posts',
    ], ERES_CLAIM_CAPABILITY);
    $capabilities['create_posts'] = 'do_not_allow';

    return $capabilities;
}

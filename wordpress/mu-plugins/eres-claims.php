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

const ERES_CLAIM_STATUS_FILTER = 'eres_claim_status';

add_action('init', 'eres_claims_register_post_type');
add_filter('manage_' . ERES_CLAIM_POST_TYPE . '_posts_columns', 'eres_claims_list_columns');
add_action('manage_' . ERES_CLAIM_POST_TYPE . '_posts_custom_column', 'eres_claims_render_list_column', 10, 2);
add_action('restrict_manage_posts', 'eres_claims_render_status_filter');
add_action('pre_get_posts', 'eres_claims_sort_and_filter_list');
add_filter('post_row_actions', 'eres_claims_row_actions', 10, 2);

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

function eres_claims_list_columns(array $columns): array
{
    return [
        'cb'           => $columns['cb'] ?? '',
        'title'        => 'N° correlativo',
        'claim_name'   => 'Nombre',
        'claim_type'   => 'Tipo',
        'claim_status' => 'Estado',
        'claim_date'   => 'Fecha',
        'claim_email'  => 'Correo',
    ];
}

function eres_claims_render_list_column(string $column, int $postId): void
{
    echo esc_html(match ($column) {
        'claim_name'   => (string)get_post_meta($postId, ERES_CLAIM_META_NAME, true),
        'claim_type'   => (string)get_post_meta($postId, ERES_CLAIM_META_REQUEST_TYPE, true),
        'claim_status' => eres_claims_status_label(eres_claims_status($postId)),
        'claim_date'   => (string)get_the_date('d/m/Y H:i', $postId),
        'claim_email'  => (string)get_post_meta($postId, ERES_CLAIM_META_EMAIL, true),
        default        => '',
    });
}

function eres_claims_status(int $postId): string
{
    $status = (string)get_post_meta($postId, ERES_CLAIM_META_STATUS, true);
    return array_key_exists($status, ERES_CLAIM_STATUSES) ? $status : ERES_CLAIM_DEFAULT_STATUS;
}

function eres_claims_status_label(string $status): string
{
    return ERES_CLAIM_STATUSES[$status] ?? ERES_CLAIM_STATUSES[ERES_CLAIM_DEFAULT_STATUS];
}

function eres_claims_selected_status_filter(): string
{
    $status = sanitize_key(wp_unslash($_GET[ERES_CLAIM_STATUS_FILTER] ?? ''));
    return array_key_exists($status, ERES_CLAIM_STATUSES) ? $status : '';
}

function eres_claims_render_status_filter(string $postType): void
{
    if ($postType !== ERES_CLAIM_POST_TYPE) {
        return;
    }

    $selected = eres_claims_selected_status_filter();
    echo '<select name="' . esc_attr(ERES_CLAIM_STATUS_FILTER) . '">';
    echo '<option value="">Todos los estados</option>';
    foreach (ERES_CLAIM_STATUSES as $status => $label) {
        printf('<option value="%s"%s>%s</option>', esc_attr($status), selected($selected, $status, false), esc_html($label));
    }
    echo '</select>';
}

function eres_claims_sort_and_filter_list(WP_Query $query): void
{
    if (!is_admin() || !$query->is_main_query() || $query->get('post_type') !== ERES_CLAIM_POST_TYPE) {
        return;
    }

    if (!$query->get('orderby')) {
        $query->set('orderby', 'date');
        $query->set('order', 'DESC');
    }

    $status = eres_claims_selected_status_filter();
    if ($status !== '') {
        $query->set('meta_query', [['key' => ERES_CLAIM_META_STATUS, 'value' => $status]]);
    }
}

function eres_claims_row_actions(array $actions, WP_Post $post): array
{
    if ($post->post_type !== ERES_CLAIM_POST_TYPE) {
        return $actions;
    }

    unset($actions['inline hide-if-no-js']);
    return $actions;
}

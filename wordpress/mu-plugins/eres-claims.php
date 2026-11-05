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
const ERES_CLAIM_STATUS_FIELD = 'eres_claim_status_value';
const ERES_CLAIM_NONCE_ACTION = 'eres_claim_save_status';
const ERES_CLAIM_NONCE_FIELD = 'eres_claim_status_nonce';
const ERES_CLAIM_REST_NAMESPACE = 'eres/v1';
const ERES_CLAIM_REST_ROUTE = '/claims';
const ERES_CLAIM_SIGNATURE_HEADER = 'x-eres-signature';
const ERES_CLAIM_CORRELATIVE_PATTERN = '/^[A-Z]{3}-\d{6}$/';
// send-email.php fecha los envíos en hora de Lima, no en la zona horaria de WordPress.
const ERES_CLAIM_SUBMISSION_TIMEZONE = 'America/Lima';

add_action('init', 'eres_claims_register_post_type');
add_filter('manage_' . ERES_CLAIM_POST_TYPE . '_posts_columns', 'eres_claims_list_columns');
add_action('manage_' . ERES_CLAIM_POST_TYPE . '_posts_custom_column', 'eres_claims_render_list_column', 10, 2);
add_action('restrict_manage_posts', 'eres_claims_render_status_filter');
add_action('pre_get_posts', 'eres_claims_sort_and_filter_list');
add_filter('post_row_actions', 'eres_claims_row_actions', 10, 2);
add_action('add_meta_boxes_' . ERES_CLAIM_POST_TYPE, 'eres_claims_add_meta_boxes');
add_action('save_post_' . ERES_CLAIM_POST_TYPE, 'eres_claims_save_status');
add_action('rest_api_init', 'eres_claims_register_route');

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

function eres_claims_add_meta_boxes(WP_Post $post): void
{
    add_meta_box('eres-claim-details', 'Datos del reclamo', 'eres_claims_render_details_box', ERES_CLAIM_POST_TYPE, 'normal', 'high');
    add_meta_box('eres-claim-status', 'Estado', 'eres_claims_render_status_box', ERES_CLAIM_POST_TYPE, 'side', 'high');
}

function eres_claims_render_details_box(WP_Post $post): void
{
    $rows = get_post_meta($post->ID, ERES_CLAIM_META_ROWS, true);
    if (!is_array($rows) || $rows === []) {
        echo '<p>Este reclamo no tiene datos.</p>';
        return;
    }

    printf('<p><strong>%s</strong> · %s</p>', esc_html($post->post_title), esc_html((string)get_the_date('d/m/Y H:i', $post)));
    echo '<table class="widefat striped"><tbody>';
    foreach ($rows as $row) {
        printf(
            '<tr><th scope="row" style="width:30%%">%s</th><td>%s</td></tr>',
            esc_html((string)($row['label'] ?? '')),
            nl2br(esc_html((string)($row['value'] ?? '')))
        );
    }
    echo '</tbody></table>';
}

function eres_claims_render_status_box(WP_Post $post): void
{
    wp_nonce_field(ERES_CLAIM_NONCE_ACTION, ERES_CLAIM_NONCE_FIELD);
    $current = eres_claims_status($post->ID);
    echo '<select name="' . esc_attr(ERES_CLAIM_STATUS_FIELD) . '" style="width:100%">';
    foreach (ERES_CLAIM_STATUSES as $status => $label) {
        printf('<option value="%s"%s>%s</option>', esc_attr($status), selected($current, $status, false), esc_html($label));
    }
    echo '</select>';
    echo '<p class="description">Guarda con "Actualizar".</p>';
}

function eres_claims_save_status(int $postId): void
{
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    $nonce = sanitize_text_field(wp_unslash($_POST[ERES_CLAIM_NONCE_FIELD] ?? ''));
    if ($nonce === '' || !wp_verify_nonce($nonce, ERES_CLAIM_NONCE_ACTION) || !current_user_can('edit_post', $postId)) {
        return;
    }

    $status = sanitize_key(wp_unslash($_POST[ERES_CLAIM_STATUS_FIELD] ?? ''));
    if (array_key_exists($status, ERES_CLAIM_STATUSES)) {
        update_post_meta($postId, ERES_CLAIM_META_STATUS, $status);
    }
}

function eres_claims_register_route(): void
{
    register_rest_route(ERES_CLAIM_REST_NAMESPACE, ERES_CLAIM_REST_ROUTE, [
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'eres_claims_receive',
        'permission_callback' => 'eres_claims_has_valid_signature',
    ]);
}

function eres_claims_secret(): string
{
    return defined('ERES_CLAIMS_SECRET') ? (string)ERES_CLAIMS_SECRET : '';
}

function eres_claims_has_valid_signature(WP_REST_Request $request): bool|WP_Error
{
    $secret = eres_claims_secret();
    if ($secret === '') {
        return new WP_Error('eres_claims_not_configured', 'Registro de reclamos no configurado.', ['status' => 503]);
    }

    $signature = (string)$request->get_header(ERES_CLAIM_SIGNATURE_HEADER);
    $expected = base64_encode(hash_hmac('sha256', $request->get_body(), $secret, true));
    if ($signature === '' || !hash_equals($expected, $signature)) {
        return new WP_Error('eres_claims_invalid_signature', 'Firma inválida.', ['status' => 401]);
    }

    return true;
}

function eres_claims_receive(WP_REST_Request $request): WP_REST_Response|WP_Error
{
    $claim = eres_claims_parse_payload($request->get_json_params());
    if ($claim === null) {
        return new WP_Error('eres_claims_invalid_payload', 'Reclamo inválido.', ['status' => 400]);
    }

    $existingId = eres_claims_find_by_correlative($claim['correlativo']);
    if ($existingId !== null) {
        return new WP_REST_Response(['id' => $existingId, 'created' => false], 200);
    }

    $postId = wp_insert_post([
        'post_type'     => ERES_CLAIM_POST_TYPE,
        'post_status'   => 'publish',
        'post_title'    => $claim['correlativo'],
        'post_date_gmt' => $claim['submittedAtGmt'],
        'post_date'     => get_date_from_gmt($claim['submittedAtGmt']),
        'meta_input'    => [
            ERES_CLAIM_META_ROWS         => $claim['rows'],
            ERES_CLAIM_META_NAME         => $claim['name'],
            ERES_CLAIM_META_EMAIL        => $claim['email'],
            ERES_CLAIM_META_REQUEST_TYPE => $claim['requestType'],
            ERES_CLAIM_META_STATUS       => ERES_CLAIM_DEFAULT_STATUS,
        ],
    ], true);
    if (is_wp_error($postId)) {
        return new WP_Error('eres_claims_not_saved', $postId->get_error_message(), ['status' => 500]);
    }

    return new WP_REST_Response(['id' => $postId, 'created' => true], 201);
}

function eres_claims_parse_payload(mixed $payload): ?array
{
    if (!is_array($payload)) {
        return null;
    }

    $correlativo = (string)($payload['correlativo'] ?? '');
    $submittedAtGmt = eres_claims_submission_gmt((string)($payload['submittedAt'] ?? ''));
    $rows = eres_claims_parse_rows($payload['rows'] ?? null);
    if (!preg_match(ERES_CLAIM_CORRELATIVE_PATTERN, $correlativo) || $submittedAtGmt === null || $rows === null) {
        return null;
    }

    return [
        'correlativo'    => $correlativo,
        'submittedAtGmt' => $submittedAtGmt,
        'rows'           => $rows,
        'name'           => sanitize_text_field((string)($payload['name'] ?? '')),
        'email'          => sanitize_email((string)($payload['email'] ?? '')),
        'requestType'    => sanitize_text_field((string)($payload['requestType'] ?? '')),
    ];
}

function eres_claims_submission_gmt(string $submittedAt): ?string
{
    $date = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $submittedAt, new DateTimeZone(ERES_CLAIM_SUBMISSION_TIMEZONE));
    if ($date === false) {
        return null;
    }

    return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
}

function eres_claims_parse_rows(mixed $rows): ?array
{
    if (!is_array($rows) || $rows === []) {
        return null;
    }

    $parsed = [];
    foreach ($rows as $row) {
        if (!is_array($row) || !isset($row['label']) || !is_scalar($row['label'])) {
            return null;
        }
        $parsed[] = [
            'label' => sanitize_text_field((string)$row['label']),
            'value' => sanitize_textarea_field(is_scalar($row['value'] ?? null) ? (string)$row['value'] : ''),
        ];
    }

    return $parsed;
}

function eres_claims_find_by_correlative(string $correlativo): ?int
{
    $ids = get_posts([
        'post_type'      => ERES_CLAIM_POST_TYPE,
        'post_status'    => 'any',
        'title'          => $correlativo,
        'fields'         => 'ids',
        'posts_per_page' => 1,
        'no_found_rows'  => true,
    ]);

    return $ids === [] ? null : (int)$ids[0];
}

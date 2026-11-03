<?php
/**
 * Plugin Name: ERES · Rebuild al editar marcas y categorías
 * Description: Avisa a rebuild-hook.php del sitio Astro cuando se crea, edita o borra una marca o una categoría de producto, porque WooCommerce no tiene webhooks para esos términos. Se configura con ERES_REBUILD_HOOK_URL y ERES_REBUILD_HOOK_SECRET en wp-config.php (cualquiera vacía = sin aviso).
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_TERM_REBUILD_TAXONOMIES = ['product_brand', 'product_cat'];
const ERES_TERM_REBUILD_TOPIC = 'product_term.updated';
const ERES_TERM_REBUILD_ACTION = 'eres_term_rebuild_deliver';
const ERES_TERM_REBUILD_GROUP = 'eres-term-rebuild';
// Agrupa en un solo deploy los cambios seguidos (renombrar varias marcas, borrar en lote).
const ERES_TERM_REBUILD_DELAY_SECONDS = 60;

foreach (ERES_TERM_REBUILD_TAXONOMIES as $taxonomy) {
    foreach (['created', 'edited', 'delete'] as $termEvent) {
        add_action("{$termEvent}_{$taxonomy}", 'eres_term_rebuild_schedule');
    }
}
add_action(ERES_TERM_REBUILD_ACTION, 'eres_term_rebuild_deliver');

function eres_term_rebuild_schedule(): void
{
    if (!eres_term_rebuild_is_configured() || !function_exists('as_schedule_single_action')) {
        return;
    }
    if (as_has_scheduled_action(ERES_TERM_REBUILD_ACTION, [], ERES_TERM_REBUILD_GROUP)) {
        return;
    }

    as_schedule_single_action(time() + ERES_TERM_REBUILD_DELAY_SECONDS, ERES_TERM_REBUILD_ACTION, [], ERES_TERM_REBUILD_GROUP);
}

function eres_term_rebuild_deliver(): void
{
    if (!eres_term_rebuild_is_configured()) {
        return;
    }

    $body = (string)wp_json_encode(['taxonomies' => ERES_TERM_REBUILD_TAXONOMIES]);
    $response = wp_remote_post(trim((string)ERES_REBUILD_HOOK_URL), [
        'timeout' => 20,
        'body'    => $body,
        'headers' => [
            'Content-Type'           => 'application/json',
            'X-WC-Webhook-Topic'     => ERES_TERM_REBUILD_TOPIC,
            'X-WC-Webhook-Signature' => base64_encode(hash_hmac('sha256', $body, (string)ERES_REBUILD_HOOK_SECRET, true)),
        ],
    ]);

    $status = is_wp_error($response) ? $response->get_error_message() : wp_remote_retrieve_response_code($response);
    if ($status !== 200) {
        throw new RuntimeException("rebuild-hook.php respondió: $status");
    }
}

function eres_term_rebuild_is_configured(): bool
{
    return defined('ERES_REBUILD_HOOK_URL') && trim((string)ERES_REBUILD_HOOK_URL) !== ''
        && defined('ERES_REBUILD_HOOK_SECRET') && (string)ERES_REBUILD_HOOK_SECRET !== '';
}

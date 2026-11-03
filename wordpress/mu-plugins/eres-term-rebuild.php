<?php
/**
 * Plugin Name: ERES · Rebuild al editar marcas y categorías
 * Description: Avisa a rebuild-hook.php del sitio Astro cuando se crea, edita o borra una marca o una categoría de producto, porque WooCommerce no tiene webhooks para esos términos. Usa la URL y el secreto del primer webhook activo que apunte a rebuild-hook.php (sin ninguno = sin aviso).
 * Version: 1.1.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const ERES_TERM_REBUILD_TAXONOMIES = ['product_brand', 'product_cat'];
const ERES_TERM_REBUILD_TOPIC = 'product_term.updated';
const ERES_TERM_REBUILD_HOOK_PATH = '/rebuild-hook.php';
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
    if (!function_exists('as_schedule_single_action') || eres_term_rebuild_webhook() === null) {
        return;
    }
    if (as_has_scheduled_action(ERES_TERM_REBUILD_ACTION, [], ERES_TERM_REBUILD_GROUP)) {
        return;
    }

    as_schedule_single_action(time() + ERES_TERM_REBUILD_DELAY_SECONDS, ERES_TERM_REBUILD_ACTION, [], ERES_TERM_REBUILD_GROUP);
}

function eres_term_rebuild_deliver(): void
{
    $webhook = eres_term_rebuild_webhook();
    if ($webhook === null) {
        throw new RuntimeException('No hay un webhook activo hacia ' . ERES_TERM_REBUILD_HOOK_PATH);
    }

    $body = (string)wp_json_encode(['taxonomies' => ERES_TERM_REBUILD_TAXONOMIES]);
    $response = wp_remote_post($webhook->get_delivery_url(), [
        'timeout' => 20,
        'body'    => $body,
        'headers' => [
            'Content-Type'           => 'application/json',
            'X-WC-Webhook-Topic'     => ERES_TERM_REBUILD_TOPIC,
            'X-WC-Webhook-Signature' => base64_encode(hash_hmac('sha256', $body, $webhook->get_secret(), true)),
        ],
    ]);

    $status = is_wp_error($response) ? $response->get_error_message() : wp_remote_retrieve_response_code($response);
    if ($status !== 200) {
        throw new RuntimeException("rebuild-hook.php respondió: $status");
    }
}

function eres_term_rebuild_webhook(): ?WC_Webhook
{
    if (!class_exists('WC_Data_Store')) {
        return null;
    }

    $webhookIds = WC_Data_Store::load('webhook')->search_webhooks(['status' => 'active', 'limit' => -1]);
    foreach ($webhookIds as $webhookId) {
        $webhook = wc_get_webhook($webhookId);
        $path = (string)wp_parse_url($webhook?->get_delivery_url() ?? '', PHP_URL_PATH);
        if ($webhook !== null && $webhook->get_secret() !== '' && str_ends_with($path, ERES_TERM_REBUILD_HOOK_PATH)) {
            return $webhook;
        }
    }

    return null;
}

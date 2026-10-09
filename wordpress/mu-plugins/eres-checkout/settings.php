<?php

defined('ABSPATH') || exit;

const ERES_CHECKOUT_SETTINGS_OPTION = 'eres_checkout_settings';
const ERES_CHECKOUT_SETTINGS_VERSION = 1;

add_filter('eres_checkout_config', 'eres_checkout_apply_settings');

function eres_checkout_saved_settings(): array
{
    $saved = get_option(ERES_CHECKOUT_SETTINGS_OPTION);

    return is_array($saved) ? $saved : [];
}

function eres_checkout_saved_text(array $saved, string $key, string $default): string
{
    return isset($saved[$key]) && is_string($saved[$key]) ? $saved[$key] : $default;
}

function eres_checkout_saved_label(array $saved, string $default): string
{
    $label = eres_checkout_saved_text($saved, 'label', $default);

    return $label !== '' ? $label : $default;
}

function eres_checkout_settings_values(): array
{
    $config = eres_checkout_default_config();
    $saved = eres_checkout_saved_settings();

    return [
        'fields' => eres_checkout_field_values($config['fields'], (array) ($saved['fields'] ?? [])),
        'document_types' => eres_checkout_document_type_values($config['document_types'], (array) ($saved['document_types'] ?? [])),
        'districts' => !empty($saved['districts']) && is_array($saved['districts']) ? array_values($saved['districts']) : $config['districts'],
        'delivery' => eres_checkout_delivery_values($config['delivery'], (array) ($saved['delivery'] ?? [])),
        'free_shipping_threshold' => (float) ($saved['free_shipping_threshold'] ?? $config['free_shipping_threshold']),
        'trust' => eres_checkout_trust_values($config['trust'], (array) ($saved['trust'] ?? [])),
    ];
}

function eres_checkout_field_values(array $defaults, array $saved): array
{
    $values = [];
    foreach ($defaults as $key => $default) {
        $field = (array) ($saved[$key] ?? []);
        $is_locked = !empty($default['locked']);
        $is_visible = $is_locked || (bool) ($field['visible'] ?? $default['visible']);

        $values[$key] = [
            'visible' => $is_visible,
            'required' => $is_locked || ($is_visible && (bool) ($field['required'] ?? $default['required'])),
            'label' => eres_checkout_saved_label($field, $default['label']),
            'placeholder' => eres_checkout_saved_text($field, 'placeholder', $default['placeholder'] ?? ''),
        ];
    }

    return $values;
}

function eres_checkout_document_type_values(array $defaults, array $saved): array
{
    $values = [];
    foreach ($defaults as $code => $default_label) {
        $type = (array) ($saved[$code] ?? []);
        $values[$code] = [
            'active' => (bool) ($type['active'] ?? true),
            'label' => eres_checkout_saved_label($type, $default_label),
        ];
    }

    return $values;
}

function eres_checkout_delivery_values(array $defaults, array $saved): array
{
    $values = [];
    foreach ($defaults as $method => $default) {
        $values[$method] = ['subtitle' => eres_checkout_saved_text((array) ($saved[$method] ?? []), 'subtitle', $default['subtitle'])];
    }

    return $values;
}

function eres_checkout_trust_values(array $defaults, array $saved): array
{
    $values = [];
    foreach ($defaults as $index => $default) {
        $item = (array) ($saved[$index] ?? []);
        $values[$index] = [
            'title' => eres_checkout_saved_text($item, 'title', $default['title']),
            'text' => eres_checkout_saved_text($item, 'text', $default['text']),
        ];
    }

    return $values;
}

function eres_checkout_apply_settings(array $config): array
{
    $values = eres_checkout_settings_values();

    foreach ($values['fields'] as $key => $field) {
        if (isset($config['fields'][$key])) {
            $config['fields'][$key] = array_merge($config['fields'][$key], $field);
        }
    }

    $active_types = array_filter($values['document_types'], static fn(array $type): bool => $type['active']);
    if ($active_types) {
        $config['document_types'] = array_map(static fn(array $type): string => $type['label'], $active_types);
    }

    $config['districts'] = $values['districts'];
    $config['free_shipping_threshold'] = $values['free_shipping_threshold'];

    foreach ($values['delivery'] as $method => $texts) {
        if (isset($config['delivery'][$method])) {
            $config['delivery'][$method]['subtitle'] = $texts['subtitle'];
        }
    }

    foreach ($values['trust'] as $index => $texts) {
        if (isset($config['trust'][$index])) {
            $config['trust'][$index] = array_merge($config['trust'][$index], $texts);
        }
    }
    $config['trust'] = array_values(array_filter(
        $config['trust'],
        static fn(array $item): bool => $item['title'] !== '' || $item['text'] !== ''
    ));

    return $config;
}

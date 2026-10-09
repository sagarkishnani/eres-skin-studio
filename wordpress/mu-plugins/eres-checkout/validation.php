<?php

defined('ABSPATH') || exit;

const ERES_CHECKOUT_PHONE_RULE = ['pattern' => '^(\+?51)?\d{9}$', 'message' => 'El celular debe tener 9 dígitos.'];
const ERES_CHECKOUT_PHONE_SEPARATORS = '/[\s\-()]/';
const ERES_CHECKOUT_DOCUMENT_RULES = [
    'DNI' => ['pattern' => '^\d{8}$', 'message' => 'El DNI debe tener 8 dígitos.'],
    'RUC' => ['pattern' => '^\d{11}$', 'message' => 'El RUC debe tener 11 dígitos.'],
];
const ERES_CHECKOUT_DEFAULT_DOCUMENT_RULE = ['pattern' => '^[A-Za-z0-9]{5,12}$', 'message' => 'El número de documento debe tener entre 5 y 12 letras o números.'];
const ERES_CHECKOUT_EMAIL_RULE = ['pattern' => '^[^\s@]+@[^\s@]+\.[^\s@]+$', 'message' => 'Ingresa un correo electrónico válido.'];
const ERES_CHECKOUT_ADDRESS_RULE = ['minLength' => 5, 'message' => 'La dirección debe tener al menos 5 caracteres.'];
const ERES_CHECKOUT_ORDER_META_FIELDS = [
    '_billing_tipo_documento' => 'billing_tipo_documento',
    '_billing_numero_documento' => 'billing_numero_documento',
    '_billing_distrito' => 'billing_distrito',
];

add_filter('woocommerce_checkout_posted_data', 'eres_checkout_normalize_posted_data');
add_action('woocommerce_after_checkout_validation', 'eres_checkout_validate', 10, 2);
add_filter('woocommerce_checkout_required_field_notice', 'eres_checkout_required_field_notice', 10, 3);
add_action('woocommerce_checkout_create_order', 'eres_checkout_save_order_meta', 10, 2);
add_action('woocommerce_admin_order_data_after_billing_address', 'eres_checkout_admin_order_meta');
add_filter('eres_checkout_script_settings', 'eres_checkout_validation_script_settings');

function eres_checkout_is_delivery_posted(array $data): bool
{
    if (!WC()->cart->needs_shipping()) {
        return false;
    }

    $rate_id = (string) (((array) ($data['shipping_method'] ?? []))[0] ?? '');

    return $rate_id !== '' && !eres_checkout_is_pickup($rate_id);
}

function eres_checkout_normalize_posted_data(array $data): array
{
    $is_delivery = eres_checkout_is_delivery_posted($data);
    if (!$is_delivery) {
        foreach (array_keys(eres_checkout_config()['fields']) as $key) {
            if (eres_checkout_is_delivery_field($key)) {
                $data[$key] = '';
            }
        }
    }

    $region = [
        'country' => ERES_CHECKOUT_COUNTRY,
        'state' => ERES_CHECKOUT_STATE,
        'city' => !empty($data['billing_distrito']) ? $data['billing_distrito'] : ERES_CHECKOUT_DEFAULT_CITY,
        'postcode' => '',
    ];
    foreach (['billing', 'shipping'] as $address_type) {
        foreach ($region as $part => $value) {
            $data[$address_type . '_' . $part] = $value;
        }
    }
    $data['shipping_address_1'] = $data['billing_address_1'] ?? '';
    $data['shipping_address_2'] = $data['billing_address_2'] ?? '';

    return $data;
}

function eres_checkout_matches(string $pattern, string $value): bool
{
    return preg_match('/' . $pattern . '/', $value) === 1;
}

function eres_checkout_add_field_error(WP_Error $errors, string $key, string $message): void
{
    $errors->add($key . '_validation', $message, ['id' => $key]);
}

function eres_checkout_validate(array $data, WP_Error $errors): void
{
    $fields = eres_checkout_visible_fields();
    $posted = static fn(string $key): string => isset($fields[$key]) ? trim((string) ($data[$key] ?? '')) : '';

    if (eres_checkout_is_delivery_posted($data)) {
        eres_checkout_validate_delivery_fields($fields, $posted, $errors);
    }

    $phone = preg_replace(ERES_CHECKOUT_PHONE_SEPARATORS, '', $posted('billing_phone'));
    if ($phone !== '' && !eres_checkout_matches(ERES_CHECKOUT_PHONE_RULE['pattern'], $phone)) {
        eres_checkout_add_field_error($errors, 'billing_phone', ERES_CHECKOUT_PHONE_RULE['message']);
    }

    $document_number = $posted('billing_numero_documento');
    $document_rule = ERES_CHECKOUT_DOCUMENT_RULES[$posted('billing_tipo_documento')] ?? ERES_CHECKOUT_DEFAULT_DOCUMENT_RULE;
    if ($document_number !== '' && !eres_checkout_matches($document_rule['pattern'], $document_number)) {
        eres_checkout_add_field_error($errors, 'billing_numero_documento', $document_rule['message']);
    }
}

function eres_checkout_required_text(string $label): string
{
    return sprintf('%s es un campo obligatorio.', $label);
}

function eres_checkout_required_message(string $label): string
{
    return eres_checkout_required_text('<strong>' . esc_html($label) . '</strong>');
}

function eres_checkout_required_texts(): array
{
    $texts = [];
    foreach (eres_checkout_visible_fields() as $key => $settings) {
        if (eres_checkout_is_field_required($settings)) {
            $texts[$key] = eres_checkout_required_text($settings['label']);
        }
    }

    return $texts;
}

function eres_checkout_required_field_notice($notice, $field_label, $key)
{
    $label = eres_checkout_config()['fields'][$key]['label'] ?? '';

    return $label !== '' ? eres_checkout_required_message($label) : $notice;
}

function eres_checkout_validate_delivery_fields(array $fields, callable $posted, WP_Error $errors): void
{
    foreach ($fields as $key => $settings) {
        if (!empty($settings['delivery_only']) && eres_checkout_is_field_required($settings) && $posted($key) === '') {
            eres_checkout_add_field_error($errors, $key, eres_checkout_required_message($settings['label']));
        }
    }

    $district = $posted('billing_distrito');
    if ($district !== '' && !in_array($district, eres_checkout_config()['districts'], true)) {
        eres_checkout_add_field_error($errors, 'billing_distrito', 'Selecciona un distrito de la lista.');
    }

    $address = $posted('billing_address_1');
    if ($address !== '' && mb_strlen($address) < ERES_CHECKOUT_ADDRESS_RULE['minLength']) {
        eres_checkout_add_field_error($errors, 'billing_address_1', ERES_CHECKOUT_ADDRESS_RULE['message']);
    }
}

function eres_checkout_save_order_meta(WC_Order $order, array $data): void
{
    foreach (ERES_CHECKOUT_ORDER_META_FIELDS as $meta_key => $field_key) {
        $order->update_meta_data($meta_key, sanitize_text_field((string) ($data[$field_key] ?? '')));
    }
}

function eres_checkout_admin_order_meta(WC_Order $order): void
{
    $labels = eres_checkout_config()['fields'];
    foreach (ERES_CHECKOUT_ORDER_META_FIELDS as $meta_key => $field_key) {
        $value = (string) $order->get_meta($meta_key);
        if ($value !== '') {
            printf('<p><strong>%s:</strong> %s</p>', esc_html($labels[$field_key]['label'] ?? $field_key), esc_html($value));
        }
    }
}

function eres_checkout_validation_script_settings(array $settings): array
{
    $settings['validation'] = [
        'required' => eres_checkout_required_texts(),
        'email' => ERES_CHECKOUT_EMAIL_RULE,
        'phone' => ERES_CHECKOUT_PHONE_RULE,
        'documents' => ERES_CHECKOUT_DOCUMENT_RULES,
        'defaultDocument' => ERES_CHECKOUT_DEFAULT_DOCUMENT_RULE,
        'address' => ERES_CHECKOUT_ADDRESS_RULE,
    ];

    return $settings;
}

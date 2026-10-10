<?php

defined('ABSPATH') || exit;

const ERES_CHECKOUT_COUNTRY = 'PE';
const ERES_CHECKOUT_STATE = 'LMA';
const ERES_CHECKOUT_DEFAULT_CITY = 'Lima';
const ERES_CHECKOUT_PICKUP_METHOD = 'local_pickup';
const ERES_CHECKOUT_FULL_WIDTH_FIELDS = ['billing_distrito', 'billing_address_1', 'billing_address_2'];

add_filter('woocommerce_checkout_fields', 'eres_checkout_fields', 1000);
add_filter('woocommerce_enable_order_notes_field', '__return_false');
// Con "billing_only" WooCommerce no pinta los campos shipping_* y copia la dirección de facturación al envío del pedido.
add_filter('pre_option_woocommerce_ship_to_destination', 'eres_checkout_ship_to_billing_address');
add_filter('woocommerce_form_field', 'eres_checkout_hold_delivery_field', 10, 2);
add_action('woocommerce_after_checkout_billing_form', 'eres_checkout_fixed_region_inputs');
add_action('template_redirect', 'eres_checkout_fix_customer_region', 1);

function eres_checkout_ship_to_billing_address(): string
{
    return 'billing_only';
}

function eres_checkout_visible_fields(): array
{
    return array_filter(
        eres_checkout_config()['fields'],
        static fn(array $settings): bool => !empty($settings['locked']) || !empty($settings['visible'])
    );
}

function eres_checkout_is_field_required(array $settings): bool
{
    return !empty($settings['locked']) || !empty($settings['required']);
}

function eres_checkout_is_delivery_field(string $key): bool
{
    return !empty(eres_checkout_config()['fields'][$key]['delivery_only']);
}

function eres_checkout_fields(array $fields): array
{
    $defaults = $fields['billing'] ?? [];
    $billing = [];
    $priority = 10;

    foreach (eres_checkout_visible_fields() as $key => $settings) {
        $is_delivery_field = !empty($settings['delivery_only']);
        $is_required = eres_checkout_is_field_required($settings);

        $billing[$key] = array_merge(
            $defaults[$key] ?? ['type' => 'text'],
            eres_checkout_choice_field($key, $settings),
            [
                'label' => $settings['label'],
                'label_class' => [],
                'placeholder' => $settings['placeholder'] ?? '',
                // La obligatoriedad de los campos de envío depende del método elegido: la resuelve validation.php.
                'required' => $is_required && !$is_delivery_field,
                'eres_required' => $is_required,
                'priority' => $priority,
                'class' => ['eres-field', in_array($key, ERES_CHECKOUT_FULL_WIDTH_FIELDS, true) ? 'eres-field--full' : 'eres-field--half'],
            ]
        );
        $priority += 10;
    }

    $fields['billing'] = $billing;

    return $fields;
}

function eres_checkout_choice_field(string $key, array $settings): array
{
    $config = eres_checkout_config();
    $choices = [
        'billing_tipo_documento' => $config['document_types'],
        'billing_distrito' => array_combine($config['districts'], $config['districts']),
    ];
    if (!isset($choices[$key])) {
        return [];
    }

    return [
        'type' => 'select',
        'options' => ['' => $settings['placeholder'] ?? ''] + $choices[$key],
    ];
}

function eres_checkout_delivery_fields_rendering(?bool $rendering = null): bool
{
    static $is_rendering = false;
    if ($rendering !== null) {
        $is_rendering = $rendering;
    }

    return $is_rendering;
}

function eres_checkout_hold_delivery_field($field, $key)
{
    $is_held = is_checkout() && eres_checkout_is_delivery_field((string) $key) && !eres_checkout_delivery_fields_rendering();

    return $is_held ? '' : $field;
}

function eres_checkout_fixed_region_inputs(): void
{
    printf('<input type="hidden" name="billing_country" id="billing_country" value="%s">', esc_attr(ERES_CHECKOUT_COUNTRY));
    printf('<input type="hidden" name="billing_state" id="billing_state" value="%s">', esc_attr(ERES_CHECKOUT_STATE));
}

function eres_checkout_fix_customer_region(): void
{
    if (!eres_checkout_is_form() || !WC()->customer) {
        return;
    }

    WC()->customer->set_props([
        'billing_country' => ERES_CHECKOUT_COUNTRY,
        'billing_state' => ERES_CHECKOUT_STATE,
        'shipping_country' => ERES_CHECKOUT_COUNTRY,
        'shipping_state' => ERES_CHECKOUT_STATE,
    ]);
}

function eres_checkout_is_pickup(string $rate_id): bool
{
    return str_starts_with($rate_id, ERES_CHECKOUT_PICKUP_METHOD);
}

<?php

defined('ABSPATH') || exit;

const ERES_CHECKOUT_DELIVERY_FRAGMENT = '.eres-delivery__methods';

add_filter('woocommerce_shipping_chosen_method', 'eres_checkout_default_to_pickup', 10, 2);
add_action('woocommerce_checkout_after_customer_details', 'eres_checkout_delivery_step', 20);
add_filter('woocommerce_update_order_review_fragments', 'eres_checkout_delivery_fragment');
add_filter('wc_get_template', 'eres_checkout_shipping_row_template', 10, 2);
add_filter('eres_checkout_script_settings', 'eres_checkout_delivery_script_settings');

function eres_checkout_step_count(): int
{
    return WC()->cart && WC()->cart->needs_shipping() ? 3 : 2;
}

function eres_checkout_step_heading(int $number, string $name, string $title): void
{
    printf(
        '<div class="eres-step%s"><span class="eres-step__eyebrow">— Paso %d de %d · %s</span><h2 class="eres-step__title">%s</h2></div>',
        $number > 1 ? ' eres-step--following' : '',
        $number,
        eres_checkout_step_count(),
        esc_html($name),
        esc_html($title)
    );
}

function eres_checkout_default_to_pickup($default, $rates)
{
    foreach (array_keys((array) $rates) as $rate_id) {
        if (eres_checkout_is_pickup((string) $rate_id)) {
            return $rate_id;
        }
    }

    return $default;
}

function eres_checkout_shipping_rates(): array
{
    $packages = WC()->shipping()->get_packages();

    return $packages[0]['rates'] ?? [];
}

function eres_checkout_chosen_rate_id(): string
{
    $rates = eres_checkout_shipping_rates();
    $chosen = (string) (((array) WC()->session->get('chosen_shipping_methods', []))[0] ?? '');

    return isset($rates[$chosen]) ? $chosen : (string) (array_key_first($rates) ?? '');
}

function eres_checkout_is_delivery_chosen(): bool
{
    $chosen = eres_checkout_chosen_rate_id();

    return $chosen !== '' && !eres_checkout_is_pickup($chosen);
}

function eres_checkout_rate_texts(WC_Shipping_Rate $rate): array
{
    $texts = eres_checkout_config()['delivery'][$rate->get_method_id()] ?? [];

    return [
        'title' => $texts['title'] ?? $rate->get_label(),
        'subtitle' => $texts['subtitle'] ?? '',
        'summary' => $texts['summary'] ?? $rate->get_label(),
    ];
}

function eres_checkout_rate_cost(WC_Shipping_Rate $rate): float
{
    $cost = (float) $rate->get_cost();

    return WC()->cart->display_prices_including_tax() ? $cost + (float) $rate->get_shipping_tax() : $cost;
}

function eres_checkout_rate_option_title(WC_Shipping_Rate $rate): string
{
    $title = esc_html(eres_checkout_rate_texts($rate)['title']);
    $cost = eres_checkout_rate_cost($rate);
    if ($cost > 0) {
        return $title . ' · ' . wc_price($cost);
    }

    return eres_checkout_is_pickup($rate->get_id()) ? $title : $title . ' · Gratis';
}

function eres_checkout_rate_summary(WC_Shipping_Rate $rate): string
{
    $cost = eres_checkout_rate_cost($rate);

    return esc_html(eres_checkout_rate_texts($rate)['summary']) . ' · ' . ($cost > 0 ? wc_price($cost) : 'Gratis');
}

function eres_checkout_chosen_rate_summary(): string
{
    $rate = eres_checkout_shipping_rates()[eres_checkout_chosen_rate_id()] ?? null;

    return $rate instanceof WC_Shipping_Rate ? eres_checkout_rate_summary($rate) : 'No disponible';
}

function eres_checkout_delivery_methods_html(): string
{
    $rates = eres_checkout_shipping_rates();
    $chosen = eres_checkout_chosen_rate_id();

    ob_start();
    ?>
    <div class="eres-delivery__methods">
        <?php if (!$rates) : ?>
            <p class="eres-delivery__empty">No hay métodos de entrega disponibles para tu dirección.</p>
        <?php else : ?>
            <ul id="shipping_method" class="eres-delivery__options woocommerce-shipping-methods">
                <?php foreach ($rates as $rate) : ?>
                    <?php
                    $input_id = 'shipping_method_0_' . sanitize_title($rate->get_id());
                    $texts = eres_checkout_rate_texts($rate);
                    ?>
                    <li>
                        <label class="eres-delivery__option" for="<?php echo esc_attr($input_id); ?>">
                            <input type="radio" name="shipping_method[0]" data-index="0" id="<?php echo esc_attr($input_id); ?>" value="<?php echo esc_attr($rate->get_id()); ?>" class="shipping_method" <?php checked($rate->get_id(), $chosen); ?>>
                            <span class="eres-delivery__text">
                                <span class="eres-delivery__title"><?php echo wp_kses_post(eres_checkout_rate_option_title($rate)); ?></span>
                                <?php if ($texts['subtitle'] !== '') : ?>
                                    <span class="eres-delivery__subtitle"><?php echo esc_html($texts['subtitle']); ?></span>
                                <?php endif; ?>
                            </span>
                        </label>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
    </div>
    <?php

    return (string) ob_get_clean();
}

function eres_checkout_delivery_address_fields(): void
{
    $checkout = WC()->checkout();
    $delivery_fields = array_filter(
        $checkout->get_checkout_fields('billing'),
        static fn(string $key): bool => eres_checkout_is_delivery_field($key),
        ARRAY_FILTER_USE_KEY
    );
    if (!$delivery_fields) {
        return;
    }

    eres_checkout_delivery_fields_rendering(true);
    printf('<div class="eres-delivery__address" data-eres-delivery-address%s>', eres_checkout_is_delivery_chosen() ? '' : ' hidden');
    foreach ($delivery_fields as $key => $field) {
        $field['required'] = !empty($field['eres_required']);
        woocommerce_form_field($key, $field, $checkout->get_value($key));
    }
    echo '</div>';
    eres_checkout_delivery_fields_rendering(false);
}

function eres_checkout_delivery_step(): void
{
    if (!WC()->cart->needs_shipping()) {
        return;
    }

    echo '<section class="eres-delivery">';
    eres_checkout_step_heading(2, 'Entrega', '¿Cómo lo recibes?');
    echo eres_checkout_delivery_methods_html();
    eres_checkout_delivery_address_fields();
    echo '</section>';
}

function eres_checkout_delivery_fragment(array $fragments): array
{
    if (WC()->cart->needs_shipping()) {
        $fragments[ERES_CHECKOUT_DELIVERY_FRAGMENT] = eres_checkout_delivery_methods_html();
    }

    return $fragments;
}

function eres_checkout_shipping_row_template($template, $template_name)
{
    return $template_name === 'cart/cart-shipping.php' && is_checkout()
        ? ERES_CHECKOUT_DIR . '/templates/cart-shipping.php'
        : $template;
}

function eres_checkout_delivery_script_settings(array $settings): array
{
    $settings['pickupMethod'] = ERES_CHECKOUT_PICKUP_METHOD;

    return $settings;
}

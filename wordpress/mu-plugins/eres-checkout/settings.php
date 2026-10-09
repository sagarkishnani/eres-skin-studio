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

const ERES_CHECKOUT_SETTINGS_TAB = 'eres_checkout';
const ERES_CHECKOUT_SETTINGS_INPUT = 'eres_checkout';
const ERES_CHECKOUT_SETTINGS_SECTIONS = ['fields', 'document_types', 'districts', 'delivery', 'free_shipping_threshold', 'trust'];
const ERES_CHECKOUT_LABEL_MAX_LENGTH = 60;
const ERES_CHECKOUT_PLACEHOLDER_MAX_LENGTH = 80;
const ERES_CHECKOUT_SUBTITLE_MAX_LENGTH = 120;
const ERES_CHECKOUT_TRUST_TITLE_MAX_LENGTH = 40;
const ERES_CHECKOUT_TRUST_TEXT_MAX_LENGTH = 80;
const ERES_CHECKOUT_FREE_SHIPPING_METHOD = 'free_shipping';
const ERES_CHECKOUT_MIN_AMOUNT_REQUIREMENTS = ['min_amount', 'either', 'both'];

add_filter('woocommerce_settings_tabs_array', 'eres_checkout_settings_tab', 50);
add_action('woocommerce_settings_' . ERES_CHECKOUT_SETTINGS_TAB, 'eres_checkout_render_settings');

function eres_checkout_settings_tab(array $tabs): array
{
    $tabs[ERES_CHECKOUT_SETTINGS_TAB] = 'Checkout ERES';

    return $tabs;
}

function eres_checkout_settings_input_name(string ...$path): string
{
    return ERES_CHECKOUT_SETTINGS_INPUT . '[' . implode('][', $path) . ']';
}

function eres_checkout_render_settings(): void
{
    $values = eres_checkout_settings_values();
    foreach (ERES_CHECKOUT_SETTINGS_SECTIONS as $section) {
        call_user_func('eres_checkout_render_' . $section . '_section', $values[$section]);
    }
}

function eres_checkout_render_fields_section(array $fields): void
{
    $defaults = eres_checkout_default_config()['fields'];
    ?>
    <h2>Campos</h2>
    <p>Qué datos pide el checkout y cuáles son obligatorios. Nombre, Apellidos y Correo electrónico siempre se piden.</p>
    <table class="widefat striped" style="max-width: 960px;">
        <thead>
            <tr>
                <th>Campo</th>
                <th>Visible</th>
                <th>Obligatorio</th>
                <th>Etiqueta</th>
                <th>Placeholder</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($fields as $key => $field) : ?>
                <?php $is_locked = !empty($defaults[$key]['locked']); ?>
                <tr>
                    <td>
                        <strong><?php echo esc_html($defaults[$key]['label']); ?></strong>
                        <?php if (!empty($defaults[$key]['delivery_only'])) : ?>
                            <br><span class="description">Solo con envío a domicilio</span>
                        <?php endif; ?>
                    </td>
                    <td>
                        <input type="checkbox" name="<?php echo esc_attr(eres_checkout_settings_input_name('fields', $key, 'visible')); ?>" value="1" aria-label="Visible" <?php checked($field['visible']); ?> <?php disabled($is_locked); ?>>
                    </td>
                    <td>
                        <input type="checkbox" name="<?php echo esc_attr(eres_checkout_settings_input_name('fields', $key, 'required')); ?>" value="1" aria-label="Obligatorio" <?php checked($field['required']); ?> <?php disabled($is_locked); ?>>
                    </td>
                    <td>
                        <input type="text" class="regular-text" style="width: 100%;" name="<?php echo esc_attr(eres_checkout_settings_input_name('fields', $key, 'label')); ?>" value="<?php echo esc_attr($field['label']); ?>" maxlength="<?php echo esc_attr((string) ERES_CHECKOUT_LABEL_MAX_LENGTH); ?>" aria-label="Etiqueta">
                    </td>
                    <td>
                        <input type="text" class="regular-text" style="width: 100%;" name="<?php echo esc_attr(eres_checkout_settings_input_name('fields', $key, 'placeholder')); ?>" value="<?php echo esc_attr($field['placeholder']); ?>" maxlength="<?php echo esc_attr((string) ERES_CHECKOUT_PLACEHOLDER_MAX_LENGTH); ?>" aria-label="Placeholder">
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <p class="description">Si ocultas Distrito o Dirección, los pedidos con envío a domicilio llegarán sin ese dato.</p>
    <?php
}

add_action('woocommerce_update_options_' . ERES_CHECKOUT_SETTINGS_TAB, 'eres_checkout_save_settings');

function eres_checkout_limited_text($value, int $max_length): string
{
    return mb_substr(sanitize_text_field(is_scalar($value) ? (string) $value : ''), 0, $max_length);
}

function eres_checkout_save_settings(): void
{
    if (!current_user_can('manage_woocommerce')) {
        return;
    }

    // WooCommerce ya verificó el nonce del formulario de ajustes antes de disparar este hook.
    $posted = isset($_POST[ERES_CHECKOUT_SETTINGS_INPUT]) ? (array) wp_unslash($_POST[ERES_CHECKOUT_SETTINGS_INPUT]) : [];
    $settings = array_merge(eres_checkout_settings_values(), ['version' => ERES_CHECKOUT_SETTINGS_VERSION]);
    foreach (ERES_CHECKOUT_SETTINGS_SECTIONS as $section) {
        $settings[$section] = call_user_func('eres_checkout_sanitize_' . $section, $posted[$section] ?? null, $settings[$section]);
    }

    update_option(ERES_CHECKOUT_SETTINGS_OPTION, $settings, true);
}

function eres_checkout_sanitize_fields($posted, array $current): array
{
    $posted = (array) $posted;
    $defaults = eres_checkout_default_config()['fields'];
    $fields = [];

    foreach ($defaults as $key => $default) {
        $field = (array) ($posted[$key] ?? []);
        $is_locked = !empty($default['locked']);
        $is_visible = $is_locked || !empty($field['visible']);
        $label = eres_checkout_limited_text($field['label'] ?? '', ERES_CHECKOUT_LABEL_MAX_LENGTH);

        $fields[$key] = [
            'visible' => $is_visible,
            'required' => $is_locked || ($is_visible && !empty($field['required'])),
            'label' => $label !== '' ? $label : $default['label'],
            'placeholder' => eres_checkout_limited_text($field['placeholder'] ?? '', ERES_CHECKOUT_PLACEHOLDER_MAX_LENGTH),
        ];
    }

    return $fields;
}

function eres_checkout_render_document_types_section(array $types): void
{
    $defaults = eres_checkout_default_config()['document_types'];
    ?>
    <h2>Tipos de documento</h2>
    <p>Opciones del campo "Tipo de documento". Tiene que quedar al menos una activa.</p>
    <table class="widefat striped" style="max-width: 640px;">
        <thead>
            <tr>
                <th>Tipo</th>
                <th>Activo</th>
                <th>Etiqueta</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($types as $code => $type) : ?>
                <tr>
                    <td><strong><?php echo esc_html($defaults[$code]); ?></strong></td>
                    <td>
                        <input type="checkbox" name="<?php echo esc_attr(eres_checkout_settings_input_name('document_types', (string) $code, 'active')); ?>" value="1" aria-label="Activo" <?php checked($type['active']); ?>>
                    </td>
                    <td>
                        <input type="text" class="regular-text" style="width: 100%;" name="<?php echo esc_attr(eres_checkout_settings_input_name('document_types', (string) $code, 'label')); ?>" value="<?php echo esc_attr($type['label']); ?>" maxlength="<?php echo esc_attr((string) ERES_CHECKOUT_LABEL_MAX_LENGTH); ?>" aria-label="Etiqueta">
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php
}

function eres_checkout_sanitize_document_types($posted, array $current): array
{
    $posted = (array) $posted;
    $types = [];
    foreach (eres_checkout_default_config()['document_types'] as $code => $default_label) {
        $type = (array) ($posted[$code] ?? []);
        $label = eres_checkout_limited_text($type['label'] ?? '', ERES_CHECKOUT_LABEL_MAX_LENGTH);
        $types[$code] = [
            'active' => !empty($type['active']),
            'label' => $label !== '' ? $label : $default_label,
        ];
    }

    if (!array_filter(array_column($types, 'active'))) {
        WC_Admin_Settings::add_error('Deja al menos un tipo de documento activo.');

        return $current;
    }

    return $types;
}

function eres_checkout_render_districts_section(array $districts): void
{
    ?>
    <h2>Distritos</h2>
    <p>Opciones del campo "Distrito", en el orden en que se muestran. Escribe un distrito por línea.</p>
    <textarea name="<?php echo esc_attr(eres_checkout_settings_input_name('districts')); ?>" rows="12" class="large-text" style="max-width: 640px;" aria-label="Distritos"><?php echo esc_textarea(implode("\n", $districts)); ?></textarea>
    <?php
}

function eres_checkout_sanitize_districts($posted, array $current): array
{
    $lines = preg_split('/\R/u', is_string($posted) ? $posted : '') ?: [];
    $districts = array_values(array_unique(array_filter(
        array_map(static fn(string $line): string => eres_checkout_limited_text($line, ERES_CHECKOUT_LABEL_MAX_LENGTH), $lines),
        static fn(string $district): bool => $district !== ''
    )));

    if (!$districts) {
        WC_Admin_Settings::add_error('Agrega al menos un distrito.');

        return $current;
    }

    return $districts;
}

function eres_checkout_render_delivery_section(array $delivery): void
{
    $defaults = eres_checkout_default_config()['delivery'];
    ?>
    <h2>Entrega</h2>
    <p>Texto que aparece bajo el título de cada tarjeta de entrega. Los precios y los métodos se configuran en la pestaña Envío.</p>
    <table class="form-table">
        <?php foreach ($delivery as $method => $texts) : ?>
            <?php $input_id = 'eres-checkout-delivery-' . $method; ?>
            <tr>
                <th scope="row">
                    <label for="<?php echo esc_attr($input_id); ?>"><?php echo esc_html($defaults[$method]['title']); ?></label>
                    <br><code><?php echo esc_html($method); ?></code>
                </th>
                <td>
                    <input type="text" class="large-text" style="max-width: 640px;" id="<?php echo esc_attr($input_id); ?>" name="<?php echo esc_attr(eres_checkout_settings_input_name('delivery', (string) $method, 'subtitle')); ?>" value="<?php echo esc_attr($texts['subtitle']); ?>" maxlength="<?php echo esc_attr((string) ERES_CHECKOUT_SUBTITLE_MAX_LENGTH); ?>">
                </td>
            </tr>
        <?php endforeach; ?>
    </table>
    <?php
}

function eres_checkout_sanitize_delivery($posted, array $current): array
{
    $posted = (array) $posted;
    $delivery = [];
    foreach (array_keys(eres_checkout_default_config()['delivery']) as $method) {
        $delivery[$method] = ['subtitle' => eres_checkout_limited_text(((array) ($posted[$method] ?? []))['subtitle'] ?? '', ERES_CHECKOUT_SUBTITLE_MAX_LENGTH)];
    }

    return $delivery;
}

function eres_checkout_woocommerce_free_shipping_amounts(): array
{
    $zones = array_map(
        static fn(array $zone): WC_Shipping_Zone => new WC_Shipping_Zone($zone['id']),
        WC_Shipping_Zones::get_zones()
    );
    $zones[] = new WC_Shipping_Zone(0);

    $amounts = [];
    foreach ($zones as $zone) {
        foreach ($zone->get_shipping_methods(true) as $method) {
            if ($method->id === ERES_CHECKOUT_FREE_SHIPPING_METHOD && in_array($method->requires, ERES_CHECKOUT_MIN_AMOUNT_REQUIREMENTS, true)) {
                $amounts[] = (float) $method->min_amount;
            }
        }
    }

    return array_values(array_unique($amounts));
}

function eres_checkout_free_shipping_notice(float $threshold): void
{
    $amounts = eres_checkout_woocommerce_free_shipping_amounts();
    if (!$amounts) {
        echo '<p class="description">WooCommerce no tiene un método de envío gratuito con monto mínimo configurado.</p>';

        return;
    }

    $formatted_amounts = wp_strip_all_tags(implode(', ', array_map('wc_price', $amounts)));
    printf('<p class="description">Monto mínimo del envío gratuito en WooCommerce: %s.</p>', esc_html($formatted_amounts));

    $has_mismatch = $threshold > 0 && array_filter($amounts, static fn(float $amount): bool => abs($amount - $threshold) > 0.001);
    if ($has_mismatch) {
        printf(
            '<div class="notice notice-warning inline"><p>El monto no coincide con el de WooCommerce (%s). La barra prometería un envío gratuito que no se aplica.</p></div>',
            esc_html($formatted_amounts)
        );
    }
}

function eres_checkout_render_free_shipping_threshold_section(float $threshold): void
{
    ?>
    <h2>Envío gratuito</h2>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="eres-checkout-free-shipping">Monto para envío gratuito (<?php echo esc_html(get_woocommerce_currency_symbol()); ?>)</label></th>
            <td>
                <input type="number" min="0" step="0.01" class="small-text" style="width: 120px;" id="eres-checkout-free-shipping" name="<?php echo esc_attr(eres_checkout_settings_input_name('free_shipping_threshold')); ?>" value="<?php echo esc_attr((string) $threshold); ?>">
                <p class="description">Es el monto de la barra "Te faltan… para obtener envío gratuito". Con 0 la barra no se muestra.</p>
                <?php eres_checkout_free_shipping_notice($threshold); ?>
            </td>
        </tr>
    </table>
    <?php
}

function eres_checkout_sanitize_free_shipping_threshold($posted, float $current): float
{
    return is_scalar($posted) ? max(0.0, (float) wc_format_decimal((string) $posted)) : $current;
}

function eres_checkout_render_trust_section(array $trust): void
{
    ?>
    <h2>Textos de confianza</h2>
    <p>Los tres mensajes que aparecen bajo el total. Un mensaje con título y texto vacíos no se muestra.</p>
    <table class="widefat striped" style="max-width: 960px;">
        <thead>
            <tr>
                <th>Título</th>
                <th>Texto</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($trust as $index => $item) : ?>
                <tr>
                    <td>
                        <input type="text" class="regular-text" style="width: 100%;" name="<?php echo esc_attr(eres_checkout_settings_input_name('trust', (string) $index, 'title')); ?>" value="<?php echo esc_attr($item['title']); ?>" maxlength="<?php echo esc_attr((string) ERES_CHECKOUT_TRUST_TITLE_MAX_LENGTH); ?>" aria-label="Título">
                    </td>
                    <td>
                        <input type="text" class="regular-text" style="width: 100%;" name="<?php echo esc_attr(eres_checkout_settings_input_name('trust', (string) $index, 'text')); ?>" value="<?php echo esc_attr($item['text']); ?>" maxlength="<?php echo esc_attr((string) ERES_CHECKOUT_TRUST_TEXT_MAX_LENGTH); ?>" aria-label="Texto">
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php
}

function eres_checkout_sanitize_trust($posted, array $current): array
{
    $posted = (array) $posted;
    $trust = [];
    foreach (array_keys(eres_checkout_default_config()['trust']) as $index) {
        $item = (array) ($posted[$index] ?? []);
        $trust[$index] = [
            'title' => eres_checkout_limited_text($item['title'] ?? '', ERES_CHECKOUT_TRUST_TITLE_MAX_LENGTH),
            'text' => eres_checkout_limited_text($item['text'] ?? '', ERES_CHECKOUT_TRUST_TEXT_MAX_LENGTH),
        ];
    }

    return $trust;
}

const ERES_CHECKOUT_RESET_ACTION = 'eres_checkout_reset';
const ERES_CHECKOUT_RESTORED_FLAG = 'eres_checkout_restored';

add_action('admin_init', 'eres_checkout_handle_settings_reset');
add_action('woocommerce_settings_' . ERES_CHECKOUT_SETTINGS_TAB, 'eres_checkout_render_settings_reset', 20);

function eres_checkout_settings_url(array $query = []): string
{
    return add_query_arg(
        array_merge(['page' => 'wc-settings', 'tab' => ERES_CHECKOUT_SETTINGS_TAB], $query),
        admin_url('admin.php')
    );
}

function eres_checkout_handle_settings_reset(): void
{
    $is_reset_request = !empty($_GET[ERES_CHECKOUT_RESET_ACTION])
        && ($_GET['page'] ?? '') === 'wc-settings'
        && ($_GET['tab'] ?? '') === ERES_CHECKOUT_SETTINGS_TAB;
    if (!$is_reset_request || !current_user_can('manage_woocommerce')) {
        return;
    }

    check_admin_referer(ERES_CHECKOUT_RESET_ACTION);
    delete_option(ERES_CHECKOUT_SETTINGS_OPTION);
    wp_safe_redirect(eres_checkout_settings_url([ERES_CHECKOUT_RESTORED_FLAG => 1]));
    exit;
}

function eres_checkout_render_settings_reset(): void
{
    if (!empty($_GET[ERES_CHECKOUT_RESTORED_FLAG])) {
        echo '<div class="notice notice-success inline"><p>Se restablecieron los valores originales del checkout.</p></div>';
    }

    printf(
        '<p style="margin-top: 32px;"><a href="%s" onclick="return confirm(\'%s\');">Restablecer valores</a><br><span class="description">Descarta todo lo guardado en esta pestaña y vuelve a los valores originales.</span></p>',
        esc_url(wp_nonce_url(eres_checkout_settings_url([ERES_CHECKOUT_RESET_ACTION => 1]), ERES_CHECKOUT_RESET_ACTION)),
        esc_js('¿Restablecer los valores originales del checkout? Se perderán los cambios guardados en esta pestaña.')
    );
}

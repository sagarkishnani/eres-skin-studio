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
const ERES_CHECKOUT_SETTINGS_SECTIONS = ['fields', 'document_types', 'districts'];
const ERES_CHECKOUT_LABEL_MAX_LENGTH = 60;
const ERES_CHECKOUT_PLACEHOLDER_MAX_LENGTH = 80;

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

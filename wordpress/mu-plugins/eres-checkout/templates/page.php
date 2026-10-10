<?php

defined('ABSPATH') || exit;

$config = eres_checkout_config();
$is_form = eres_checkout_is_form();
$back_url = eres_checkout_back_url();
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class('eres-checkout-page'); ?>>
<?php wp_body_open(); ?>

<header class="eres-header">
    <div class="eres-header__inner">
        <a class="eres-header__back" href="<?php echo esc_url($back_url); ?>">
            <?php echo eres_checkout_icon('arrow-left'); ?>
            <span>Volver</span>
        </a>
        <a class="eres-header__logo" href="<?php echo esc_url($back_url); ?>" aria-label="ERES Skin Studio">
            <img src="<?php echo esc_url(eres_checkout_asset_url('logo-eres.svg')); ?>" width="309" height="137" alt="">
        </a>
        <p class="eres-header__secure">
            <?php echo eres_checkout_icon('shield'); ?>
            <span>Compra segura</span>
        </p>
    </div>
</header>

<main class="eres-main<?php echo $is_form ? '' : ' eres-main--single'; ?>">
    <?php if ($is_form) : ?>
        <?php echo do_shortcode('[woocommerce_checkout]'); ?>
    <?php else : ?>
        <div class="eres-card">
            <h1 class="eres-title"><?php echo esc_html(eres_checkout_page_title()); ?></h1>
            <?php echo do_shortcode('[woocommerce_checkout]'); ?>
        </div>
    <?php endif; ?>
</main>

<footer class="eres-footer">
    <nav class="eres-footer__links" aria-label="Legales">
        <?php foreach ($config['legal_links'] as $label => $path) : ?>
            <a href="<?php echo esc_url(eres_checkout_site_link($path)); ?>" target="_blank" rel="noopener"><?php echo esc_html($label); ?></a>
        <?php endforeach; ?>
    </nav>
    <p class="eres-footer__legal">Eres Skin Studio · Todos los derechos reservados</p>
</footer>

<?php if (!empty($config['whatsapp_url'])) : ?>
    <a class="eres-whatsapp" href="<?php echo esc_url($config['whatsapp_url']); ?>" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
        <span class="eres-whatsapp__pulse" aria-hidden="true"></span>
        <span class="eres-whatsapp__pulse eres-whatsapp__pulse--delayed" aria-hidden="true"></span>
        <?php echo ERES_CHECKOUT_WHATSAPP_ICON; ?>
    </a>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>

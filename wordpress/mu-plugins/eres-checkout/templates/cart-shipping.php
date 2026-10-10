<?php

defined('ABSPATH') || exit;
?>
<tr class="woocommerce-shipping-totals shipping">
    <th>Envío</th>
    <td data-title="Envío"><?php echo wp_kses_post(eres_checkout_chosen_rate_summary()); ?></td>
</tr>

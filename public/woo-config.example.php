<?php
// Súbelo como woo-config.php junto a woo-api.php, fuera del repo y de dist/. Nunca commitees valores reales.
// Lo leen woo-api.php y rebuild-hook.php.
return [
    'store_url'       => 'https://eresskinstudio.com',
    'consumer_key'    => 'ck_CHANGE-ME',
    'consumer_secret' => 'cs_CHANGE-ME',
    'allowed_origins' => ['https://eresskinstudio.com'],
    'cache_ttl'       => ['products' => 300, 'product' => 300, 'categories' => 3600, 'stock' => 60],
    'rate_limit'      => 120,

    'webhook_secret'  => 'CHANGE-ME',
    'github_repo'     => 'sagarkishnani/eres-skin-studio',
    'github_token'    => 'github_pat_CHANGE-ME',
];

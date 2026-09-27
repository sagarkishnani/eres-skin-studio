<?php
// Se sube como woo-config.php junto a woo-api.php, fuera del repo y de dist/. Nunca con valores reales en git.
return [
  // URL base del WordPress, sin barra final. Debe ser https: las claves viajan en Basic Auth.
  'store_url'       => 'https://eresskinstudio.com',

  // Claves de la API REST de WooCommerce con permiso de SOLO LECTURA.
  'consumer_key'    => 'ck_CHANGE-ME',
  'consumer_secret' => 'cs_CHANGE-ME',

  // Orígenes autorizados a llamar al proxy. Vacío = cualquiera (no recomendado en producción).
  'allowed_origins' => [
    'https://eresskinstudio.com',
    'http://localhost:4321',
  ],

  // Segundos de caché en disco por tipo de respuesta.
  'cache_ttl'       => [
    'products'   => 300,
    'product'    => 300,
    'categories' => 900,
    'stock'      => 15,
  ],

  // Máximo de peticiones por IP y por minuto.
  'rate_limit'      => 120,
];

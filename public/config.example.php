<?php
// Upload as site-config.php next to send-email.php, outside the repo and dist/. Never commit real values.
return [
  'smtp_host'        => 'smtp.office365.com',       // not a secret
  'smtp_port'        => 587,                   // not a secret
  'smtp_user'        => 'hola@eresskinstudio.com',
  'smtp_pass'        => 'CHANGE-ME',
  'fallback_email'   => 'hola@eresskinstudio.com',   // used when form-config.json has no recipients
  'turnstile_secret' => '',                    // Cloudflare Turnstile secret key; empty = captcha off
  'claims_endpoint'  => 'https://eresskinstudio.com/wp-json/eres/v1/claims', // empty = claims are not registered in WordPress
  'claims_secret'    => '',                    // same value as ERES_CLAIMS_SECRET in wp-config.php
];

<?php
// Recibe los webhooks de productos de WooCommerce y dispara el rebuild en GitHub Actions.
// Woo no permite mandar el header Authorization que pide GitHub, por eso existe este relevo.
// Un cambio que solo toca existencias no redespliega: el navegador ya lo lee de woo-api.php.

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const GITHUB_EVENT_TYPE = 'woo-catalog-changed';
const MAX_BODY_BYTES = 262144;
const UPDATED_TOPIC = 'product.updated';
// El precio y el estado de stock sí cuentan: el build los usa en filtros, orden y etiqueta de descuento.
const FIELDS_SERVED_LIVE = ['stock_quantity', 'total_sales', 'date_modified', 'date_modified_gmt', '_links'];

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(405, 'Método no permitido.');

$CONFIG_PATH = __DIR__ . '/woo-config.php';
if (!file_exists($CONFIG_PATH)) respond(503, 'Rebuild no configurado.');
$cfg = require $CONFIG_PATH;

$secret = $cfg['webhook_secret'] ?? '';
$repo   = $cfg['github_repo'] ?? '';
$token  = $cfg['github_token'] ?? '';
if ($secret === '' || $repo === '' || $token === '') respond(503, 'Rebuild no configurado.');

$body = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($body === false || strlen($body) > MAX_BODY_BYTES) respond(413, 'Petición demasiado grande.');

$topic = $_SERVER['HTTP_X_WC_WEBHOOK_TOPIC'] ?? '';

// Al guardar un webhook, Woo manda un ping sin firma ("webhook_id=N") y lo desactiva si no recibe 2xx.
if ($topic === '' && preg_match('/^webhook_id=\d+$/', $body)) respond(200, 'pong');

if (!isValidSignature($body, $_SERVER['HTTP_X_WC_WEBHOOK_SIGNATURE'] ?? '', $secret)) {
    respond(401, 'Firma inválida.');
}

if (!str_starts_with($topic, 'product.')) respond(200, 'Tema ignorado.');

$product = json_decode($body, true);
if (!is_array($product)) $product = [];
$productId = (int)($product['id'] ?? 0);

purgeProxyCache();

$fingerprint = buildFingerprint($product);
if ($topic === UPDATED_TOPIC && $productId > 0 && readFingerprint($productId) === $fingerprint) {
    respond(200, 'Sin cambios que requieran rebuild.');
}

$payload = [
    'event_type'     => GITHUB_EVENT_TYPE,
    'client_payload' => ['topic' => $topic, 'id' => $productId],
];

$status = dispatchToGithub($repo, $token, $payload);

// Woo desactiva el webhook tras varias entregas fallidas; un fallo de GitHub lo cubre el cron diario.
if ($status !== 204) {
    error_log("[rebuild-hook] GitHub respondió $status para $topic");
    respond(200, 'Rebuild no disparado.');
}

if ($productId > 0) writeFingerprint($productId, $fingerprint);

respond(200, 'Rebuild disparado.');

function buildFingerprint(array $product): string
{
    $relevant = array_diff_key($product, array_flip(FIELDS_SERVED_LIVE));
    ksort($relevant);
    return sha1(json_encode($relevant));
}

function fingerprintPath(int $productId): string
{
    $dir = __DIR__ . '/data/woo-rebuild';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    return "$dir/$productId.txt";
}

function readFingerprint(int $productId): string
{
    $stored = @file_get_contents(fingerprintPath($productId));
    return $stored === false ? '' : trim($stored);
}

function writeFingerprint(int $productId, string $fingerprint): void
{
    @file_put_contents(fingerprintPath($productId), $fingerprint, LOCK_EX);
}

function purgeProxyCache(): void
{
    foreach (glob(__DIR__ . '/data/woo-cache/*.json') ?: [] as $cached) @unlink($cached);
}

function isValidSignature(string $body, string $signature, string $secret): bool
{
    if ($signature === '') return false;
    $expected = base64_encode(hash_hmac('sha256', $body, $secret, true));
    return hash_equals($expected, $signature);
}

function dispatchToGithub(string $repo, string $token, array $payload): int
{
    $ch = curl_init("https://api.github.com/repos/$repo/dispatches");
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer $token",
            'Accept: application/vnd.github+json',
            'X-GitHub-Api-Version: 2022-11-28',
            'Content-Type: application/json',
            'User-Agent: eres-skin-studio-rebuild-hook',
        ],
    ]);
    curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $status;
}

function respond(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['ok' => $code < 300, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

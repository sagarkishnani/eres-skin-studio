<?php
// Recibe los webhooks de productos de WooCommerce y dispara el rebuild en GitHub Actions.
// Woo no permite mandar el header Authorization que pide GitHub, por eso existe este relevo.

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const GITHUB_EVENT_TYPE = 'woo-catalog-changed';
const MAX_BODY_BYTES = 262144;

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
$payload = [
    'event_type'     => GITHUB_EVENT_TYPE,
    'client_payload' => ['topic' => $topic, 'id' => (int)($product['id'] ?? 0)],
];

$status = dispatchToGithub($repo, $token, $payload);

// Woo desactiva el webhook tras varias entregas fallidas; un fallo de GitHub lo cubre el cron diario.
if ($status !== 204) {
    error_log("[rebuild-hook] GitHub respondió $status para $topic");
    respond(200, 'Rebuild no disparado.');
}

respond(200, 'Rebuild disparado.');

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

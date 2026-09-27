<?php
// Único lugar donde viven las claves de Woo: el navegador nunca habla con WordPress.
// Rutas y parámetros por allowlist, respuesta proyectada campo a campo: lo no declarado no sale.

date_default_timezone_set('America/Lima');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$CONFIG_PATH = __DIR__ . '/woo-config.php';
if (!file_exists($CONFIG_PATH)) {
    fail(503, 'Tienda no disponible.');
}
$cfg = require $CONFIG_PATH;
if (!is_array($cfg)) fail(503, 'Tienda no disponible.');

$STORE_URL = rtrim($cfg['store_url'] ?? '', '/');
$CK        = $cfg['consumer_key'] ?? '';
$CS        = $cfg['consumer_secret'] ?? '';
$ORIGINS   = $cfg['allowed_origins'] ?? [];
$TTL       = $cfg['cache_ttl'] ?? [];
$RATE      = (int)($cfg['rate_limit'] ?? 120);

if ($STORE_URL === '' || $CK === '' || $CS === '') fail(503, 'Tienda no configurada.');

// Las claves viajan en Basic Auth: sobre http irían en claro.
if (stripos($STORE_URL, 'https://') !== 0) fail(503, 'La tienda debe usar https.');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($ORIGINS)) {
    if ($origin !== '' && !in_array($origin, $ORIGINS, true)) fail(403, 'Origen no autorizado.');
    if ($origin !== '') header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cart-Token, Nonce');
header('Access-Control-Expose-Headers: Cart-Token, Nonce');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

$ROUTES = [
    'products' => [
        'api' => 'v3', 'method' => 'GET', 'path' => '/products',
        'params' => [
            'page' => 'int', 'per_page' => 'int', 'search' => 'str', 'slug' => 'str',
            'category' => 'str', 'tag' => 'str', 'featured' => 'bool',
            'on_sale' => 'bool', 'min_price' => 'str', 'max_price' => 'str',
            'orderby' => 'enum:date|title|price|popularity|rating|menu_order',
            'order' => 'enum:asc|desc', 'include' => 'csv-int',
        ],
        'defaults' => ['status' => 'publish', 'per_page' => 24],
        'project' => 'projectProduct', 'list' => true, 'ttl' => 'products',
    ],
    'product' => [
        'api' => 'v3', 'method' => 'GET', 'path' => '/products',
        'params' => ['slug' => 'str', 'include' => 'csv-int'],
        'defaults' => ['status' => 'publish', 'per_page' => 1],
        'project' => 'projectProduct', 'list' => true, 'ttl' => 'product',
    ],
    'categories' => [
        'api' => 'v3', 'method' => 'GET', 'path' => '/products/categories',
        'params' => ['page' => 'int', 'per_page' => 'int', 'parent' => 'int',
                     'orderby' => 'enum:name|count|menu_order', 'hide_empty' => 'bool'],
        'defaults' => ['per_page' => 100],
        'project' => 'projectCategory', 'list' => true, 'ttl' => 'categories',
    ],
    'stock' => [
        'api' => 'v3', 'method' => 'GET', 'path' => '/products',
        'params' => ['include' => 'csv-int'],
        'defaults' => ['status' => 'publish', 'per_page' => 100],
        'project' => 'projectStock', 'list' => true, 'ttl' => 'stock',
        'requires' => ['include'],
    ],
    // Store API: pública y sin ck/cs; se proxea para no exponer la URL del WordPress ni lidiar con CORS.
    'cart' => [
        'api' => 'store', 'method' => 'GET', 'path' => '/cart',
        'params' => [], 'project' => 'projectCart', 'ttl' => null,
    ],
    'cart-add' => [
        'api' => 'store', 'method' => 'POST', 'path' => '/cart/add-item',
        'body' => ['id' => 'int', 'quantity' => 'int', 'variation' => 'raw'],
        'project' => 'projectCart', 'ttl' => null,
    ],
    'cart-update' => [
        'api' => 'store', 'method' => 'POST', 'path' => '/cart/update-item',
        'body' => ['key' => 'str', 'quantity' => 'int'],
        'project' => 'projectCart', 'ttl' => null,
    ],
    'cart-remove' => [
        'api' => 'store', 'method' => 'POST', 'path' => '/cart/remove-item',
        'body' => ['key' => 'str'],
        'project' => 'projectCart', 'ttl' => null,
    ],
];

$resource = $_GET['resource'] ?? '';
if (!isset($ROUTES[$resource])) fail(404, 'Recurso no disponible.');
$route = $ROUTES[$resource];

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $route['method']) fail(405, 'Método no permitido.');

if ($RATE > 0) enforceRateLimit($RATE);

$query = $route['defaults'] ?? [];
foreach (($route['params'] ?? []) as $name => $type) {
    if (!isset($_GET[$name])) continue;
    $clean = sanitize($_GET[$name], $type);
    if ($clean !== null) $query[$name] = $clean;
}
foreach (($route['requires'] ?? []) as $name) {
    if (!isset($query[$name])) fail(400, 'Petición incompleta.');
}
if (isset($query['per_page'])) $query['per_page'] = min(max((int)$query['per_page'], 1), 100);
if (isset($query['page']))     $query['page']     = min(max((int)$query['page'], 1), 500);

$body = null;
if ($route['method'] === 'POST') {
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 32768) fail(413, 'Petición demasiado grande.');
    $in = json_decode($raw, true);
    if (!is_array($in)) $in = [];
    $body = [];
    foreach (($route['body'] ?? []) as $name => $type) {
        if (!isset($in[$name])) continue;
        $clean = $type === 'raw' ? $in[$name] : sanitize($in[$name], $type);
        if ($clean !== null) $body[$name] = $clean;
    }
}

$ttl = $route['ttl'] ? (int)($TTL[$route['ttl']] ?? 300) : 0;
$cacheKey = null;
if ($ttl > 0) {
    $cacheKey = sha1($resource . '|' . json_encode($query));
    $hit = cacheGet($cacheKey, $ttl);
    if ($hit !== null) {
        header('X-Cache: HIT');
        echo $hit;
        exit;
    }
}

if ($route['api'] === 'v3') {
    $url = $STORE_URL . '/wp-json/wc/v3' . $route['path'] . '?' . http_build_query($query);
    $headers = ['Authorization: Basic ' . base64_encode("$CK:$CS")];
} else {
    $url = $STORE_URL . '/wp-json/wc/store/v1' . $route['path'];
    if (!empty($query)) $url .= '?' . http_build_query($query);
    $headers = [];
    // Sin reenviar Cart-Token cada petición abriría un carrito nuevo.
    foreach (['HTTP_CART_TOKEN' => 'Cart-Token', 'HTTP_NONCE' => 'Nonce'] as $srv => $h) {
        if (!empty($_SERVER[$srv])) $headers[] = "$h: " . preg_replace('/[^\w\.\-]/', '', $_SERVER[$srv]);
    }
}

[$status, $payload, $respHeaders] = httpCall($url, $route['method'], $headers, $body);

if ($status === 0) fail(504, 'La tienda no responde.');
if ($status >= 400) {
    // El detalle del error se queda en el servidor: al cliente solo el código.
    error_log("[woo-api] $resource -> HTTP $status");
    fail($status === 404 ? 404 : 502, $status === 404 ? 'No encontrado.' : 'Error al consultar la tienda.');
}

$data = json_decode($payload, true);
if ($data === null) fail(502, 'Respuesta inválida de la tienda.');

$projector = $route['project'];
if (!empty($route['list']) && is_array($data)) {
    $out = array_values(array_map($projector, $data));
} else {
    $out = $projector($data);
}

// La Store API puede rotar Cart-Token y Nonce en cada respuesta.
foreach (['cart-token', 'nonce'] as $h) {
    if (isset($respHeaders[$h])) header(ucfirst($h) . ': ' . $respHeaders[$h]);
}

$json = json_encode(['ok' => true, 'data' => $out], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($cacheKey !== null) cachePut($cacheKey, $json);
header('X-Cache: MISS');
echo $json;
exit;

function projectProduct($p) {
    return [
        'id'             => (int)($p['id'] ?? 0),
        'name'           => $p['name'] ?? '',
        'slug'           => $p['slug'] ?? '',
        'permalink'      => $p['permalink'] ?? '',
        'type'           => $p['type'] ?? 'simple',
        'description'    => $p['description'] ?? '',
        'short_description' => $p['short_description'] ?? '',
        'sku'            => $p['sku'] ?? '',
        'price'          => $p['price'] ?? '',
        'regular_price'  => $p['regular_price'] ?? '',
        'sale_price'     => $p['sale_price'] ?? '',
        'on_sale'        => (bool)($p['on_sale'] ?? false),
        'purchasable'    => (bool)($p['purchasable'] ?? false),
        'stock_status'   => $p['stock_status'] ?? 'instock',
        'stock_quantity' => $p['stock_quantity'] ?? null,
        'average_rating' => $p['average_rating'] ?? '0',
        'rating_count'   => (int)($p['rating_count'] ?? 0),
        'categories'     => array_map(fn($c) => [
            'id' => (int)($c['id'] ?? 0), 'name' => $c['name'] ?? '', 'slug' => $c['slug'] ?? '',
        ], $p['categories'] ?? []),
        'images'         => array_map(fn($i) => [
            'src' => $i['src'] ?? '', 'alt' => $i['alt'] ?? '',
        ], array_slice($p['images'] ?? [], 0, 8)),
        'attributes'     => array_map(fn($atx) => [
            'name' => $atx['name'] ?? '', 'options' => $atx['options'] ?? [],
        ], $p['attributes'] ?? []),
    ];
}

function projectCategory($c) {
    return [
        'id'     => (int)($c['id'] ?? 0),
        'name'   => $c['name'] ?? '',
        'slug'   => $c['slug'] ?? '',
        'parent' => (int)($c['parent'] ?? 0),
        'count'  => (int)($c['count'] ?? 0),
        'image'  => isset($c['image']['src']) ? ['src' => $c['image']['src'], 'alt' => $c['image']['alt'] ?? ''] : null,
    ];
}

function projectStock($p) {
    return [
        'id'             => (int)($p['id'] ?? 0),
        'price'          => $p['price'] ?? '',
        'regular_price'  => $p['regular_price'] ?? '',
        'sale_price'     => $p['sale_price'] ?? '',
        'on_sale'        => (bool)($p['on_sale'] ?? false),
        'purchasable'    => (bool)($p['purchasable'] ?? false),
        'stock_status'   => $p['stock_status'] ?? 'instock',
        'stock_quantity' => $p['stock_quantity'] ?? null,
    ];
}

function projectCart($c) {
    return [
        'items_count' => (int)($c['items_count'] ?? 0),
        'items'       => array_map(fn($i) => [
            'key'      => $i['key'] ?? '',
            'id'       => (int)($i['id'] ?? 0),
            'name'     => $i['name'] ?? '',
            'quantity' => (int)($i['quantity'] ?? 0),
            'image'    => $i['images'][0]['thumbnail'] ?? ($i['images'][0]['src'] ?? ''),
            'totals'   => $i['totals'] ?? null,
            'prices'   => $i['prices'] ?? null,
        ], $c['items'] ?? []),
        'totals'      => $c['totals'] ?? null,
        'needs_payment' => (bool)($c['needs_payment'] ?? false),
    ];
}

function sanitize($value, $type) {
    if (is_array($value)) $value = implode(',', $value);
    $value = (string)$value;
    if (strlen($value) > 200) $value = substr($value, 0, 200);

    if ($type === 'int')     return ctype_digit($value) ? (int)$value : null;
    if ($type === 'bool')    return in_array($value, ['true', '1'], true) ? 'true'
                                  : (in_array($value, ['false', '0'], true) ? 'false' : null);
    if ($type === 'csv-int') {
        $ids = array_filter(array_map('trim', explode(',', $value)), 'ctype_digit');
        return $ids ? implode(',', array_slice($ids, 0, 100)) : null;
    }
    if (str_starts_with($type, 'enum:')) {
        $allowed = explode('|', substr($type, 5));
        return in_array($value, $allowed, true) ? $value : null;
    }
    $clean = preg_replace('/[^\p{L}\p{N}\s\-_,\.]/u', '', $value);
    return $clean === '' ? null : $clean;
}

function httpCall($url, $method, $headers, $body) {
    $ch = curl_init($url);
    $headers[] = 'Accept: application/json';
    if ($body !== null) $headers[] = 'Content-Type: application/json';
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_CUSTOMREQUEST  => $method,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));

    $raw = curl_exec($ch);
    if ($raw === false) { curl_close($ch); return [0, '', []]; }
    $status     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    $parsed = [];
    foreach (explode("\r\n", substr($raw, 0, $headerSize)) as $line) {
        if (str_contains($line, ':')) {
            [$k, $v] = explode(':', $line, 2);
            $parsed[strtolower(trim($k))] = trim($v);
        }
    }
    return [$status, substr($raw, $headerSize), $parsed];
}

function cacheDir() {
    $dir = __DIR__ . '/data/woo-cache';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    return $dir;
}

function cacheGet($key, $ttl) {
    $f = cacheDir() . "/$key.json";
    if (!is_file($f) || (time() - filemtime($f)) > $ttl) return null;
    $c = @file_get_contents($f);
    return $c === false ? null : $c;
}

function cachePut($key, $json) {
    $f = cacheDir() . "/$key.json";
    @file_put_contents($f, $json, LOCK_EX);
    if (random_int(1, 50) === 1) {
        foreach (glob(cacheDir() . '/*.json') ?: [] as $old) {
            if ((time() - filemtime($old)) > 3600) @unlink($old);
        }
    }
}

function enforceRateLimit($max) {
    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $dir = __DIR__ . '/data/woo-rate';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $f = "$dir/" . sha1($ip) . '-' . date('YmdHi') . '.txt';
    $n = is_file($f) ? (int)@file_get_contents($f) : 0;
    if ($n >= $max) fail(429, 'Demasiadas peticiones.');
    @file_put_contents($f, $n + 1, LOCK_EX);
    if (random_int(1, 50) === 1) {
        foreach (glob("$dir/*.txt") ?: [] as $old) {
            if ((time() - filemtime($old)) > 300) @unlink($old);
        }
    }
}

function fail($code, $msg) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

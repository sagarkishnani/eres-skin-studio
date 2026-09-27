<?php
date_default_timezone_set('America/Lima');

// Secrets live in site-config.php, uploaded by hand: never in the repo nor in dist/.
$CONFIG_PATH = __DIR__ . '/site-config.php';
if (!file_exists($CONFIG_PATH)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Configuración no disponible.']);
    exit;
}
$cfg = require $CONFIG_PATH;
if (!is_array($cfg)) $cfg = [];

$SMTP_HOST     = $cfg['smtp_host'] ?? 'smtp.office365.com';
$SMTP_PORT     = $cfg['smtp_port'] ?? 587;
$SMTP_USER     = $cfg['smtp_user'] ?? '';
$SMTP_PASS     = $cfg['smtp_pass'] ?? '';
$UPLOAD_DIR    = __DIR__ . '/uploads';
$COUNTER_FILE  = __DIR__ . '/data/counter.json';
$SUBMISSIONS_DIR = __DIR__ . '/data/submissions';
$CONFIG_FILE   = __DIR__ . '/form-config.json';

$FALLBACK_EMAIL = $cfg['fallback_email'] ?? '';

$mailProto = $_SERVER['HTTP_X_FORWARDED_PROTO']
    ?? ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
$mailHost  = $_SERVER['HTTP_HOST'] ?? '';
$mailDir   = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
$ASSET_BASE = "$mailProto://$mailHost$mailDir/mail";

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
} else {
    $input = $_POST;
}

// Honeypot: bots fill the hidden `website` field; fake a success so they don't retry.
if (!empty($input['website'])) {
    echo json_encode(['success' => true]);
    exit;
}

// The captcha token must never reach the email or the stored record.
$captchaToken = $input['captchaToken'] ?? '';
unset($input['captchaToken']);
$TURNSTILE_SECRET = $cfg['turnstile_secret'] ?? '';
// Fail-closed: with a secret set, a missing/invalid token or an unreachable siteverify rejects the lead.
if ($TURNSTILE_SECRET !== '') {
    if (!verifyTurnstile($TURNSTILE_SECRET, $captchaToken, $_SERVER['REMOTE_ADDR'] ?? '')) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Verificación de seguridad fallida. Recarga la página e inténtalo de nuevo.']);
        exit;
    }
}

$formType = $input['formType'] ?? '';
if (empty($formType) || !preg_match('/^[a-z0-9_-]+$/', $formType)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo de formulario inválido']);
    exit;
}

$config = loadFormConfig($CONFIG_FILE);
$formConfig = findFormConfig($config, $formType);

if (!$formConfig['enabled']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Este formulario está desactivado.']);
    exit;
}

$recipients = !empty($formConfig['recipients']) ? $formConfig['recipients'] : [$FALLBACK_EMAIL];

$correlativo = generateCorrelative($formType);

$uploadedFiles = [];
if (!empty($_FILES)) {
    $fileDir = $UPLOAD_DIR . '/' . $correlativo;
    if (!is_dir($fileDir)) mkdir($fileDir, 0755, true);

    foreach ($_FILES as $fieldName => $fileGroup) {
        if (is_array($fileGroup['name'])) {
            for ($i = 0; $i < count($fileGroup['name']); $i++) {
                if ($fileGroup['error'][$i] === UPLOAD_ERR_OK) {
                    $safeName = sanitizeFilename($fileGroup['name'][$i]);
                    $dest = $fileDir . '/' . $safeName;
                    if (move_uploaded_file($fileGroup['tmp_name'][$i], $dest)) {
                        $uploadedFiles[] = ['field' => $fieldName, 'name' => $safeName, 'path' => $dest, 'size' => $fileGroup['size'][$i]];
                    }
                }
            }
        } else {
            if ($fileGroup['error'] === UPLOAD_ERR_OK) {
                $safeName = sanitizeFilename($fileGroup['name']);
                $dest = $fileDir . '/' . $safeName;
                if (move_uploaded_file($fileGroup['tmp_name'], $dest)) {
                    $uploadedFiles[] = ['field' => $fieldName, 'name' => $safeName, 'path' => $dest, 'size' => $fileGroup['size']];
                }
            }
        }
    }
}

saveSubmission($formType, $correlativo, $input, $uploadedFiles);

require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';
require __DIR__ . '/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = $SMTP_USER;
    $mail->Password   = $SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($SMTP_USER, 'ERES Skin Studio Web');
    foreach ($recipients as $to) {
        $mail->addAddress(trim($to));
    }

    $replyEmail = $input['email'] ?? $input['correo'] ?? '';
    $replyName  = trim(($input['nombre'] ?? '') . ' ' . ($input['apellido'] ?? ''));
    if ($replyEmail && filter_var($replyEmail, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($replyEmail, $replyName);
    }

    foreach ($uploadedFiles as $file) {
        $mail->addAttachment($file['path'], $file['name']);
    }

    $subjectPrefix = getSubjectPrefix($formType);
    $mail->Subject = "$subjectPrefix [$correlativo]" . ($replyName ? " - $replyName" : "");
    $mail->isHTML(true);
    $mail->Body    = buildEmailBody($formType, $input, $correlativo, $uploadedFiles, $ASSET_BASE);
    $mail->AltBody = buildPlainText($formType, $input, $correlativo);

    $mail->send();

        $leadEmail = $input['email'] ?? $input['correo'] ?? '';
        $leadName  = trim(($input['nombre'] ?? '') . ' ' . ($input['apellido'] ?? $input['apellidos'] ?? ''));
        if ($leadName === '') $leadName = trim($input['nombreCompleto'] ?? '');
        if ($leadEmail && filter_var($leadEmail, FILTER_VALIDATE_EMAIL)) {
            try {
                $confirm = new PHPMailer(true);
                $confirm->isSMTP();
                $confirm->Host       = $SMTP_HOST;
                $confirm->SMTPAuth   = true;
                $confirm->Username   = $SMTP_USER;
                $confirm->Password   = $SMTP_PASS;
                $confirm->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $confirm->Port       = $SMTP_PORT;
                $confirm->CharSet    = 'UTF-8';
                $confirm->setFrom($SMTP_USER, 'ERES Skin Studio');
                $confirm->addAddress($leadEmail, $leadName);
                $confirm->isHTML(true);

                $richTypes = ['contacto'];
                if (in_array($formType, $richTypes, true)) {
                    $confirm->Subject = 'Gracias por contactarnos — ERES Skin Studio';
                    $confirm->Body    = buildConfirmRich($leadName, $ASSET_BASE);
                    $confirm->AltBody = 'Hola' . ($leadName ? " $leadName" : '') . ', hemos recibido tus datos. Nos comunicaremos contigo muy pronto. — ERES Skin Studio';
                } else {
                    $confirm->Subject = "Recibimos tu mensaje [$correlativo] — ERES Skin Studio";
                    $confirm->Body    = buildConfirmSimple($leadName, $correlativo, $ASSET_BASE);
                    $confirm->AltBody = "Hola $leadName, recibimos tu solicitud [$correlativo]. Nos comunicaremos contigo en las próximas 24 horas.";
                }
                $confirm->send();
            } catch (Exception $e) {
                // A failed confirmation must not fail the lead's already-sent submission.
            }
        }

        echo json_encode(['success' => true, 'correlativo' => $correlativo]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo enviar el correo.']);
}

function loadFormConfig(string $path): array {
    if (!file_exists($path)) return ['forms' => []];
    $data = json_decode(file_get_contents($path), true);
    return is_array($data) ? $data : ['forms' => []];
}

function findFormConfig(array $config, string $formType): array {
    foreach ($config['forms'] ?? [] as $f) {
        if (($f['formType'] ?? '') === $formType) {
            return [
                'enabled' => $f['enabled'] ?? true,
                'recipients' => $f['recipients'] ?? [],
            ];
        }
    }
    return ['enabled' => true, 'recipients' => []];
}

function saveSubmission(string $type, string $correlativo, array $data, array $files): void {
    global $SUBMISSIONS_DIR;
    if (!is_dir($SUBMISSIONS_DIR)) mkdir($SUBMISSIONS_DIR, 0755, true);

    $submission = [
        'correlativo' => $correlativo,
        'formType'    => $type,
        'label'       => getSubjectPrefix($type),
        'date'        => date('Y-m-d H:i:s'),
        'timestamp'   => time(),
        'data'        => array_diff_key($data, array_flip(['formType', 'website', 'captchaToken'])),
        'files'       => array_map(fn($f) => ['name' => $f['name'], 'size' => $f['size']], $files),
    ];

    $filename = $correlativo . '.json';
    file_put_contents($SUBMISSIONS_DIR . '/' . $filename, json_encode($submission, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function generateCorrelative(string $type): string {
    global $COUNTER_FILE;
    $dir = dirname($COUNTER_FILE);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $counters = file_exists($COUNTER_FILE) ? json_decode(file_get_contents($COUNTER_FILE), true) ?: [] : [];
    $prefixes = ['contacto'=>'CON'];
    $prefix = $prefixes[$type] ?? 'GEN';
    $current = ($counters[$type] ?? 0) + 1;
    $counters[$type] = $current;
    file_put_contents($COUNTER_FILE, json_encode($counters, JSON_PRETTY_PRINT));
    return $prefix . '-' . str_pad($current, 6, '0', STR_PAD_LEFT);
}

function sanitizeFilename(string $name): string {
    return substr(preg_replace('/_+/', '_', preg_replace('/[^a-zA-Z0-9._-]/', '_', $name)), 0, 200);
}

function verifyTurnstile(string $secret, string $token, string $remoteIp): bool {
    if ($token === '') return false;

    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    $fields = ['secret' => $secret, 'response' => $token];
    if ($remoteIp !== '') $fields['remoteip'] = $remoteIp;

    $resp = false;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => http_build_query($fields),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT        => 10,
        ]);
        $resp = curl_exec($ch);
        $failed = ($resp === false) || curl_errno($ch) !== 0;
        curl_close($ch);
        if ($failed) return false;
    } else {
        $ctx = stream_context_create(['http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($fields),
            'timeout' => 10,
        ]]);
        $resp = @file_get_contents($url, false, $ctx);
        if ($resp === false) return false;
    }

    $data = json_decode($resp, true);
    return is_array($data) && !empty($data['success']);
}

function getSubjectPrefix(string $type): string {
    $map = ['contacto' => 'Nuevo contacto web'];
    return $map[$type] ?? 'Nuevo formulario web';
}

function h(string $val): string { return htmlspecialchars(trim($val), ENT_QUOTES, 'UTF-8'); }

// The front sends checkboxes as "true"/"false" strings; '' makes buildEmailBody skip the row.
function boolLabel($val): string {
    $v = is_string($val) ? strtolower(trim($val)) : '';
    if ($v === 'true' || $v === '1' || $v === 'on') return 'Sí';
    if ($v === 'false' || $v === '0') return 'No';
    return '';
}

function buildEmailBody(string $type, array $data, string $correlativo, array $files, string $assetBase = ''): string {
    $rows = getFieldRows($type, $data);
    $fileRows = '';
    if (!empty($files)) {
        $fileRows = '<tr><td style="padding:12px 0;color:#888;vertical-align:top;">Archivos adjuntos</td><td style="padding:12px 0;">';
        foreach ($files as $f) { $size = round($f['size']/1024,1); $fileRows .= h($f['name'])." ({$size} KB)<br>"; }
        $fileRows .= '</td></tr>';
    }
    $tableRows = '';
    foreach ($rows as $label => $value) {
        if ($value === '') continue;
        $tableRows .= '<tr><td style="padding:8px 0;color:#888;width:180px;vertical-align:top;font-size:13px;">'.h($label).'</td><td style="padding:8px 0;font-weight:500;font-size:14px;">'.nl2br(h($value)).'</td></tr>';
    }
    $typeName = getSubjectPrefix($type);
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;"><tr><td align="center">'
        . '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">'
        . '<tr><td style="background:#171D1A;padding:24px 32px;">'
        . '<p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">ERES Skin Studio</p>'
        . '<p style="margin:6px 0 0;color:#ffffffaa;font-size:13px;">' . h($typeName) . '</p></td></tr>'
        . '<tr><td style="padding:20px 32px 0;"><span style="display:inline-block;background:#2E3A33;color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">' . h($correlativo) . '</span></td></tr>'
        . '<tr><td style="padding:24px 32px 32px;"><table width="100%" cellpadding="0" cellspacing="0" style="color:#333;">' . $tableRows . $fileRows . '</table></td></tr>'
        . '<tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #eee;"><p style="margin:0;color:#aaa;font-size:11px;text-align:center;">Correo generado desde eresskinstudio.com</p></td></tr>'
        . '</table></td></tr></table></body></html>';
}

function buildPlainText(string $type, array $data, string $correlativo): string {
    $rows = getFieldRows($type, $data);
    $text = getSubjectPrefix($type)." [$correlativo]\n\n";
    foreach ($rows as $l => $v) { if ($v !== '') $text .= "$l: $v\n"; }
    return $text;
}

function getFieldRows(string $type, array $data): array {
    switch ($type) {
        case 'contacto':
            return [
                'Nombre'   => trim(($data['nombre'] ?? '') . ' ' . ($data['apellido'] ?? '')),
                'Empresa'  => $data['empresa'] ?? '',
                'Teléfono' => $data['telefono'] ?? '',
                'Email'    => $data['correo'] ?? $data['email'] ?? '',
                'Mensaje'  => $data['mensaje'] ?? $data['comentario'] ?? '',
            ];
        default:
            $rows = [];
            foreach ($data as $k => $v) {
                if (in_array($k, ['formType', 'website', 'captchaToken'], true)) continue;
                $rows[ucfirst(preg_replace('/(?<!^)[A-Z]/', ' $0', $k))] = is_string($v) ? $v : json_encode($v);
            }
            return $rows;
    }
}

// Plain HTML tables on purpose: the only email layout that survives Outlook and Gmail.
function buildConfirmSimple(string $leadName, string $correlativo, string $assetBase): string {
    $name = $leadName !== '' ? ' <strong>' . htmlspecialchars($leadName, ENT_QUOTES, 'UTF-8') . '</strong>' : '';
    $cor  = htmlspecialchars($correlativo, ENT_QUOTES, 'UTF-8');
    $year = date('Y');
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;"><tr><td align="center">'
        . '<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">'
        . '<tr><td style="background:#171D1A;padding:24px 32px;"><p style="margin:0;color:#fff;font-size:18px;font-weight:700;">ERES Skin Studio</p></td></tr>'
        . '<tr><td style="padding:32px;">'
        . '<p style="color:#333;font-size:15px;margin:0 0 16px;">Hola' . $name . ',</p>'
        . '<p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 16px;">Hemos recibido tu solicitud con el código <strong style="color:#2E3A33;">' . $cor . '</strong>. Nuestro equipo se comunicará contigo a la brevedad.</p>'
        . '<p style="color:#aaa;font-size:12px;margin:0;">Este es un mensaje automático, por favor no respondas a este correo.</p></td></tr>'
        . '<tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #eee;text-align:center;"><p style="margin:0;color:#aaa;font-size:11px;">© ' . $year . ' ERES Skin Studio</p></td></tr>'
        . '</table></td></tr></table></body></html>';
}

function buildConfirmRich(string $leadName, string $assetBase): string {
    $name = $leadName !== '' ? ' <strong>' . htmlspecialchars($leadName, ENT_QUOTES, 'UTF-8') . '</strong>' : '';
    $year = date('Y');
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;"><tr><td align="center">'
        . '<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">'
        . '<tr><td style="background:#171D1A;padding:28px 32px;"><p style="margin:0;color:#fff;font-size:20px;font-weight:700;">ERES Skin Studio</p></td></tr>'
        . '<tr><td style="padding:32px;">'
        . '<p style="color:#111;font-size:20px;font-weight:600;margin:0 0 16px;">Gracias por contactarnos</p>'
        . '<p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 16px;">Hola' . $name . ', recibimos tus datos y un miembro de nuestro equipo se pondrá en contacto contigo muy pronto.</p>'
        . '<p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">Mientras tanto, puedes conocer más sobre nosotros en <a href="https://eresskinstudio.com" style="color:#2E3A33;">eresskinstudio.com</a>.</p>'
        . '<p style="color:#aaa;font-size:12px;margin:0;">Este es un mensaje automático, por favor no respondas a este correo.</p></td></tr>'
        . '<tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #eee;text-align:center;"><p style="margin:0;color:#aaa;font-size:11px;">© ' . $year . ' ERES Skin Studio</p></td></tr>'
        . '</table></td></tr></table></body></html>';
}

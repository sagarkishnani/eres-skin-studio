# SPEC 25 — Registro de reclamos en WordPress

> **Estado:** Aprobado
> **Depende de:** SPEC 20, SPEC 21
> **Fecha:** 2026-11-04
> **Objetivo:** Que cada reclamo enviado desde `/libro-de-reclamaciones` quede registrado en un panel propio de WP Admin, donde el estudio pueda verlo y cambiar su estado.

## Por qué existe esta spec

La SPEC 20 dejó el libro de reclamaciones en Astro. `send-email.php` envía el reclamo por correo al estudio, le manda la constancia a la consumidora y guarda una copia en `data/submissions/`. El panel para consultar reclamos quedó fuera de alcance.

En producción el correo llega, pero el estudio busca el reclamo en "Libro de Reclamaciones" de WP Admin y no lo encuentra. Ese menú es del plugin "Reclamaciones" del WordPress anterior. Solo registra los reclamos del formulario viejo, y la SPEC 21 lo deja para retirar.

Los archivos de `data/submissions/` no se pueden consultar desde ningún panel. El estudio necesita una lista de reclamos con su estado para darles seguimiento.

## Alcance

**Entra:**

- **Mu-plugin `wordpress/mu-plugins/eres-claims.php`.** Registra el tipo de contenido `eres_claim` y su menú "Reclamos web" en WP Admin.
- **Lista de reclamos.** Columnas: Correlativo, Nombre, Tipo, Estado, Fecha y Correo. Se ordena por fecha, del más reciente al más antiguo, y se filtra por estado.
- **Detalle de un reclamo.** Muestra todos los campos enviados, en el mismo orden y con las mismas etiquetas que el correo. Es de solo lectura, salvo el estado.
- **Estado editable.** Pendiente → En proceso → Atendido. Todo reclamo nuevo entra como Pendiente.
- **Endpoint `POST /wp-json/eres/v1/claims`.** Recibe el reclamo desde `send-email.php`, firmado con HMAC-SHA256 y un secreto compartido.
- **Envío desde `public/send-email.php`.** Solo para `formType` `libro-de-reclamaciones`. Llama al endpoint justo después de `saveSubmission()`. Un fallo no bloquea el correo ni la respuesta al formulario.
- **Configuración.** `claims_endpoint` y `claims_secret` en `site-config.php`, y la constante `ERES_CLAIMS_SECRET` en `wp-config.php`. Con cualquiera de los dos vacíos, el registro no se intenta.
- Actualizar `public/config.example.php`, `CLAUDE.md` (Libro de reclamaciones) y `wordpress/README.md` (instalación del mu-plugin y del secreto).

**Fuera de alcance (para futuras specs):**

- Responderle a la consumidora desde el panel.
- Importar los reclamos que ya están en `data/submissions/` o en el plugin "Reclamaciones". Los del plugin viejo se exportan como dice la SPEC 21.
- Registrar en WordPress los mensajes del formulario de contacto.
- Crear reclamos a mano desde WP Admin.
- Plazos de respuesta, avisos de vencimiento o recordatorios por correo.
- Exportar los reclamos a CSV o Excel.
- Retirar el plugin "Reclamaciones". Sigue en la limpieza de la SPEC 21.

## Modelo de datos

### Payload del endpoint

`send-email.php` envía este JSON:

```json
{
  "correlativo": "LDR-000012",
  "submittedAt": "2026-11-04 17:42:10",
  "name": "Ana Pérez Rojas",
  "email": "ana@correo.com",
  "requestType": "Reclamo",
  "rows": [
    { "label": "Nombre completo", "value": "Ana Pérez Rojas" },
    { "label": "Tipo de documento", "value": "DNI" }
  ]
}
```

- `rows` sale de `getFieldRows('libro-de-reclamaciones', $input)`, así que el panel muestra lo mismo que el correo.
- `submittedAt` usa la hora de Lima, igual que `saveSubmission()`.
- `requestType` es el valor de `tipoSolicitud`: Reclamo o Queja.

### Firma

```
X-Eres-Signature: base64(hmac_sha256(<cuerpo crudo>, <secreto>))
```

Es el mismo esquema que valida `rebuild-hook.php` para los webhooks de Woo. El endpoint compara con `hash_equals` y responde `401` si la firma no coincide.

### Configuración

```php
// public_html/site-config.php (y la plantilla public/config.example.php)
'claims_endpoint' => 'https://eresskinstudio.com/wp-json/eres/v1/claims', // vacío = no registra
'claims_secret'   => '',                                                   // mismo valor que ERES_CLAIMS_SECRET
```

```php
// wp-config.php
define('ERES_CLAIMS_SECRET', '<cadena aleatoria de 32+ caracteres>');
```

### En WordPress

```php
// wordpress/mu-plugins/eres-claims.php
const ERES_CLAIM_POST_TYPE = 'eres_claim';
const ERES_CLAIM_META_ROWS = '_eres_claim_rows';         // array de { label, value }
const ERES_CLAIM_META_NAME = '_eres_claim_name';
const ERES_CLAIM_META_EMAIL = '_eres_claim_email';
const ERES_CLAIM_META_REQUEST_TYPE = '_eres_claim_request_type';
const ERES_CLAIM_META_STATUS = '_eres_claim_status';
const ERES_CLAIM_STATUSES = [
    'pendiente'  => 'Pendiente',
    'en-proceso' => 'En proceso',
    'atendido'   => 'Atendido',
];
```

- Un reclamo es un post `eres_claim` con `post_title` = correlativo y `post_date` = `submittedAt`. Su `post_status` siempre es `publish`.
- El estado del reclamo es un meta, no el `post_status` de WordPress, para no mezclarlo con borradores y papelera.
- El tipo de contenido no es público: sin URL en el sitio, sin búsqueda y sin REST propio (`public => false`, `show_ui => true`, `show_in_rest => false`).
- Solo lo ven los usuarios con `manage_woocommerce`, es decir, administradores y gestores de la tienda. Nadie puede crear reclamos desde el panel (`create_posts => do_not_allow`).
- El endpoint es idempotente. Si ya existe un `eres_claim` con ese correlativo, responde `200` con el id existente y no lo duplica.

## Plan de implementación

1. Crear `wordpress/mu-plugins/eres-claims.php` con el tipo de contenido, las constantes y el menú "Reclamos web". Prueba manual: el menú aparece vacío y el botón "Añadir" no existe.
2. Agregar las columnas de la lista, el orden por fecha y el filtro por estado.
3. Agregar la caja de detalle (tabla de `rows`, de solo lectura) y la caja de estado con su guardado (nonce y capacidad).
4. Registrar el endpoint `eres/v1/claims`: validar la firma con `ERES_CLAIMS_SECRET`, validar el payload, evitar duplicados por correlativo y crear el post como Pendiente. Prueba manual: un `curl` firmado crea el reclamo y uno sin firma responde `401`.
5. En `public/send-email.php`, agregar `registerClaimInWordPress()`. Envía el payload firmado con `claims_endpoint` y `claims_secret`, con un tiempo máximo de 5 s. Si falla, deja una línea en `error_log` y sigue. Se llama solo para `libro-de-reclamaciones`, después de `saveSubmission()`.
6. Agregar `claims_endpoint` y `claims_secret` a `public/config.example.php`.
7. Documentar en `wordpress/README.md` cómo subir el mu-plugin, definir `ERES_CLAIMS_SECRET` y completar `site-config.php`. Actualizar la sección "Libro de reclamaciones" de `CLAUDE.md`.

## Criterios de aceptación

- [ ] Con `eres-claims.php` instalado, WP Admin muestra el menú "Reclamos web" a un administrador y a un gestor de la tienda.
- [ ] Un usuario sin `manage_woocommerce` no ve el menú.
- [ ] En "Reclamos web" no hay botón para añadir un reclamo.
- [ ] Al enviar un reclamo desde `/libro-de-reclamaciones`, aparece en la lista con su correlativo `LDR-…`, nombre, tipo, estado "Pendiente", fecha y correo.
- [ ] El detalle muestra los mismos campos, etiquetas y valores que el correo que recibe el estudio.
- [ ] Cambiar el estado a "En proceso" o "Atendido" y guardar lo deja cambiado en la lista.
- [ ] El filtro por estado de la lista muestra solo los reclamos de ese estado.
- [ ] Un `POST` a `/wp-json/eres/v1/claims` sin firma, o con una firma inválida, responde `401` y no crea nada.
- [ ] Repetir un `POST` con el mismo correlativo no crea un segundo reclamo.
- [ ] Con `claims_endpoint` o `claims_secret` vacíos en `site-config.php`, el formulario sigue enviando el correo, la constancia y la copia en `data/submissions/`.
- [ ] Si el endpoint no responde o devuelve un error, el formulario muestra igual el mensaje de éxito y llegan los dos correos.
- [ ] El formulario de contacto no crea reclamos.
- [ ] Ningún reclamo es accesible desde una URL pública del sitio.

## Decisiones

- **Sí:** un mu-plugin propio, `eres-claims.php`. Vive en el repo, no depende de un plugin de terceros y sobrevive al retiro del plugin "Reclamaciones".
- **No:** escribir en el plugin "Reclamaciones". Sus datos internos no están documentados, sus campos no coinciden con los de Tina y la SPEC 21 lo deja para retirar.
- **Sí:** un endpoint REST firmado con HMAC. Es el mismo patrón que ya usa `rebuild-hook.php`, y `send-email.php` no necesita cargar WordPress.
- **No:** cargar `wp-load.php` desde `send-email.php`. Cargaría todo WordPress y sus plugins en cada envío, y en el sitio de prueba no hay WordPress.
- **Sí:** el registro en WordPress nunca bloquea el envío. El correo y la copia en `data/submissions/` siguen siendo el registro que no puede fallar.
- **Sí:** las filas se envían ya etiquetadas (`rows`) en lugar de los campos crudos. El panel muestra lo mismo que el correo sin repetir la lógica de etiquetas en WordPress.
- **Sí:** el estado vive en un meta, no en `post_status`. Así no se mezcla con borradores ni con la papelera.
- **Sí:** el menú se llama "Reclamos web". Se distingue del "Libro de Reclamaciones" del plugin viejo mientras los dos convivan.
- **No:** importar los reclamos anteriores. Los del plugin viejo se exportan en la SPEC 21, y los de `data/submissions/` siguen en el servidor.
- **No:** responder desde el panel. Va en otra spec si hace falta.
- **Definición rápida:** la cabecera y el "por qué" se revisaron con el usuario. El resto de las secciones se escribió sin revisión sección por sección, a pedido del usuario, a partir de sus respuestas: 1a, 2a, 3a, 4a y 5b.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Cloudflare, LiteSpeed o el firewall de Hostinger bloquean la llamada del servidor a su propio dominio. | Tiempo máximo de 5 s y fallo silencioso. El reclamo queda en el correo y en `data/submissions/`. El error queda en `error_log` para diagnosticarlo. |
| El secreto de `site-config.php` no coincide con `ERES_CLAIMS_SECRET`. | El endpoint responde `401` y `send-email.php` lo registra en `error_log`. La guía de `wordpress/README.md` indica copiar el mismo valor en los dos archivos. |
| Datos personales (documento, dirección, teléfono) guardados en la base de WordPress. | El tipo de contenido no es público, no tiene REST propio y solo lo ven usuarios con `manage_woocommerce`. |
| Alguien borra un reclamo desde el panel. | La copia en `data/submissions/` y el correo siguen intactos. Borrar está limitado a quienes pueden gestionar la tienda. |

## Lo que **no** entra en esta spec

- Responder a la consumidora desde el panel.
- Importar reclamos anteriores.
- Registrar en WordPress el formulario de contacto.
- Crear reclamos a mano desde WP Admin.
- Plazos, avisos de vencimiento o exportación a CSV.
- Retirar el plugin "Reclamaciones".

Cada una de esas, si llega, va en su propia spec.

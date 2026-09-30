# SPEC 14 — Sitio de prueba para el carrito

> **Estado:** Aprobado
> **Depende de:** SPEC 02
> **Fecha:** 2026-09-29
> **Objetivo:** Publicar la rama `staging` en un sitio de prueba privado y sin indexar, con PHP, conectado al WooCommerce real, para probar el carrito sin tocar el WordPress que hoy sirve `eresskinstudio.com`.

## Por qué existe esta spec

- **El carrito no se puede probar hoy.** Todo pasa por `public/woo-api.php`, y ni `npm run dev` ni `npm run preview` ejecutan PHP.
- **No hay a dónde desplegar.** `deploy.yml` publica `main` en la raíz de `eresskinstudio.com`, y esa raíz es el WordPress en vivo hasta que el cliente confirme la migración.
- **La dirección todavía no está definida.** Crear un subdominio de `eresskinstudio.com` exige acceso al dominio y al DNS del cliente. Por eso esta spec no fija ningún dominio: la URL y la carpeta de destino son configuración.

## Topología

| Pieza | Dónde | Qué sirve |
|---|---|---|
| Astro de prueba (estático + PHP) | URL de prueba en Hostinger (`algo.hostingersite.com`, un dominio propio o, más adelante, `staging.eresskinstudio.com`) | Rama `staging`, `/productos`, carrito, `woo-api.php` |
| WordPress + WooCommerce real | `eresskinstudio.com` (tras la migración: `checkout.eresskinstudio.com`) | Catálogo, Store API, checkout |

Flujo:

1. Un push a `staging` (o un lanzamiento manual) ejecuta `deploy-staging.yml`.
2. El build lee el catálogo real con las claves de solo lectura de siempre y sube `dist/` a la carpeta de prueba.
3. En el navegador, el carrito llama a `woo-api.php` del sitio de prueba. Ese proxy habla con la Store API del WordPress real.
4. "Finalizar compra" abre `https://eresskinstudio.com/checkout/?cart-token=…`. El mu-plugin `eres-cart-handoff` carga el carrito. **En esta etapa no se paga.**

## Alcance

**Entra:**

- Workflow `.github/workflows/deploy-staging.yml`: se dispara con push a `staging` y con `workflow_dispatch`, y usa el *environment* `staging` de GitHub.
- Variable de build `SITE_ENV` (`production` por defecto, `staging` en prueba).
- Con `SITE_ENV=staging`, todas las páginas llevan `<meta name="robots" content="noindex">` y `robots.txt` responde `Disallow: /`.
- `robots.txt` pasa de archivo estático a un endpoint `src/pages/robots.txt.ts` que depende de `SITE_ENV`.
- Basic Auth opcional: si el *environment* define `STAGING_HTPASSWD_PATH`, el workflow agrega el bloque de autenticación al `.htaccess` de `dist/`.
- `woo-config.php` propio en el servidor de prueba, con la URL de prueba en `allowed_origins`.
- Instalación de `eres-cart-handoff.php` en el WordPress en vivo.
- Sección **Sitio de prueba** en `wordpress/README.md` con los pasos en orden.
- Mención del sitio de prueba en la sección **Tienda (WooCommerce)** de `CLAUDE.md`.

**Fuera de alcance (para specs futuras):**

- Carrito en local: servidor `php -S` o proxy de Vite para `npm run dev`.
- Una copia de WordPress con la herramienta Staging de Hostinger.
- Hacer una compra real o de prueba de punta a punta.
- Probar `/gracias` desde el checkout: `ERES_THANK_YOU_URL` sigue vacía en el WordPress en vivo, porque apuntarla al sitio de prueba mandaría ahí a las clientas reales.
- Webhooks de Woo y rebuild diario para el sitio de prueba. Siguen solo en producción.
- Formularios en el sitio de prueba: sin `site-config.php`, `send-email.php` no envía correos.
- Crear o apuntar `staging.eresskinstudio.com` (DNS del cliente).
- Ejecutar la migración a `checkout.eresskinstudio.com`.

## Modelo de datos

### *Environment* `staging` en GitHub (Settings → Environments)

Los secretos del *environment* pisan a los del repo que tienen el mismo nombre. Así el workflow usa los mismos nombres que `deploy.yml`, y solo se redefine lo que cambia.

**Secrets** (solo los que difieren de producción; los demás se heredan del repo):

| Nombre | Valor |
|---|---|
| `HOSTINGER_DEPLOY_PATH` | Carpeta pública del sitio de prueba, por ejemplo `/home/u123/domains/algo.hostingersite.com/public_html` |
| `HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_PORT`, `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_KEY` | Solo si el sitio de prueba vive en otra cuenta de Hostinger |

`WOO_STORE_URL`, `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET`, `TINA_CLIENT_ID` y `TINA_TOKEN` se heredan del repo.

**Variables:**

| Nombre | Valor |
|---|---|
| `PUBLIC_WOO_CHECKOUT_URL` | `https://eresskinstudio.com/checkout/` |
| `PUBLIC_TURNSTILE_SITE_KEY` | La misma de producción o vacía |
| `STAGING_HTPASSWD_PATH` | Ruta absoluta al `.htpasswd` en el servidor, fuera de la carpeta pública. Vacía = sin Basic Auth |

### Build

```bash
SITE_ENV=staging   # sin PUBLIC_: solo se lee en build, desde frontmatter
TINA_BRANCH=staging
```

### `woo-config.php` del sitio de prueba (en el servidor, fuera de git)

```php
return [
    'store_url'       => 'https://eresskinstudio.com',
    'consumer_key'    => 'ck_…',                          // las mismas de solo lectura
    'consumer_secret' => 'cs_…',
    'allowed_origins' => ['https://algo.hostingersite.com'], // origen exacto del sitio de prueba
    'cache_ttl'       => ['products' => 300, 'product' => 300, 'categories' => 3600, 'stock' => 60],
    'rate_limit'      => 120,

    'webhook_secret'  => '',  // vacíos: rebuild-hook.php responde 503 y no dispara nada
    'github_repo'     => '',
    'github_token'    => '',
];
```

### Bloque de Basic Auth (se agrega al final de `dist/.htaccess`)

```apache
AuthType Basic
AuthName "ERES · prueba"
AuthUserFile /home/u123/.htpasswd-eres-staging
Require valid-user
```

## Plan de implementación

Rama: `feat/sitio-de-prueba-carrito`, desde `staging` actualizado.

1. **`noindex` por entorno.** En `BaseLayout.astro`, el meta `robots` se emite si `noindex` es verdadero o si `import.meta.env.SITE_ENV === "staging"`. Agregar `SITE_ENV=` (vacío) a `.env.example`. Prueba: `SITE_ENV=staging npm run build` deja `noindex` en `dist/index.html`, y un build sin la variable no lo deja (salvo en `/gracias`).
2. **`robots.txt` dinámico.** Borrar `public/robots.txt` y crear `src/pages/robots.txt.ts`. En producción emite el contenido actual; con `SITE_ENV=staging`, `User-agent: *` y `Disallow: /`, sin `Sitemap`. Prueba: comparar `dist/robots.txt` en los dos builds.
3. **Workflow.** Crear `.github/workflows/deploy-staging.yml` a partir de `deploy.yml`:
   - disparadores: `push` a `staging` y `workflow_dispatch`;
   - `environment: staging` y `concurrency: { group: deploy-staging, cancel-in-progress: true }`;
   - `ref: staging`, `TINA_BRANCH: staging`, `SITE_ENV: staging`;
   - si `vars.STAGING_HTPASSWD_PATH` no está vacía, antes de subir se agrega el bloque de Basic Auth a `dist/.htaccess`;
   - el mismo `rsync` con las mismas exclusiones (`site-config.php`, `woo-config.php`, `data/*`).
4. **Guía.** Agregar a `wordpress/README.md` una sección **Sitio de prueba**, con estos pasos en orden:
   1. Conseguir la URL: sitio nuevo en Hostinger con dominio temporal, dominio propio o subdominio del cliente.
   2. Autorizar la clave SSH de deploy si es otra cuenta.
   3. Subir `woo-config.php` con `allowed_origins` = origen de prueba.
   4. Opcional: crear el `.htpasswd` con `htpasswd -c`, fuera de `public_html`.
   5. Crear el *environment* `staging` con sus secretos y variables.
   6. Instalar `eres-cart-handoff.php` en el WordPress en vivo, con `ERES_THANK_YOU_URL` vacía.
   7. Verificación (ver criterios).
   8. Qué cambiar al migrar a `checkout.eresskinstudio.com`: `store_url` del `woo-config.php` de prueba y `PUBLIC_WOO_CHECKOUT_URL` del *environment*.
5. **Configuración del servidor (manual, la hace el usuario siguiendo la guía).** Crear el sitio de prueba, subir `woo-config.php`, crear el *environment* e instalar el mu-plugin en el WordPress en vivo.
6. **Primer deploy.** Merge a `staging` → corre `deploy-staging.yml`. Verificar los criterios de aceptación.
7. **Documentación del proyecto.** En `CLAUDE.md`, sección **Tienda (WooCommerce)**: una viñeta **Prueba** que explique `deploy-staging.yml`, `SITE_ENV` y el `woo-config.php` propio con `allowed_origins`.

## Criterios de aceptación

- [ ] Un push a `staging` crea una ejecución de `deploy-staging.yml`, y no de `deploy.yml`.
- [ ] El workflow sube a `HOSTINGER_DEPLOY_PATH` del *environment* `staging`, no a la carpeta de producción.
- [ ] El HTML de cualquier página del sitio de prueba contiene `<meta name="robots" content="noindex">`.
- [ ] `/robots.txt` del sitio de prueba responde `Disallow: /`.
- [ ] Un build sin `SITE_ENV` genera el mismo `robots.txt` que hoy, y `dist/index.html` sin `noindex`.
- [ ] Con `STAGING_HTPASSWD_PATH` definida, abrir el sitio de prueba sin credenciales responde `401`. Con esa variable vacía, abre sin pedir nada.
- [ ] `/productos` del sitio de prueba muestra los productos reales de WooCommerce.
- [ ] Agregar un producto desde su ficha sube el contador del carrito sin recargar, y `woo-api.php` no responde `403`.
- [ ] Recargar la página conserva el carrito (`eres-skin-studio:cart-token` en `localStorage`).
- [ ] Cambiar la cantidad y quitar un producto se refleja en el carrito.
- [ ] "Finalizar compra" abre `https://eresskinstudio.com/checkout/` con los mismos productos y cantidades. No se completa el pago.
- [ ] `https://eresskinstudio.com/checkout/?cart-token=invalido` redirige a `/checkout/` sin errores PHP, y la tienda en vivo funciona igual que antes del mu-plugin.
- [ ] Un `POST` a `rebuild-hook.php` del sitio de prueba responde `503` y no crea ninguna ejecución en GitHub Actions.
- [ ] Un deploy de prueba no borra `woo-config.php` ni el `.htpasswd` del servidor.
- [ ] `grep -rE "(ck|cs)_[0-9a-f]{40}" dist/` no devuelve nada.
- [ ] `wordpress/README.md` tiene la sección **Sitio de prueba**, y `CLAUDE.md` la viñeta **Prueba**.

## Decisiones

- **Sí:** sitio de prueba en Hostinger (o en cualquier hosting con PHP). El carrito depende de `woo-api.php`.
- **No:** Netlify o Cloudflare Pages para la prueba. No ejecutan PHP.
- **No:** subcarpeta del dominio actual con `DEPLOY_BASE`. Metería el sitio dentro del WordPress en vivo.
- **Sí:** URL y carpeta como secretos de un *environment*, sin un dominio fijo. El usuario aún no sabe si puede crear subdominios de `eresskinstudio.com`, y así se cambia de URL sin tocar código.
- **Sí:** *environment* `staging` con los mismos nombres de secretos que producción. El workflow queda casi igual a `deploy.yml`, y solo se redefine lo que cambia.
- **Sí:** conectar el sitio de prueba al WooCommerce real con claves de solo lectura. Armar un carrito no crea pedidos, y el catálogo es el verdadero. Cuando WordPress pase a `checkout.eresskinstudio.com`, solo cambian `store_url` y `PUBLIC_WOO_CHECKOUT_URL`.
- **No:** copia de WordPress con Staging de Hostinger. Duplica productos que se desactualizan, y habría que apagar correos y pasarela. Solo se justifica para probar pagos, y eso queda fuera.
- **Sí:** instalar `eres-cart-handoff` en el WordPress en vivo. Solo actúa cuando la URL trae `?cart-token=`, y el usuario lo confirmó.
- **No:** probar `/gracias` desde el checkout. `ERES_THANK_YOU_URL` redirige a todas las clientas reales.
- **Sí:** `noindex` siempre en prueba, y Basic Auth opcional. `noindex` evita indexar una tienda duplicada. Basic Auth depende de si el cliente o terceros pueden ver el enlace.
- **Sí:** `robots.txt` como endpoint. Un archivo estático no puede cambiar por entorno sin lógica en el workflow.
- **Sí:** deploy en push a `staging` más lanzamiento manual. Sin webhooks ni cron: un cambio de precio en Woo se ve en prueba relanzando el workflow.
- **No:** carrito en local. El usuario solo necesita el sitio desplegado.
- **Definición rápida:** el usuario confirmó el encabezado y pidió asumir y guardar el resto sin revisar sección por sección.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `allowed_origins` no incluye el origen exacto de prueba (esquema, `www`, puerto) y el carrito responde `403` | La guía pide copiar el origen tal como aparece en el header `Origin`. Hay un criterio de aceptación dedicado. |
| Cloudflare del WordPress en vivo bloquea las llamadas del proxy desde la IP del servidor de prueba | La sección 8 del README ya pide permitir `/wp-json/wc/*`. Si pasa, se agrega una excepción para la IP del servidor de prueba. |
| El mu-plugin rompe el checkout en vivo | Falla cerrado: sin `cart-token` no hace nada, y con uno inválido redirige a `/checkout/`. Se verifica apenas se instala, y se quita borrando el archivo. |
| Carritos de prueba abandonados en la Store API real | Son sesiones anónimas que WooCommerce expira solo. No crean pedidos ni reservan stock. |
| Un deploy de prueba apunta por error a la carpeta de producción | `HOSTINGER_DEPLOY_PATH` es un secreto del *environment* `staging` y se revisa en el primer deploy. |
| Google indexa el sitio de prueba antes del `noindex` | `noindex` y `Disallow: /` van desde el primer deploy. Opcionalmente, Basic Auth. |
| TinaCloud no tiene indexada la rama `staging` y el build falla | `TINA_BRANCH: staging` coincide con la rama que ya usa el proyecto. Si falla, se indexa la rama en TinaCloud. |

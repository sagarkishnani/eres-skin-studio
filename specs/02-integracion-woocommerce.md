# SPEC 02 — Integración con WooCommerce

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-09-27
> **Objetivo:** Conectar el catálogo y el carrito de `/productos` al WooCommerce de ERES, con el pago en el checkout de WordPress y un rebuild automático cuando cambian los productos.

## Por qué existe esta spec

El proyecto trae del starter la tienda completa en esqueleto, pero nunca se conectó al WooCommerce real:

- el proxy `public/woo-api.php`;
- el cliente de build `src/lib/woo/rest.ts`;
- el cliente de navegador `src/utils/wooClient.ts`;
- las páginas `src/pages/tienda/` (`/tienda`, `/tienda/[slug]` y `/tienda/categoria/[slug]`).

Cuatro huecos impiden usarla tal como está:

- **Ruta equivocada.** El starter publica el catálogo en `/tienda`, pero la ruta de ERES es `/productos`.
  La web en vivo ya usa `/productos/` para el listado, `/product/<slug>/` para las fichas y `/product-category/<slug>/` para las categorías.

- **Checkout roto.** `checkoutUrl()` manda a `/checkout/?cart-token=…`, y WooCommerce no lee ese parámetro por sí solo. El cliente llegaría al pago con el carrito vacío.
- **Dominio fijo en el código.** `https://eresskinstudio.com` está escrito a mano. Cuando WordPress se mueva a `checkout.eresskinstudio.com`, habría que tocar código.
- **Catálogo congelado.** Los productos se compilan en build. Sin un disparador, un precio o un producto nuevo no aparecen hasta el siguiente deploy manual.

Esta spec cierra esos cuatro huecos y documenta qué hay que configurar del lado de WordPress. No toca el diseño.

Estado de la tienda en vivo al 2026-09-27 (Store API pública):

- 29 productos, todos `simple`, sin variaciones. Moneda `PEN`.
- 7 categorías: `limpieza`, `serum`, `hidratante`, `contorno-de-ojos`, `protector-solar`, `maquillaje-base`, `pack`.
- 2 productos sin categoría (los cushions `mask-fit-red-cushion-*`).
- 5 productos sin stock.
- Hosting: Hostinger detrás de Cloudflare, PHP 8.3.

## Topología

Antes de la migración, WordPress sigue en `eresskinstudio.com`. Todo lo de esta spec se prueba contra ese dominio cambiando solo variables de entorno.

Después de la migración:

| Pieza | Dominio | Qué sirve |
|---|---|---|
| Astro (estático + PHP) | `eresskinstudio.com` | Sitio, `/productos`, `woo-api.php`, `rebuild-hook.php`, `send-email.php` |
| WordPress + WooCommerce | `checkout.eresskinstudio.com` | Admin de productos, API REST, Store API, checkout y pago |

Flujo de compra:

1. El navegador arma el carrito contra `woo-api.php`. El proxy habla con la Store API de WordPress servidor a servidor y devuelve el `Cart-Token`.
2. El botón "Finalizar compra" lleva a `https://checkout.eresskinstudio.com/checkout/?cart-token=<token>`.
3. El mu-plugin `eres-cart-handoff` carga el carrito de ese token en la sesión con cookie del navegador. Después redirige a `/checkout/` sin el parámetro.
4. El pago, los correos de pedido y la cuenta del cliente son 100% WooCommerce.

Flujo de rebuild:

1. En WooCommerce se crea, edita, borra o restaura un producto.
2. El webhook de Woo hace `POST` a `https://eresskinstudio.com/rebuild-hook.php`.
3. `rebuild-hook.php` verifica la firma y dispara `repository_dispatch` (`woo-catalog-changed`) en GitHub.
4. `.github/workflows/deploy.yml` compila y sube el sitio a Hostinger.
5. Además, el mismo workflow corre todos los días a las 04:00 de Lima como red de seguridad.

## Alcance

**Entra:**

- Catálogo en `/productos`, `/productos/<slug>` y `/productos/categoria/<slug>`, en lugar de `/tienda`.
- Redirecciones 301 en `public/.htaccess` desde las URLs de WordPress (`/product/<slug>/` y `/product-category/<slug>/`) a las nuevas.
- URL de la tienda y del checkout configurables por entorno, sin dominios en el código.
- Plantilla `public/woo-config.example.php` para el `woo-config.php` que lee el proxy.
- Build verificado contra el WooCommerce real con claves de solo lectura.
- mu-plugin `wordpress/mu-plugins/eres-cart-handoff.php`, que pasa el carrito del `Cart-Token` al checkout.
- Endpoint `public/rebuild-hook.php`, que recibe webhooks de Woo y dispara el rebuild en GitHub.
- Workflow `.github/workflows/deploy.yml` con tres disparadores: push a `main`, `repository_dispatch` y cron diario.
- Guía `wordpress/README.md` con todo lo que hay que configurar en WordPress, en orden.
- Sección **Tienda (WooCommerce)** en `CLAUDE.md`.

**Fuera de alcance (para specs futuras):**

- Rediseño visual de la tienda y del carrito con el lenguaje de ERES. Irá en la SPEC 03. Esta spec no corrige los `text-white` ni el `bg-black/60` heredados.
- La migración de WordPress a `checkout.eresskinstudio.com`: DNS, copia del sitio y SSL. La guía la describe, pero no se ejecuta aquí. Las redirecciones de producto sí entran (ver arriba).
- Checkout propio en Astro o integración directa con pasarelas (Culqi, Mercado Pago…).
- Productos variables, reseñas, cupones en Astro, cuenta de cliente en Astro.
- Búsqueda de productos, destacados en la home y productos relacionados.
- Tratamiento especial para los productos sin categoría. Aparecen en `/productos`, pero no en ninguna página de categoría.

## Modelo de datos

### Variables de entorno (`.env.example` y secretos de GitHub)

```bash
# Build time, sin PUBLIC_: nunca llegan al navegador.
WOO_STORE_URL=https://eresskinstudio.com            # tras la migración: https://checkout.eresskinstudio.com
WOO_CONSUMER_KEY=
WOO_CONSUMER_SECRET=

# Público: es solo una URL y la necesita el botón del carrito.
PUBLIC_WOO_CHECKOUT_URL=https://eresskinstudio.com/checkout/   # tras la migración: https://checkout.eresskinstudio.com/checkout/
```

Si `PUBLIC_WOO_CHECKOUT_URL` está vacía, el carrito no muestra el botón "Finalizar compra".

### `public/woo-config.php` (git-ignored, plantilla en `public/woo-config.example.php`)

```php
return [
    'store_url'       => 'https://eresskinstudio.com',
    'consumer_key'    => 'ck_…',
    'consumer_secret' => 'cs_…',
    'allowed_origins' => ['https://eresskinstudio.com'],
    'cache_ttl'       => ['products' => 300, 'product' => 300, 'categories' => 3600, 'stock' => 60],
    'rate_limit'      => 120,

    'webhook_secret'  => '…',                         // el mismo "Secret" de los webhooks de Woo
    'github_repo'     => 'owner/eres-skin-studio',
    'github_token'    => 'github_pat_…',             // fine-grained, solo este repo, permiso Contents: write
];
```

`rebuild-hook.php` lee el mismo archivo. Así hay un solo lugar con secretos de la tienda en el servidor.

### Evento de rebuild

```json
{ "event_type": "woo-catalog-changed", "client_payload": { "topic": "product.updated", "id": 3815 } }
```

### Webhooks en WooCommerce

| Nombre | Tema | URL de entrega | Secreto |
|---|---|---|---|
| Astro · producto creado | `product.created` | `https://eresskinstudio.com/rebuild-hook.php` | `webhook_secret` |
| Astro · producto actualizado | `product.updated` | ídem | ídem |
| Astro · producto eliminado | `product.deleted` | ídem | ídem |
| Astro · producto restaurado | `product.restored` | ídem | ídem |

### mu-plugin `eres-cart-handoff`

Solo actúa en la página de checkout y solo si la URL trae `cart-token`:

1. Valida el token con las utilidades de la Store API.
2. Si es válido, carga en la sesión con cookie los ítems de la sesión que apunta el token.
3. Redirige (302) a la misma URL sin el parámetro.

Si el token no es válido o expiró, redirige a `/checkout/` sin tocar la sesión. WooCommerce muestra entonces su aviso normal de carrito vacío.

## Plan de implementación

Rama: `feat/integracion-woocommerce`, desde `staging` actualizado.

1. **Ruta `/productos`.** Mover `src/pages/tienda/` a `src/pages/productos/`. Actualizar los enlaces en `ProductCard.astro`, en las migas de las páginas y en la navegación de categorías (`/tienda/…` → `/productos/…`), y el texto de las migas ("Tienda" → "Productos"). Prueba: `npm run build` no genera nada bajo `dist/tienda/`.
2. **Redirecciones.** Crear `public/.htaccess` con 301 de `^product/([^/]+)/?$` a `/productos/$1/` y de `^product-category/([^/]+)/?$` a `/productos/categoria/$1/`. Prueba: con el sitio desplegado, `curl -I /product/<slug>/` responde `301` con `Location: /productos/<slug>/`.
3. **URL del checkout por entorno.** Agregar `PUBLIC_WOO_CHECKOUT_URL` a `.env.example`. `checkoutUrl()` en `src/utils/wooClient.ts` la usa en vez del dominio fijo. `CartReact.tsx` oculta el botón si la variable está vacía. Prueba manual: con la variable vacía no hay botón, y con valor el enlace apunta a ese dominio.
4. **Plantilla del proxy.** Crear `public/woo-config.example.php` con las claves del modelo de datos. Confirmar que `public/woo-config.php` sigue en `.gitignore`.
5. **Build contra el WooCommerce real.** Con claves de solo lectura en `.env` y en `public/woo-config.php`, correr `npm run build` y `npm run preview`. Corregir en `src/lib/woo/rest.ts`, `types.ts` o las proyecciones de `woo-api.php` solo los campos que no lleguen bien: precio, imágenes, stock o categorías. Prueba: se generan las 29 fichas y las 7 páginas de categoría.
6. **Carrito vía proxy.** Con `npm run preview`, agregar, actualizar y quitar productos. Verificar que el `Cart-Token` se guarda en `localStorage` y que el carrito sobrevive a una recarga. Corregir `woo-api.php` solo si el reenvío del `Cart-Token` o del `Nonce` falla.
7. **mu-plugin.** Crear `wordpress/mu-plugins/eres-cart-handoff.php`. Instalarlo en el WordPress actual y verificar que `/checkout/?cart-token=<token>` muestra el carrito armado en Astro.
8. **Endpoint de rebuild.** Crear `public/rebuild-hook.php`:
   - acepta solo `POST`;
   - verifica `X-WC-Webhook-Signature`, un HMAC-SHA256 en base64 del cuerpo crudo con `webhook_secret`;
   - responde `200` al ping de verificación que Woo manda al crear el webhook;
   - llama a `POST https://api.github.com/repos/{github_repo}/dispatches`.

   Una firma inválida responde `401` y no dispara nada.
9. **Workflow de deploy.** Crear `.github/workflows/deploy.yml`:
   - disparadores: `push` a `main`, `repository_dispatch` de tipo `woo-catalog-changed`, `schedule` con `0 9 * * *` (04:00 Lima) y `workflow_dispatch`;
   - `concurrency: { group: deploy, cancel-in-progress: true }`, para que una ráfaga de webhooks termine en un solo build;
   - `tinacms build` y `astro build` con los mismos secretos que `estandar.yml`, más `PUBLIC_WOO_CHECKOUT_URL`;
   - sube `dist/` a Hostinger por SSH/rsync o FTP con secretos del repo;
   - **excluye** `site-config.php`, `woo-config.php` y `data/`, para no pisar lo que vive solo en el servidor.
10. **Guía de WordPress.** Crear `wordpress/README.md` con estos pasos, en orden:
   1. Versiones mínimas de WordPress y WooCommerce.
   2. Crear las claves REST de solo lectura.
   3. Instalar el mu-plugin.
   4. Crear los 4 webhooks con su secreto.
   5. Crear el token de GitHub y los secretos del repo.
   6. Hacer una verificación de punta a punta.
   7. Checklist de migración a `checkout.eresskinstudio.com`: qué variables cambiar, dominios de `allowed_origins`, URL de los webhooks y y confirmación de que las redirecciones 301 de `public/.htaccess` responden en el dominio raíz.
11. **Documentación del proyecto.** Agregar a `CLAUDE.md` una sección **Tienda (WooCommerce)** que cubra:
   - la topología;
   - qué corre en build y qué en el navegador;
   - las variables de entorno;
   - cómo se dispara el rebuild;
   - dónde está la guía de WordPress.

## Criterios de aceptación

- [ ] `grep -rn "eresskinstudio.com" src/utils src/lib` no devuelve resultados.
- [ ] `dist/` no contiene la carpeta `tienda/` y `grep -rn '"/tienda' src` no devuelve resultados.
- [ ] Con el sitio desplegado, `/product/<slug>/` responde `301` hacia `/productos/<slug>/`.
- [ ] Con el sitio desplegado, `/product-category/<slug>/` responde `301` hacia `/productos/categoria/<slug>/`.
- [ ] Con claves reales, `npm run build` termina sin errores y genera `/productos/<slug>/index.html` para los 29 productos publicados.
- [ ] `npm run build` genera las 7 páginas `/productos/categoria/<slug>/`.
- [ ] Con `WOO_CONSUMER_KEY` vacía, `npm run build` termina sin errores y `/productos` muestra el aviso "La tienda aún no está conectada a WooCommerce."
- [ ] Ninguna clave `ck_` ni `cs_` aparece en `dist/`: `grep -r "ck_\|cs_" dist/` sin resultados.
- [ ] Un producto sin stock en Woo no permite agregarse al carrito en su ficha.
- [ ] Agregar un producto desde la ficha actualiza el contador del carrito en el header sin recargar.
- [ ] Recargar la página conserva el carrito.
- [ ] "Finalizar compra" abre el checkout de WooCommerce con los mismos productos y cantidades del carrito de Astro.
- [ ] Abrir `/checkout/?cart-token=invalido` en WordPress lleva a `/checkout/` sin errores PHP.
- [ ] Un `POST` a `rebuild-hook.php` con firma inválida responde `401` y no crea ninguna ejecución en GitHub Actions.
- [ ] Editar el precio de un producto en WooCommerce crea una ejecución de `deploy.yml` con disparador `repository_dispatch`.
- [ ] Después de esa ejecución, la ficha del producto en el sitio muestra el precio nuevo.
- [ ] `deploy.yml` tiene un `schedule` con `0 9 * * *`.
- [ ] El deploy no borra ni sobrescribe `site-config.php` ni `woo-config.php` en el servidor.
- [ ] `wordpress/README.md` cubre claves REST, mu-plugin, webhooks, token de GitHub, verificación y checklist de migración.
- [ ] `CLAUDE.md` tiene la sección **Tienda (WooCommerce)**.

## Decisiones

- **Sí:** checkout en WordPress (`checkout.eresskinstudio.com`). Mantiene pasarelas, correos, impuestos y pedidos donde ya funcionan.
- **No:** checkout propio en Astro. Pide PCI, pasarela y manejo de pedidos: es otra spec.
- **Sí:** carrito en Astro con traspaso por `Cart-Token` y mu-plugin. El cliente arma el pedido sin salir del sitio, y el código del plugin vive en el repo.
- **No:** mandar a la ficha de WordPress para comprar. Obliga a salir del sitio por cada producto.
- **Sí:** catálogo compilado en build y stock refrescado en el navegador. Las fichas son estáticas y rápidas, y el stock se mantiene fresco sin rebuild.
- **Sí:** webhook → `rebuild-hook.php` → `repository_dispatch`. El token de GitHub queda en el servidor, y Woo no puede mandar el header `Authorization` que pide GitHub.
- **No:** Netlify o Vercel con build hook nativo. Obligaría a cambiar de hosting.
- **Sí:** cron diario a las 04:00 de Lima como red de seguridad ante webhooks perdidos. Los cambios de Tina ya disparan build por el push a git.
- **Sí:** `concurrency` con `cancel-in-progress` en lugar de un throttle en PHP. Una edición masiva termina en un solo build sin perder el último cambio.
- **Sí:** secretos del webhook y de GitHub dentro de `woo-config.php`. Un solo archivo de secretos de la tienda en el servidor.
- **Sí:** catálogo en `/productos`, no en `/tienda`. Es la ruta que ERES ya usa en la web en vivo.
- **Sí:** `/productos/categoria/<slug>` para categorías. Mantiene todo el catálogo bajo un solo prefijo. Las URLs de Woo (`/product/…`, `/product-category/…`) redirigen con 301.
- **No:** reproducir las URLs de WordPress (`/product/<slug>`). Están en inglés y mezclan dos prefijos.
- **Sí:** URL de la tienda y del checkout por entorno. El mismo código sirve antes y después de la migración.
- **Sí:** documentación de WordPress en `wordpress/` en la raíz del repo. Queda versionada junto al mu-plugin que describe.
- **No:** rediseño de la tienda en esta spec. Va en la SPEC 03.
- **Definición rápida:** el usuario confirmó el encabezado y pidió asumir y guardar el resto sin revisar sección por sección.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| La API interna de sesión o `Cart-Token` de WooCommerce cambia entre versiones | El README fija la versión mínima probada. El mu-plugin falla cerrado: sin carrito, pero sin error. |
| Cada pedido baja el stock y podría disparar `product.updated`, con un rebuild por venta | `concurrency` colapsa ráfagas. Si el volumen lo justifica, se filtra en `rebuild-hook.php` por campos cambiados. |
| El deploy pisa `woo-config.php` o `site-config.php` en Hostinger | Exclusión explícita en `deploy.yml` y criterio de aceptación dedicado. |
| Cloudflare bloquea o cachea el `POST` del webhook o las llamadas del proxy | El README incluye reglas de bypass de caché para `*.php` y `/wp-json/*`. |
| Las URLs antiguas `/product/<slug>/` y `/product-category/<slug>/` pierden su SEO con la migración | Redirecciones 301 en `public/.htaccess` a `/productos/…`, más `/productos/` con la misma URL que hoy. |
| Los slugs de Woo cambian y la redirección apunta a una ficha que no existe | La regla es genérica (mismo slug). Un slug renombrado en Woo muestra el 404 del sitio. |
| El token de GitHub se filtra desde el servidor | Token fine-grained, limitado a este repo y a `Contents: write`, con fecha de expiración. |

## Qué **no** entra en esta spec

- Rediseño visual de la tienda y del carrito (SPEC 03).
- Ejecutar la migración de WordPress a `checkout.eresskinstudio.com`.
- Checkout o pasarela de pago propios en Astro.
- Productos variables, reseñas, cupones y cuenta de cliente en Astro.
- Búsqueda, destacados en la home y productos relacionados.

# WordPress + WooCommerce para ERES

Qué hay que configurar en WordPress (y alrededor) para que el sitio en Astro
muestre los productos, arme el carrito y mande a pagar al checkout de WooCommerce.
Sigue los pasos en orden. La decisión de diseño está en `specs/02-integracion-woocommerce.md`.

## Cómo encaja todo

| Pieza | Dominio | Qué hace |
|---|---|---|
| Astro | `eresskinstudio.com` | Catálogo en `/productos`, carrito, `woo-api.php`, `rebuild-hook.php` |
| WordPress + WooCommerce | `checkout.eresskinstudio.com` (hoy: `eresskinstudio.com`) | Productos, pedidos, checkout y pago |

- **Catálogo:** se compila en el build con la API REST v3 de Woo (claves de solo lectura).
- **Precio y stock:** el navegador los refresca a través de `woo-api.php`.
- **Carrito:** vive en la Store API de Woo. `woo-api.php` lo proxea y el navegador guarda el `Cart-Token`.
- **Checkout:** "Finalizar compra" abre `/checkout/?cart-token=…` en WordPress. El mu-plugin `eres-cart-handoff` carga ese carrito.
- **Rebuild:** los webhooks de producto llaman a `rebuild-hook.php`, que dispara `.github/workflows/deploy.yml`. Además hay un rebuild diario a las 04:00 de Lima.

## 1. Requisitos

- WordPress 6.4 o superior.
- WooCommerce 9.0 o superior. Necesita la Store API v1 con `Cart-Token`: comprueba que `https://<wordpress>/wp-json/wc/store/v1/cart` responde con el header `cart-token`.
- PHP 8.0 o superior en el WordPress y en el hosting de Astro.
- Enlaces permanentes activados (Ajustes → Enlaces permanentes, cualquier opción menos "Simple").

## 2. Claves REST de solo lectura

1. WooCommerce → Ajustes → Avanzado → API REST → **Añadir clave**.
2. Descripción: `Astro (solo lectura)`. Usuario: un administrador. Permisos: **Lectura**.
3. Copia `ck_…` y `cs_…`. Solo se muestran una vez.
4. Guárdalas en tres lugares:
   - `.env` local: `WOO_CONSUMER_KEY` y `WOO_CONSUMER_SECRET`.
   - GitHub → Settings → Secrets and variables → Actions → **Secrets**: `WOO_CONSUMER_KEY` y `WOO_CONSUMER_SECRET`.
   - `woo-config.php` en el servidor de Astro (ver paso 5).

Nunca uses claves con permiso de escritura. Si una clave se filtra, revócala en esa misma pantalla y crea otra.

## 3. mu-plugin de traspaso del carrito

1. Copia `wordpress/mu-plugins/eres-cart-handoff.php` a `wp-content/mu-plugins/` del WordPress (crea la carpeta si no existe).
2. Plugins → **Imprescindibles**: debe aparecer "ERES · Traspaso de carrito". Los mu-plugins no se activan: se cargan solos.
3. Comprobación rápida: abre `https://<wordpress>/checkout/?cart-token=invalido`. Debe redirigir a `/checkout/` sin errores.

### mu-plugin de detalle de producto

El acordeón de la ficha (`specs/10-ficha-de-producto.md`) lee tres campos por producto.

1. Copia `wordpress/mu-plugins/eres-product-fields.php` a `wp-content/mu-plugins/`.
2. Plugins → **Imprescindibles**: debe aparecer "ERES · Detalle de producto".
3. En Productos → editar → Datos del producto → **General** aparecen tres textareas:

   | Campo | Meta key |
   |---|---|
   | Beneficios | `eres_beneficios` |
   | Ingredientes clave | `eres_ingredientes` |
   | Modo de uso | `eres_modo_uso` |

4. Texto plano: los saltos de línea se respetan. Un campo vacío no se muestra en la ficha. Si los tres están vacíos, la ficha muestra la descripción larga del producto como panel "Descripción".
5. Comprobación: completa "Beneficios" en un producto, guarda y verifica que `https://<wordpress>/wp-json/wc/v3/products/<id>` trae `eres_beneficios` en `meta_data`. Guardar dispara el webhook y el rebuild.

### mu-plugin de la página de gracias

Después del pago, lleva a la clienta de la página "pedido recibido" de WooCommerce a `/gracias?pedido=<número>` del sitio Astro (`specs/13-paginas-404-y-gracias.md`). `/gracias` muestra el número y vacía el carrito del navegador.

1. Copia `wordpress/mu-plugins/eres-thank-you-redirect.php` a `wp-content/mu-plugins/`.
2. Plugins → **Imprescindibles**: debe aparecer "ERES · Página de gracias".
3. El destino se define en `wp-config.php`:

   ```php
   define('ERES_THANK_YOU_URL', 'https://eresskinstudio.com/gracias/');
   ```

   Sin la constante se usa esa misma URL. Con la constante vacía (`''`) no hay redirección y WooCommerce muestra su página como siempre.
4. **Mientras WordPress siga en `eresskinstudio.com`**, `/gracias/` todavía no es el sitio Astro: instala el plugin con `ERES_THANK_YOU_URL` vacía y complétala en la migración (paso 10).
5. No redirige pedidos fallidos ni URLs con una `key` inválida: ahí se queda la página de WooCommerce.
6. Si la tienda ofrece transferencia bancaria, los datos de la cuenta ya no se ven tras el pago: solo llegan en el correo de "pedido en espera".
7. Comprobación: haz un pedido de prueba con "Pago contra entrega". Debe terminar en `https://eresskinstudio.com/gracias/?pedido=<número>` con el carrito vacío.

## 4. Token de GitHub para el rebuild

1. GitHub → Settings (de tu usuario) → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories** → `sagarkishnani/eres-skin-studio`.
3. Permissions → Repository → **Contents: Read and write**. Nada más.
4. Fecha de expiración: 1 año. Anótala en el calendario para renovarlo.
5. Copia el token (`github_pat_…`) para el paso 5.

## 5. `woo-config.php` en el servidor de Astro

1. Copia `public/woo-config.example.php` como `woo-config.php` en la raíz pública del sitio Astro en Hostinger (junto a `woo-api.php`).
2. Completa:
   - `store_url`: URL del WordPress, con `https://` y sin barra final.
   - `consumer_key` / `consumer_secret`: las del paso 2.
   - `allowed_origins`: `['https://eresskinstudio.com']`.
   - `webhook_secret`: una cadena aleatoria larga (por ejemplo, `openssl rand -hex 32`). Es la misma que irá en los webhooks.
   - `github_repo`: `sagarkishnani/eres-skin-studio`.
   - `github_token`: el del paso 4.
3. Este archivo no está en git y el deploy no lo sobrescribe.

## 6. Webhooks de producto

WooCommerce → Ajustes → Avanzado → Webhooks → **Añadir webhook**, cuatro veces:

| Nombre | Estado | Tema | URL de entrega | Secreto | Versión de la API |
|---|---|---|---|---|---|
| Astro · producto creado | Activo | Producto creado | `https://eresskinstudio.com/rebuild-hook.php` | `webhook_secret` | WP REST API Integration v3 |
| Astro · producto actualizado | Activo | Producto actualizado | ídem | ídem | ídem |
| Astro · producto eliminado | Activo | Producto eliminado | ídem | ídem | ídem |
| Astro · producto restaurado | Activo | Producto restaurado | ídem | ídem | ídem |

Al guardar, Woo manda un ping. `rebuild-hook.php` lo responde con `200` sin disparar nada.

Si un webhook aparece **Desactivado**, Woo tuvo varias entregas fallidas seguidas. Revisa los registros (WooCommerce → Estado → Registros, fuente `webhooks-delivery`), corrige y vuelve a activarlo. Mientras tanto, el rebuild diario mantiene el catálogo al día.

## 7. GitHub Actions

En el repo → Settings → Secrets and variables → Actions.

**Secrets:**

| Nombre | Valor |
|---|---|
| `TINA_CLIENT_ID`, `TINA_TOKEN` | Los de TinaCloud |
| `WOO_STORE_URL` | URL del WordPress |
| `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET` | Paso 2 |
| `HOSTINGER_SSH_HOST` | Host SSH de Hostinger (hPanel → Avanzado → Acceso SSH) |
| `HOSTINGER_SSH_PORT` | Puerto SSH (en Hostinger suele ser `65002`) |
| `HOSTINGER_SSH_USER` | Usuario SSH |
| `HOSTINGER_SSH_KEY` | Clave privada cuya pública está autorizada en hPanel → Acceso SSH → Claves SSH |
| `HOSTINGER_DEPLOY_PATH` | Ruta absoluta de la raíz pública, por ejemplo `/home/u123/domains/eresskinstudio.com/public_html` |

**Variables:**

| Nombre | Valor |
|---|---|
| `PUBLIC_WOO_CHECKOUT_URL` | `https://<wordpress>/checkout/` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Site key pública de Cloudflare Turnstile |

## 8. Cloudflare

- Regla de caché: **Bypass** para `eresskinstudio.com/*.php`. `woo-api.php` ya cachea en disco lo que conviene cachear, y el carrito nunca debe salir de caché.
- Regla de caché: **Bypass** para `/wp-json/*`, `/checkout/*`, `/cart/*` y `/my-account/*` en el dominio de WordPress.
- Si hay reglas WAF o "Bot Fight Mode", permite los `POST` a `/rebuild-hook.php` (vienen desde el servidor de WordPress) y las llamadas de `woo-api.php` a `/wp-json/wc/*`.

## 9. Verificación de punta a punta

1. `npm run build` en local con las claves del paso 2. Se generan `dist/productos/<slug>/` para cada producto publicado y `dist/productos/categoria/<slug>/` para cada categoría con productos.
2. `grep -rE "(ck|cs)_[0-9a-f]{40}" dist/` no devuelve nada.
3. En el sitio desplegado, agrega un producto desde su ficha. El contador del carrito sube sin recargar.
4. Recarga la página. El carrito sigue ahí.
5. "Finalizar compra" abre el checkout de WooCommerce con los mismos productos y cantidades.
6. Cambia el precio de un producto en WooCommerce. En GitHub → Actions aparece una ejecución de "Deploy a producción" con evento `repository_dispatch`. Cuando termina, la ficha muestra el precio nuevo.
7. `curl -X POST -H 'X-WC-Webhook-Topic: product.updated' -H 'X-WC-Webhook-Signature: falsa' -d '{}' https://eresskinstudio.com/rebuild-hook.php` responde `401` y no crea ninguna ejecución en GitHub.

## 10. Migración a `checkout.eresskinstudio.com`

La migración no la ejecuta la SPEC 02. Esta es la checklist para cuando toque:

1. Crear el subdominio `checkout.eresskinstudio.com` en Hostinger con SSL activo.
2. Migrar WordPress (plugin de migración o copia de archivos + base de datos) y cambiar `siteurl` y `home` al subdominio.
3. Revisar en la pasarela de pago las URLs de retorno y de notificación (IPN/webhooks de la pasarela). Todas deben apuntar al subdominio.
4. Instalar los mu-plugins (paso 3) en el WordPress migrado y definir `ERES_THANK_YOU_URL` como `https://eresskinstudio.com/gracias/`.
5. Actualizar las URLs:
   - `.env` y secret `WOO_STORE_URL` → `https://checkout.eresskinstudio.com`
   - Variable `PUBLIC_WOO_CHECKOUT_URL` → `https://checkout.eresskinstudio.com/checkout/`
   - `store_url` en `woo-config.php` → `https://checkout.eresskinstudio.com`
6. Los webhooks siguen apuntando a `https://eresskinstudio.com/rebuild-hook.php`: no cambian.
7. Publicar el sitio Astro en `eresskinstudio.com` (lanzar "Deploy a producción" a mano desde Actions).
8. Comprobar las redirecciones 301 de `public/.htaccess` en el dominio raíz:
   - `curl -I https://eresskinstudio.com/product/<slug>/` → `301` a `/productos/<slug>/`
   - `curl -I https://eresskinstudio.com/product-category/<slug>/` → `301` a `/productos/categoria/<slug>/`
9. Repetir la verificación del paso 9.

## 11. Sitio de prueba

Mientras WordPress siga en `eresskinstudio.com`, la rama `staging` se publica en un sitio aparte para probar el carrito contra el WooCommerce real (`specs/14-sitio-de-prueba-carrito.md`). Lo publica `.github/workflows/deploy-staging.yml` en cada push a `staging`, o a mano desde Actions. Siempre lleva `noindex` y un `robots.txt` con `Disallow: /`.

En el sitio de prueba no se paga, `/gracias` no recibe redirecciones y los formularios no envían correos.

1. **Dirección.** Cualquier hosting con PHP sirve. Tres opciones:
   - Hostinger → Sitios web → **Agregar sitio web**, con el dominio temporal que ofrece (`algo.hostingersite.com`). No toca ningún DNS.
   - Un subdominio de un dominio propio que apunte a ese sitio.
   - `staging.eresskinstudio.com`, cuando haya acceso al dominio y al DNS del cliente.

   Anota la **carpeta pública** (por ejemplo `/home/u123/domains/algo.hostingersite.com/public_html`) y el **origen** exacto con el que se abre el sitio: esquema y host, sin barra final (`https://algo.hostingersite.com`).
2. **Acceso SSH.** Si el sitio vive en la misma cuenta que producción, sirve la clave de deploy de siempre. Si es otra cuenta, autoriza su clave pública en hPanel → Avanzado → Acceso SSH → Claves SSH.
3. **`woo-config.php`.** Copia `public/woo-config.example.php` como `woo-config.php` en la carpeta pública del sitio de prueba:
   - `store_url`, `consumer_key` y `consumer_secret`: los mismos de producción (paso 2).
   - `allowed_origins`: `['<origen del paso 1>']`. Si no coincide exacto, agregar al carrito responde `403`.
   - `webhook_secret`, `github_repo` y `github_token`: vacíos. Así `rebuild-hook.php` responde `503` y no dispara nada desde el sitio de prueba.
4. **Usuario y contraseña (opcional).** Por SSH, fuera de la carpeta pública:

   ```bash
   printf 'eres:%s\n' "$(openssl passwd -apr1 'una-contraseña')" > ~/.htpasswd-eres-staging
   realpath ~/.htpasswd-eres-staging
   ```

   Esa ruta absoluta va en la variable `STAGING_HTPASSWD_PATH` (paso 5). Sin la variable, el sitio abre sin pedir credenciales.
5. **Environment `staging` en GitHub.** Repo → Settings → Environments → **New environment** → `staging`. Sus secretos pisan a los del repo con el mismo nombre; lo que no definas aquí se hereda.

   **Secrets:**

   | Nombre | Valor |
   |---|---|
   | `STAGING_DEPLOY_PATH` | Carpeta pública del paso 1. **Obligatorio**: sin él, o si coincide con `HOSTINGER_DEPLOY_PATH`, el workflow falla sin subir nada. |
   | `HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_PORT`, `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_KEY` | Solo si el sitio de prueba vive en otra cuenta de Hostinger. |

   **Variables:**

   | Nombre | Valor |
   |---|---|
   | `PUBLIC_WOO_CHECKOUT_URL` | `https://eresskinstudio.com/checkout/` |
   | `PUBLIC_TURNSTILE_SITE_KEY` | La de producción o vacía |
   | `STAGING_HTPASSWD_PATH` | Ruta del paso 4, o vacía |

6. **mu-plugin en el WordPress en vivo.** Instala `eres-cart-handoff.php` (paso 3). Solo actúa cuando `/checkout/` trae `?cart-token=`; la tienda en vivo sigue igual. **No** instales `eres-thank-you-redirect.php` apuntando al sitio de prueba: mandaría ahí a las clientas reales.
7. **Verificación.**
   1. Lanza "Deploy al sitio de prueba" desde Actions (o haz push a `staging`) y comprueba que sube a la carpeta de prueba.
   2. `curl -s <origen>/robots.txt` devuelve `Disallow: /`, y el HTML de la home trae `<meta name="robots" content="noindex">`.
   3. Con `STAGING_HTPASSWD_PATH` definida, `curl -I <origen>/` responde `401`.
   4. `/productos` muestra los productos reales. Agregar uno sube el contador del carrito sin recargar, y en la pestaña Red `woo-api.php` no responde `403`.
   5. Recarga: el carrito sigue ahí. Cambia una cantidad y quita un producto.
   6. "Finalizar compra" abre `https://eresskinstudio.com/checkout/` con los mismos productos. **No pagues.**
   7. `https://eresskinstudio.com/checkout/?cart-token=invalido` redirige a `/checkout/` sin errores.
   8. `curl -X POST <origen>/rebuild-hook.php` responde `503`.
8. **Si el carrito no responde.** Si `woo-api.php` devuelve error al hablar con WordPress, revisa en el Cloudflare del WordPress en vivo que la IP del servidor de prueba no esté bloqueada al llamar a `/wp-json/wc/*` (paso 8).
9. **Al migrar a `checkout.eresskinstudio.com`.** En el sitio de prueba cambia `store_url` de `woo-config.php`, y en el environment `staging` cambia `PUBLIC_WOO_CHECKOUT_URL` a `https://checkout.eresskinstudio.com/checkout/`. El secret `WOO_STORE_URL` del repo ya cambia en el paso 10.

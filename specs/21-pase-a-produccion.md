# SPEC 21 — Pase a producción en la raíz compartida con WordPress

> **Estado:** Borrador
> **Depende de:** SPEC 02, SPEC 13, SPEC 14, SPEC 18, SPEC 20
> **Fecha:** 2026-10-09
> **Objetivo:** Publicar el sitio Astro en `eresskinstudio.com`, en la misma carpeta que WordPress, con deploy automático en cada push a `main` y un inventario de qué se queda y qué se retira en WordPress y en el servidor.

## Por qué existe esta spec

- **Cambió la topología.** SPEC 02 planeaba mover WordPress a `checkout.eresskinstudio.com`. Eso queda descartado: WordPress y Astro comparten `public_html` en `eresskinstudio.com`.
- **La raíz compartida tiene choques que nadie probó.** El sitio de prueba vive en otra carpeta y en Amplify; ninguno convive con el `index.php` de WordPress.
- **WordPress queda reducido a tienda.** Solo sirve el checkout, el admin y las APIs. Lo demás (33 plugins, 12 páginas, snippets) hay que clasificarlo.
- **`main` está 245 commits detrás de `staging`.** `deploy.yml` compila `main`: el pase incluye ese merge.

Lo que se verificó antes de escribirla (2026-10-09):

- `public_html` contiene WordPress, `woo-api.php`, `woo-config.php`, `data/`, `.private/`, `qa/`, `staging/`, `default.php`, `.htaccess.bk`, `llms.txt`, `readme.html` y `license.txt`. No tiene `site-config.php`, `send-email.php` ni `rebuild-hook.php`.
- El `.htaccess` tiene tres bloques con marcadores: `LSCACHE`, `NON_LSCACHE` y `WordPress`. WordPress y LiteSpeed solo reescriben lo que está entre sus marcadores.
- La regla final de WordPress manda a `index.php` todo lo que no es archivo ni carpeta. La petición a `/` no la toca: la resuelve `DirectoryIndex`.
- WooCommerce llama a `/?wc-ajax=…` sobre la raíz (`update_order_review`, `checkout`).
- Páginas de WordPress: `home` (757), `nosotras` (2744), `contacto` (2812), `servicios` (2826), `skin-journal` (2516), `productos` (5), `terminos-y-condiciones` (3367), `cambios-y-devoluciones` (3382), `libro-de-reclamaciones` (3425), `checkout` (7), `cart` (6) y `my-account` (8).
- El mu-plugin `eres-checkout` ya está en vivo. Las clientas no usan "Mi cuenta".
- `qa/` y `staging/` están abandonadas.

## Topología

| Ruta | Quién la sirve |
|---|---|
| `/`, `/nosotras/`, `/servicios/`, `/contacto/`, `/productos/…`, `/skin-journal/…`, `/gracias/`, páginas legales, `/admin/` (Tina), `/_astro/`, `/uploads/` | Astro (archivos estáticos) |
| `/woo-api.php`, `/send-email.php`, `/rebuild-hook.php` | PHP del sitio Astro |
| `/checkout/…` (incluye `order-pay` y `order-received`) | WordPress |
| `/wp-admin/`, `/wp-login.php`, `/wp-json/…`, `/wp-content/…`, `/wp-includes/…` | WordPress |
| `/?wc-ajax=…`, `/?wc-api=…` | WordPress |
| Cualquier otra URL que no exista | `404.html` de Astro |

Una carpeta real de Astro (`nosotras/`) gana sola a la página de WordPress del mismo nombre: la regla de WordPress solo actúa si la ruta no existe en disco.

## Alcance

**Entra:**

- Archivo nuevo `wordpress/htaccess-astro.conf`: el bloque que se pega a mano en el `.htaccess` del servidor.
- Archivo nuevo `wordpress/htaccess-reversa.conf`: el bloque que devuelve el sitio de WordPress sin borrar archivos.
- En `.github/workflows/deploy.yml`: verificación de nombres protegidos, exclusión de las plantillas `*.example.php` y prueba de humo al final.
- Inventario de plugins, páginas, snippets, temas y archivos de `public_html`: qué se queda y qué se retira.
- Orden del pase en tres fases (preparación, pase, limpieza) y reversa.
- Reescritura de `wordpress/README.md`: tabla de dominios, sección 10 y toda mención a `checkout.eresskinstudio.com`.
- Actualización de `CLAUDE.md` (tabla de dominios, viñetas Checkout y Secretos) y del comentario de `.env.example`.

**Fuera de alcance (para futuras specs):**

- Las páginas legales en Astro. Son SPEC 20 y tienen que estar publicadas antes de la fase de limpieza.
- Pasar el deploy a FTP. Se mantiene `rsync` por SSH (ver Decisiones).
- Que el workflow edite el `.htaccess` del servidor.
- Desmontar el sitio de prueba y el staging de Amplify.
- Limpiar la base de datos de restos de Elementor y Jet (opciones, metadatos, tablas).
- Actualizar WordPress, WooCommerce o los plugins que se quedan.
- Reescribir SPEC 02, 13, 14 y 18. Quedan como registro histórico.

## Modelo de datos

### Bloque de Astro en el `.htaccess`

Va **arriba** de `# BEGIN LSCACHE`, entre sus propios marcadores.

```apache
# BEGIN ERES Astro
DirectoryIndex index.html index.php
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On

# WooCommerce llama a /?wc-ajax=… y /?wc-api=… sobre la raíz, que ahora es el index.html de Astro.
RewriteCond %{QUERY_STRING} (^|&)(wc-ajax|wc-api|rest_route|p|page_id|preview)= [NC]
RewriteRule ^$ /index.php [L]

RewriteRule ^product/([^/]+)/?$ /productos/$1/ [R=301,L]
RewriteRule ^product-category/([^/]+)/?$ /productos/categoria/$1/ [R=301,L]
RewriteRule ^blog/?$ /skin-journal/ [R=301,L]
RewriteRule ^blog/([^/]+)/?$ /skin-journal/$1/ [R=301,L]
RewriteRule ^cart/?$ /productos/?carrito=abierto [R=302,L]
RewriteRule ^my-account(/.*)?$ / [R=302,L]

# Lo que no existe y no es de WordPress responde el 404 de Astro, no el del tema.
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(checkout|wp-json|wp-admin|wp-content|wp-includes)(/|$)
RewriteRule . - [R=404,L]
</IfModule>
# END ERES Astro
```

El archivo tiene dos partes señaladas con comentarios:

- **Parte previa:** `DirectoryIndex` y la regla de `wc-ajax`. Es inerte mientras no exista `index.html`; se pega antes del primer deploy.
- **Parte definitiva:** `ErrorDocument`, redirecciones y la regla del 404. Se pega cuando el primer deploy terminó, porque antes rompería las páginas de WordPress.

`public/.htaccess` no cambia: lo sigue usando el sitio de prueba, que no comparte carpeta con WordPress.

### Bloque de reversa

Reemplaza al bloque de Astro. Fuerza `index.php` en la raíz y en las carpetas que Astro creó:

```apache
# BEGIN ERES Reversa
DirectoryIndex index.php index.html
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule ^(nosotras|servicios|contacto|productos|skin-journal|gracias|terminos-y-condiciones|cambios-y-devoluciones|libro-de-reclamaciones)(/.*)?$ /index.php [L]
</IfModule>
# END ERES Reversa
```

### Nombres protegidos en `deploy.yml`

El workflow falla, sin subir nada, si `dist/` contiene en su raíz alguno de estos nombres:

```
wp-admin  wp-content  wp-includes  .private  index.php  xmlrpc.php  wp-*.php
```

Así, una página futura llamada `wp-content` nunca llega al `rsync --delete` de esa carpeta.

### Prueba de humo en `deploy.yml`

| Petición | Resultado esperado |
|---|---|
| `GET /` | `200` y el HTML contiene `/_astro/` |
| `GET /?wc-ajax=get_refreshed_fragments` | `200` con `Content-Type: application/json` |
| `GET /wp-json/wc/store/v1/cart` | `200` con el header `cart-token` |
| `GET /woo-api.php?resource=categories` | `200` con `"ok":true` |
| `GET /ruta-que-no-existe-eres/` | `404` |

Si una falla, el job termina en rojo. No hay reversa automática.

### Valores de producción

| Dónde | Nombre | Valor |
|---|---|---|
| GitHub Secrets | `WOO_STORE_URL` | `https://eresskinstudio.com` |
| GitHub Secrets | `HOSTINGER_DEPLOY_PATH` | Ruta absoluta de `public_html` |
| GitHub Variables | `PUBLIC_WOO_CHECKOUT_URL` | `https://eresskinstudio.com/checkout/` |
| GitHub Variables | `PUBLIC_WOO_API_URL` | No se define |
| `woo-config.php` | `allowed_origins` | `https://eresskinstudio.com`, más el origen de Amplify mientras exista |
| `woo-config.php` | `webhook_secret`, `github_repo`, `github_token` | Completos (hoy vacíos) |
| `site-config.php` | SMTP y `turnstile_secret` | Archivo nuevo, desde `public/config.example.php` |
| `wp-config.php` | `ERES_STOREFRONT_URL` | `https://eresskinstudio.com` |
| `wp-config.php` | `ERES_THANK_YOU_URL` | `https://eresskinstudio.com/gracias/` |

## Inventario

### Plugins

| Plugin | Destino | Motivo o condición |
|---|---|---|
| WooCommerce | Se queda | Tienda, APIs y checkout |
| Culqi | Se queda | Pasarela de pago |
| WP Mail SMTP | Se queda | Correos de pedido |
| LiteSpeed Cache | Se queda | Su bloque del `.htaccess` da caché de navegador a los assets de Astro |
| Hostinger Tools | Se queda | Herramientas del hosting |
| Google Analytics for WooCommerce | Se queda | Evento de compra en el checkout |
| Meta for WooCommerce | Se queda | Píxel y catálogo de Meta |
| Elementor | Se retira | Cuando no quede ninguna página hecha con Elementor |
| JetBlocks, JetBlog, JetElements, JetMenu, JetPopup, JetProductGallery, JetSearch, JetSmartFilters, JetThemeCore, JetTricks, JetWooBuilder | Se retiran | Dependen de Elementor |
| JetEngine | Se retira | Tras comprobar que `/wp-json/wc/v3/products` sigue trayendo `brands` y los meta `eres_*` con el plugin desactivado |
| Crocoblock Wizard | Se retira | Instalador de los plugins Jet |
| CookieYes | Se retira | Astro tiene su banner; el checkout ya lo ocultaba |
| All in One SEO | Se retira | Astro genera el SEO, el sitemap y `robots.txt`. Se borra también `llms.txt` |
| SureForms | Se retira | Los formularios son de Astro. Antes, exportar las entradas |
| Site Kit by Google | Se retira | Nunca se configuró |
| WooPayments | Se retira | Se cobra con Culqi |
| WooCommerce.com Update Manager | Se retira | No hay suscripciones de Woo.com |
| Simple Custom CSS and JS | Se retira | Su CSS era para el sitio de Elementor y el checkout viejo |
| Simple Custom Post Order | Se retira | El orden (`menu_order`) queda guardado en cada producto; WooCommerce permite reordenar en Productos → Ordenar |
| Jetpack | Se retira | Desconectar el sitio antes de borrarlo |
| WPCode Lite | Se retira | Después de desactivar todos los fragmentos y comprobar la medición |
| Editor clásico | Se retira | No queda contenido que editar |
| Reclamaciones | Se retira | Cuando SPEC 20 esté publicada y los reclamos estén exportados |
| Los que no salen en las capturas (WhatsApp, Instagram Feed y cualquier otro) | Se retiran | Solo afectan al sitio público de WordPress, que deja de verse |

Regla general: todo plugin se **desactiva** en la fase de pase y se **borra** en la fase de limpieza.

### mu-plugins

Se quedan los cinco: `eres-cart-handoff`, `eres-checkout`, `eres-product-fields`, `eres-store-api-no-cache` y `eres-thank-you-redirect`.

### Fragmentos de WPCode

- Se desactivan todos, incluido "ERES · Comprar ahora": las fichas de WordPress dejan de ser accesibles.
- Después se comprueba que el evento de compra de Analytics y el píxel de Meta siguen saliendo en un pedido de prueba.
- Si uno de los dos deja de salir, se reactiva solo el fragmento que lo cargaba y WPCode Lite se queda.

### Páginas y entradas de WordPress

| Elemento | Destino |
|---|---|
| `checkout` (7), `cart` (6), `my-account` (8) | Se quedan. WooCommerce las espera asignadas. `/cart/` y `/my-account/` redirigen a Astro desde el `.htaccess` |
| `home`, `nosotras`, `contacto`, `servicios`, `skin-journal`, `productos` | A la papelera en la fase de limpieza |
| `terminos-y-condiciones`, `cambios-y-devoluciones`, `libro-de-reclamaciones` | A la papelera en la fase de limpieza, con SPEC 20 publicada |
| Entradas del blog | A la papelera en la fase de limpieza |
| Plantillas de Elementor / JetThemeCore y el tipo "Listado servicios" | Se van con sus plugins |

Se usa la papelera, no el borrado definitivo: da 30 días para restaurar.

### Temas

Se queda el tema activo (Hello Elementor funciona sin Elementor) y un tema por defecto de WordPress como respaldo. El resto se borra.

### Archivos de `public_html`

| Elemento | Destino |
|---|---|
| `wp-admin/`, `wp-content/`, `wp-includes/`, `wp-*.php`, `index.php`, `xmlrpc.php` | Se quedan |
| `.private/` | Se queda (es de Hostinger) |
| `data/`, `woo-api.php`, `woo-config.php` | Se quedan |
| `site-config.php` | Se crea a mano |
| `qa/`, `staging/` | Se borran |
| `default.php` | Se borra (página por defecto de Hostinger) |
| `.htaccess.bk` | Se borra, después de guardar una copia nueva con fecha |
| `llms.txt` | Se borra junto con All in One SEO |
| `readme.html`, `license.txt`, `wp-config-sample.php` | Se pueden borrar. WordPress recrea los dos primeros al actualizarse |

## Plan de implementación

### Parte A — Cambios en el repo

1. Crear `wordpress/htaccess-astro.conf` con las dos partes señaladas.
2. Crear `wordpress/htaccess-reversa.conf`.
3. En `deploy.yml`, agregar el paso "Verificar nombres protegidos" antes de "Subir a Hostinger".
4. En `deploy.yml`, excluir `*.example.php` del `rsync` de la raíz.
5. En `deploy.yml`, agregar el paso "Prueba de humo" al final.
6. Reescribir `wordpress/README.md`: tabla de dominios, sección 10 como "Pase a producción" con las fases de esta spec, y las menciones al subdominio en las secciones 3, 11, 12 y 13.
7. Actualizar `CLAUDE.md` y el comentario de `PUBLIC_WOO_CHECKOUT_URL` en `.env.example`.

### Parte B — Preparación (días antes, sin efecto visible)

1. Respaldo completo desde hPanel: archivos y base de datos.
2. Copiar el `.htaccess` actual como `.htaccess.pre-astro-<fecha>`.
3. Completar los Secrets y Variables de GitHub (README §7) con los valores de producción.
4. Completar `woo-config.php` y crear `site-config.php`.
5. Crear los cuatro webhooks de producto (README §6).
6. Agregar `eresskinstudio.com` a los dominios del widget de Turnstile.
7. Confirmar que TinaCloud indexa la rama `main`.
8. Exportar las entradas de SureForms y los reclamos del plugin "Reclamaciones".
9. Pegar la **parte previa** del bloque de Astro en el `.htaccess`. El sitio de WordPress sigue igual.
10. Publicar SPEC 20 en `staging` y revisarla en el sitio de prueba.

### Parte C — Pase (hora de poco tráfico)

1. Merge de `staging` a `main`. El push dispara "Deploy a producción".
2. Cuando el deploy termina, pegar la **parte definitiva** del bloque en el `.htaccess`.
3. Definir `ERES_STOREFRONT_URL` y `ERES_THANK_YOU_URL` en `wp-config.php`.
4. Purgar LiteSpeed y Cloudflare.
5. Relanzar "Deploy a producción" a mano: la prueba de humo tiene que pasar completa.
6. Desactivar los fragmentos de WPCode.
7. Hacer un pedido real de monto bajo con Culqi por cada método de entrega.
8. Desactivar, sin borrar, los plugins marcados "Se retira" que no dependan de SPEC 20. Primero los Jet, después Elementor.
9. Repetir el pedido de prueba y recorrer los criterios de aceptación.

### Parte D — Limpieza (7 días después, con el pase confirmado)

1. Mandar a la papelera las páginas y entradas del inventario.
2. Borrar los plugins desactivados y los temas sobrantes.
3. Borrar `qa/`, `staging/`, `default.php`, `.htaccess.bk` y `llms.txt`.
4. Quitar el origen de Amplify de `allowed_origins` cuando el staging deje de usarse.

### Reversa

Solo es posible antes de la Parte D.

1. Reemplazar el bloque de Astro por el de `wordpress/htaccess-reversa.conf`.
2. Vaciar `ERES_STOREFRONT_URL` y `ERES_THANK_YOU_URL` en `wp-config.php`.
3. Reactivar los plugins desactivados en la Parte C.
4. Purgar LiteSpeed y Cloudflare.
5. Desactivar el workflow "Deploy a producción" en GitHub → Actions.

## Criterios de aceptación

- [ ] `https://eresskinstudio.com/` muestra la home de Astro.
- [ ] `/nosotras/`, `/servicios/`, `/contacto/`, `/productos/` y `/skin-journal/` muestran las páginas de Astro.
- [ ] `/checkout/` con un carrito armado en Astro muestra el checkout homologado con los mismos productos.
- [ ] En el checkout, cambiar el método de entrega actualiza el total sin recargar (`/?wc-ajax=update_order_review` responde JSON).
- [ ] Un pedido pagado con Culqi termina en `/gracias/?pedido=<número>` con el carrito vacío.
- [ ] El pedido aparece en WooCommerce y llega el correo de confirmación.
- [ ] El pedido de prueba registra el evento de compra en Analytics y en el píxel de Meta.
- [ ] `/wp-admin/` abre el panel de WordPress.
- [ ] `/admin/` abre el panel de Tina.
- [ ] `curl -I /product/<slug>/` responde `301` a `/productos/<slug>/`.
- [ ] `curl -I /blog/` responde `301` a `/skin-journal/`.
- [ ] `curl -I /cart/` responde `302` a `/productos/?carrito=abierto`.
- [ ] `curl -I /ruta-que-no-existe/` responde `404` y el cuerpo es el 404 de Astro.
- [ ] `/?utm_source=prueba` muestra la home de Astro, no la de WordPress.
- [ ] `/robots.txt` es el de Astro y apunta a `sitemap-index.xml`.
- [ ] El formulario de contacto envía el correo y devuelve un correlativo.
- [ ] Cambiar el precio de un producto en WooCommerce dispara "Deploy a producción" con evento `repository_dispatch`.
- [ ] Un push a `main` dispara "Deploy a producción" y la prueba de humo pasa.
- [ ] Después de dos deploys seguidos, `woo-config.php`, `site-config.php`, el `.htaccess` de la raíz y `data/counter.json` conservan su contenido.
- [ ] Después de un deploy, `wp-admin/`, `wp-content/` y `wp-includes/` conservan su número de archivos.
- [ ] Con una carpeta `wp-content` en `dist/`, el workflow falla antes de subir.
- [ ] Con Elementor y los plugins Jet desactivados, el checkout y el catálogo siguen funcionando.
- [ ] `wordpress/README.md` y `CLAUDE.md` no mencionan `checkout.eresskinstudio.com`.

## Decisiones

- **Sí:** WordPress y Astro en la misma carpeta de `eresskinstudio.com`. Decisión del cliente; evita migrar WordPress y reconfigurar Culqi.
- **No:** mover WordPress a `checkout.eresskinstudio.com`. Queda descartado el plan de SPEC 02.
- **Sí:** deploy con `rsync` por SSH desde GitHub Actions. Ya está escrito y probado en el sitio de prueba, usa clave en vez de contraseña y solo borra dentro de las carpetas de Astro.
- **No:** FTP. Es más lento, viaja con contraseña y obliga a reescribir la protección de archivos.
- **No:** que el servidor haga `git pull` y compile. El hosting compartido no está pensado para correr el build de Node.
- **Sí:** el `.htaccess` del servidor se edita a mano y el bloque se versiona en el repo. Un error automático ahí tumba la tienda.
- **Sí:** lista corta de rutas de WordPress y 404 de Astro para el resto. El sitio público de WordPress deja de existir.
- **No:** dejar que WordPress pinte los 404. Mostraría el tema viejo.
- **Sí:** bloque en dos partes. La parte definitiva rompería las páginas de WordPress si se pega antes del primer deploy.
- **Sí:** desactivar en el pase y borrar una semana después. Mantiene la reversa barata.
- **Sí:** conservar las páginas `cart` y `my-account` y redirigirlas. WooCommerce las espera asignadas y no cuestan nada.
- **Sí:** desactivar todos los fragmentos de WPCode. Decisión del cliente; la medición se comprueba con un pedido de prueba.
- **Sí:** conservar Google Analytics for WooCommerce y Meta for WooCommerce. Decisión del cliente.
- **Sí:** prueba de humo sin reversa automática. Avisa en minutos; deshacer un deploy sobre una raíz compartida a ciegas es más riesgoso que el fallo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| LiteSpeed no acepta `[R=404]` en `RewriteRule` | Se comprueba en la Parte C, paso 2. Alternativa: `RewriteRule . /404.html [L]` (responde `200`, se corrige después). |
| Culqi o Meta usan una URL de WordPress fuera de la lista (`/wp-json/`, `/?wc-api=`) | Pedido real de prueba en la Parte C. Si falla, se agrega la ruta a la condición del 404. |
| El primer deploy deja `index.html` junto a `index.php` antes de pegar el bloque | La parte previa ya fija `DirectoryIndex` y la regla de `wc-ajax`. |
| El caché de navegador de un año (bloque `NON_LSCACHE`) afecta a `/uploads/` | Una imagen reemplazada con el mismo nombre no se refresca: subirla con otro nombre. |
| JetEngine define una taxonomía o un campo que el catálogo usa | Se desactiva antes de borrar y se revisa la API de productos y un rebuild. |
| Borrar el plugin "Reclamaciones" pierde reclamos anteriores | Se exportan en la Parte B. El plugin se borra al final. |
| El cron diario o un webhook despliega durante la reversa | La reversa desactiva el workflow. |
| Una actualización de WordPress o de LiteSpeed reescribe el `.htaccess` | Solo tocan sus bloques. El de Astro tiene marcadores propios y queda copia en el repo. |
| Editoras publican desde `/admin/` de Tina durante el pase | El pase se hace en hora de poco tráfico y se avisa antes. `concurrency` cancela el deploy anterior. |

## Lo que **no** entra en esta spec

- Las páginas legales en Astro (SPEC 20).
- Deploy por FTP.
- Edición automática del `.htaccess` del servidor.
- Desmontar el sitio de prueba y Amplify.
- Limpieza de la base de datos de WordPress.
- Actualizaciones de WordPress y plugins.

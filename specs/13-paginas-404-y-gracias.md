# SPEC 13 — Páginas 404 y de agradecimiento tras la compra

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03, SPEC 04
> **Fecha:** 2026-09-29
> **Objetivo:** Rediseñar la página 404 y crear `/gracias`, al que WooCommerce redirige después del pago, con textos editables en una colección `systemPages` y el carrito local vaciado al confirmarse el pedido.

## Por qué existe esta spec

- **404.** `src/pages/404.astro` es la plantilla del starter. Tiene textos fijos, no se edita en Tina y no ofrece más salida que la home. Además `public/.htaccess` no declara `ErrorDocument`, así que el hosting puede servir su propio 404 en lugar del del sitio.
- **Gracias.** El pago es 100% WooCommerce (SPEC 02). Después de pagar, la clienta se queda en la página *order-received* de `checkout.eresskinstudio.com`, fuera del sitio de marca.
- **Carrito fantasma.** `eres-cart-handoff.php` copia el carrito del `Cart-Token` a la sesión de WordPress, pero no vacía el carrito original. Al volver al sitio, `localStorage` sigue apuntando a un carrito con los productos que ya compró.

## Referencia de diseño

No hay captura para estas pantallas. Se reusan los patrones del resto del sitio: la cabecera centrada del Skin Journal (SPEC 11), `btn-primary` / `btn-secondary` y el subrayado animado.

Breakpoints de SPEC 05:

- **móvil:** `< md` (768px);
- **desktop:** `≥ md`.

### 1. Estructura común

- Una sola sección `bg-surface`, con `min-h-[70vh]`, contenido centrado vertical y horizontalmente, y padding `py-section`.
- El contenido va en `container-text`, centrado, en columna.
- **Eyebrow:** "— {eyebrow}", en `caption-sm`, mayúsculas, tracking `.2em` y `text-content-muted`.
- **H1:** `heading-xl`, peso 400, tracking negativo, `leading-[1.05]` y `text-balance`, con margen superior de 16px. Lleva `data-reveal="0"`.
- **Bajada:** `subtitle-sm`, `leading-[1.65]`, `text-content-muted`, `max-w-[520px] mx-auto` y `text-pretty`, con margen superior de 16px. Lleva `data-reveal="80"`.
- **Botones:** margen superior de 32px. Van en una fila con gap de 12px y `flex-wrap justify-center`. En móvil pasan a columna a lo ancho. Lleva `data-reveal="120"`.

### 2. 404

- Eyebrow "404" (valor por defecto).
- Botón principal: `btn-primary` con `primaryCtaLabel` hacia `primaryCtaUrl` ("Volver al inicio", `/`).
- **Enlaces rápidos:** debajo de los botones, con margen superior de 40px y `border-t border-line` y `pt-8`.
  - Título opcional en `caption-md`, mayúsculas y `text-content-subtle` ("O explora").
  - Fila centrada con gap de 32px, `flex-wrap`. Cada enlace va en `body-md`, `text-content` y con el subrayado animado.
  - Contenido inicial: Productos (`/productos`), Servicios (`/servicios`) y Skin Journal (`/skin-journal`).

### 3. Gracias (`/gracias`)

- Un icono `PiCheckCircleLight` de 48px en `text-accent`, encima del eyebrow, con `aria-hidden`.
- **Número de pedido:** si la URL trae `?pedido=<n>`, debajo de la bajada aparece `orderLabel` con el número ("Tu número de pedido es **#1234**"). Usa `body-md`, `text-content` y el número en peso 500. El texto de `orderLabel` usa el marcador `{numero}`. Sin `?pedido=` no se muestra la línea.
- **Aviso de correo:** `emailNote` en `body-sm` y `text-content-subtle`, con margen superior de 12px ("Te enviamos la confirmación y el detalle a tu correo.").
- **Botones:**
  - `btn-primary` con `primaryCtaLabel` hacia `primaryCtaUrl` ("Seguir comprando", `/productos`).
  - `btn-secondary` con `whatsappLabel` ("Escríbenos por WhatsApp") hacia `https://wa.me/<global.contact.phone solo dígitos>`, con `target="_blank"` y `rel="noopener"`. Se oculta si `global.contact.phone` está vacío.
- La página lleva `<meta name="robots" content="noindex">`.

## Alcance

**Entra:**

- Nueva colección singleton `systemPages` (`src/content/system-pages/index.json`) con los grupos `notFound` y `thankYou`.
- Rediseño de `src/pages/404.astro` con el patrón de componente doble y enlaces rápidos.
- Nueva página `src/pages/gracias.astro`, con `noindex`.
- Prop `noindex` en `BaseLayout.astro`.
- Lectura de `?pedido=` en el navegador para mostrar el número de pedido.
- Vaciado del carrito local al llegar a `/gracias` con `?pedido=`: se borra `eres-skin-studio:cart-token` y el header muestra el carrito vacío sin recargar.
- Nuevo mu-plugin `wordpress/mu-plugins/eres-thank-you-redirect.php`: redirige *order-received* a `/gracias?pedido=<número>`.
- `ErrorDocument 404 /404.html` en `public/.htaccess`.
- Documentación en `CLAUDE.md` y en `wordpress/README.md`.

**Fuera de alcance (para specs futuras):**

- Resumen del pedido en `/gracias` (productos, total, dirección). Exige una ruta nueva en `woo-api.php` que valide `order_key`.
- Productos recomendados en `/gracias` o en el 404.
- Buscador dentro del 404.
- Página de pago fallido o cancelado: Woo sigue mostrando la suya.
- Eventos de analítica o píxel de conversión (`purchase`).
- Cuenta de cliente o seguimiento del pedido.

## Modelo de datos

### Contenido (`src/content/system-pages/index.json`)

```json
{
  "notFound": {
    "eyebrow": "404",
    "title": "Esta página no existe",
    "intro": "Puede que el enlace esté roto o que la página se haya movido.",
    "primaryCtaLabel": "Volver al inicio",
    "primaryCtaUrl": "/",
    "quickLinksTitle": "O explora",
    "quickLinks": [
      { "label": "Productos", "url": "/productos" },
      { "label": "Servicios", "url": "/servicios" },
      { "label": "Skin Journal", "url": "/skin-journal" }
    ],
    "seo": { "title": "Página no encontrada — ERES Skin Studio" }
  },
  "thankYou": {
    "eyebrow": "Pedido confirmado",
    "title": "Gracias por tu compra",
    "intro": "Ya estamos preparando tu pedido con mucho cuidado.",
    "orderLabel": "Tu número de pedido es {numero}",
    "emailNote": "Te enviamos la confirmación y el detalle a tu correo.",
    "primaryCtaLabel": "Seguir comprando",
    "primaryCtaUrl": "/productos",
    "whatsappLabel": "Escríbenos por WhatsApp",
    "seo": { "title": "Gracias por tu compra — ERES Skin Studio" }
  }
}
```

### Schema (`tina/collections/systemPages.ts`)

| Campo | Tipo Tina | Notas |
|---|---|---|
| `notFound.eyebrow` / `title` / `intro` | string | `title` requerido; `intro` con `textarea`. |
| `notFound.primaryCtaLabel` / `primaryCtaUrl` | string | Requeridos. |
| `notFound.quickLinksTitle` | string | Opcional. |
| `notFound.quickLinks[]` | object, list (`label`, `url`) | `itemProps` muestra `label`. Vacío = sin bloque de enlaces. |
| `notFound.seo` | `seoField` | |
| `thankYou.eyebrow` / `title` / `intro` | string | `title` requerido. |
| `thankYou.orderLabel` | string | La descripción explica el marcador `{numero}`. |
| `thankYou.emailNote` | string | Opcional. |
| `thankYou.primaryCtaLabel` / `primaryCtaUrl` | string | Requeridos. |
| `thankYou.whatsappLabel` | string | El número sale de `global.contact.phone`. |
| `thankYou.seo` | `seoField` | |

- `allowedActions: { create: false, delete: false }`, como `journal`.
- `router`: `/gracias` (la 404 se previsualiza en `/404`).

### Parámetro de URL

- `/gracias?pedido=<número>`. El número de pedido de Woo (`get_order_number()`), no el `order_key`.
- En el navegador se acepta solo si cumple `^[A-Za-z0-9-]{1,32}$`. Si no, se trata como ausente.
- No es un secreto: no da acceso a nada, solo se muestra.

### Carrito (`src/utils/wooClient.ts`)

- Nueva función `forgetCart()`:
  - borra `eres-skin-studio:cart-token` de `localStorage` (en `try/catch`);
  - emite `CART_UPDATED` con `detail: null`.
- `useCart` trata `detail: null` como carrito vacío.

### mu-plugin (`wordpress/mu-plugins/eres-thank-you-redirect.php`)

- Engancha `template_redirect`. Si `is_order_received_page()`:
  - carga el pedido de la query y valida `key` con `$order->key_is_valid()`;
  - si el pedido no existe, la clave no es válida o el estado es `failed`, no hace nada y Woo muestra su página;
  - si no, redirige con 302 a `ERES_THANK_YOU_URL` + `?pedido=<get_order_number()>`.
- `ERES_THANK_YOU_URL` se define en `wp-config.php`. Por defecto es `https://eresskinstudio.com/gracias/`. Si la constante está vacía, el plugin no redirige.

## Plan de implementación

1. **Schema y contenido.** Crear `tina/collections/systemPages.ts`, registrarlo en `tina/config.ts` y crear `src/content/system-pages/index.json` con el contenido inicial. Verificación: `npm run dev` levanta y la colección se edita en `/admin`.
2. **`noindex` en el layout.** Agregar la prop `noindex?: boolean` a `BaseLayout.astro`, que emite `<meta name="robots" content="noindex">`. Verificación: una página sin la prop no cambia.
3. **404.** Crear `src/components/system-pages/NotFound.astro` y `NotFoundReact.tsx` con `useTina()`, y usarlos desde `src/pages/404.astro`. `client:tina`, porque la página no tiene interacción. Verificación: `/404` y una URL inexistente en `npm run preview` muestran el diseño con los enlaces rápidos.
4. **`ErrorDocument`.** Agregar `ErrorDocument 404 /404.html` a `public/.htaccess`, fuera del bloque `mod_rewrite`. Verificación: `dist/404.html` existe tras `npm run build`.
5. **Gracias estático.** Crear `src/components/system-pages/ThankYou.astro` y `ThankYouReact.tsx`, y `src/pages/gracias.astro` con `noindex`. El `.astro` pasa el teléfono de `global.contact.phone` ya normalizado como prop plana. Verificación: `/gracias` se ve sin número de pedido.
6. **Número de pedido.** La isla lee `?pedido=`, lo valida y muestra `orderLabel` con el número. `client:load`. Verificación: `/gracias?pedido=1234` muestra "#1234"; `/gracias?pedido=<script>` no muestra la línea.
7. **Vaciar el carrito.** Agregar `forgetCart()` a `wooClient.ts` y el manejo de `detail: null` en `useCart`. La isla de gracias la llama una vez al montar, solo con un `?pedido=` válido y fuera del editor de Tina. Verificación: con productos en el carrito, abrir `/gracias?pedido=1` deja el contador del header en 0; abrir `/gracias` sin parámetro no lo toca.
8. **mu-plugin.** Crear `wordpress/mu-plugins/eres-thank-you-redirect.php`. Verificación en staging de WordPress: un pedido de prueba con "Pago contra entrega" termina en `https://eresskinstudio.com/gracias/?pedido=<n>`.
9. **Documentación.** Agregar `systemPages` a la lista de colecciones de `CLAUDE.md` y un apartado corto sobre `/gracias`, `?pedido=` y el vaciado del carrito. Agregar a `wordpress/README.md` la instalación del mu-plugin y la constante `ERES_THANK_YOU_URL`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores y genera `dist/404.html` y `dist/gracias/index.html`.
- [ ] Una URL inexistente en producción responde 404 y muestra la página del sitio, no la del hosting.
- [ ] El 404 muestra eyebrow, título, bajada, "Volver al inicio" y los tres enlaces rápidos del contenido inicial.
- [ ] Con `quickLinks` vacío, el bloque de enlaces rápidos (incluido su título y el borde) no se renderiza.
- [ ] Los textos del 404 y de `/gracias` se editan en `/admin` y se ven en vivo en el editor visual.
- [ ] `/gracias` lleva `<meta name="robots" content="noindex">` y el 404 no la lleva.
- [ ] `/gracias?pedido=1234` muestra "Tu número de pedido es #1234" con el número en peso 500.
- [ ] `/gracias` sin parámetro, o con un valor que no cumple `^[A-Za-z0-9-]{1,32}$`, no muestra la línea del pedido.
- [ ] Al abrir `/gracias?pedido=<n>` con productos en el carrito, `eres-skin-studio:cart-token` desaparece de `localStorage` y el contador del header pasa a 0 sin recargar.
- [ ] Abrir `/gracias` sin `?pedido=` no borra el `Cart-Token`.
- [ ] El botón de WhatsApp abre `https://wa.me/<dígitos de global.contact.phone>` en otra pestaña. Con el teléfono vacío no se renderiza.
- [ ] Con el mu-plugin instalado, un pedido pagado termina en `/gracias?pedido=<número>` del sitio Astro.
- [ ] Un pedido con estado `failed`, o una URL *order-received* con `key` inválida, se queda en la página de Woo.
- [ ] Con `ERES_THANK_YOU_URL` vacía, Woo muestra su página *order-received* como antes.
- [ ] En 375px de ancho, los botones van en columna a lo ancho y nada desborda horizontalmente.
- [ ] Ningún componente nuevo usa colores fuera de tema, `rounded-*` distinto de `none`/`full` ni `text-white`.

## Decisiones

- **Sí:** definición rápida. La persona pidió "asume el resto y guarda" después de la cabecera, así que las secciones 2 a 7 no se revisaron una por una. Hay que releerlas antes de aprobar.
- **Sí:** redirigir *order-received* al sitio Astro con un mu-plugin. La experiencia termina en el sitio de marca y el código vive en el repo, como el traspaso del carrito.
- **No:** dejar la página de Woo como está. La clienta terminaría la compra fuera del diseño del sitio.
- **Sí:** `/gracias` estático, con el número de pedido tomado de la query. Es lo único que se puede mostrar sin exponer datos.
- **No:** resumen del pedido en `/gracias`. Exige validar `order_key` en el proxy y proyectar datos personales: es otra spec. El correo de Woo ya trae el detalle.
- **Sí:** el número de pedido y no el `order_key` en la URL. El número no da acceso a nada y así la URL es segura para compartir o para analítica.
- **Sí:** vaciar el carrito local solo con un `?pedido=` válido. Una visita directa a `/gracias` no debe borrar un carrito en curso.
- **Sí:** borrar el token en lugar de vaciar el carrito vía Store API. El carrito del token ya no sirve y la siguiente compra crea uno nuevo; evita otra ruta en el proxy.
- **Sí:** una colección `systemPages` con dos grupos. Sigue el patrón de `shop` y `journal` sin sumar dos colecciones mínimas.
- **No:** textos fijos en el código. El equipo edita todo lo demás desde Tina.
- **Sí:** enlaces rápidos en el 404, editables. Dan una salida útil sin la complejidad de un buscador.
- **No:** buscador en el 404. El buscador del header ya está en la página.
- **Sí:** `ErrorDocument 404 /404.html`. Sin él, Apache sirve el 404 del hosting.
- **Sí:** `noindex` en `/gracias`. No tiene valor para buscadores y no debe aparecer en resultados.
- **Sí:** el WhatsApp de `global.contact.phone` con `wa.me`, como "Hacer una pregunta" de la ficha (SPEC 10). El enlace `wa.link` no admite mensaje ni variantes.
- **Sí:** `ERES_THANK_YOU_URL` como constante de `wp-config.php`. Cambia con la migración de dominios sin tocar el plugin, y vaciarla desactiva la redirección.
- **Sí:** no redirigir pedidos `failed`. La página de Woo ofrece reintentar el pago.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Transferencia bancaria (`bacs`): Woo muestra los datos de la cuenta en *order-received* y la redirección los oculta | Woo también los envía en el correo de "pedido en espera". Si el negocio usa `bacs`, el plugin puede excluir esa pasarela con una lista en una constante; se decide al instalar. |
| Una pasarela usa su propia URL de retorno y no pasa por *order-received* | La redirección está en `template_redirect`, no en la URL de retorno: cubre toda pasarela que termine en *order-received*. Las demás siguen como hoy. |
| Alguien abre `/gracias?pedido=123` a mano y pierde su carrito | Impacto bajo: el carrito es anónimo y se vuelve a armar. No hay forma de validar el pedido en un sitio estático sin el resumen (fuera de alcance). |
| El hosting ignora `ErrorDocument` en `.htaccess` | Comprobar en producción una URL inexistente. Si no funciona, se configura en el panel del hosting. |
| El header lee el carrito antes de que `/gracias` borre el token | `forgetCart()` emite `CART_UPDATED` con `null` después de borrar: el header se actualiza aunque ya haya leído. |

## Qué **no** entra en esta spec

- Resumen del pedido en `/gracias`.
- Productos recomendados.
- Buscador en el 404.
- Página propia de pago fallido o cancelado.
- Analítica o píxel de conversión.
- Cuenta de cliente o seguimiento de pedidos.

Cada una de esas, si llega, va en su propia spec.

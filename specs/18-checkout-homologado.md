# SPEC 18 — Checkout homologado en un mu-plugin

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02, SPEC 13
> **Fecha:** 2026-10-08
> **Objetivo:** Reemplazar los snippets y el CSS suelto del checkout de WooCommerce por un único mu-plugin versionado que lo muestra con el diseño del sitio (DM Sans, tokens, header y footer propios) y con el mínimo de campos.

## Por qué existe esta spec

- **El checkout es lo único que queda en WordPress.** Tras el pase a producción se borran las demás páginas. Hoy se ve distinto al sitio: Playfair Display e Inter desde Google Fonts, y header y footer de Elementor / JetThemeCore.
- **El código está repartido.** Siete snippets de Code Snippets, dos que no están documentados (barra de envío gratuito y validación en línea), un CSS en `wp-content/uploads/eres/checkout-eres.css` y reglas del checkout mezcladas en el CSS global.
- **El maquetado depende de JS que mueve nodos.** `build()` reubica título, cupón, datos, envío y pago en cada `updated_checkout`. Mete un `<form>` dentro de otro y falla si cambia el HTML de WooCommerce.
- **Pide datos que no hacen falta.** País, región, código postal, "enviar a una dirección diferente" y dirección aunque la clienta recoja en el local.

Lo que se verificó antes de escribirla:

- El checkout en vivo es el clásico (shortcode `[woocommerce_checkout]`), con WooCommerce 11.1 y el tema Hello Elementor.
- El plugin de Culqi instalado (3.1.4, `culqi/culqi-woocommerce`) no lee el código postal. Al antifraude manda nombre, apellidos, dirección, ciudad, país y celular, y cada uno solo si tiene valor.
- Los métodos de envío actuales son `local_pickup:1` ("Recojo en el local") y `flat_rate:2` ("Precio fijo", S/12.00).
- El sitio Astro no tiene las páginas `/terminos-y-condiciones`, `/cambios-y-devoluciones` ni `/libro-de-reclamaciones`. Hoy las sirve WordPress.

## Alcance

**Entra:**

- mu-plugin `wordpress/mu-plugins/eres-checkout.php` con su carpeta `wordpress/mu-plugins/eres-checkout/`.
- Plantilla propia para `/checkout/`, `order-pay` y "pedido recibido": header mínimo, footer reducido y botón de WhatsApp, sin Elementor ni JetThemeCore.
- DM Sans variable autoalojada dentro del mu-plugin. Sin Google Fonts.
- CSS del checkout con los tokens de SPEC 01 como variables CSS.
- Campos mínimos, con la dirección visible solo en "Envío a domicilio".
- Maquetado resuelto en PHP con hooks y fragmentos de WooCommerce. El JS no mueve nodos.
- Bloque de cupón propio, plegable, fuera de cualquier `<form>` anidado.
- Barra de envío gratuito y validación en línea, reescritas.
- Configuración (campos, distritos, tipos de documento, textos, umbral) en un único arreglo: `eres-checkout/config.php`.
- Constante `ERES_STOREFRONT_URL` para los enlaces hacia el sitio Astro.
- En Astro: `?carrito=abierto` abre el drawer del carrito.
- Pase a producción directo, con plan de reversa.
- Sección nueva en `wordpress/README.md` y viñeta en `CLAUDE.md`.

**Fuera de alcance (para futuras specs):**

- Pantalla de ajustes para que el cliente edite campos, distritos y textos. Va en SPEC 19 y sobrescribe el arreglo de esta spec.
- Crear campos nuevos o reordenarlos desde el admin.
- Boleta o factura.
- Páginas legales en Astro.
- Desinstalar Elementor, los plugins Jet o CookieYes.
- Cambiar la pasarela, los métodos de envío o sus precios.
- Un staging de WordPress.
- Los correos de WooCommerce.
- El checkout de bloques.

## Referencia de diseño

Cortes: **móvil** `< 768px`, **tablet** `768–1023px`, **desktop** `≥ 1024px`.

### Página

- Fondo `surface-sunken` (`#EEEAE3`). Contenedor de 1200px con `px-gutter`.
- Desktop: dos columnas, `minmax(0, 1fr)` y 420px, separadas 32px. El resumen es `sticky` bajo el header.
- Bajo 1024px: una columna. El resumen va debajo del formulario.
- Tarjetas: fondo `surface-raised`, borde `line`, esquinas rectas. Padding de 48px en desktop y 24px en móvil.

### Header y footer

- Header blanco con borde inferior `line`, fijo arriba. Tres zonas: "← Volver", logo (`logo-eres.svg`) centrado y "Compra segura" con un escudo.
- "Volver" y "Compra segura" van en `caption-sm`, mayúsculas, tracking `.18em`. Bajo 768px, "Compra segura" muestra solo el ícono.
- Footer: una franja con Términos y condiciones, Cambios y devoluciones, Libro de reclamaciones y "Eres Skin Studio · Todos los derechos reservados".
- Botón de WhatsApp flotante, abajo a la derecha, verde `#25D366`, con las dos ondas de SPEC 17. Sin ondas con `prefers-reduced-motion: reduce`.
- El banner y el ícono de CookieYes no se muestran en estas páginas.

### Tipografía

- Todo en DM Sans. Títulos en peso 400 con tracking negativo, sin itálicas.
- "Checkout": `heading-sm`, con una línea `ink` debajo.
- Título de paso: `heading-xs` ampliado a 28–34px. Eyebrow "— Paso 1 de 3 · Datos personales" en `caption-xs`, color `content-subtle`.
- Etiquetas de campo: `caption-xs`, mayúsculas, peso 500, tracking `.18em`. Asterisco en `semantics.error`.
- Total: 40px en desktop y 32px en móvil, peso 400.

### Columna izquierda, de arriba a abajo

1. Título "Checkout".
2. Cupón: franja `clay-100` con borde izquierdo `sage-500`. Texto "¿Tienes un código de descuento?" y botón de texto "Haz clic para aplicarlo". Al pulsarlo despliega un campo y el botón "Aplicar".
3. **Paso 1 de 3 · Datos personales** — "¿Quién recibe el pedido?". Rejilla de dos columnas desde 768px:
   - Nombre | Apellidos
   - Correo electrónico | Celular
   - Tipo de documento | N° de documento
4. **Paso 2 de 3 · Entrega** — "¿Cómo lo recibes?". Dos tarjetas con radio, título y subtítulo:
   - "Recojo en el local" / "Calle Libertad 176, of. 413 · Miraflores".
   - "Envío a domicilio · S/12.00" / "Envío en 48h · Distritos seleccionados de Lima".
   - La tarjeta elegida lleva borde `ink` y fondo `surface`.
   - Con "Envío a domicilio" aparecen debajo: Distrito, Dirección y Referencia (opcional), los tres a ancho completo.
5. **Paso 3 de 3 · Pago** — "¿Cómo prefieres pagar?". Método de pago con borde `ink`, texto de privacidad y botón.
6. Botón: fondo `ink`, texto `content-inverse`, 64px de alto, candado y "Realizar pedido · S/209.00".

Campos: 56px de alto (48px en móvil), borde `line-strong`, foco con borde `accent`. Un campo con error lleva borde `semantics.error` y el mensaje debajo en `caption-md`.

### Columna derecha

1. "Resumen de compra" (`heading-xs`) y enlace "Editar".
2. Tabla "Producto / Subtotal". Cada producto: miniatura de 64px con la cantidad en un círculo `ink`, categoría en `caption-xs` color `clay-800`, nombre y variación.
3. Filas Subtotal, Descuento (si hay cupón) y Envío. La fila Envío es solo texto: "Recojo · Gratis" o "Envío a domicilio · S/12.00".
4. Total, con la nota "Impuestos incluidos. Pago en soles peruanos (PEN)."
5. Tres textos de confianza con ícono: pago seguro, envío y devoluciones.

### Avisos y barra de envío gratuito

- Los avisos de WooCommerce van sobre las dos columnas: fondo `clay-100`, borde superior de 2px `sage-500`. Los de error usan `semantics.error`.
- Barra de envío gratuito bajo los avisos: "Te faltan S/91.00 para obtener envío gratuito" y una barra de progreso `ink` sobre `line`.
- Al llegar al umbral: "¡Tienes envío gratuito!" con la barra completa.
- No se muestra si el carrito no necesita envío.

### Páginas vecinas

- `order-pay` y "pedido recibido" usan la misma plantilla, con una sola tarjeta centrada de 760px.
- No llevan pasos, cupón ni barra de envío gratuito.

## Modelo de datos

### Archivos del mu-plugin

```
wordpress/mu-plugins/
  eres-checkout.php              cargador: require de los archivos de abajo
  eres-checkout/
    config.php                   arreglo de configuración
    shell.php                    plantilla, header, footer, WhatsApp, estilos y scripts
    fields.php                   campos, dirección condicional, país y región fijos
    validation.php               validaciones y guardado en el pedido
    layout.php                   pasos, entrega, pago, cupón, resumen, barra de envío
    templates/page.php           documento HTML de las tres páginas
    templates/cart-shipping.php  fila "Envío" del resumen, solo texto
    assets/checkout.css
    assets/checkout.js
    assets/logo-eres.svg
    assets/fonts/dm-sans-latin-wght-normal.woff2
    assets/fonts/dm-sans-latin-wght-italic.woff2
```

Los mu-plugins solo se cargan desde la raíz de `mu-plugins/`. Por eso `eres-checkout.php` es el único archivo en la raíz.

### `config.php`

```php
return [
    'fields' => [
        'billing_first_name'       => ['label' => 'Nombre',               'required' => true,  'visible' => true, 'placeholder' => '',                   'locked' => true],
        'billing_last_name'        => ['label' => 'Apellidos',            'required' => true,  'visible' => true, 'placeholder' => '',                   'locked' => true],
        'billing_email'            => ['label' => 'Correo electrónico',   'required' => true,  'visible' => true, 'placeholder' => 'tu@correo.com',      'locked' => true],
        'billing_phone'            => ['label' => 'Celular',              'required' => true,  'visible' => true, 'placeholder' => 'Ej. 987654321'],
        'billing_tipo_documento'   => ['label' => 'Tipo de documento',    'required' => true,  'visible' => true, 'placeholder' => 'Selecciona'],
        'billing_numero_documento' => ['label' => 'N° de documento',      'required' => true,  'visible' => true, 'placeholder' => 'Ej. 12345678'],
        'billing_distrito'         => ['label' => 'Distrito',             'required' => true,  'visible' => true, 'placeholder' => 'Selecciona un distrito', 'delivery_only' => true],
        'billing_address_1'        => ['label' => 'Dirección',            'required' => true,  'visible' => true, 'placeholder' => 'Calle, número y departamento', 'delivery_only' => true],
        'billing_address_2'        => ['label' => 'Referencia',           'required' => false, 'visible' => true, 'placeholder' => 'Ej. frente al parque',   'delivery_only' => true],
    ],
    'document_types' => ['DNI' => 'DNI', 'CE' => 'Carné de Extranjería', 'Pasaporte' => 'Pasaporte', 'RUC' => 'RUC'],
    'districts' => ['Barranco', 'Chorrillos', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Magdalena del Mar', 'Miraflores', 'Pueblo Libre', 'San Borja', 'San Isidro', 'San Luis', 'San Miguel', 'Santiago de Surco', 'Surquillo'],
    'delivery' => [
        'local_pickup' => ['title' => 'Recojo en el local',  'subtitle' => 'Calle Libertad 176, of. 413 · Miraflores',       'summary' => 'Recojo'],
        'flat_rate'    => ['title' => 'Envío a domicilio',   'subtitle' => 'Envío en 48h · Distritos seleccionados de Lima', 'summary' => 'Envío a domicilio'],
        'free_shipping'=> ['title' => 'Envío a domicilio',   'subtitle' => 'Envío en 48h · Distritos seleccionados de Lima', 'summary' => 'Envío a domicilio'],
    ],
    'free_shipping_threshold' => 300,
    'trust' => [
        ['icon' => 'shield', 'title' => 'Pago 100% seguro', 'text' => 'Encriptado SSL'],
        ['icon' => 'truck',  'title' => 'Envío en 48h',     'text' => 'Lima · Distritos disponibles'],
        ['icon' => 'return', 'title' => 'Devoluciones',     'text' => 'Hasta 14 días. Revisar condiciones.'],
    ],
    'whatsapp_url' => 'https://wa.link/9tjyvn',
    'legal_links' => [
        'Términos y condiciones' => '/terminos-y-condiciones/',
        'Cambios y devoluciones' => '/cambios-y-devoluciones/',
        'Libro de reclamaciones' => '/libro-de-reclamaciones/',
    ],
];
```

Convenciones:

- Todo el código lee la configuración con `eres_checkout_config()`, que aplica el filtro `eres_checkout_config`. SPEC 19 se engancha ahí.
- `locked` marca los campos que nunca se ocultan ni dejan de ser obligatorios.
- `delivery_only` marca los campos que solo se muestran y validan con un método que no sea `local_pickup`.
- Las claves de `delivery` son el identificador del método sin instancia: `flat_rate:2` usa `flat_rate`. Un método sin entrada muestra su título de WooCommerce y ningún subtítulo.
- El precio de la tarjeta de entrega lo pone WooCommerce. No se escribe en la configuración.

### Valores fijos y derivados

| Campo | Valor |
|---|---|
| `billing_country` | Siempre `PE`. No se pinta. |
| `billing_state` | Siempre `LMA`. No se pinta. |
| `billing_city` | El distrito elegido. `Lima` en recojo. |
| `billing_postcode` | No existe en el formulario. Se guarda vacío. |
| Campos `shipping_*` | No se pintan. El envío usa la dirección de facturación. |
| Notas del pedido | Desactivadas. |

### Meta del pedido

Se conservan las claves que ya usan los pedidos existentes:

| Meta key | Contenido |
|---|---|
| `_billing_tipo_documento` | Clave de `document_types` |
| `_billing_numero_documento` | Texto |
| `_billing_distrito` | Nombre del distrito. Vacío en recojo. |

Se escriben con `$order->update_meta_data()` en `woocommerce_checkout_create_order` y se leen con `$order->get_meta()`, para que funcionen con HPOS.

### Constante en `wp-config.php`

```php
define('ERES_STOREFRONT_URL', 'https://eresskinstudio.com');
```

| Enlace | Constante vacía o sin definir | Constante con valor |
|---|---|---|
| "← Volver" y logo | Página de la tienda de WooCommerce | `<url>/productos` |
| "Editar" | `/cart/` de WooCommerce | `<url>/productos?carrito=abierto` |
| Checkout con carrito vacío | Comportamiento de WooCommerce | Redirige a `<url>/productos` |
| Enlaces legales y de privacidad | Rutas en el mismo WordPress | `<url>` + ruta |

Mientras WordPress siga en `eresskinstudio.com`, la constante queda sin definir. Se completa en la migración.

### Astro

- `?carrito=abierto` en cualquier página abre el drawer del carrito y se quita de la URL con `history.replaceState`.
- Lo resuelve `HeaderReact.tsx`, que ya escucha `CART_OPEN_REQUEST`.

## Plan de implementación

Rama: `feat/checkout-homologado`, desde `staging` actualizado. Los pasos 1 a 10 no tocan el WordPress en vivo.

1. **Esqueleto.** Crear `eres-checkout.php`, `config.php` y `eres_checkout_config()`. El plugin no hace nada todavía.
2. **Plantilla.** En `shell.php`, filtrar `template_include` para `is_checkout()` y servir `templates/page.php` con header, contenido, footer y WhatsApp. Resolver los enlaces con `ERES_STOREFRONT_URL`.
3. **Estilos base.** Encolar `checkout.css` y `checkout.js` con `filemtime` como versión. Desencolar en esas páginas los estilos del tema, de Elementor y de los plugins Jet. Copiar las dos fuentes desde `node_modules/@fontsource-variable/dm-sans/files/` y declarar los tokens.
4. **Campos.** En `fields.php`, armar los campos desde la configuración, quitar código postal, notas y campos `shipping_*`, y fijar país, región y ciudad.
5. **Entrega.** En `layout.php`, pintar las tarjetas de entrega en el Paso 2 con los tres campos de dirección debajo. Registrar su fragmento en `woocommerce_update_order_review_fragments`. Reemplazar `cart/cart-shipping.php` por la fila de solo texto.
6. **Pasos, pago y resumen.** Encabezados de los tres pasos. Mover `woocommerce_checkout_payment` de `woocommerce_checkout_order_review` a la columna izquierda con `remove_action` / `add_action`. Miniatura, categoría y cantidad en el resumen. Nota de impuestos y textos de confianza.
7. **Cupón.** Quitar `woocommerce_checkout_coupon_form` y pintar el bloque propio. El JS llama a `wc-ajax=apply_coupon` y dispara `update_checkout`.
8. **Barra de envío gratuito y botón.** Barra con su fragmento. Total dentro del botón en cada `updated_checkout`.
9. **Validaciones.** En `validation.php`, validar en `woocommerce_after_checkout_validation` con errores asociados a cada campo, y guardar la meta del pedido. Mensaje en línea al salir de un campo y tras `checkout_error`.
10. **Astro.** `?carrito=abierto` en `HeaderReact.tsx`. Verificar en `/productos` y en la home.
11. **Documentación.** Sección **Checkout** en `wordpress/README.md` con instalación, constante, pase y reversa. Viñeta **Checkout** en `CLAUDE.md`.
12. **Pase a producción** (manual, en una hora de poco tráfico):
    1. Exportar todos los snippets desde Code Snippets y guardar una copia de `checkout-eres.css` y del CSS global.
    2. Mover el filtro `woocommerce_add_to_cart_redirect` (`eres_buy_now`) a un snippet propio, "ERES · Comprar ahora". Sigue activo hasta la migración.
    3. Desactivar los snippets del checkout, sin borrarlos.
    4. Subir `eres-checkout.php` y la carpeta `eres-checkout/` a `wp-content/mu-plugins/`.
    5. LiteSpeed Cache → **Purgar todo**.
    6. Recorrer los criterios de aceptación, con un pedido real de monto bajo.
13. **Limpieza** (cuando el paso 12 pase completo): borrar los snippets desactivados y `uploads/eres/checkout-eres.css`. Quitar del CSS global los bloques de avisos, cupón, documento, `#place_order`, `.eres-field-error`, `.eres-step--shipping`, `.eres-shipping-target` y `.cky-*`.

### Reversa

Si algo falla en el paso 12: borrar `eres-checkout.php` de `mu-plugins/`, reactivar los snippets y purgar LiteSpeed. El checkout vuelve al estado anterior. Por eso el paso 13 no se ejecuta el mismo día.

### Snippets que se desactivan en el paso 12

- Formulario de Checkout + Validaciones + Distritos
- Eres Checkout — Enqueue CSS + Preload fuentes
- Eres Checkout — Wrapper del resumen + Step headers
- Eres Checkout — Trust badges + Tax note
- Eres Checkout — Botón con candado + total + reorden de campos
- Eres Checkout — Resumen mejorado (imagen + categoría)
- Eres Checkout — Mover botón de pago a columna izquierda
- El snippet de la barra de envío gratuito (`eres-free-shipping-notice`)
- El snippet de la validación en línea (`eres-field-error`)

## Criterios de aceptación

**Plantilla y estilos**

- [ ] `/checkout/` no contiene `jet-theme-core-header`, `data-elementor-type` ni hojas de estilo de Elementor en su HTML.
- [ ] El HTML no contiene `fonts.googleapis.com`, y en la pestaña Red se descargan las fuentes desde `mu-plugins/eres-checkout/assets/fonts/`.
- [ ] El `font-family` computado del `<body>`, de "Checkout" y del total empieza por `DM Sans`.
- [ ] El fondo computado de la página es `rgb(238, 234, 227)` y el de las dos tarjetas `rgb(255, 255, 255)`.
- [ ] Ningún campo, botón ni tarjeta tiene `border-radius` distinto de `0px`. Los radios, el círculo de cantidad y el botón de WhatsApp son círculos.
- [ ] El header muestra "Volver", el logo y "Compra segura". El footer muestra los tres enlaces legales.
- [ ] El botón de WhatsApp abre `https://wa.link/9tjyvn` en una pestaña nueva.
- [ ] El banner de CookieYes no se ve en `/checkout/`.
- [ ] A 1440px hay dos columnas y el resumen queda fijo al hacer scroll. A 390px hay una columna y no hay scroll horizontal.
- [ ] Hay un solo `<h1>` en la página.

**Campos**

- [ ] El formulario muestra exactamente: Nombre, Apellidos, Correo electrónico, Celular, Tipo de documento y N° de documento.
- [ ] No aparecen País, Región, Código postal, "¿Enviar a una dirección diferente?" ni notas del pedido.
- [ ] Con "Recojo en el local" no se ven Distrito, Dirección ni Referencia, y el pedido se completa sin ellos.
- [ ] Al elegir "Envío a domicilio" aparecen Distrito, Dirección y Referencia sin recargar la página.
- [ ] Con "Envío a domicilio", enviar sin Distrito o sin Dirección muestra un error bajo cada campo y no crea el pedido.
- [ ] Un DNI de 7 dígitos, un RUC de 10 dígitos y un celular de 8 dígitos muestran cada uno su error.
- [ ] Cambiar `required` a `false` en `billing_numero_documento` dentro de `config.php` quita el asterisco y deja pasar el pedido sin ese dato.
- [ ] Cambiar `visible` a `false` en `billing_address_2` oculta Referencia.

**Entrega, cupón y resumen**

- [ ] Al cargar, "Recojo en el local" está elegido y el resumen dice "Recojo · Gratis".
- [ ] Elegir "Envío a domicilio" suma S/12.00 al total del resumen y al texto del botón.
- [ ] `document.querySelectorAll('[name="shipping_method[0]"]')` devuelve dos elementos, ambos dentro del Paso 2.
- [ ] "Haz clic para aplicarlo" despliega el campo del cupón. Un cupón válido agrega la fila Descuento y baja el total.
- [ ] Un cupón inválido muestra un aviso de error y no cambia el total.
- [ ] `document.querySelectorAll('form form')` devuelve cero elementos.
- [ ] Con un subtotal de S/209.00 la barra dice "Te faltan S/91.00 para obtener envío gratuito".
- [ ] Cada producto del resumen muestra miniatura, cantidad, categoría y nombre.
- [ ] Tras cambiar de método de entrega tres veces seguidas, los pasos 1, 2 y 3 siguen en orden y no hay bloques duplicados.

**Pago y pedido**

- [ ] Un pedido con Culqi en "Recojo en el local" se paga y queda en estado Procesando.
- [ ] Un pedido con Culqi en "Envío a domicilio" se paga y queda en estado Procesando.
- [ ] En el admin, el pedido de envío muestra Tipo de documento, N° de documento y Distrito, y su ciudad de facturación es el distrito.
- [ ] En el admin, un pedido anterior al pase sigue mostrando su tipo y número de documento.
- [ ] La página `order-pay` de un pedido pendiente y la de "pedido recibido" de un pedido fallido usan el header y el footer nuevos.
- [ ] La consola no muestra errores ni los `console.log` de debug durante un pedido completo.

**Enlaces y Astro**

- [ ] Sin `ERES_STOREFRONT_URL`, "Volver" va a la tienda de WooCommerce y "Editar" a `/cart/`.
- [ ] Con `ERES_STOREFRONT_URL` definida, "Volver" va a `<url>/productos` y "Editar" a `<url>/productos?carrito=abierto`.
- [ ] Con `ERES_STOREFRONT_URL` definida, abrir `/checkout/` con el carrito vacío redirige a `<url>/productos`.
- [ ] En el sitio Astro, `/productos?carrito=abierto` abre el carrito y la URL queda en `/productos`.
- [ ] "Finalizar compra" desde el sitio Astro abre el checkout nuevo con los mismos productos y cantidades.
- [ ] En el WordPress en vivo, "Comprar ahora" de una ficha sigue llevando al checkout.

**Cierre**

- [ ] Plugins → Imprescindibles lista "ERES · Checkout".
- [ ] Tras el paso 13, Code Snippets no tiene snippets del checkout y `uploads/eres/checkout-eres.css` responde `404`.
- [ ] `npm run build` termina sin errores.
- [ ] `wordpress/README.md` tiene la sección **Checkout** y `CLAUDE.md` la viñeta **Checkout**.

## Decisiones

- **Sí:** un solo mu-plugin versionado en el repo. Es el patrón de los otros cuatro, queda en git y se instala copiando archivos.
- **No:** seguir con Code Snippets o un plugin en zip. Los snippets no tienen historial y ya se duplicaron entre sí.
- **Sí:** partir el trabajo en SPEC 18 (checkout) y SPEC 19 (pantalla de ajustes). La 18 se prueba directo en producción y conviene que lleve lo mínimo.
- **Sí:** configuración en un arreglo con un filtro. La 19 agrega la pantalla sin tocar el maquetado.
- **Sí:** plantilla propia sin Elementor. El usuario eligió que el checkout no dependa de Elementor ni de Jet.
- **No:** reestilizar el header y footer de JetThemeCore. Ata el checkout a plugins que se van a retirar.
- **Sí:** DM Sans autoalojada. Es la fuente del sitio y evita la llamada a Google Fonts.
- **Sí:** títulos sin itálicas. Las capturas de referencia no las llevan y Playfair Display deja de cargarse.
- **Sí:** quitar el código postal. El usuario lo confirmó y Culqi 3.1.4 no lo lee.
- **Sí:** dirección solo en "Envío a domicilio". Elegido por el usuario, como en su referencia.
- **Sí:** país y región fijos y sin pintar. Solo se vende en Lima.
- **No:** boleta o factura. El usuario lo excluyó.
- **Sí:** tarjetas con radio para la entrega, como en la referencia visual. Los dos botones de la referencia de campos no dejan lugar al subtítulo.
- **Sí:** subtítulo "Distritos seleccionados de Lima". El usuario confirmó que por ahora es solo Lima, y la lista no tiene distritos del Callao.
- **Sí:** maquetado con hooks, fragmentos y una plantilla de WooCommerce. El JS que movía nodos era la parte más frágil.
- **Sí:** cupón propio contra `wc-ajax=apply_coupon`. El formulario nativo vive fuera de `form.checkout` y meterlo dentro anida formularios.
- **Sí:** reescribir la barra de envío gratuito y la validación en línea a partir de lo que se ve en la página. Elegido por el usuario.
- **Sí:** umbral de envío gratuito en la configuración. No se lee del método de envío de WooCommerce.
- **Sí:** conservar las claves de meta del pedido. Los pedidos existentes siguen legibles.
- **Sí:** `ERES_STOREFRONT_URL` con comportamiento propio cuando está vacía. El mu-plugin se puede instalar antes de la migración, igual que `ERES_THANK_YOU_URL`.
- **Sí:** `?carrito=abierto` en Astro. "Editar" necesita un destino cuando `/cart/` deje de existir.
- **Sí:** el botón de WhatsApp lo pinta el mu-plugin. Hoy lo pone Elementor.
- **Sí:** ocultar CookieYes en el checkout con CSS. El usuario pidió quitarlo ahí. Desinstalarlo es otra decisión.
- **Sí:** pase directo en producción con reversa. El usuario descartó armar un staging de WordPress.
- **Sí:** `eres_buy_now` se queda en un snippet aparte. La tienda de WordPress lo usa hasta la migración.
- **Sí:** Distrito a ancho completo. Pedido del usuario tras el primer pase.
- **Sí:** validar todos los campos en el navegador antes de enviar. El script de Culqi escucha `checkout_place_order`, envía el pedido por su cuenta y ante un rechazo solo muestra `alert('Order creation failed')`: sin este freno, un campo vacío terminaba en esa alerta.
- **Sí:** interceptar la respuesta de `wc-ajax=checkout`. Si el servidor rechaza el pedido, se silencia esa alerta y se pintan sus mensajes arriba del formulario y bajo cada campo.
- **Definición rápida:** el usuario confirmó el encabezado y pidió asumir el resto y guardar. Son propuestas no revisadas: la división en dos specs, el orden de los campos, el resumen debajo del formulario en móvil, los tamaños de la referencia de diseño, el texto "¡Tienes envío gratuito!" y las reglas de validación (celular de 9 dígitos, DNI de 8, RUC de 11, CE y Pasaporte de 5 a 12 caracteres, dirección de 5 o más).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El pase se hace sobre la tienda en vivo y un error corta las ventas | Hora de poco tráfico, snippets desactivados y no borrados, y reversa en tres pasos. La limpieza va otro día. |
| El plugin de Culqi espera un HTML que la plantilla nueva no tiene | El paso 12 incluye un pedido real por cada método de entrega antes de dar el pase por bueno. |
| Culqi rechaza por antifraude un pedido de recojo sin dirección | Manda cada dato solo si existe. Si aparecen rechazos, en recojo se guarda la dirección del local. |
| El CSS global sigue cargando reglas con `!important` sobre avisos y botón | La plantilla desencola los estilos ajenos. Los criterios miden estilos computados. El paso 13 borra esos bloques. |
| LiteSpeed sirve el CSS o el JS combinado anterior | Purga total en el paso 12. La versión de los archivos es su `filemtime`. |
| El umbral de la barra no coincide con el del envío gratuito de WooCommerce | Los dos valen 300 hoy. La guía pide cambiarlos juntos. SPEC 19 lo deja editable. |
| Las páginas legales no existen en Astro y los enlaces dan 404 tras la migración | Fuera de alcance. Sin la constante, los enlaces apuntan a WordPress. La guía lo marca como requisito antes de definirla. |
| Un método de envío nuevo no tiene entrada en `delivery` | Muestra su título de WooCommerce sin subtítulo y se trata como envío a domicilio. |
| Otro plugin engancha contenido en hooks del checkout que ya no se pintan donde espera | Se usan los hooks estándar de WooCommerce. Solo cambian de lugar el pago y la fila de envío. |
| Con `?cart-token=` inválido, `eres-cart-handoff` redirige a `/checkout/` y este a `/productos` | Es el comportamiento buscado con la constante definida. Sin ella, sigue como en SPEC 14. |
| Un snippet viejo sigue validando en el servidor y rechaza pedidos de recojo ("La dirección debe tener al menos 5 caracteres.") | Sus mensajes llegan sin `data-id`. Se busca ese texto en Code Snippets y se desactiva el snippet que lo contiene. |
| Un pedido de prueba real en producción | Monto bajo y reembolso desde Culqi. Lo decide el usuario al hacer el pase. |

## Lo que **no** entra en esta spec

- Pantalla de ajustes del checkout para el cliente (SPEC 19).
- Campos nuevos o reordenables.
- Boleta o factura.
- Páginas legales en Astro.
- Desinstalar Elementor, Jet o CookieYes.
- Cambios en pasarela, métodos de envío o precios.
- Staging de WordPress.
- Correos de WooCommerce.

Cada una, si llega, va en su propia spec.

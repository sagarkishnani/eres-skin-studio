# SPEC 10 — Ficha de producto

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03, SPEC 05, SPEC 09
> **Fecha:** 2026-09-29
> **Objetivo:** Rehacer `/productos/<slug>` según la pantalla `pdp` de la referencia de diseño, 100% responsive, con galería, compra, acordeón de detalle, barra de compra fija y productos relacionados.

## Por qué existe esta spec

Hoy la ficha es la plantilla de SPEC 02: una imagen grande, miniaturas sin interacción, colores fuera de tema (`text-emerald-400`, `text-amber-400`, `text-red-400`, `text-white`, `rounded-full` en el badge) y un `input type=number` para la cantidad. SPEC 09 dejó fuera su rediseño.

La referencia (`Eres Skin Studio (2).html`, pantalla `pdp`) define:

- miga de pan, galería con miniaturas, flechas, swipe y zoom a pantalla completa;
- bloque de compra: marca · categoría, precio con "Ahorras", aviso de stock con barra, selector de cantidad, "Añadir al carrito" y "Comprar ahora";
- envío, recojo en tienda y un acordeón (Beneficios, Ingredientes clave, Modo de uso);
- "Compartir" y "Hacer una pregunta";
- una barra de compra fija abajo cuando el bloque de compra sale de pantalla;
- la banda de Beneficios y "Te puede gustar · Completa tu rutina".

El contenido del acordeón no existe en Woo como campos separados: esta spec agrega tres campos meta por producto con un mu-plugin propio.

Estado de Woo al redactar (2026-09-29): 29 productos, todos `simple`, todos con `manage_stock`, ninguno con cross-sells ni upsells.

## Referencia de diseño (valores extraídos del bundle)

Breakpoints de SPEC 05:

- **móvil:** `< md` (768px);
- **tablet:** `md` a `lg`;
- **desktop:** `≥ lg` (1024px).

El layout de dos columnas y la galería sticky arrancan en `lg`. Por debajo todo va en una columna.

| Hex del bundle | Token |
|---|---|
| `#FFFFFF` | `bg-surface-raised` |
| `#FAFAF5` | `bg-surface` / `text-content-inverse` |
| `#F0F0EC` (fondo de imagen) | `bg-stone-100` |
| `#EEEAE3` | `border-stone-150` / `bg-stone-150` |
| `#E4E0D8` / `#D9D6CF` | `border-line` / `border-line-strong` |
| `#DCE2D5` ("Ahorras", Beneficios) | `bg-sage-100` |
| `#718471` (barra de stock) | `bg-sage-500` |
| `#4E5E55` (eyebrow marca · categoría) | `text-sage-700` |
| `#2E3A33` | `bg-accent` / `text-accent` |
| `#1D1D1B` / `#3A3A36` / `#6B6A66` | `content` / `content-muted` / `content-subtle` |

### 1. Contenedor y miga de pan

- Sección `bg-surface-raised`, en `container-xl`, con padding superior de 16px en móvil y 32px desde `md`, e inferior `clamp(56px,7vw,96px)`. El offset del header se resuelve como en las demás páginas.
- Miga: **Home › Productos › {nombre}**.
  - `caption-md` (13px), `text-content-muted`, `flex-wrap`, gap 10px, chevron de 12px entre ítems.
  - El último ítem en `text-content`.
  - Los enlaces llevan el subrayado animado de 1px (`background-size 0→100%`, 500ms `ease-out-expo`).
  - Margen inferior `clamp(20px,3vw,40px)`.
- Grilla principal:
  - **desktop:** `minmax(0,1.1fr) minmax(0,1fr)` con gap `clamp(40px,6vw,96px)` e `items-start`;
  - **< lg:** una columna con gap de 28px.

### 2. Galería

- **Desktop:** `sticky`, con `top` de 112px, o 24px con el header oculto (`html[data-header=hidden]`), animado en 600ms `ease-out-expo`. Grilla `72px minmax(0,1fr)` con gap de 16px.
- **Miniaturas (solo desktop):** columna con gap de 12px. Cada una de 72×72, `bg-stone-100`, `object-cover`.
  - Activa: `border border-ink` y opacidad 1.
  - Inactiva: borde transparente y `opacity-60`, que pasa a 1 en hover.
- **Imagen principal:** `aspect-square`, `overflow-hidden`, `bg-stone-100`, `touch-action: pan-y`, sin selección de texto.
  - Todas las imágenes apiladas en `absolute inset-0` con `object-cover`.
  - La activa en opacidad 1 y `scale(1)`; en desktop con el puntero encima, `scale(1.03)`. Las demás en opacidad 0 y `scale(1.04)`.
  - Opacidad en 700ms `cubic-bezier(.22,.61,.36,1)` y escala en 1400ms `ease-out-expo`.
  - Swipe horizontal de más de 40px cambia de imagen (con puntero, en cualquier breakpoint).
- **Badge de descuento:** arriba a la izquierda (14px), `bg-accent text-content-inverse`, 12px, peso 600, tracking `.04em`, `px-[9px] py-1.5`, `leading-none`. Texto `-N%`. Solo si hay descuento.
- **Botón de zoom:** arriba a la derecha (14px), 44px, `rounded-full`, `bg-surface-raised`, `shadow-sm`, icono lupa con `+` de 18px. En hover `scale(1.08)` con `ease-spring`.
- **Flechas (solo desktop y con más de una imagen):** 44px, `border border-stone-150`, `bg-surface-raised`, chevron de 16px, centradas en vertical a 14px de cada borde.
  - Sin puntero encima: opacidad 0 y desplazadas 8px hacia afuera. Con puntero o foco: opacidad 1 y en su sitio (500ms `ease-out-expo`).
- **Contador (< lg y con más de una imagen):** debajo de la imagen, centrado, gap 14px: botón anterior de 44px, "1 / 3" en 14px `tabular-nums`, botón siguiente de 44px.
- **Sin imágenes:** el cuadro `bg-stone-100` con "Sin imagen" en `caption-sm text-content-subtle`, sin zoom ni flechas.

### 3. Zoom

- Capa `fixed inset-0 z-[80] bg-surface-raised`, que entra con opacidad en 450ms.
- Imagen en `object-contain`, con márgenes `clamp(64px,7vw,88px)` arriba y abajo y `clamp(12px,6vw,96px)` a los lados. Pasa de `scale(.96)` a 1 en 700ms `ease-out-expo`.
- Botón cerrar de 48px arriba a la derecha (16px), `border border-stone-150`, `bg-surface-raised`, ✕ de 22px.
- Abajo, centrado a 20px del borde: anterior (44px, con borde), "N / M" en 14px `tabular-nums` y siguiente.
- `Esc` cierra, las flechas del teclado navegan, el foco queda atrapado y se bloquea el scroll con `scrollLock`.

### 4. Columna de información

En orden, dentro de un `flex-col min-w-0`:

1. **Eyebrow:** "Marca · Categoría" en `caption-sm` (12px), uppercase, tracking `.18em`, peso 500, `text-sage-700`. Sin marca, solo la categoría.
2. **H1:** `text-[clamp(32px,3.4vw,50px)]`, `leading-[1.06]`, tracking `-.03em`, peso 400, `text-balance`, `mt-3 mb-4`.
3. **Precio** (`flex-wrap items-center gap-3`):
   - precio actual en 24px, peso 600, tracking `-.01em`;
   - precio regular en 17px, `line-through`, `text-content-subtle`;
   - chip "Ahorras S/ X" en `bg-sage-100 text-accent`, 12px, peso 600, `px-2 py-[5px]`, `leading-none`.
   - Sin descuento solo va el precio actual.
4. **Nota de envío:** `shop.productPage.shippingNote` en 14px, `text-content-muted`, `mt-2.5`.
5. **Descripción corta:** `short_description` de Woo (HTML) en `body-md`, `leading-[1.65]`, `text-content-muted`, `text-pretty`, `mt-6`. Se omite si está vacía.
6. **Stock** (`mt-6`, gap 10px), según la regla del modelo de datos:
   - "Solo quedan **N** unidades en stock." en 14px, con el número en peso 600;
   - barra de 2px `bg-stone-150`, `max-w-[360px]`, con relleno `bg-sage-500` de ancho `min(100%, N/30)`.
7. **Compra** (`mt-6`): grilla `auto minmax(0,1fr)` con gap de 10px.
   - **Cantidad:** caja de 54px de alto, `border border-line-strong`, `bg-surface-raised`. Botones "−" y "+" de 44px de ancho (18px, hover `opacity-50`) y el valor en 15px `tabular-nums` con ancho mínimo de 28px.
   - **Añadir al carrito:** 54px, `border border-ink`, fondo transparente, texto `text-content`, 13px, peso 500, uppercase, tracking `.14em`, `PiHandbagLight` de 18px.
     - Hover: relleno `bg-ink` que sube desde abajo (`background-size 100% 0→100%`, 550ms `ease-out-expo`) y el texto pasa a `text-content-inverse` (400ms).
   - **Comprar ahora:** `col-span-full`, 54px, `bg-ink text-content-inverse`, mismo texto.
     - Hover: relleno `bg-accent` desde abajo y tracking `.14em→.18em` (500ms).
8. **Envío** (`mt-7`, 14px): icono de caja de 20px y `shop.productPage.deliveryText`.
9. **Recojo** (`mt-[22px]`, gap 12px): check de 20px; título `pickupTitle` en 15px peso 500 y `pickupText` en 13px `text-content-subtle`.
10. **Acordeón** (`mt-8 border-t border-line`):
    - cada panel con `border-b border-line`;
    - botón de ancho completo, `py-[22px]`, 18px, tracking `-.01em`, alineado a la izquierda;
    - indicador `+`/`−` de 14px con trazos de 1.5px: el vertical hace `scaleY(0)` al abrir (450ms `ease-out-expo`);
    - contenido con `grid-template-rows 0fr→1fr` en 550ms `ease-out-expo`;
    - texto en 15px, `leading-[1.7]`, `text-content-muted`, `whitespace-pre-line`, `text-pretty`, `pb-6`;
    - el panel "Descripción" (HTML de Woo) usa `prose` con los mismos tamaños.
    - El primer panel empieza abierto. Solo hay uno abierto a la vez y hacer clic en el abierto lo cierra.
11. **Acciones** (`mt-[22px]`, `flex-wrap`, gap `12px 28px`, 14px), con icono de 18px y subrayado animado:
    - "Compartir" → "Enlace copiado" durante 2,2s;
    - "Hacer una pregunta" (icono de interrogación).

### 5. Barra de compra fija

- `fixed inset-x-0 bottom-0 z-[44]`, `bg-surface-raised`, `border-t border-stone-150`, sombra hacia arriba (`shadow-up`, nuevo token: `0 -12px 30px -22px rgba(29,29,27,.3)`).
- Entra con `translateY(110%)→0` en 650ms `ease-out-expo`. Respeta `env(safe-area-inset-bottom)`.
- Interior en `container-xl`, `flex items-center gap-4`, con padding `10px 16px` en móvil y `py-3` + gutter desde `md`.
  - **Solo desktop:** miniatura de 56px (`bg-stone-100`, `object-cover`).
  - Nombre (15px, 13px en móvil) truncado a una línea y debajo el precio (16px, peso 600) y el regular tachado (13px, `text-content-subtle`).
  - **Solo desktop:** el mismo selector de cantidad, de 48px de alto.
  - Botón "Añadir al carrito" de 48px, `px-8`, `bg-ink text-content-inverse`, 12px uppercase tracking `.14em`, `whitespace-nowrap`, hover con relleno `bg-accent`.

### 6. Beneficios

Idéntica a la de `/productos` (SPEC 09, sección 4): se reutiliza `ShopBenefits.astro` con `shop.benefits`.

### 7. Te puede gustar

- Sección `bg-surface` con padding vertical `clamp(64px,8vw,112px)`, en `container-xl`.
- Cabecera: eyebrow "— {relatedEyebrow}" (`eyebrow`: 12px, tracking `.22em`, `text-content-muted`) y H2 `relatedTitle` en `heading-md` con gap de 16px.
- Grilla a `pt-[clamp(28px,4vw,48px)]`:
  - **móvil:** 2 columnas, gap `28px 12px`;
  - **desde `md`:** 4 columnas, gap `48px 24px`.
- Tarjetas: `ProductCard.astro` de SPEC 05/09, con `QuickAdd`.

## Alcance

**Entra:**

- Nueva plantilla de `/productos/<slug>` con las secciones 1 a 7 de la referencia, responsive de 360px en adelante.
- Galería con miniaturas, flechas, contador, swipe y zoom a pantalla completa.
- Bloque de compra con precio, "Ahorras", stock, cantidad, "Añadir al carrito" (abre el drawer del carrito) y "Comprar ahora" (agrega y va al checkout de Woo).
- Precio y stock refrescados en vivo al cargar.
- Barra de compra fija que aparece al pasar el bloque de compra, con el botón de WhatsApp desplazado hacia arriba.
- Acordeón con los campos meta `eres_beneficios`, `eres_ingredientes` y `eres_modo_uso`, y el fallback "Descripción".
- mu-plugin `wordpress/mu-plugins/eres-product-fields.php` para editar esos tres campos en WordPress.
- "Compartir" (copia el enlace) y "Hacer una pregunta" (WhatsApp con mensaje prellenado).
- Relacionados: cross-sells y upsells, completados con la misma categoría y luego destacados.
- Objeto `productPage` en el schema de `shop` con los textos fijos de la ficha.
- Evento `eres-skin-studio:cart-open` para abrir el carrito desde fuera del header.
- JSON-LD `schema.org/Product`.
- Productos no simples: muestran "Ver opciones" enlazando a su permalink de Woo.

**Fuera de alcance (para specs futuras):**

- Selector de variaciones para productos variables.
- Reseñas y valoraciones.
- Productos vistos recientemente.
- Carrusel horizontal de relacionados en móvil (el bundle tiene restos de uno, pero la grilla 2×2 es lo que renderiza).
- Zoom con lupa en hover o pinch-to-zoom dentro del modo zoom.
- Vista previa en vivo en el editor de Tina para los textos de `productPage` en la ficha.
- Editar los campos del acordeón desde el CMS de Astro (viven en WordPress).

## Modelo de datos

### Woo, solo build (`src/lib/woo/types.ts`)

```ts
export interface WooMeta {
  key: string;
  value: unknown;
}

export interface WooProductWithStats extends WooProduct {
  total_sales: number;
  date_created: string;
  featured: boolean;
  cross_sell_ids: number[];
  upsell_ids: number[];
  meta_data: WooMeta[];
}
```

- `cross_sell_ids`, `upsell_ids` y `meta_data` **no** van a `projectProduct()` del proxy. Solo los lee el build.
- `getAllProducts()` no cambia de firma: la API REST v3 ya devuelve esos campos.

### Campos meta del acordeón

| Meta key | Título del panel | Formato |
|---|---|---|
| `eres_beneficios` | Beneficios | Texto plano, los saltos de línea se respetan |
| `eres_ingredientes` | Ingredientes clave | Texto plano |
| `eres_modo_uso` | Modo de uso | Texto plano |

- Sin guion bajo inicial: la API REST los expone en `meta_data` sin registrar nada más.
- El mu-plugin agrega tres `textarea` en la pestaña "General" de los datos del producto (`woocommerce_product_options_general_product_data`). Guarda con `woocommerce_process_product_meta` y `sanitize_textarea_field`. Un campo vacío borra el meta.
- Guardar el producto dispara el webhook de SPEC 02, que reconstruye el sitio.

### Datos de la ficha (`src/lib/woo/productPage.ts`, solo build)

```ts
export type DetailKey = "beneficios" | "ingredientes" | "modo-uso" | "descripcion";

export interface ProductDetail {
  key: DetailKey;
  title: string;
  body: string;
  isHtml: boolean;
}

export interface ProductPageData {
  eyebrow: string;
  details: ProductDetail[];
  related: WooProduct[];
}

export function buildProductPage(
  product: WooProductWithStats,
  all: WooProductWithStats[],
): ProductPageData;
```

- **Eyebrow:** `"{marca} · {primera categoría}"`. Sin marca, solo la categoría. Sin ninguna, se omite.
- **Detalles:** los tres paneles meta en ese orden, omitiendo los vacíos. Si los tres están vacíos y hay `description`, un único panel `descripcion` con el HTML de Woo (`isHtml: true`). Si tampoco hay descripción, no hay acordeón.
- **Relacionados** (máximo 4, `RELATED_LIMIT`), sin el propio producto, sin repetidos y solo con `stock_status !== "outofstock"`:
  1. `cross_sell_ids`, y luego `upsell_ids`, en su orden;
  2. productos de la misma primera categoría, por el rank `destacados` de SPEC 09;
  3. el resto del catálogo por `destacados`.
  - Con cero resultados no se renderiza la sección.

### Isla de compra (`src/components/shop/product/ProductPurchaseReact.tsx`)

```ts
interface ProductPurchaseProps {
  id: number;
  name: string;
  type: WooProduct["type"];
  permalink: string;
  thumb: string | null;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  purchasable: boolean;
  stockStatus: StockStatus;
  stockQuantity: number | null;
  lowStockThreshold: number;
  shippingNote: string;
}
```

- Renderiza precio, nota de envío, stock, cantidad, botones y la barra fija. La cantidad es un único estado compartido entre el bloque y la barra.
- Al montar llama a `fetchStock([id])` y reemplaza precio y stock con lo que devuelva. Sin respuesta, se queda con los valores del build.
- **Stock mostrado:**
  - `outofstock` o `!purchasable` → "Agotado" en `text-content-subtle`, sin barra, con cantidad y botones deshabilitados y la barra fija sin mostrarse.
  - `onbackorder` → "Bajo pedido", sin barra.
  - `stock_quantity` numérico y `≤ lowStockThreshold` → "Solo quedan N unidades en stock." con barra (`STOCK_BAR_SCALE = 30`).
  - En cualquier otro caso → "En stock", sin barra.
- **Cantidad:** mínimo 1. Máximo `stock_quantity` si es numérico, si no 99. Los botones se deshabilitan en los topes.
- **Añadir al carrito:** `addToCart(id, qty)`.
  - Mientras espera: "Añadiendo…" y el botón deshabilitado.
  - Éxito: "Añadido" con check durante 1,5s y `requestCartOpen()`.
  - Error: mensaje `role="alert"` en `text-semantics-error`: "No se pudo añadir el producto. Intenta de nuevo en un momento."
- **Comprar ahora:** `addToCart(id, qty)` y, si responde, `location.assign(checkoutUrl())`. Si `checkoutUrl()` es `null` (`PUBLIC_WOO_CHECKOUT_URL` vacía), el botón no se renderiza.
- **Tipo distinto de `simple`:** en lugar de cantidad y botones, un enlace "Ver opciones" (estilo de "Añadir al carrito") a `permalink`. Sin barra fija.

### Barra fija y WhatsApp (`<html data-buy-bar>`)

- La isla observa el bloque de compra con `IntersectionObserver` (`rootMargin: "-72px 0px 0px 0px"`). La barra se muestra cuando el bloque ya salió por arriba.
- Mientras se muestra, escribe `document.documentElement.dataset.buyBar = "visible"`, y lo borra al ocultarse o al desmontar.
- No se muestra si hay un drawer abierto (`html[data-scroll-locked]`).
- `WhatsAppButton.astro` sube su `bottom` a 84px en móvil y 100px desde `md` con `[html[data-buy-bar]_&]`, con transición de 600ms `ease-out-expo`.
- La barra se renderiza con `createPortal` en `document.body`, porque la columna tiene `data-reveal` y un ancestro con `transform` rompe el `position: fixed`.

### Evento para abrir el carrito (`src/utils/wooClient.ts`)

```ts
export const CART_OPEN_REQUEST = "eres-skin-studio:cart-open";
export function requestCartOpen(): void;
```

`HeaderReact` escucha el evento y llama a `openPanelExclusively("cart")`.

### Schema de `shop` (`tina/collections/shop.ts`)

```ts
productPage: {
  shippingNote: string;
  deliveryText: string;
  pickupTitle: string;
  pickupText?: string;
  relatedEyebrow: string;
  relatedTitle: string;
  askMessage: string;
};
```

Contenido sembrado en `src/content/shop/index.json`:

| Campo | Valor |
|---|---|
| `shippingNote` | "Envío calculado al finalizar la compra." |
| `deliveryText` | "Envío a Lima Metropolitana en 48h" |
| `pickupTitle` | "Recojo disponible en Eres Skin Studio" |
| `pickupText` | "Miraflores · Generalmente listo en 24 horas" |
| `relatedEyebrow` | "Te puede gustar" |
| `relatedTitle` | "Completa tu rutina." |
| `askMessage` | "Hola, tengo una pregunta sobre {producto}" |

- `{producto}` se reemplaza por el nombre del producto.
- "Hacer una pregunta" usa la URL de WhatsApp de `global.footer.social` (la misma que `WhatsAppButton`), con `text` agregado vía `URL.searchParams`. Sin URL de WhatsApp, el enlace no se renderiza.

### Compartir

- Con `navigator.share` disponible (móvil) abre la hoja nativa con título y URL.
- Si no, copia `location.href` con `navigator.clipboard.writeText` y muestra "Enlace copiado" 2,2s.
- Si ninguna de las dos APIs existe, el botón no se renderiza.

### JSON-LD

`<script type="application/ld+json">` con:

- `@type: "Product"`, `name`, `image` (todas las URLs), `description` (`stripHtml` de la descripción corta o, si falta, de la larga, 300 caracteres) y `sku` si existe;
- `brand` (`@type: "Brand"`) si hay marca;
- `offers`: `@type: "Offer"`, `price`, `priceCurrency: "PEN"`, `url` canónica y `availability`:
  - `instock` → `InStock`;
  - `outofstock` → `OutOfStock`;
  - `onbackorder` → `BackOrder`.

### Componentes

| Archivo | Rol | Hidratación |
|---|---|---|
| `src/pages/productos/[slug].astro` | `getStaticPaths` con `buildProductPage`, SEO, JSON-LD y composición | — |
| `src/components/shop/product/ProductBreadcrumb.astro` | Miga | — |
| `src/components/shop/product/ProductGalleryReact.tsx` | Galería y zoom | `client:load` |
| `src/components/shop/product/ProductPurchaseReact.tsx` | Precio, stock, compra y barra fija | `client:load` |
| `src/components/shop/product/QuantityStepper.tsx` | Selector de cantidad compartido | — |
| `src/components/shop/product/ProductDetailsReact.tsx` | Acordeón | `client:visible` |
| `src/components/shop/product/ProductActionsReact.tsx` | Compartir y preguntar | `client:visible` |
| `src/components/shop/product/RelatedProducts.astro` | Te puede gustar | — |

## Plan de implementación

1. **Datos de Woo.**
   - Agregar `WooMeta`, `cross_sell_ids`, `upsell_ids` y `meta_data` a `WooProductWithStats`.
   - Crear `src/lib/woo/productPage.ts` con `buildProductPage()`.
   - `getStaticPaths` pasa `product` y `page` como props. La plantilla vieja sigue funcionando.
   - Verificación: `npm run build` pasa con y sin `WOO_*`, y el HTML no contiene `meta_data` ni `total_sales`.
2. **mu-plugin.**
   - Crear `wordpress/mu-plugins/eres-product-fields.php` y documentarlo en `wordpress/README.md`.
   - Verificación: cargar "Beneficios" en un producto y verlo en `meta_data` de `/wp-json/wc/v3/products/<id>`.
3. **Schema y contenido de `shop`.**
   - Agregar `productPage` a `tina/collections/shop.ts` y sembrar `src/content/shop/index.json`.
   - `/admin` muestra el grupo "Ficha de producto".
4. **Abrir el carrito desde fuera.**
   - Agregar `CART_OPEN_REQUEST` y `requestCartOpen()` a `wooClient.ts`, y el listener en `HeaderReact`.
   - Verificación: `window.dispatchEvent(new Event("eres-skin-studio:cart-open"))` en la consola abre el drawer.
5. **Esqueleto de la página.**
   - Reescribir `[slug].astro`: sección, `ProductBreadcrumb`, grilla de dos columnas, eyebrow, H1, descripción corta, envío y recojo.
   - Se eliminan los colores fuera de tema. Provisionalmente, la primera imagen estática y `AddToCartReact` donde irá la compra.
6. **Galería.**
   - `ProductGalleryReact.tsx`: apilado con crossfade, miniaturas, flechas en hover, contador en `< lg`, swipe, badge de descuento y sticky con el offset de `data-header`.
7. **Zoom.**
   - Capa de zoom dentro de la misma isla, con `scrollLock`, `Esc`, flechas del teclado y foco atrapado.
8. **Compra.**
   - `QuantityStepper.tsx` y `ProductPurchaseReact.tsx`: precio, "Ahorras", nota de envío, stock con barra, cantidad, "Añadir al carrito", "Comprar ahora", estados y refresco con `fetchStock`.
   - Reemplaza a `AddToCartReact`. Si este queda sin uso en el proyecto, se borra.
9. **Barra fija.**
   - Portal, `IntersectionObserver`, `data-buy-bar`, token `shadow-up` en `tailwind.config.mjs` y offset del botón de WhatsApp.
10. **Acordeón.** `ProductDetailsReact.tsx` con los paneles de `page.details`.
11. **Compartir y preguntar.** `ProductActionsReact.tsx`.
12. **Beneficios y relacionados.**
    - Montar `ShopBenefits.astro` con la consulta de `shop` de la página y crear `RelatedProducts.astro` sobre `ProductCard`.
    - `StockRefresher` sigue en la página para las tarjetas relacionadas.
13. **SEO.** JSON-LD, `title` `"{nombre} — ERES Skin Studio"` y `description` con `stripHtml(short_description || description, 155)`.
14. **Pulido.**
    - `data-reveal` en la columna de información, la cabecera de relacionados y los ítems de Beneficios, como en la referencia.
    - `prefers-reduced-motion` desactiva crossfade, escala, zoom, acordeón y la entrada de la barra fija.
    - Actualizar la sección Tienda de `CLAUDE.md`: campos meta, evento `cart-open` y `data-buy-bar`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores con y sin variables `WOO_*`.
- [ ] En las piezas nuevas no hay colores hex, `text-white/*`, `bg-white/*`, `text-emerald-*`, `text-amber-*`, `text-red-*` ni `rounded-*`, salvo `rounded-none` y `rounded-full`.
- [ ] El HTML de una ficha no contiene `meta_data`, `total_sales`, `date_created`, `cross_sell_ids` ni `upsell_ids`.
- [ ] La miga muestra Home › Productos › {nombre} y los dos primeros ítems enlazan a `/` y `/productos`.
- [ ] El eyebrow muestra "Marca · Categoría" (p. ej. "OVACO · HIDRATANTE").
- [ ] Un producto en oferta muestra precio, precio regular tachado, "Ahorras S/ X" con la diferencia correcta y el badge `-N%` sobre la imagen.
- [ ] Desde 1024px, la galería tiene miniaturas a la izquierda y se queda fija al hacer scroll hasta el final de la columna de información.
- [ ] Hacer clic en una miniatura cambia la imagen principal y marca la miniatura con borde.
- [ ] En desktop, las flechas aparecen solo con el puntero sobre la imagen y recorren las imágenes en bucle.
- [ ] Por debajo de 1024px no hay miniaturas y aparece el contador "1 / N" con sus flechas.
- [ ] Deslizar la imagen más de 40px en horizontal cambia de imagen, y el scroll vertical sobre ella sigue funcionando.
- [ ] La lupa abre el zoom a pantalla completa. `Esc` y ✕ lo cierran, las flechas del teclado navegan y la página de fondo no hace scroll.
- [ ] Con `stock_quantity` de 3 y umbral 5 se ve "Solo quedan 3 unidades en stock." con la barra. Con 20 se ve "En stock" sin barra.
- [ ] Un producto agotado muestra "Agotado", cantidad y botones deshabilitados y ninguna barra fija.
- [ ] "+" no supera `stock_quantity` y "−" no baja de 1.
- [ ] "Añadir al carrito" con cantidad 2 agrega 2 unidades, muestra "Añadido" y abre el drawer del carrito con el producto.
- [ ] "Comprar ahora" agrega el producto y navega a `PUBLIC_WOO_CHECKOUT_URL?cart-token=…`. Con la variable vacía, el botón no existe.
- [ ] Si el proxy falla al agregar, aparece el mensaje de error y el botón vuelve a estar disponible.
- [ ] Al cambiar el precio en Woo sin reconstruir, la ficha muestra el precio nuevo tras cargar.
- [ ] Al pasar el bloque de compra aparece la barra fija abajo. Al volver a subir, desaparece.
- [ ] En la barra fija, desktop muestra miniatura, nombre, precio, cantidad y botón. Móvil muestra nombre, precio y botón, sin desbordar a 360px.
- [ ] La cantidad de la barra fija y la del bloque son la misma: cambiar una cambia la otra.
- [ ] Con la barra fija visible, el botón de WhatsApp sube y no queda tapado.
- [ ] Con el drawer del carrito abierto, la barra fija no se ve.
- [ ] Un producto con los tres campos meta muestra tres paneles, con "Beneficios" abierto. Abrir otro cierra el anterior.
- [ ] Un producto sin campos meta y con descripción muestra un único panel "Descripción" con el HTML de Woo.
- [ ] Los saltos de línea de "Modo de uso" se respetan.
- [ ] En desktop, "Compartir" copia la URL y muestra "Enlace copiado". En móvil, abre la hoja nativa.
- [ ] "Hacer una pregunta" abre WhatsApp con "Hola, tengo una pregunta sobre {nombre del producto}".
- [ ] La banda de Beneficios muestra los 4 ítems de `shop.benefits`.
- [ ] "Completa tu rutina." muestra 4 productos en stock distintos del actual: 4 columnas desde 768px y 2 por debajo.
- [ ] Sin cross-sells, los relacionados son de la misma categoría primero.
- [ ] Un producto con `type` distinto de `simple` muestra "Ver opciones" enlazando a su permalink y no muestra cantidad ni barra fija.
- [ ] El JSON-LD de la ficha pasa el Rich Results Test de Google como `Product` con oferta válida.
- [ ] A 360, 768, 1024 y 1440px no hay scroll horizontal, ni con el zoom abierto.
- [ ] Todos los controles se pueden usar con teclado. Los paneles llevan `aria-expanded` y `aria-controls`, y la galería anuncia "Imagen N de M".
- [ ] Con `prefers-reduced-motion` no hay crossfade, escala ni deslizamiento de la barra fija.
- [ ] Editar `productPage.pickupText` en `/admin` y reconstruir cambia el texto en todas las fichas.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario, las secciones posteriores a la cabecera no se revisaron una por una. Se asumieron a partir de sus respuestas y de la referencia.
- **Sí: campos meta en Woo para el acordeón.** Es contenido por producto y vive con el producto.
- **No: partir la `description` por títulos.** Depende de que el editor respete una convención de HTML que nadie valida.
- **Sí: mu-plugin propio para los campos.** Sin depender de ACF, igual que `eres-cart-handoff.php`.
- **Sí: "Descripción" como fallback.** Ningún producto queda sin detalle mientras se cargan los metas.
- **Sí: el aviso "Solo quedan N" solo bajo el umbral.** Evita urgencia falsa y reutiliza `lowStockThreshold`.
- **No: mostrar siempre la barra de stock, como la referencia.** Con 29 productos gestionando stock, todas las fichas dirían "Solo quedan".
- **Sí: relacionados cross-sells → categoría → destacados, calculados en build.** Hoy no hay cross-sells, pero quedan disponibles para el equipo sin tocar código.
- **No: `related_ids` de Woo.** Es aleatorio y cambiaría en cada build.
- **Sí: "Añadir" abre el carrito y "Comprar ahora" va directo al checkout de Woo.** El pago es 100% Woo (SPEC 02).
- **Sí: evento `cart-open` en vez de exponer estado del header.** Mismo patrón que `CART_UPDATED` y `data-header`.
- **Sí: una sola isla para precio, stock, compra y barra fija.** Comparten la cantidad y el stock refrescado. Evita que `StockRefresher` reescriba el markup del bloque.
- **No: `data-woo-id` sobre la columna de información.** `StockRefresher` reemplazaría el precio y perdería el chip "Ahorras".
- **Sí: portal para la barra fija.** El `transform` de `data-reveal` rompería el `position: fixed`.
- **Sí: textos fijos en `shop.productPage`.** Horario y zona de recojo cambian sin deploy de código.
- **No: `useTina` en la ficha.** Las fichas se generan desde Woo; los textos se editan en `/admin` y se ven al reconstruir.
- **Sí: reutilizar `ShopBenefits` y `ProductCard`.** Mismo diseño que el catálogo y un solo lugar que mantener.
- **Sí: 4 columnas de relacionados desde `md`.** Es lo que calcula la referencia (`m ? 2 : 4`).
- **No: selector de variaciones en esta spec.** Hoy no hay productos variables y la referencia no trae su UI. Va en su propia spec.
- **Sí: "Ver opciones" para productos no simples.** Degrada con seguridad si aparece uno antes de esa spec.
- **Sí: JSON-LD `Product`.** Costo bajo y habilita rich results de precio y disponibilidad.
- **Sí: `navigator.share` en móvil con fallback al portapapeles.** La referencia solo copia, pero en móvil la hoja nativa es lo esperado.
- **Sí: miga sin categoría.** Así lo define la referencia. La categoría ya está en el eyebrow.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El editor escribe mal un meta o usa otro campo | El mu-plugin da los tres campos con etiqueta propia; nadie teclea las claves a mano. |
| Un cambio de meta no llega al sitio | Guardar el producto dispara el webhook `product.updated` de SPEC 02 y el rebuild. El rebuild diario de las 04:00 cubre fallos del webhook. |
| `stock_quantity` en `null` con `manage_stock` desactivado | Se trata como "En stock" y la cantidad máxima es 99. |
| El precio del build difiere del real | `fetchStock` lo reemplaza al cargar. Si el proxy falla, se ve el del build, igual que hoy. |
| El swipe choca con el scroll vertical o con Lenis | `touch-action: pan-y` y umbral de 40px solo en horizontal. El zoom lleva `data-lenis-prevent`. |
| La barra fija tapa contenido del final de la página | La sección de relacionados ya tiene padding inferior de al menos 64px, mayor que la barra (≈72px en móvil con safe area); si no alcanza, el `main` suma `pb` con `[html[data-buy-bar]_&]`. |
| `navigator.clipboard` no está disponible fuera de HTTPS | Se detecta la API; sin ninguna de las dos, "Compartir" no se renderiza. |
| Aparece un producto variable antes de la spec de variaciones | Muestra "Ver opciones" y enlaza a Woo en vez de fallar al agregar. |

## Qué **no** entra en esta spec

- Selector de variaciones.
- Reseñas, valoraciones y productos vistos recientemente.
- Carrusel de relacionados en móvil.
- Lupa en hover y pinch-to-zoom.
- Vista previa en vivo en Tina de los textos de la ficha.
- Edición de los campos del acordeón desde el CMS de Astro.

Cada una de esas piezas, si llega, va en su propia spec.

# SPEC 05 — Rediseño del home

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03, SPEC 04
> **Fecha:** 2026-09-27
> **Objetivo:** Reemplazar el home del starter por el de la referencia de diseño (hero en carrusel, marquee, productos, servicios, esencia, resultados, Skin Journal, pilares y CTA de reserva), editable desde el CMS y correcto de 360px a 1920px.

## Por qué existe esta spec

El home actual viene del starter:

- tiene tres bloques genéricos (`hero`, `features`, `cta`) con textos de relleno;
- no muestra productos, servicios ni posts;
- no tiene animaciones.

La referencia (`Eres Skin Studio (2).html`) define nueve bloques en un orden fijo. Varios leen datos reales:

- los productos vienen de Woo (SPEC 02);
- los posts vienen de la colección `post`;
- el CTA toma el WhatsApp de `footer.social` (SPEC 04).

Esta spec también suma dos cosas que afectan a todo el sitio:

- un interruptor para el smooth scroll con Lenis, que ya existe en `BaseLayout`;
- las animaciones de entrada al hacer scroll.

Las dos se apagan desde el CMS. Además rediseña `ProductCard`, que comparten el home y `/productos`.

## Referencia de diseño (valores extraídos del bundle)

Los colores se escriben con tokens de SPEC 01, nunca en hex. Equivalencias usadas:

| Hex del bundle | Token |
|---|---|
| `#FAFAF5` | `bg-surface` |
| `#FFFFFF` | `bg-surface-raised` |
| `#DCE2D5` | `bg-sage-100` |
| `#F2EDE9` | `bg-blush` |
| `#F0F0EC` | `bg-stone-100` |
| `#EEEAE3` | `border-stone-150` |
| `#D9D6CF` | `border-line-strong` |
| `#D8C9B8` | `border-clay-300` |
| `#1D1D1B` | `ink` / `text-content` |
| `#3A3A36` | `text-content-muted` / `border-stone-800` |
| `#6B6A66` | `text-content-subtle` |
| `#2E3A33` | `accent` / `sage-900` |
| `#4E5E55` | `sage-700` |
| `#5E4F3F` | `text-clay-800` |
| `#B0BAA8` | `bg-sage-300` |
| `#718471` | **se reemplaza por `bg-sage-700`** (ver Decisiones) |

Tipografía, siempre con tokens de SPEC 01:

| Uso en el bundle | Token |
|---|---|
| H2 de sección `clamp(32px,3.8vw,54px)` | `heading-md` |
| H2 destacado `clamp(34px,4.2vw,60px)` | `heading-lg` |
| Título del hero y del CTA `clamp(40–42px,5.4vw,80px)` | `heading-xxl` |
| H3 de servicio y de pilar | `heading-xs` |
| Eyebrow `12px`, tracking `.22em`, peso 500, uppercase | `caption-sm` + clases de tracking |

Estos valores no tienen token y van como valores arbitrarios:

- el título del post destacado, `clamp(24px,2.6vw,38px)`;
- las cifras de Resultados, `clamp(36px,3.4vw,48px)` en peso 300.

**Breakpoints:** "móvil" es `< md` (768px) y "tablet" es `md` a `lg` (768–1023px). Desktop es `≥ lg`.

**Contenedor común:** `container-xl` (1440px + `px-gutter`, que equivale a `clamp(20px,5vw,72px)`).

**Botón sólido** (hero, Productos, CTA):

- Alto 52px, padding `0 30px`, `caption-md` (13px), peso 500, tracking `.14em`, uppercase.
- Termina en una flecha `→`.
- Al hacer hover, un fondo sube de abajo arriba (`background-size` de `100% 0%` a `100% 100%`) en 550ms `ease-out-expo`.
- Al mismo tiempo el gap pasa de 12px a 18px y el padding a `0 24px 0 30px`.

Hay dos variantes:

- **`btn-fill-dark`:** fondo `ink` que se rellena con `accent` y texto `content-inverse`.
- **`btn-fill-light`:** fondo `surface-raised` que se rellena con `ink`. El texto pasa de `ink` a `content-inverse`.

**Link con subrayado** ("Conoce nuestra esencia", "Skin journal"):

- `caption-sm` (12px), tracking `.16em`, uppercase y flecha `→`.
- Subrayado de 1px que crece de derecha a izquierda en 500ms. El gap pasa de 10px a 16px.
- En `< lg` (táctil) el subrayado está siempre visible.

### 1. Hero

- `<section>` con fondo `bg-accent`, `overflow-hidden` y `touch-action: pan-y`.
  - Alto: `600px` en móvil y `min(78vh, 720px)` en tablet y desktop.
- 3 slides apilados con `absolute inset-0`:
  - cruce de opacidad en 1,4s `cubic-bezier(.22,.61,.36,1)`;
  - la imagen del slide activo hace un zoom lento (Ken Burns) de `scale(1.08)` a `1` en 9s.
- La imagen es un `<img>` con `object-cover`:
  - el primer slide carga con `loading="eager"` y `fetchpriority="high"`, el resto con `loading="lazy"`;
  - `object-position` sale del CMS por slide y tiene un valor para desktop y otro para móvil.
- Scrim (fondo oscuro fijo, excepción de CLAUDE.md):
  - desktop: `linear-gradient(90deg, ink/50 0%, ink/28 38%, transparent 66%)`;
  - móvil: `linear-gradient(180deg, ink/5 25%, ink/66 100%)`.
- Contenido:
  - desktop: centrado vertical, dentro de `container-xl`;
  - móvil: pegado abajo, con padding `0 20px 72px`;
  - columna con gap de 20px y `text-content-inverse`.
- Entrada del texto: opacidad y `translateY(24px → 0)` con 350ms de retraso.
- Título:
  - `heading-xxl` (en `≥ lg` baja 6px: `calc(... - 6px)`), `max-w-[720px]` y `white-space: pre-line`;
  - el `h1` es solo el título del slide 1; los demás son `<p>` con el mismo estilo.
- Bajada: `subtitle-sm`, `max-w-[540px]`.
- CTA: `btn-fill-light`, con `margin-top: 8px`.
- Indicador arriba a la izquierda (`top-8`, alineado con el gutter):
  - `01 ── 03` en `caption-sm`, tracking `.18em`;
  - la línea mide 72×1px sobre `content-inverse/35` y su relleno crece con `scaleX` durante 6,5s.
- Autoplay cada 6,5s, si `home.hero.autoplay` está activo. Lo pausan el hover, el foco dentro del hero y `prefers-reduced-motion`.
- Swipe: un arrastre horizontal de más de 50px con el puntero cambia de slide y reinicia el temporizador.
- Accesibilidad:
  - `aria-roledescription="carrusel"` en la sección y `aria-hidden` en los slides inactivos;
  - los CTA de los slides inactivos llevan `tabindex="-1"`;
  - flechas de teclado ← → cuando el foco está dentro del hero.

### 2. Marquee

- Banda de 46px, `bg-ink` y `text-content-inverse`.
- Los items van en `caption-xs` (11px), tracking `.24em`, uppercase y peso 500, separados por un cuadrado de 3×3px `bg-sage-300` con gap de 28px.
- La lista se renderiza dos veces y se desplaza con `translateX(0 → -50%)` en 48s lineal e infinito.
- Con `prefers-reduced-motion` queda quieta.
- Toda la banda es `aria-hidden`. Los items van también en un `<ul class="sr-only">`.

### 3. Productos

- Sección con fondo `bg-surface` y `py-section`.
- Cabecera:
  - flex con `justify-between`, `items-end`, `flex-wrap` y gap `24px 40px`;
  - margen inferior `clamp(32px,4vw,56px)`;
  - a la izquierda, el eyebrow `— Skincare` (`text-content-muted`) y un H2 `heading-md` con `max-w-[620px]` y `text-wrap: balance`;
  - a la derecha, el botón `btn-fill-dark` "Ver todos" → `/productos`.
- Grilla:
  - `repeat(4,minmax(0,1fr))` con gap `48px 24px` en `≥ md`;
  - `repeat(2,minmax(0,1fr))` con gap `28px 12px` en móvil.
- Datos: `getFeaturedProducts(4)` en build. Si devuelve 0 o Woo no está configurado, la sección no se renderiza.
- Cada tarjeta es la `ProductCard` rediseñada (ver abajo).
- `StockRefresher` refresca precio y stock, como en `/productos`.

### 3b. `ProductCard` rediseñada (compartida con `/productos`)

- Columna con gap de 18px (12px en móvil). Sin `card` ni borde.
- Imagen:
  - `aspect-square`, `bg-stone-100` y `overflow-hidden`;
  - `images[0]` y, si existe, `images[1]` encima con opacidad 0;
  - al hacer hover (solo `≥ lg`), la primera escala a 1,05 y la segunda aparece en 700ms y pasa de `scale(1.06)` a 1.
- Badges arriba a la izquierda (`top-2.5 left-2.5`), cuadrados:
  - descuento `-NN%` con `bg-accent`, `text-content-inverse`, 11px, peso 600 y padding `5px 8px`;
  - "Agotado" con `bg-surface-raised` y `text-content`, que reemplaza al descuento.
- Agregar al carrito, solo si el producto es `simple`, `purchasable` y está en stock:
  - `≥ lg`: una barra de 50px abajo de la imagen, `bg-ink/92` y `text-content-inverse`, con el texto "Agregar al carrito +" en `caption-sm` y uppercase. Sube desde `translateY(101%)` en 600ms `ease-out-expo` al hacer hover o al tener foco, y en hover cambia a `bg-accent`.
  - `< lg`: un botón de 40×40 en `bottom-2 right-2`, `bg-surface-raised`, con `PiHandbagLight` de 18px, `shadow-sm`, `active:scale-90` y `aria-label="Agregar {nombre} al carrito"`.
- Los productos variables no llevan botón: la tarjeta entera lleva a la ficha.
- Texto, columna con gap de 6px (4px en móvil):
  - meta: el nombre de la primera categoría en 11px (10px en móvil), tracking `.1em`, uppercase, `text-content-subtle`, una línea con ellipsis;
  - nombre: `body-md` (14px en móvil), peso 500, `line-clamp-2`, con un subrayado de 1px que crece al hacer hover;
  - precio: 15px (14px en móvil), peso 600, seguido del precio anterior tachado en 13px (12px en móvil) y `text-content-subtle`.
- Se conservan `data-woo-id`, `data-woo-price` y `data-woo-stock` para `StockRefresher`.
- El link cubre toda la tarjeta con `after:absolute after:inset-0`. El botón de agregar queda por encima (`relative z-10`).
- El botón de agregar es una isla `QuickAddReact.tsx` (`client:visible`):
  - llama a `addToCart(id, 1)` de `wooClient.ts`;
  - mientras carga queda deshabilitado; cuando termina muestra un check 1,5s;
  - el badge del header se actualiza por el evento `CART_UPDATED` que ya existe.

### 4. Servicios

- Sección con fondo `bg-sage-100` y `py-section`.
- Cabecera:
  - grilla `repeat(auto-fit,minmax(min(100%,420px),1fr))` con gap `20px 64px` y `items-end`;
  - eyebrow `— Servicios` en `text-accent`;
  - H2 `heading-md` con `white-space: pre-line`;
  - bajada en `body-md`, `text-accent`, `max-w-[520px]` y `justify-self-end`.
- Tarjetas:
  - `≥ md`: `grid-auto-flow: column` con 3 columnas iguales y gap de 24px;
  - móvil: carrusel con `overflow-x-auto`, `grid-auto-columns: 84%`, gap de 12px, `scroll-snap-type: x mandatory`, `scroll-padding` igual al gutter y sin scrollbar. La tarjeta de la derecha se asoma para indicar que hay más.
- Cada tarjeta es un `<a>`:
  - `bg-surface-raised`, padding de 28px (20px en móvil), gap de 20px y alto completo;
  - imagen 16:10 que escala a 1,05 en 1,2s al hacer hover;
  - H3 `heading-xs` con `margin-top: 8px`;
  - texto en `body-sm` con `text-content-muted` y `flex-1`;
  - pie con `border-t border-line-strong` y `pt-[18px]`: "Saber más" con el subrayado y `→`, que se mueve 6px al hacer hover.

### 5. Nuestra esencia

- Sección con fondo `bg-surface-raised` y padding `clamp(64px,9vw,128px) 0`.
- Grilla `repeat(auto-fit,minmax(min(100%,380px),1fr))` con gap `32px 80px`.
- Izquierda: eyebrow y H2 `heading-lg` con `pre-line`.
- Derecha:
  - padding superior de 44px (0 en móvil);
  - párrafos en `body-md`, line-height 1.65 y `text-content-muted`, con gap de 18px;
  - link con subrayado, con `mt-3.5`.

### 6. Resultados

- Sección con fondo `bg-blush` y padding `clamp(64px,9vw,120px) 0`.
- Grilla `auto-fit minmax(min(100%,420px),1fr)` con gap `48px 72px` y `items-center`.
- Texto:
  - eyebrow en `text-clay-800`;
  - H2 `heading-lg`;
  - 2 párrafos como en Esencia.
- Cifras:
  - arriba llevan `border-t border-clay-300`, `mt-5` y `pt-7`;
  - flex con gap de 56px y `flex-wrap`;
  - cada una tiene un valor (`clamp(36px,3.4vw,48px)`, peso 300, `text-sage-700` y `tabular-nums`) y una etiqueta (`caption-sm`, tracking `.16em`, uppercase y `text-content-muted`);
  - al entrar en pantalla cuentan de 0 al valor final en 1,8s con `ease-out-cubic`, una sola vez;
  - el HTML estático lleva el valor final, así que sin JS o con `revealAnimations: false` no cuentan.
- Slider antes/después (isla `BeforeAfterReact.tsx`, `client:visible`):
  - `aspect-[4/3]`, `cursor-ew-resize` y `touch-action: pan-y`;
  - la imagen "después" va abajo y la de "antes" encima, recortada con `clip-path: inset(0 {100-x}% 0 0)`;
  - la posición inicial es 50%;
  - línea de 1px `bg-surface-raised`;
  - mango circular (`rounded-full`) de 48px, `bg-surface-raised` y `shadow-lg`, con dos chevrons de 14px, que baja a `scale(.9)` al arrastrar;
  - etiquetas "ANTES" y "DESPUÉS" abajo a los lados, en 11px, tracking `.16em`, sobre `bg-surface-raised/85`;
  - el arrastre usa `setPointerCapture`;
  - para accesibilidad, el mango es `role="slider"` con `aria-valuenow` y se mueve con ← → de a 5%.

### 7. Skin Journal

- Sección con fondo `bg-surface-raised` y padding `clamp(64px,9vw,120px) 0`.
- Cabecera:
  - flex con `justify-between` e `items-end`;
  - eyebrow y H2 `heading-md`;
  - link con subrayado: "Skin journal" en `≥ md` y "Ver todo" en móvil (dos textos del CMS), que va a `home.journal.ctaUrl`.
- Grilla:
  - `≥ lg`: `minmax(0,1.55fr) minmax(0,1fr)` con gap de 12px;
  - `< lg`: una columna, con los posts laterales apilados debajo del grande.
- Post destacado:
  - `<a>` con `min-h-[560px]` (440px en móvil) y la portada de fondo;
  - la portada escala a 1,05 en 1,4s al hacer hover;
  - degradado `ink/0 35% → ink/72` (fondo oscuro fijo);
  - contenido abajo con padding `clamp(24px,3vw,44px)`: meta `{fecha} · {etiqueta}` en 11px uppercase, título con el valor arbitrario de arriba y el subrayado, y "Por {autor}".
- Posts laterales:
  - dos filas iguales, apiladas con gap de 12px;
  - cada una es una grilla `minmax(0,.9fr) minmax(0,1fr)` con `bg-blush`, imagen a la izquierda y texto a la derecha;
  - padding de 28px (16px en móvil) y alto mínimo de 180px en móvil;
  - meta en 10,5px y `text-clay-800`;
  - título en `clamp(18px,1.6vw,23px)` (17px en móvil);
  - autor en 10,5px y `text-content-muted`.
- Selección de posts:
  - el más reciente con `featured: true` es el grande; si no hay, el más reciente de todos;
  - los laterales son los 2 más recientes que no sean el grande.
- Degradación:
  - con 2 posts queda un solo lateral, que ocupa las dos filas;
  - con 1 post, el grande ocupa todo el ancho;
  - con 0 posts, la sección no se renderiza.
- Fecha en formato `27 sep 2026` (`es-PE`). La etiqueta es el primer `tags`. Sin `author`, la línea se omite.
- Los links van a `/blog/<slug>`.

### 8. Nuestra forma

- Sección con fondo `bg-surface-raised`, `border-t border-stone-150` y padding `clamp(64px,9vw,120px) 0`.
- H2 `heading-md` con margen inferior `clamp(36px,5vw,64px)`.
- Grilla de pilares:
  - 4 columnas en `≥ lg`, 2 en tablet y 1 en móvil;
  - gap `40px 32px` (28px en móvil).
- Cada pilar:
  - `border-t border-stone-800`, `pt-5` y gap de 12px;
  - número `01` en `caption-sm`, tracking `.14em`, `text-content-subtle` y `tabular-nums`;
  - H3 `heading-xs`;
  - texto en `body-sm` y `text-content-muted`.

### 9. CTA Reserva

- Sección con fondo `bg-sage-700` y `text-content-inverse` (fondo oscuro fijo), `relative` y `overflow-hidden`.
  - Padding `clamp(72px,10vw,140px) 0`.
- Letra decorativa `e`:
  - `aria-hidden`, `absolute`, en `right: -3%` y `bottom: -40%`;
  - `clamp(300px,36vw,560px)`, peso 300, itálica, `text-content-inverse/[.07]` y `pointer-events-none`.
- Grilla `auto-fit minmax(min(100%,420px),1fr)` con gap `36px 80px` e `items-center`.
- Izquierda:
  - eyebrow;
  - H2 `heading-xxl`, escrito en el CMS como texto con `pre-line`, donde lo que va entre `*asteriscos*` se muestra en `<em>` itálica peso 300.
- Derecha:
  - párrafo en `body-lg`, line-height 1.7 y `max-w-[500px]`;
  - `btn-fill-light` "Háblanos por WhatsApp".
- El botón usa la URL de la red `whatsapp` de `footer.social`, con `target="_blank"` y `rel="noopener noreferrer"`. Sin esa red, el botón no se renderiza.

### Animaciones de entrada (todo el sitio)

- Atributo `data-reveal="<retraso en ms>"` en los bloques.
- Un script en `BaseLayout` (sin React) hace esto:
  - añade la clase `reveal-ready` a `<html>`, y con ella los `[data-reveal]` arrancan en `opacity: 0; translateY(32px)`;
  - un `IntersectionObserver` (`threshold: .12`, `rootMargin: 0px 0px -6% 0px`) les pone `data-shown` y pasan a `opacity: 1; transform: none`;
  - la transición es `opacity 1.1s cubic-bezier(.22,.61,.36,1)` + `transform 1.3s ease-out-expo`, con el retraso en `transition-delay`;
  - a los 2,5s, una red de seguridad muestra todo lo que está por encima de 1,2× el alto de la ventana;
  - se reinicia en `astro:after-swap`.
- Sin JS, con `revealAnimations: false` o con `prefers-reduced-motion`, el script no corre, `<html>` no tiene `reveal-ready` y todo se ve.
- Los retrasos escalonados son 90ms por tarjeta de producto y 110ms por servicio y por pilar. En móvil los pilares no se escalonan.

### Smooth scroll

- El script de Lenis existente en `BaseLayout` solo arranca si `global.motion.smoothScroll` no es `false`.
- El valor llega al script por `data-smooth-scroll` en `<html>`.

## Alcance

**Entra:**

- Nuevo schema de la colección `home`: nueve grupos fijos, cada uno con `enabled`. Se borran `hero`, `features` y `cta` del starter.
- Contenido sembrado en `src/content/home/index.json` con los textos de la referencia.
- Nueve componentes de sección con el patrón doble (`.astro` + `React.tsx`) y una sola consulta compartida desde `index.astro`.
- Islas propias: `HeroCarouselReact`, `BeforeAfterReact` y `QuickAddReact`.
- Rediseño de `ProductCard.astro`, que se aplica también en `/productos` y en `/productos/categoria/<slug>`.
- Grupo `motion` en `global` (`smoothScroll`, `revealAnimations`) y su conexión en `BaseLayout`.
- Campo `author` en la colección `post`.
- Tres posts de ejemplo en MDX con las portadas de la referencia. Se borra `primer-post.mdx`.
- Imágenes extraídas del bundle en `public/uploads/home/`.
- Clases `btn-fill-dark`, `btn-fill-light` y `link-underline` en `global.css`.

**No entra (para specs futuras):**

- Páginas `/servicios`, `/servicios/<slug>` y `/nosotras`. Sus links apuntan a esas URLs y dan 404 hasta que existan.
- El layout de `/productos` (filtros, orden, banner). Solo cambia la tarjeta.
- Traducciones (`_en`) de los campos nuevos.
- Abrir el drawer del carrito al agregar desde una tarjeta.
- Opción de 1 columna de productos en móvil.
- Integración con Instagram o newsletter (son de otras páginas de la referencia).

## Modelo de datos

### Colección `home` (`tina/collections/home.ts`, reemplaza el schema actual)

```ts
type Link = { label: string; url: string };

interface Home {
  hero: {
    enabled: boolean;
    autoplay: boolean;
    slides: {
      image: string;
      imageAlt: string;
      focus: string;       // object-position en ≥ md, p. ej. "50% 50%"
      focusMobile: string; // object-position en < md, p. ej. "62% 50%"
      title: string;       // admite saltos de línea
      text: string;
      cta: Link;
    }[];
  };
  marquee: { enabled: boolean; items: { label: string }[] };
  products: { enabled: boolean; eyebrow: string; title: string; cta: Link };
  services: {
    enabled: boolean;
    eyebrow: string;
    title: string;         // admite saltos de línea
    description: string;
    ctaLabel: string;      // "Saber más"
    items: { image: string; title: string; text: string; url: string }[];
  };
  essence: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    paragraphs: { text: string }[];
    cta: Link;
  };
  results: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    paragraphs: { text: string }[];
    stats: { value: number; prefix: string; suffix: string; label: string }[];
    beforeImage: string;
    afterImage: string;
    beforeLabel: string;   // "Antes"
    afterLabel: string;    // "Después"
  };
  journal: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    ctaLabel: string;       // "Skin journal"
    ctaLabelMobile: string; // "Ver todo"
    ctaUrl: string;         // "/blog"
  };
  pillars: {
    enabled: boolean;
    title: string;
    items: { title: string; text: string }[]; // el número 01–04 sale del índice
  };
  booking: {
    enabled: boolean;
    eyebrow: string;
    title: string;          // "Tu primera\n*consulta*\nempieza aquí."
    text: string;
    ctaLabel: string;       // la URL sale de footer.social → whatsapp
  };
  seo: { title: string; description: string };
}
```

Valores sembrados de las URLs:

- Slides del hero: `/productos`, `/servicios` y `/nosotras`.
- Servicios: `/servicios/limpiezas-faciales`, `/servicios/tratamientos-faciales` y `/servicios/depilacion-laser`.
- Esencia: `/nosotras`.
- Productos: `/productos`.
- Journal: `/blog`.
- Estadísticas: `{ value: 2400, prefix: "+", suffix: "", label: "Clientas atendidas" }` y `{ value: 97, prefix: "", suffix: "%", label: "Satisfacción real" }`. El valor se formatea con separador de miles (`2,400`).

### Colección `global`

```ts
motion: {
  smoothScroll: boolean;      // por defecto true
  revealAnimations: boolean;  // por defecto true
}
```

### Colección `post`

```ts
author?: string; // "Adriana Paradisi"; se muestra como "Por {author}"
```

### Archivos

```
public/uploads/home/hero-1.jpg, hero-2.webp, hero-3.webp
public/uploads/home/svc-limpieza.webp, svc-tratamiento.webp, svc-depilacion.webp
public/uploads/home/resultados-antes.webp, resultados-despues.webp
public/uploads/blog/blog-cream.jpg, blog-oil.jpg, blog-roller.jpg
src/components/home/{Hero,Marquee,FeaturedProducts,Services,Essence,Results,Journal,Pillars,Booking}.astro + *React.tsx
src/components/home/HeroCarouselReact.tsx
src/components/home/BeforeAfterReact.tsx
src/components/shop/QuickAddReact.tsx
src/utils/reveal.ts
```

## Plan de implementación

1. **Assets.** Extraer las imágenes del bundle a `public/uploads/home/` y `public/uploads/blog/`. El sitio compila igual.
2. **Schema de `home`.** Reescribir `tina/collections/home.ts` y `src/content/home/index.json` con los textos de la referencia. Borrar `Hero`, `Features`, `CTA` y sus `React.tsx`. Dejar `index.astro` con un `<main>` vacío. `npm run build` pasa.
3. **`global.motion` y Lenis.** Agregar el grupo al schema y al JSON. `BaseLayout` escribe `data-smooth-scroll` y el script de Lenis lo respeta. Verificar que con `false` no hay smooth scroll.
4. **Animaciones de entrada.** Crear `src/utils/reveal.ts`, su CSS en `global.css` y el `data-reveal-animations` en `<html>`. Conectarlo en `BaseLayout`, con reinicio en `astro:after-swap`.
5. **Botones y link.** Agregar `btn-fill-dark`, `btn-fill-light` y `link-underline` a `global.css`.
6. **Hero.** Crear `Hero.astro`, `HeroReact.tsx` y `HeroCarouselReact.tsx` (`client:load`), con autoplay, swipe, teclado y `aria`. Verificar a 360, 768 y 1440px.
7. **Marquee.** Solo Astro, sin isla.
8. **`ProductCard` y `QuickAddReact`.** Rediseñar la tarjeta y crear la isla. Verificar en `/productos` y en una categoría.
9. **Productos del home.** Crear `FeaturedProducts.astro` con `getFeaturedProducts(4)` y `StockRefresher`, y que se oculte sin datos.
10. **Servicios.** Grilla en desktop y carrusel con snap en móvil.
11. **Esencia y Pilares.** Solo Astro, con su isla React vacía para `useTina()` (`client:tina`).
12. **Resultados.** Crear `Results.astro`, el contador (dentro de `reveal.ts` y con `data-count`) y `BeforeAfterReact.tsx` (`client:visible`).
13. **`post.author` y Journal.** Agregar el campo. Crear los tres MDX de ejemplo y borrar `primer-post.mdx`. Crear `Journal.astro` con la selección y la degradación de 0 a 3 posts.
14. **Booking.** Crear el CTA, con el `*énfasis*` y la URL de WhatsApp desde `footer.social`.
15. **Ensamblar.** `index.astro` hace una consulta de `home` y otra de `global` y se las pasa a las nueve secciones en orden. Se respeta cada `enabled`.
16. **Contraste.** Medir el texto sobre `sage-100`, `blush` y `sage-700` y ajustar si algo queda por debajo de 4.5:1.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores y sin `hero`, `features` ni `cta` del starter en el schema.
- [ ] El home muestra las nueve secciones en el orden de la referencia a 360, 768, 1024, 1440 y 1920px, sin scroll horizontal en ningún ancho.
- [ ] El hero mide 600px en móvil y `min(78vh,720px)` en `≥ md`, con el texto abajo en móvil y centrado en desktop.
- [ ] El hero avanza solo cada 6,5s con `autoplay: true` y no avanza con `false`.
- [ ] Un swipe de más de 50px cambia de slide, y ← → también lo hacen con el foco dentro del hero.
- [ ] Solo el título del primer slide es `<h1>` y la página tiene un único `<h1>`.
- [ ] El marquee se desplaza sin saltos y queda quieto con `prefers-reduced-motion`.
- [ ] La sección de productos muestra hasta 4 destacados de Woo, en 4 columnas en `≥ md` y 2 en móvil, y no aparece si no hay destacados.
- [ ] En desktop, el hover de una tarjeta con segunda imagen muestra esa imagen y sube la barra "Agregar al carrito".
- [ ] En `< lg`, la tarjeta muestra el botón de 40×40.
- [ ] Agregar desde una tarjeta suma el producto al carrito de Woo y el badge del header se actualiza sin recargar.
- [ ] Los productos variables o agotados no muestran botón de agregar. Los agotados muestran el badge "Agotado".
- [ ] `/productos` y `/productos/categoria/<slug>` usan la tarjeta nueva y `StockRefresher` sigue actualizando precio y stock.
- [ ] Servicios muestra 3 columnas en `≥ md`. En móvil es un carrusel con snap y se asoma la tarjeta siguiente.
- [ ] Las cifras de Resultados cuentan una sola vez al entrar en pantalla y terminan en `+2,400` y `97%`.
- [ ] El slider antes/después se arrastra con mouse y con dedo, y con el foco se mueve con ← →.
- [ ] Skin Journal muestra el post destacado grande y los 2 más recientes al lado.
- [ ] Con 2, 1 y 0 posts, el Journal se adapta sin huecos o se oculta.
- [ ] Los pilares ocupan 4 columnas en `≥ lg`, 2 en tablet y 1 en móvil.
- [ ] "Háblanos por WhatsApp" abre la URL de `footer.social` → `whatsapp`, y sin esa red no se renderiza.
- [ ] Con `global.motion.smoothScroll: false` no se instancia Lenis.
- [ ] Con `global.motion.revealAnimations: false`, con `prefers-reduced-motion` o sin JS, todo el contenido es visible desde la carga.
- [ ] Con `enabled: false` en cualquier sección, esa sección no está en el HTML.
- [ ] Desde `/admin` se editan todos los textos, imágenes, links y estadísticas del home, y el cambio se ve en la vista previa.
- [ ] Ningún componente nuevo escribe un color en hex ni usa `text-white/*` o `bg-white/*`, salvo en los scrims y fondos oscuros fijos permitidos.
- [ ] Todo el texto de cuerpo alcanza 4.5:1 sobre su fondo (`sage-100`, `blush`, `sage-700`, `surface-raised`).
- [ ] La consola del navegador no muestra errores en el home.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario, las secciones posteriores a la cabecera no se revisaron una por una. Se asumieron a partir de sus respuestas y de la referencia.
- **Sí: productos = destacados de Woo (`getFeaturedProducts(4)`).** Elección del usuario. El cliente cura la selección marcando "Destacado" en Woo.
- **No: IDs de productos en el CMS.** Se descartó para no mantener la selección en dos lugares.
- **Sí: rediseñar la `ProductCard` compartida.** Hay una sola tarjeta en todo el sitio y `/productos` hereda el diseño.
- **Sí: meta de la tarjeta = primera categoría.** El proxy de Woo no expone marca. Si más adelante se agrega un atributo "Marca", se usa ese.
- **Sí: botón de agregar solo en productos `simple`.** Un producto variable necesita elegir variante, y eso pasa en la ficha.
- **No: abrir el drawer del carrito al agregar.** Basta con la confirmación en el botón y el rebote del badge. Si se quiere, va en otra spec.
- **Sí: URLs finales (`/servicios`, `/nosotras`, `/servicios/<slug>`), editables en el CMS.** Elección del usuario, aunque den 404 por ahora. Es el mismo criterio que en SPEC 04.
- **Sí: el CTA del Journal va a `/blog`.** Esa ruta existe hoy. El renombre a `/skin-journal` sigue fuera de alcance, como en SPEC 04.
- **Sí: `sage-700` en lugar de `sage-500` en el CTA Reserva.** Elección del usuario. El texto blanco sobre `#718471` no llega a 4.5:1.
- **Sí: campo `author` en `post`.** Elección del usuario. Sin autor, la línea se omite.
- **Sí: el Journal toma el destacado más reciente como post grande y los 2 más recientes al lado,** y se adapta con 1 o 2 posts. Con 0 se oculta.
- **Sí: Lenis, que se puede apagar desde `global.motion.smoothScroll`.** Pedido del usuario. Lenis ya estaba instalado, así que solo se agrega el interruptor.
- **Sí: animaciones de entrada con un script vanilla en `BaseLayout`.** No requieren hidratar React y valen para cualquier página.
- **Sí: el estado oculto depende de `html.reveal-ready`.** Sin JS nada queda invisible.
- **Sí: secciones fijas con `enabled`, no bloques de Tina.** Elección del usuario. El orden del diseño es intencional.
- **Sí: 2 columnas de productos en móvil, sin opción en el CMS.** Elección del usuario.
- **No: traducciones.** Elección del usuario.
- **Sí: imágenes del hero como `<img>` con `object-position` por breakpoint, no como `background-image`.** Permite `alt`, `fetchpriority` y carga diferida.
- **Sí: solo el primer slide lleva `<h1>`.** Así hay un único `h1` por página.
- **Sí: el énfasis del título de Reserva con `*asteriscos*` en un string.** Es más simple de editar que un rich-text para una sola palabra.
- **Sí: tokens de SPEC 01 en lugar de los hex del bundle.** Los tamaños sin token (título destacado del Journal y cifras) quedan como valores arbitrarios.
- **Sí: `heading-xs` para los H3 de los pilares.** El diseño usa 20–24px y el token 22–26px. Se prefiere no crear un token para un solo uso.
- **No: el marquee como isla React.** Es CSS puro.
- **Sí: el Journal pasa a dos columnas recién en `lg`, no en `md`.** Cambio hecho durante la implementación. Entre 768 y 1023px, la columna de texto de los posts laterales quedaba en unos 85px y el título se partía palabra por palabra. El diseño original tiene el mismo problema a ese ancho.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Woo no tiene productos marcados como destacados y la sección desaparece. | Documentarlo en `wordpress/README.md`: marcar 4 productos con la estrella de "Destacado". |
| El hero, con `min(78vh,720px)`, queda muy bajo en laptops con poca altura (≈ 560px). | Verificar a 1366×650. Si el texto no entra, poner `min-h-[520px]`. |
| `clip-path` y el arrastre del slider chocan con Lenis o con el scroll táctil. | `touch-action: pan-y` en el slider y `data-lenis-prevent` en el contenedor si hace falta. |
| Las animaciones de entrada ocultan contenido que el `IntersectionObserver` nunca marca (p. ej. dentro del carrusel horizontal). | Red de seguridad a 2,5s y `root: null`. Además, las tarjetas del carrusel móvil de servicios no llevan `data-reveal`. |
| Cambiar la `ProductCard` rompe `StockRefresher` en `/productos`. | Conservar los atributos `data-woo-*` y verificar el refresco en el paso 8. |
| Las imágenes del bundle son de baja resolución para 1920px. | Son provisionales y se reemplazan desde Tina. Verificar su nitidez a 1920px antes de publicar. |
| Borrar `hero`, `features` y `cta` rompe otra consulta. | `npm run build` en el paso 2. Los tipos generados por Tina fallan si queda alguna referencia. |

## Qué **no** entra en esta spec

- Páginas `/servicios`, `/servicios/<slug>` y `/nosotras`.
- El layout de `/productos` (filtros, orden, banner).
- Renombrar `/blog` a `/skin-journal`.
- Traducciones de los campos nuevos.
- Abrir el carrito al agregar desde una tarjeta.
- Opción de 1 columna de productos en móvil.
- Instagram, newsletter y otras secciones de otras páginas de la referencia.

Cada una de esas piezas, si llega, va en su propia spec.

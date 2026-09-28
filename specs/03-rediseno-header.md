# SPEC 03 — Rediseño del header

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-09-27
> **Objetivo:** Reemplazar el header actual por el de la referencia de diseño (barra de anuncio, header sticky con mega-menú, drawer móvil y overlays de búsqueda y carrito), editable desde el CMS y correcto de 360px a 1920px.

## Por qué existe esta spec

El header actual viene del starter:

- es `fixed` y transparente sobre el hero, con una prop `theme` que cambia su fondo;
- tiene una lista plana de links y un botón CTA;
- la búsqueda es un modal centrado que solo encuentra posts;
- el carrito es un drawer genérico con iconos de Font Awesome.

La referencia de diseño (`Eres Skin Studio (2).html`, un bundle exportado) define otra cosa:

- una barra de anuncio rotativa;
- un header blanco sticky que se encoge y se oculta con el scroll;
- mega-menús para Productos y Servicios;
- un drawer móvil con submenús;
- un panel de búsqueda con productos;
- un drawer de carrito propio.

Esta spec traslada esa referencia al sistema de tokens de SPEC 01 y la conecta al CMS y a Woo (SPEC 02).

## Referencia de diseño (valores extraídos del bundle)

Todos los valores de color se escriben con los tokens semánticos de SPEC 01, nunca en hex.

**Barra de anuncio**

- Fondo `bg-ink` y texto `text-content-inverse`.
- Alto 36px, `caption-md` (13px), `uppercase`, tracking `.22em`, peso 500.
- Rota entre sus mensajes cada 4,5s: el saliente sube a `-100%` y el entrante entra desde `100%`, con opacidad, en 800ms `ease-out-expo`.
- No es sticky: se va con el scroll.

**Header en desktop (≥ `lg`, 1024px)**

- `position: sticky; top: 0; z-50`, fondo `bg-surface-raised`.
- Grilla `1fr auto 1fr`, con `max-w-container` y `px-gutter`.
- Alto 88px en reposo y 72px con `scrollY > 40`, animado en 450ms `ease-out-expo`.
- Oculto (`translateY(-100%)`) al bajar con `scrollY ≥ 120`, y visible al subir.
- Ignora movimientos de menos de 6px.
- Nunca se oculta si hay un mega-menú o un overlay abierto.
- Sombra: `0 1px 0` en color `line` en reposo; con scroll o con el mega-menú abierto se suma `shadow-md`.
- Logo a 40px de alto, alineado a la izquierda.
- Nav centrada:
  - gap 36px, `body-md` (16px), peso 500, tracking `.01em`;
  - subrayado de 1px que crece de derecha a izquierda en 500ms;
  - los items con submenú llevan un chevron de 12px que rota 180° al abrirse.
- A la derecha, botones de 44×44 para buscar y carrito, con iconos de 20px y `hover:opacity-60`.

**Badge del carrito**

- Cuadrado: sin `rounded-full`, con las esquinas rectas del sistema.
- Mínimo 16×16px, fondo `bg-accent`, texto `text-content-inverse`, 10px en peso 600.
- Posición `top-1.5 right-1`.
- Al cambiar el conteo hace un rebote a `scale(1.35)` con `ease-spring`.

**Mega-menú**

- Panel `absolute top-full` a todo el ancho, `bg-surface-raised`, `border-t border-line` y sombra inferior.
- Al entrar: opacidad 0→1 y `translateY(-10px)`→0, en 450–600ms.
- Grilla `1.1fr 1fr 1fr 1.15fr`, con padding `48px gutter 56px`.
- Columna 1, links destacados: `heading-xs` (24px), peso 400, gap 18px.
- Columnas 2 y 3, grupos de links:
  - separador `border-l border-line` y padding horizontal de 40px;
  - título como eyebrow de 12px, tracking `.16em`, `text-content-subtle`;
  - links en `body-md`.
- Columna 4, tarjeta: imagen 4:3, eyebrow de 11px, título de 18px y CTA de 12px en uppercase con `→`.
- Se abre con hover. Se cierra al salir del `<header>` o al pasar el mouse por el logo o por los iconos.

**Header en móvil y tablet (< `lg`)**

- Alto 64px, grilla `1fr auto 1fr`, padding lateral de 8px.
- Botón de menú a la izquierda, logo de 34px al centro, buscar y carrito a la derecha.
- No cambia de alto con el scroll, pero sí se oculta.

**Drawer móvil**

- Sale desde la izquierda con ancho `min(88vw, 420px)` y fondo `bg-surface`, en 700ms `ease-out-expo`.
- Cabecera de 64px con el logo de 30px y el botón de cerrar.
- Cuerpo en un "track" de dos paneles que se desliza a `-50%` al entrar a un submenú.
- Panel raíz:
  - items de 60px de alto mínimo, 22px, con `border-b border-line`;
  - entran con un stagger de 150ms + 55ms por item;
  - los que tienen submenú llevan un chevron a la derecha;
  - abajo, el CTA negro `btn-primary` a todo el ancho, la dirección, el teléfono y los links a redes (11px, uppercase).
- Panel de submenú: "Volver", título de 30px, links destacados de 19px y grupos con título-eyebrow.

**Overlay común**

- `bg-ink/35` a pantalla completa, que se desvanece en 500ms.
- Hacer click en el overlay cierra lo que esté abierto.

**Búsqueda**

- Panel `fixed top-0` a todo el ancho, `z-[70]`, `bg-surface-raised`.
- Entra desde `-105%` en 700ms.
- Input sin borde: `clamp(18px, 2.2vw, 28px)`, con línea inferior `border-content`.
- Chips "Populares" (36px de alto, borde `line-strong`).
- Etiqueta de resultados.
- Resultados en grilla: 4 columnas en `md+` y 1 en móvil. Cada uno lleva una miniatura de 64×64, la meta en 10.5px uppercase, el nombre en 14px/500 y el precio en 13px/600.

**Carrito**

- Drawer desde la derecha con ancho `min(92vw, 440px)` y fondo `bg-surface-raised`.
- Cabecera de 72px: "Tu carrito (n)".
- Estado vacío: "Tu carrito está vacío." (22px) y un botón con borde "Seguir comprando".
- Líneas con miniatura de 84px, nombre y un stepper de 36px con borde `line-strong` (`−` / cantidad / `+`), más el total de la línea.
- Pie con subtotal, la nota "Envío calculado al finalizar la compra." y el botón negro "Finalizar compra →".

## Alcance

**Entra:**

- Barra de anuncio rotativa, editable desde el CMS y apagable.
- Header sticky nuevo (desktop y móvil) con el comportamiento de scroll descrito arriba.
- Mega-menú en desktop para cualquier item de `nav.links` que tenga submenú.
- Drawer móvil con submenús, CTA, datos de contacto y redes.
- Rediseño de `SearchOverlay.tsx`: el panel superior, los chips populares y los resultados con miniatura.
- Productos de Woo en `/search-index.json`, junto a los posts.
- Rediseño visual de `CartReact.tsx`. La funcionalidad actual con la Store API no cambia.
- Estado activo del item de nav según la URL actual.
- Logo SVG en `public/uploads/eres-studio-logo-dark.svg`.
- Iconos de `react-icons/pi` (Phosphor, peso Light) en el header, el drawer, la búsqueda y el carrito.
- Eliminar la prop `theme` / `headerTheme` y el `pt-[72px]` del hero.
- Contenido inicial de `src/content/global/index.json` con la estructura de la referencia.
- Actualizar la línea de iconos del `CLAUDE.md`.

**Fuera de alcance (para specs futuras):**

- Páginas nuevas (`/servicios`, `/nosotras`, marcas, "Más vendidos", "Novedades", "Ofertas", "Kits").
- Filtros de catálogo por marca: Woo no expone marcas hoy.
- Sticky "Agregar al carrito" de la ficha de producto y cualquier otra pieza de la referencia fuera del header.
- Rediseño del footer.
- Búsqueda del lado del servidor o fuzzy: se mantiene el filtro por substring en el navegador.
- Mega-menú abierto por click en desktop táctil (tablets ≥1024px con touch). El primer tap navega.
- Traducciones de los campos nuevos (`_en`, etc.): se agregan cuando haya i18n activo.

## Modelo de datos

### Schema de `global` (`tina/collections/global.ts`)

Campos nuevos en `nav.links[]` y en `nav`, y dos objetos nuevos en la raíz:

```ts
announcement: {
  enabled: boolean;
  items: { label: string; url?: string }[];
}

nav: {
  logo: string;
  logoAlt: string;
  links: {
    label: string;
    url: string;
    external?: boolean;
    menu?: {
      featured: { label: string; url: string }[];
      columns: {
        title: string;
        links: { label: string; url: string }[];
      }[];
      card?: {
        image?: string;
        eyebrow?: string;
        title?: string;
        ctaLabel?: string;
        url?: string;
      };
    };
  }[];
  cta: { label: string; url: string };
  contact: {
    address?: string;
    phone?: string;
    phoneUrl?: string;
  };
}

search: {
  placeholder: string;
  popular: { label: string }[];
}
```

Reglas:

- Un item tiene submenú si `menu.featured` o `menu.columns` tienen al menos un elemento. No hay un booleano aparte.
- `nav.cta` se conserva y solo se muestra en el drawer móvil.
- Las redes del drawer reutilizan `footer.social`. No se duplica esa lista. La etiqueta visible es el nombre de la red con la inicial en mayúscula.
- `phoneUrl` es opcional. Si falta, el link del teléfono se arma como `tel:` más el teléfono sin espacios.

### Contenido inicial (`src/content/global/index.json`)

Los links sin página propia apuntan al destino real más cercano, así que ninguno da 404.

| Item | URL | Submenú |
|---|---|---|
| Productos | `/productos` | Destacados: Más vendidos, Novedades, Ofertas, Kits de rutina → `/productos`. Columna "Categorías": las 7 de Woo → `/productos/categoria/<slug>`, más "Ver todo" → `/productos`. Tarjeta "Nuevo en tienda". |
| Servicios | `/contacto` | Destacados: Limpiezas faciales, Tratamientos faciales, Depilación láser → `/contacto`. Columna "Tu primera visita": Reserva tu consulta → `/contacto`. Columna "El estudio": Contacto → `/contacto`. Tarjeta "Primera consulta". |
| Skin Journal | `/blog` | — |
| Nosotras | `/contacto` | — |
| Contacto | `/contacto` | — |

- **Anuncio:** "Eres única, tu piel también" y "Reserva tu primera consulta →" → `/contacto`.
- **CTA:** "Reserva tu consulta" → `/contacto`.
- **Contacto:** "Calle Libertad 176, oficina 413 – Miraflores, Lima" y "+51 908 686 767".
- **Búsqueda:** placeholder "Buscar productos o tratamientos", populares "Limpieza", "Sérum", "Hidratante" y "Protector solar".

La columna "Marcas" de la referencia no se siembra (ver Decisiones).

### Entrada del índice de búsqueda (`src/pages/search-index.json.ts`)

```ts
interface SearchEntry {
  type: "blog" | "product";
  locale: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  meta?: string;
  price?: string;
}
```

- **Productos:** salen de `getAllProducts()` de `src/lib/woo/rest.ts`.
  - `meta` es el nombre de la primera categoría.
  - `image` es `images[0].src`.
  - `price` va formateado con `formatPrice`.
  - `url` es `/productos/<slug>`.
- **Posts:** `meta` es "Skin Journal".
- **Sin configuración de Woo:** si `wooConfigured` es `false`, el índice sale solo con los posts y el build no falla.
- **Con la búsqueda vacía:** los "Productos sugeridos" son las primeras 4 entradas `type: "product"`.

### Estado de UI (`HeaderReact.tsx`)

```ts
type OpenPanel = null | "drawer" | "search" | "cart";

const state = {
  megaMenuIndex: null as number | null,
  lastMegaMenuIndex: 0,
  openPanel: null as OpenPanel,
  drawerSubmenuIndex: null as number | null,
  hidden: false,
  scrolled: false,
};
```

Solo puede haber un panel abierto a la vez. Hoy la búsqueda y el carrito controlan su propio `open`. Eso pasa a controlarse desde el header con props `open` / `onClose`.

## Plan de implementación

1. **Iconos y logo.**
   - Commitear `eres-studio-logo-dark.svg` (logo oscuro, para el header) y `eres-studio-logo.svg` (versión clara, para fondos oscuros) en `public/uploads/`.
   - Cambiar la línea de iconos del `CLAUDE.md` a `react-icons/pi` (Phosphor Light).
   - Verificación: el archivo carga en `/uploads/eres-studio-logo-dark.svg`.
2. **Schema.**
   - Agregar al `global.ts` `announcement`, `nav.links[].menu`, `nav.contact` y `search`, con `itemProps` legibles en las listas.
   - Correr `npm run dev` y confirmar que `/admin` muestra los campos nuevos.
   - El header viejo sigue funcionando porque ignora los campos nuevos.
3. **Contenido inicial.** Sembrar `src/content/global/index.json` según la tabla de arriba, con `nav.logo` en `/uploads/eres-studio-logo-dark.svg`. El build pasa.
4. **Scroll lock compartido.**
   - En `BaseLayout.astro`, exponer la instancia de Lenis como `window.lenis`.
   - Crear `src/utils/scrollLock.ts` con `lockScroll()` / `unlockScroll()`: pone `overflow: hidden` en `html` y `body` y llama a `lenis.stop()` / `lenis.start()`.
   - Cambiar `CartReact` para que use esas funciones en lugar de `document.body.style.overflow`.
5. **Header base.**
   - Reescribir `HeaderReact.tsx` con la barra de anuncio (`AnnouncementBar.tsx`), el header sticky desktop/móvil, el logo, la nav con subrayado y estado activo, y los botones de buscar y carrito (por ahora, los componentes actuales).
   - `Header.astro` pasa `currentPath={Astro.url.pathname}`.
   - Eliminar `theme` / `headerTheme` de `Header.astro` y `BaseLayout.astro`, y el `pt-[72px]` de `HeroReact.tsx`.
   - Verificación: la home se ve sin huecos ni solapes en 360, 768, 1024 y 1440px.
6. **Comportamiento de scroll.**
   - Crear el hook `useHeaderScroll()` en `src/hooks/useHeaderScroll.ts`, que devuelve `{ hidden, scrolled }` con los umbrales 40 / 120 / 6px.
   - Conectarlo a la altura y al `translateY`.
7. **Mega-menú.** Crear `MegaMenu.tsx`, renderizado dentro del `<header>`, con apertura por hover, cierre por salida, chevron rotando y transición de entrada. Con teclado:
   - `Enter` o `Espacio` en el item abre o cierra el panel;
   - `Esc` lo cierra y devuelve el foco al item;
   - `aria-expanded` y `aria-controls` en el item.
8. **Overlay y drawer móvil.**
   - Crear `HeaderOverlay.tsx` y `MobileDrawer.tsx` como hermanos del `<header>`, no como hijos (ver Riesgos).
   - El drawer lleva el track de dos paneles, el stagger, "Volver", el CTA, el contacto y las redes.
   - Cerrar el drawer al navegar, al pulsar `Esc`, al tocar el overlay o al pasar a `lg+` con la ventana redimensionada.
   - Mientras está abierto, el foco queda atrapado dentro.
9. **Índice de búsqueda con productos.**
   - Extender `search-index.json.ts` con las entradas de producto.
   - Verificación: `/search-index.json` en `npm run build` incluye productos con `image`, `meta` y `price`. Sin claves de Woo, incluye solo los posts.
10. **Búsqueda rediseñada.**
    - Reescribir `SearchOverlay.tsx` como panel controlado (`open`, `onClose`, `config`) con chips, sugeridos y resultados con miniatura.
    - El input recibe el foco a los 300ms de abrir el panel.
    - `Cmd/Ctrl+K` sigue abriendo la búsqueda, ahora a través del header.
    - Los resultados que no tienen imagen muestran un cuadro `bg-stone-100`.
11. **Carrito rediseñado.**
    - Reescribir la presentación de `CartReact.tsx` como drawer controlado.
    - Mantener `getCart`, `updateCartItem`, `removeCartItem`, `checkoutUrl` y `CART_UPDATED`.
    - Separar el botón con badge (`CartButton`) del drawer (`CartDrawer`). El rebote del badge se dispara cuando sube `items_count`.
    - Sin `checkoutUrl()` no se muestra el botón "Finalizar compra", como hoy.
12. **Pulido.**
    - Con `prefers-reduced-motion` se desactivan las transiciones de transform: el header no se oculta y el anuncio no rota.
    - Revisar los contrastes de los tonos nuevos contra SPEC 01.
    - Borrar el código muerto del header viejo.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores con y sin variables `WOO_*`.
- [ ] No queda ningún `theme` / `headerTheme` en `src/`, ni un `pt-[72px]` en `HeroReact.tsx`.
- [ ] En ninguna de las piezas nuevas hay colores hex, `text-white/*`, `bg-white/*` ni `rounded-*`, salvo `rounded-none` y `rounded-full`.
- [ ] Todos los iconos del header, el drawer, la búsqueda y el carrito vienen de `react-icons/pi`.
- [ ] El logo se ve en `/uploads/eres-studio-logo-dark.svg` a 40px en desktop, 34px en el header móvil y 30px en el drawer.
- [ ] La barra de anuncio alterna sus mensajes cada 4,5s. Con `announcement.enabled: false` no se renderiza.
- [ ] Con `scrollY > 40` el header de desktop mide 72px, y 88px arriba del todo.
- [ ] Al bajar más de 120px el header se oculta, y reaparece al subir.
- [ ] El header no se oculta con un mega-menú, el drawer, la búsqueda o el carrito abiertos.
- [ ] En 1024px o más, pasar el mouse por "Productos" abre su mega-menú. Salir del header lo cierra.
- [ ] `Enter` sobre "Productos" abre el mega-menú, y `Esc` lo cierra y devuelve el foco al item.
- [ ] El item cuya URL coincide con el inicio de la ruta actual se muestra en `text-sage-700` y con subrayado. Por ejemplo, "Productos" queda activo en `/productos/categoria/serum`.
- [ ] En menos de 1024px se ve el botón de menú, el logo centrado, buscar y carrito, y no aparece la nav de escritorio.
- [ ] El drawer abre desde la izquierda. Tocar "Productos" desliza al submenú, y "Volver" regresa al panel raíz.
- [ ] El drawer, la búsqueda y el carrito se cierran con `Esc`, con el botón de cerrar y al tocar el overlay.
- [ ] Con cualquier panel abierto, la página de fondo no hace scroll, ni con rueda (Lenis) ni con touch.
- [ ] Abrir un panel cierra el que estuviera abierto.
- [ ] `/search-index.json` contiene entradas `type: "product"` con `url` que empieza por `/productos/`.
- [ ] Buscar "sérum" en el panel muestra productos con miniatura, categoría y precio.
- [ ] Con la búsqueda vacía se ven 4 productos sugeridos. Tocar un chip rellena el input.
- [ ] Agregar un producto desde la ficha actualiza el badge del carrito y lo hace rebotar.
- [ ] En el carrito, `+` y `−` cambian la cantidad contra la Store API, y bajar a 0 elimina la línea.
- [ ] "Finalizar compra" va a `PUBLIC_WOO_CHECKOUT_URL?cart-token=…`.
- [ ] A 360px de ancho no hay scroll horizontal en ninguna página, ni con la búsqueda o el carrito abiertos.
- [ ] Todos los botones de icono miden al menos 44×44px y tienen `aria-label`.
- [ ] El panel `/admin` permite editar el anuncio, los submenús, el contacto y los chips de búsqueda, y el cambio se ve en la vista previa.

## Decisiones

- **Sí: una sola spec.** El usuario la prefirió frente a separar los overlays en una SPEC 04. Para compensar, el plan está en 12 pasos que se pueden commitear por separado.
- **Sí: definición rápida.** Por pedido del usuario, las secciones posteriores a la cabecera no se revisaron una por una. Se asumieron a partir de sus respuestas y de la referencia.
- **Sí: header sticky, siempre blanco, que se oculta con el scroll.** Es fiel a la referencia y elimina la lógica de `theme`.
- **No: header transparente sobre el hero.** Se aleja de la referencia y obliga a mantener dos variantes.
- **Sí: `react-icons/pi` en peso Light.** Su trazo fino es casi igual al de los SVG de la referencia (1.5px).
- **No: `fa6` para estas piezas.** Sus iconos rellenos y gruesos no encajan.
- **No: SVG inline propios.** Van contra la regla de usar `react-icons`.
- **Sí: logo SVG** en `public/uploads/eres-studio-logo-dark.svg`. Es un export de Figma con un PNG de 1080px dentro: se ve nítido a 40px en retina y se puede editar desde Tina.
- **No: el PNG de 103×52 del bundle.** Se ve borroso en 2x.
- **Sí: submenús dentro de `nav.links[].menu`.** Todo el menú se edita en un solo lugar.
- **No: una colección `menus` aparte.** Sería más indirecto, sin ninguna ventaja con dos submenús.
- **Sí: el submenú se infiere del contenido.** No hay un booleano `hasMenu`, así que no puede quedar incoherente.
- **Sí: redes reutilizadas de `footer.social`.** Así no hay dos listas que mantener.
- **Sí: el CTA solo en el drawer.** En desktop, la reserva se promueve desde la barra de anuncio, como en la referencia.
- **Sí: links sembrados solo con destinos reales.** Nada da 404. El editor cambia las URLs cuando existan `/servicios` y `/nosotras`.
- **No: la columna "Marcas".** Woo no expone marcas y cada link tendría que apuntar a `/productos`. Se agrega cuando exista el filtro.
- **Sí: productos en el índice estático, generado en build.** Reutiliza `rest.ts` sin exponer las claves y el precio puede quedar desfasado hasta el siguiente rebuild. Se acepta porque el rebuild ya se dispara con los webhooks de SPEC 02.
- **No: consultar la Store API en vivo desde la búsqueda.** Suma latencia y carga al proxy a cambio de poco.
- **Sí: paneles controlados desde el header.** Garantiza que solo haya uno abierto y que el overlay sea uno solo.
- **Sí: el anuncio rota en todos los anchos.** La referencia deja un mensaje fijo en desktop, pero con una lista editable la regla uniforme es más simple.
- **No: mega-menú por click en tablets táctiles de 1024px o más.** Queda fuera de alcance: el primer tap navega.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `position: sticky` deja de funcionar si la isla envuelve la barra y el `<header>` en un `<div>`: el contenedor solo mide lo que su contenido. | `HeaderReact` devuelve un fragmento. `astro-island` tiene `display: contents`, así que el contenedor efectivo pasa a ser `body`. Se verifica en el paso 5. |
| El `transform` del header convierte a sus hijos `fixed` en relativos al header, y el drawer, la búsqueda y el overlay quedarían recortados. | Esos paneles se renderizan como hermanos del `<header>`. Dentro solo va el mega-menú, que es `absolute`. |
| Lenis sigue desplazando la página con un panel abierto, porque bloquear `overflow` no lo detiene. | `window.lenis` expuesto y `scrollLock.ts` llama a `stop()` / `start()`. Las zonas con scroll interno llevan `data-lenis-prevent`. |
| Un catálogo grande infla `search-index.json`. | Con unos 30 productos hoy son unos KB. Si pasa de unos cientos, se recortan `description` y los campos que no se usan. |
| `getAllProducts()` falla en build y rompe el índice. | Un `try/catch` como el de los posts: el índice sale sin productos y el build sigue. |
| El header oculto tapa anclas (`/#cta`) al volver a aparecer al subir. | `scroll-margin-top` de 72px en `[id]` dentro de `global.css`. |
| El SVG del logo no llega antes de implementar. | El paso 1 lo bloquea. Mientras tanto, el header muestra el texto "ERES Skin Studio" como hoy. |

## Qué **no** entra en esta spec

- Páginas nuevas (`/servicios`, `/nosotras`, marcas, colecciones "Más vendidos" / "Novedades" / "Ofertas" / "Kits").
- Filtro o links por marca.
- Rediseño del footer y de las secciones de la home.
- Sticky de "Agregar al carrito" en la ficha de producto.
- Búsqueda en vivo contra Woo o búsqueda fuzzy.
- Mega-menú por click en tablets táctiles grandes.
- Traducciones de los campos nuevos.

Cada una de esas piezas, si llega, va en su propia spec.

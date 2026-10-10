# SPEC 09 — Catálogo de productos con filtros

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03, SPEC 05
> **Fecha:** 2026-09-28
> **Objetivo:** Rehacer `/productos` y `/productos/categoria/<slug>` según la referencia de diseño, con filtros, orden y paginación que funcionan en el navegador y viven en la URL, para que el mega-menú pueda enlazar a cualquier vista filtrada.

## Por qué existe esta spec

Hoy `/productos` muestra un `ShopHero`, una fila de pills de categoría que llevan a otra página y una grilla con todo el catálogo. No se puede ordenar, filtrar por marca o tipo de piel, ni paginar. `/productos/categoria/<slug>` es otra plantilla, más pobre.

La referencia (`Eres Skin Studio (2).html`, pantalla `productos`) define:

- un banner con miga de pan;
- un sidebar de filtros (Disponibilidad, Precio, Categoría, Marca y Tipo de piel), que en móvil es un drawer;
- orden, chips de filtros activos, paginación y estado vacío;
- una sección "Beneficios".

Tres cambios en Woo y en el header hacen que esta spec sea posible y necesaria:

- **Marcas.** Woo ya expone marcas (`brands`, Woo Brands), así que la columna "Marcas" que SPEC 03 descartó ahora tiene destino.
- **Tipo de piel.** Vive en los tags de producto (`piel-seca`, `todo-tipo-de-piel`…).
- **Mega-menú.** Los destacados (Más vendidos, Novedades, Ofertas, Kits de rutina) apuntan todos a `/productos`. Necesitan URLs que abran el catálogo ya ordenado o filtrado.

## Referencia de diseño (valores extraídos del bundle)

Se aplican los breakpoints de SPEC 05:

- **móvil:** `< md`;
- **tablet:** `md` a `lg`;
- **desktop:** `≥ lg`.

El layout con sidebar arranca en `lg`. Por debajo se usan la barra "Filtrar" y el drawer.

| Hex del bundle | Token |
|---|---|
| `#FAFAF5` | `bg-surface` |
| `#FFFFFF` | `bg-surface-raised` |
| `#EEEAE3` | `bg-surface-sunken` / `border-stone-150` |
| `#E4E0D8` / `#D9D6CF` | `border-line` / `border-line-strong` |
| `#B8B5AE` (checkbox sin marcar) | `border-stone-400` |
| `#F0F0EC` (fondo de imagen) | `bg-stone-100` |
| `#DCE2D5` (Beneficios) | `bg-sage-100` |
| `#B0BAA8` (divisores de Beneficios) | `border-sage-300` |
| `#2E3A33` | `bg-accent` / `text-accent` |
| `#1D1D1B` / `#3A3A36` / `#6B6A66` | `content` / `content-muted` / `content-subtle` |

### 1. Banner

- Imagen a todo el ancho: 220px en móvil y `clamp(300px,33vw,480px)` en el resto. Fondo `bg-surface-sunken`, `object-cover` y `object-position: 50% 62%`.
- Debajo, en `container-xl` con `pt-[clamp(28px,4vw,56px)]`, una grilla `repeat(auto-fit,minmax(min(100%,380px),1fr))` con gap `16px 64px` y `items-end`:
  - **Izquierda:** la miga de pan (`caption-sm`, uppercase, tracking `.18em`, peso 500, `text-content-muted`, el último ítem en `text-content`) y el H1 en `heading-xl`, peso 400, tracking `-.035em` y `text-balance`, con saltos de línea respetados.
  - **Derecha:** la bajada en `body-md`, `leading-[1.65]`, `text-content-muted`, `max-w-[480px]` y `justify-self-end`.

### 2. Catálogo

- Sección `bg-surface` con padding `clamp(20px,5vw,64px)` arriba y `clamp(64px,8vw,112px)` abajo, en `container-xl`.
- **Desktop:** grilla `260px minmax(0,1fr)` con gap de 56px.
  - **Sidebar:** sticky, con `border-t border-line`.
    - `top` de 120px en reposo, 104px con el header compacto y 24px con el header oculto, animado en 600ms `ease-out-expo`.
    - Cada grupo lleva `border-b border-line`.
    - Su botón mide el ancho completo, con `py-5`, `body-md` y peso 500.
    - El indicador `+`/`−` mide 14px: el trazo vertical hace `scaleY(0)` al abrir.
    - El contenido se despliega con `grid-template-rows 0fr→1fr` en 550ms.
  - **Opciones:** una fila de 24px de alto mínimo y `body-sm` (15px).
    - Checkbox cuadrado de 18px con `border-stone-400`. Marcado lleva `bg-ink border-ink` y un check blanco de 12px.
    - La etiqueta va seguida de ` (n)` en `text-content-subtle`.
    - Una opción con `n = 0` y sin marcar queda en `opacity-40`.
  - **Debajo del sidebar:** "Limpiar filtros" (caption uppercase, subrayado), solo con filtros activos.
- **Cabecera de la grilla (desktop):**
  - El conteo "N productos" en `body-md`.
  - "Ordenar por: *Destacados*" con un chevron de 14px que rota 180°.
  - El desplegable es `absolute right-0`, de 250px de ancho mínimo, `bg-surface-raised`, `border-stone-150` y `shadow-lg`.
    - Sus opciones llevan `py-[11px] px-[18px]` y `body-xs`.
    - La activa va en peso 600 y con un check.
    - Entra con opacidad y `translateY(-6px→4px)`.
- **Chips:**
  - Cada chip mide 34px de alto, con `px-3`, `border-line-strong`, `bg-surface-raised`, `body-xs` y una ✕ de 10px. En hover, `border-ink`.
  - Al final va "Limpiar todo", subrayado.
- **Grilla:** 3 columnas en desktop y 2 en móvil y tablet, con gap `48px 24px` en desktop y `28px 12px` en móvil. Se reutiliza la tarjeta de SPEC 05 (`ProductCard.astro`).
- **Estado vacío:**
  - Texto "No encontramos productos con esos filtros." (24px, tracking `-.02em`), con `py-20`.
  - Botón con borde "Limpiar filtros" de 52px.
- **Paginación:**
  - Botones de 44×44 con la página activa en `bg-ink text-content-inverse`.
  - "Siguiente →", en `opacity-35` en la última página.
  - Centrada, con margen superior `clamp(40px,6vw,72px)`.
  - Solo se muestra con más de una página.
- **Barra de móvil y tablet:**
  - Sticky, con `top` de 64px, o 0 con el header oculto.
  - `bg-surface`, `border-b border-stone-150`, `py-3` y margen negativo lateral para ir a sangre.
  - Botón "Filtrar" de 44px con borde `ink`, un icono de sliders y el badge de conteo (18px, `bg-accent`).
  - A la derecha, el conteo en `caption-md` y `text-content-subtle`.
- **Drawer de filtros:**
  - `fixed` a la derecha con ancho `min(100vw,440px)`, `bg-surface` y `z-[70]`. Entra desde `translateX(102%)` en 700ms.
  - Cabecera de 64px: "Filtros" (22px) y botón de cerrar de 44px.
  - Cuerpo con scroll propio (`data-lenis-prevent`):
    - bloque "Ordenar por" con pills de 38px (activa `bg-ink`);
    - los mismos grupos del sidebar.
  - Pie con una grilla `1fr 1.6fr`: "Limpiar" con borde y "Ver N productos" en `bg-ink`, ambos de 52px.

### 3. Precio (slider)

- Riel de 2px en `bg-line-strong`, con el tramo activo en `bg-ink`.
- Dos topes de 18px, `rounded-full`, `bg-surface-raised` y `border-2 border-ink`.
- Debajo, dos cajas de 44px (`S/` en `text-content-subtle`, valor en `tabular-nums`) separadas por una "a".

### 4. Beneficios

- Sección `bg-sage-100` con padding vertical `clamp(40px,5vw,64px)` y `container-xl`.
- 4 columnas en desktop y 2 en tablet y móvil.
- **Desktop:** cada ítem desde el segundo lleva `border-l border-sage-300` y `pl-8`.
- **Tablet:** el borde va solo en la columna derecha.
- **Móvil:** el ícono va encima del texto.
- Ícono en un círculo blanco de 44px (`rounded-full bg-surface-raised`), de 20px y en `text-accent`.
- Título en 18px y texto en `body-xs` en `text-accent`.

## Alcance

**Entra:**

- Nueva `/productos`: banner, catálogo filtrable y Beneficios.
- `/productos/categoria/<slug>` con la misma plantilla y la categoría preseleccionada.
- Filtros por disponibilidad, precio, categoría, marca y tipo de piel.
- Orden: Destacados, Más vendidos, Novedades, Precio menor a mayor, Precio mayor a menor, Mayor descuento y A–Z.
- Paginación de 12 productos por página.
- Estado completo en la query string, con `pushState` y `popstate` (el botón "atrás" funciona).
- Drawer de filtros en `< lg`.
- Badge "Nuevo" en `ProductCard`, según la antigüedad configurada en el CMS.
- Meta de la tarjeta "Marca · Categoría" en desktop y "Marca" en móvil.
- "Agotado" como barra inferior, según la referencia.
- Marcas y tags en el tipo `WooProduct` y en la proyección de `woo-api.php`.
- Schema de `shop`: banner con imagen, Beneficios y `newProductDays`. Se quitan `hero.eyebrow` y `hero.badges`.
- Contenido sembrado del mega-menú: destacados con URLs de catálogo y la columna "Marcas".
- El header publica su estado de scroll en `<html data-header>` para los offsets sticky.

**Fuera de alcance (para specs futuras):**

- Páginas estáticas por marca (`/productos/marca/<slug>`).
- Generar automáticamente las columnas del mega-menú desde Woo.
- Búsqueda de texto dentro del catálogo (sigue en el overlay de SPEC 03).
- Filtros por atributos (`Tamaño`) y productos variables.
- Filtrar con el precio refrescado en vivo por `StockRefresher` (se filtra con el precio del build).
- "Más vendidos" por período: se usa `total_sales` histórico.
- Rediseño de la ficha de producto (`/productos/<slug>`).
- Selector de 1 o 2 columnas en móvil (el bundle lo trae como prop de diseño; se fija en 2).
- Re-animar la entrada (`data-reveal`) de las tarjetas al filtrar.

## Modelo de datos

### Woo (`src/lib/woo/types.ts`, `public/woo-api.php`)

```ts
export interface WooProduct {
  brands: WooTermRef[];
  tags: WooTermRef[];
}

export interface WooProductWithStats extends WooProduct {
  total_sales: number;
  date_created: string;
  featured: boolean;
}

export interface WooTerm { id: number; name: string; slug: string; count: number }
```

- `brands` y `tags` se suman a `projectProduct()` del proxy para respetar la regla de que "un campo que no esté en ambos lados no existe para el front".
- `total_sales`, `date_created` y `featured` **no** van al proxy. Solo los usa el build.
- En `rest.ts` se agregan:
  - `getAllProducts()`, que ahora devuelve `WooProductWithStats[]`;
  - `getAllBrands()`, que lee `/products/brands` con `hide_empty`;
  - `getAllTags()`, que lee `/products/tags` con `hide_empty`.

### Catálogo serializado (`src/utils/catalog/types.ts`, seguro para el navegador)

```ts
export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  discount: number;
  brand: string | null;
  categories: string[];
  skins: string[];
  inStock: boolean;
  isNew: boolean;
  rank: { destacados: number; "mas-vendidos": number; novedades: number };
}

export interface CatalogFacets {
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  skins: { slug: string; name: string }[];
  priceMax: number;
}

export type SortKey =
  | "destacados" | "mas-vendidos" | "novedades"
  | "precio-asc" | "precio-desc" | "descuento" | "a-z";

export interface CatalogState {
  categoria: string[];
  marca: string[];
  piel: string[];
  disponibilidad: ("en-stock" | "agotado")[];
  precio: [number, number] | null;
  orden: SortKey;
  pagina: number;
}
```

- **Rankings.** `src/lib/woo/catalog.ts` (solo build) arma `items` y `facets` y precalcula los `rank`. Así el HTML no expone `total_sales` ni fechas crudas.
  - `destacados`: primero los `featured`, después `menu_order`.
  - `mas-vendidos`: por `total_sales` descendente.
  - `novedades`: por `date_created` descendente.
- **Nuevo.** `isNew` es `date_created ≥ hoy − shop.newProductDays` y se calcula en build. El rebuild diario de las 04:00 lo mantiene al día.
- **Disponibilidad.** `inStock` es `stock_status !== "outofstock"`, así que `onbackorder` cuenta como en stock.
- **Precio máximo.** `priceMax` es el precio más alto redondeado hacia arriba a múltiplos de 10.

### URL (`src/utils/catalog/urlState.ts`)

| Parámetro | Formato | Ejemplo |
|---|---|---|
| `categoria` | slugs separados por coma | `serum,limpieza` |
| `marca` | slugs | `ovaco` |
| `piel` | slugs de tag | `piel-seca` |
| `disponibilidad` | `en-stock`, `agotado` | `en-stock` |
| `precio` | `min-max` | `50-200` |
| `orden` | `SortKey` (por defecto `destacados`, que se omite) | `mas-vendidos` |
| `pagina` | entero ≥ 2 (la 1 se omite) | `2` |

- Los valores desconocidos se ignoran en silencio.
- En `/productos/categoria/<slug>`, la categoría de la ruta es implícita.
  - Si el usuario cambia la selección de categorías, se navega con `location.assign` a `/productos?categoria=…` y se conservan el resto de parámetros.
  - Los demás cambios usan `pushState` sin salir de la ruta.
- El slider de precio solo escribe la URL al soltar el tope.

### Reglas de filtrado (`src/utils/catalog/applyFilters.ts`)

- Dentro de un grupo, las opciones se combinan con **O**. Entre grupos, con **Y**.
- **Tipo de piel:** un producto con el tag `todo-tipo-de-piel` (constante `ALL_SKIN_TYPES_TAG`) pasa cualquier filtro de piel. "Todo tipo de piel" también es una opción propia.
- **Conteos:** el conteo de cada opción se calcula aplicando todos los filtros **salvo el de su propio grupo**, como en la referencia.
- **Grupos abiertos:** Disponibilidad, Precio y Categoría empiezan abiertos. Marca y Tipo de piel, cerrados, salvo que tengan un filtro activo.
- **Paginación:** 12 por página (`CATALOG_PAGE_SIZE`). Si `pagina` supera el total, se usa la última.

### Schema de `shop` (`tina/collections/shop.ts`)

```ts
hero: { title: string; description?: string; image?: string; imageAlt?: string };
benefits: { title: string; text?: string; icon: "check" | "drop" | "truck" | "chat" }[];
newProductDays: number;
lowStockThreshold: number;
seo: { title?: string; description?: string };
```

- Iconos de Beneficios: `PiCheckLight`, `PiDropLight`, `PiTruckLight` y `PiChatCircleLight`.
- Contenido sembrado:
  - `hero.title`: "Productos\npara tu piel.";
  - `hero.description`: la bajada de la referencia;
  - `hero.image`: `/uploads/productos/banner.jpg`, extraída del bundle;
  - `benefits`: los 4 de la referencia ("Validado por expertas", "Sin parabenos", "Envío seguro" y "Asesoría experta").

### Mega-menú sembrado (`src/content/global/index.json`)

| Link | URL |
|---|---|
| Más vendidos | `/productos?orden=mas-vendidos` |
| Novedades | `/productos?orden=novedades` |
| Ofertas | `/productos?orden=descuento` |
| Kits de rutina | `/productos/categoria/pack` |
| Columna "Marcas" | Beauty of Joseon, Germaine de Capuccini, Ovaco, APBL, The Round Lab, Tirtir → `/productos?marca=<slug>`, y "Ver todas" → `/productos` |

La columna "Categorías" no cambia.

### Estado del header (`<html data-header>`)

`HeaderReact` escribe `full`, `compact` u `hidden` en `document.documentElement.dataset.header`. El catálogo lo lee con variantes arbitrarias de Tailwind, por ejemplo `[html[data-header=hidden]_&]:top-6`.

## Plan de implementación

1. **Tipos y fetch de Woo.**
   - Agregar `brands` y `tags` a `WooProduct` y a `projectProduct()` del proxy.
   - Agregar `WooProductWithStats`, `getAllBrands()` y `getAllTags()`.
   - Verificación: `npm run build` pasa con y sin `WOO_*`, y `/woo-api.php` devuelve `brands` en un producto.
2. **Modelo de catálogo.**
   - Crear `src/utils/catalog/{types,urlState,applyFilters}.ts` y `src/lib/woo/catalog.ts` (`buildCatalog()`).
   - Verificación manual con `node --experimental-strip-types`: `parseCatalogUrl(serializeCatalogUrl(s))` devuelve `s`, y filtrar `piel-seca` incluye a los productos `todo-tipo-de-piel`.
3. **Schema y contenido de `shop`.**
   - Cambiar los campos según el modelo, sembrar `index.json` y extraer la imagen del banner a `public/uploads/productos/banner.jpg`.
   - `/admin` muestra los campos nuevos.
4. **Tarjeta de producto.**
   - `ProductCard.astro` recibe `isNew` y cambia la meta a "Marca · Categoría".
   - "Agotado" pasa a barra inferior (42px, `bg-surface/95`, caption uppercase y tracking `.18em`).
   - El badge "Nuevo" (`bg-surface-raised text-content`) va junto al de descuento.
   - La home sigue funcionando, porque `FeaturedProducts` pasa `isNew` desde `buildCatalog`.
5. **Banner y Beneficios.**
   - Crear `ShopBanner.astro`/`ShopBannerReact.tsx` y `ShopBenefits.astro`/`ShopBenefitsReact.tsx`, que comparten la consulta de la página.
   - Borrar `ShopHero*`.
6. **Plantilla compartida.**
   - Crear `src/components/shop/CatalogPage.astro`, que recibe `category?` y lo usan las dos rutas.
   - Renderiza todas las tarjetas del orden `destacados`, y las que pasan de 12 salen con `hidden`.
   - Por ahora, sin isla: el sitio compila y muestra la página 1.
7. **Isla del catálogo (desktop).**
   - Crear `CatalogReact.tsx` (`client:load`) con las tarjetas como `children`.
   - Hook `useCatalogState()`: lee la URL, hace `pushState` y escucha `popstate`.
   - Aplica el filtro sobre el DOM: `hidden` y `style.order` en `[data-woo-id]`.
   - Componentes: `FilterGroup.tsx`, `SortMenu.tsx`, `ActiveFilterChips.tsx`, `Pagination.tsx` y el estado vacío.
   - Cambiar de página hace scroll al inicio de la grilla con `window.lenis.scrollTo` y el offset del header.
8. **Slider de precio.**
   - Crear `PriceRange.tsx`, con dos topes `role="slider"` que se mueven con el puntero y con el teclado (flechas ±10, `Home` y `End`).
   - El paso es de 10 y la separación mínima entre topes, de 10.
9. **Móvil y tablet.**
   - Crear la barra sticky "Filtrar" y `FilterDrawer.tsx`, usando el `scrollLock` y el overlay de SPEC 03.
   - Se cierra con `Esc`, con el overlay y con "Ver N productos". El foco queda atrapado dentro.
10. **Offsets sticky.** `HeaderReact` escribe `data-header`. Se ajustan los `top` del sidebar y de la barra de móvil.
11. **Ruta de categoría.**
    - `/productos/categoria/[slug].astro` usa `CatalogPage`: la miga es Home / Productos / Categoría y el H1 es el nombre de la categoría.
    - Aplica la regla de `location.assign` al cambiar de categoría.
12. **Mega-menú.** Sembrar los destacados y la columna "Marcas" en `global/index.json`.
13. **Pulido.**
    - Script inline que, si la URL trae parámetros de catálogo, marca la grilla con `data-catalog-pending` (opacidad 0) hasta que la isla aplica el estado.
    - `prefers-reduced-motion` desactiva las transiciones de drawer, acordeón y desplegable.
    - Región `aria-live="polite"` para el conteo.
    - Actualizar la sección Tienda del `CLAUDE.md` con los parámetros de URL.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores con y sin variables `WOO_*`. Sin Woo, `/productos` muestra el aviso actual de tienda no conectada.
- [ ] En las piezas nuevas no hay colores hex, `text-white/*`, `bg-white/*` ni `rounded-*`, salvo `rounded-none` y `rounded-full`.
- [ ] El HTML de `/productos` no contiene `total_sales` ni `date_created`.
- [ ] `/productos` muestra el banner, "Productos para tu piel." en dos líneas, el catálogo y Beneficios con 4 ítems.
- [ ] Desde 1024px se ve el sidebar con 5 grupos: Disponibilidad, Precio y Categoría abiertos, y Marca y Tipo de piel cerrados.
- [ ] Marcar "Sérum" deja solo productos de esa categoría, actualiza el conteo y agrega `?categoria=serum` a la URL.
- [ ] Marcar "Sérum" y "Limpieza" muestra la unión de las dos. Sumar una marca muestra la intersección con esa marca.
- [ ] Con "Piel seca" marcado aparecen también los productos con el tag `todo-tipo-de-piel`.
- [ ] Los conteos de un grupo no cambian al marcar opciones de ese mismo grupo.
- [ ] Una opción con conteo 0 y sin marcar se ve atenuada.
- [ ] Arrastrar el slider a 50–200 filtra por precio, crea el chip "S/ 50 – S/ 200" y la URL recibe `precio=50-200` recién al soltar.
- [ ] El slider se mueve con las flechas en pasos de 10.
- [ ] Cada filtro activo tiene un chip. Su ✕ lo quita, y "Limpiar todo" deja la URL en `/productos`.
- [ ] Las 7 opciones de orden reordenan la grilla. "Precio: menor a mayor" deja el producto de S/ 45 primero.
- [ ] Con más de 12 resultados aparece la paginación. "Siguiente" muestra la página 2, pone `pagina=2` y lleva el scroll al inicio de la grilla.
- [ ] Cualquier cambio de filtro vuelve a la página 1.
- [ ] El botón "atrás" del navegador deshace el último cambio de filtro, orden o página.
- [ ] Abrir `/productos?marca=ovaco&orden=precio-desc` en una pestaña nueva muestra solo Ovaco, de mayor a menor precio, sin ver antes la grilla sin filtrar.
- [ ] Los parámetros inválidos (`?orden=foo&marca=xyz`) no rompen la página y se ignoran.
- [ ] Una combinación sin resultados muestra "No encontramos productos con esos filtros." y el botón "Limpiar filtros" funciona.
- [ ] `/productos/categoria/serum` muestra "Sérum" como H1, con la categoría marcada y la miga Home / Productos / Sérum.
- [ ] En `/productos/categoria/serum`, marcar también "Limpieza" navega a `/productos?categoria=serum,limpieza`.
- [ ] En menos de 1024px se ve la barra "Filtrar" con el badge de conteo. Abre el drawer y "Ver N productos" lo cierra con el conteo correcto.
- [ ] Con el drawer abierto, la página de fondo no hace scroll y `Esc` lo cierra.
- [ ] La barra de móvil y el sidebar se pegan debajo del header, y suben cuando el header se oculta.
- [ ] En el mega-menú, "Más vendidos" abre `/productos?orden=mas-vendidos` con el orden aplicado.
- [ ] En el mega-menú, "Kits de rutina" abre `/productos/categoria/pack`.
- [ ] La columna "Marcas" del mega-menú lista 6 marcas y cada una abre el catálogo filtrado.
- [ ] Con `newProductDays` en un valor que incluya el producto más reciente, su tarjeta muestra "Nuevo".
- [ ] Un producto agotado muestra la barra "Agotado" y no tiene el botón de agregar.
- [ ] `QuickAdd` y `StockRefresher` siguen funcionando sobre las tarjetas filtradas.
- [ ] A 360px no hay scroll horizontal, ni con el drawer abierto.
- [ ] Todos los controles del catálogo se pueden usar con teclado. Los checkboxes anuncian su estado y los grupos llevan `aria-expanded`.
- [ ] `/admin` permite editar el banner, Beneficios y `newProductDays`, y el cambio se ve en la vista previa.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario, las secciones posteriores a la cabecera no se revisaron una por una. Se asumieron a partir de sus respuestas y de la referencia.
- **Sí: filtrar en el navegador sobre HTML estático.** Con 29 productos, todo el catálogo cabe en la página. Es instantáneo y no carga el proxy.
- **No: filtrar contra la Store API en vivo.** Suma latencia y dependencia del WordPress a cambio de nada con este tamaño de catálogo.
- **Sí: la isla controla el DOM de tarjetas renderizadas por Astro** (`hidden` + `order`). Hay una sola tarjeta (`ProductCard.astro`) para la home y el catálogo. `QuickAdd` y `StockRefresher` siguen funcionando y el HTML trae todos los productos para SEO.
- **No: portar la tarjeta a React.** Duplicaría el componente y rompería las islas anidadas de `QuickAdd`.
- **Sí: el estado en la query string con `pushState`.** Se puede compartir, el botón "atrás" funciona y el mega-menú puede enlazar a vistas filtradas.
- **Sí: `/productos/categoria/<slug>` como landing estática** con la categoría preseleccionada. Conserva las URLs, el SEO y el HTML con productos.
- **No: redirigir las páginas de categoría a query params.** Perdería las páginas indexables.
- **Sí: salir de la ruta de categoría con `location.assign`** al cambiar categorías. Evita un H1 que no coincide con la URL.
- **Sí: los destacados del mega-menú como órdenes.** "Ofertas" es un orden por descuento porque los 29 productos están en oferta. "Kits de rutina" es la categoría `pack`.
- **Sí: la columna "Marcas" sembrada a mano,** con el mismo patrón que "Categorías" en SPEC 03.
- **No: columnas del mega-menú generadas desde Woo.** Rompería la edición desde el CMS.
- **Sí: tipo de piel desde los tags de Woo, con todos los que tienen productos.** `todo-tipo-de-piel` pasa cualquier filtro de piel.
- **Sí: rankings precalculados en build.** No se publican las ventas ni las fechas de alta.
- **Sí: "Nuevo" por antigüedad** con `shop.newProductDays` (30 por defecto).
- **Sí: Beneficios reemplaza `hero.badges`.** No quedan dos listas de sellos.
- **Sí: 2 columnas fijas en móvil.** Es el valor por defecto de la referencia. El selector 1/2 queda fuera.
- **Sí: `data-header` en `<html>`** para los offsets sticky. Evita acoplar la isla del catálogo al estado interno del header.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Destello de la grilla sin filtrar antes de hidratar cuando la URL trae parámetros | Un script inline pone `data-catalog-pending` (opacidad 0) solo si hay parámetros de catálogo. La isla lo quita al aplicar el estado, y un timeout de 1,5s lo quita igual si la isla falla. |
| Las tarjetas quedan dentro de `<astro-slot>` y el `order` de CSS no aplica | `astro-slot` tiene `display: contents`, así que los `<article>` son ítems de la grilla. Se verifica en el paso 7. |
| El precio refrescado por `StockRefresher` difiere del precio usado para filtrar | Se acepta: el rebuild por webhook (SPEC 02) resincroniza. Queda fuera de alcance. |
| Un producto sin marca o sin tags | `brand: null` y `skins: []`. No aparece bajo ninguna marca ni tipo de piel, pero sí sin filtros. |
| Woo Brands desactivado en el WordPress | `getAllBrands()` devuelve `[]` y el grupo "Marca" no se renderiza si no tiene opciones. |
| El catálogo crece a cientos de productos | El HTML crece de forma lineal. Pasados unos 300 productos se evalúa paginar en build (otra spec). |

## Qué **no** entra en esta spec

- Páginas por marca y columnas del mega-menú generadas desde Woo.
- Búsqueda de texto dentro del catálogo.
- Filtros por atributos (`Tamaño`) y productos variables.
- Filtrar con el precio en vivo.
- Rediseño de la ficha de producto.
- Selector de columnas en móvil y re-animación de tarjetas al filtrar.

Cada una de esas piezas, si llega, va en su propia spec.

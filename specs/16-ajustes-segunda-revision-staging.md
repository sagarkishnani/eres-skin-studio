# SPEC 16 — Ajustes de la segunda revisión de staging

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 09, SPEC 15
> **Fecha:** 2026-10-06
> **Objetivo:** Resolver las seis observaciones de la segunda revisión de staging (foto móvil del hero, etiqueta de descuento diagonal, banner de productos en móvil y en desktop, y orden y filtros del catálogo) dejando cada opción editable desde Tina.

## Por qué existe esta spec

El cliente revisó de nuevo el sitio de prueba y dejó seis observaciones:

1. Hero de la home: cada slide debe poder llevar una foto propia para móvil. Sin ella se usa la de desktop, centrada.
2. Tarjeta de producto: la etiqueta de descuento debe poder mostrarse horizontal (como hoy) o diagonal, a elegir en el panel.
3. Banner de `/productos` en móvil: título corto de dos líneas y sin párrafo.
4. Banner de `/productos` en desktop: el texto blanco apenas se lee sobre la foto clara, y el cliente no quiere oscurecerla.
5. Orden en móvil: solo Destacados, Más vendidos, Novedades y Mayor descuento, configurables en el panel.
6. Filtros: quedan Categoría, Marca y Tipo de piel. Disponibilidad y Precio se pueden reactivar en el panel. En móvil arranca abierta solo Categoría.

La observación 4 revierte una decisión de SPEC 15 ("texto claro con degradado oscuro en el banner"). El motivo está en Decisiones.

## Alcance

**Entra:**

- **Foto móvil del hero.** Campo nuevo `imageMobile` por slide. Se elimina el campo `focusMobile`.
- **Fotos entregadas.** `banner2mobile.webp` y `banner3mobile.webp` se renombran y se asignan a las slides 2 y 3.
- **Etiqueta de descuento.** Selector global `shop.discountBadgeStyle` (`horizontal` | `diagonal`) que aplica a toda tarjeta `ProductCard`: catálogo, destacados de la home y relacionados de la ficha.
- **Banner de `/productos` en móvil.** Campo nuevo `shop.hero.titleMobile` y párrafo oculto por debajo de `md`.
- **Banner de `/productos` en desktop.** Texto oscuro con velo crema en lugar de texto blanco con velo oscuro.
- **Orden en móvil.** Lista `shop.catalog.mobileSortOptions` que decide qué opciones muestra el drawer de filtros.
- **Filtros visibles.** Lista `shop.catalog.visibleFilters` que decide qué grupos se muestran, en desktop y en móvil.
- **Grupos abiertos al cargar.** En el drawer solo Categoría. En el panel de desktop, todos los visibles.
- Actualizar `CLAUDE.md` con los campos nuevos.

**Fuera de alcance (para futuras specs):**

- Foto móvil para el banner de `/productos`. La observación 1 es solo del hero de la home.
- Cambiar el alto del hero en móvil. Sigue en 600px.
- Campo de encuadre (`object-position`) para el banner de `/productos`.
- Intensidad del velo del banner editable en Tina.
- Editar el nombre o el orden de las opciones de "Ordenar por".
- Cambiar las opciones de orden en desktop. `SortMenu` sigue con las siete.
- Etiqueta de descuento en la ficha de producto (`ProductPurchaseReact`).
- Estilo diagonal para la etiqueta "Nuevo".

## Referencia de diseño

Hay dos cortes distintos y no se unifican:

- Hero y banner de `/productos`: **móvil** `< md` (768px), **desktop** `≥ md`.
- Catálogo: **móvil** `< lg` (1024px, drawer de filtros), **desktop** `≥ lg` (panel lateral). Es el corte que ya usa `CatalogReact`.

### 1. Foto móvil del hero

- Cada slide gana `imageMobile` ("Imagen en móvil"), opcional.
- `HeroCarouselReact` envuelve la imagen en `<picture>`. Si la slide tiene `imageMobile`, agrega `<source media="(max-width: 767px)" srcset={imageMobile}>` antes del `<img>`. Así cada dispositivo descarga una sola foto.
- El `<img>` conserva `src={image}`, sus clases, `fetchPriority`, `alt` y `data-tina-field`.
- Encuadre: por debajo de `md` la imagen va siempre en `object-position: 50% 50%`, sea la foto móvil o la de desktop. Desde `md` sigue usando `focus`.
- Se elimina `focusMobile` del schema, de `HeroSlide`, de `HeroReact.tsx`, de la variable `--focus-mobile` y de las tres slides de `src/content/home/index.json`.
- `imageMobile` pasa por `mediaUrl()`.
- La regla de carga diferida (`showImage`) no cambia: depende de `slide.image`. Una slide sin `image` no muestra foto aunque tenga `imageMobile`.
- Archivos: `public/uploads/home/banner2mobile.webp` → `hero-2-mobile.webp` y `banner3mobile.webp` → `hero-3-mobile.webp`. Ambas miden 780×1700.
- Contenido: slide 2 ("Eres única, tu piel también") usa `/uploads/home/hero-2-mobile.webp`. Slide 3 ("Conoce más de nosotras") usa `/uploads/home/hero-3-mobile.webp`. Slide 1 queda sin foto móvil.

### 2. Etiqueta de descuento

- `ProductCard.astro` recibe la prop `discountBadgeStyle?: "horizontal" | "diagonal"`, con `diagonal` por defecto (cualquier valor distinto de `horizontal`).
- **Horizontal:** idéntico a hoy. Etiqueta `-20%` arriba a la izquierda, con "Nuevo" a su derecha.
- **Diagonal:** cinta a 45° que cruza la esquina superior izquierda de la foto.
  - Fondo `bg-accent`, texto `text-content-inverse`, `text-caption-xs font-semibold`, centrado.
  - Alto de la cinta: 24px. Su eje queda a unos 30px de la esquina, medido sobre la diagonal.
  - El `overflow-hidden` del contenedor de la foto recorta las puntas.
  - `pointer-events-none`, para no tapar el enlace de la tarjeta.
- Con estilo diagonal, "Nuevo" pasa a la esquina superior derecha (`right-2.5 top-2.5`). Esa esquina está libre: el botón de agregar rápido va abajo.
- Los tres sitios que montan `ProductCard` le pasan el valor de `shop.discountBadgeStyle`: `CatalogPage.astro`, `FeaturedProducts.astro` y `RelatedProducts.astro` (este último lo recibe de `src/pages/productos/[slug].astro`).
- `StockRefresher` no toca la etiqueta: el porcentaje se calcula en build, igual que hoy.
- La tarjeta pinta las dos variantes y las alterna con `data-discount-badge` en su `<article>`. En el editor de Tina, la isla `DiscountBadgePreviewReact` (`client:tina`, en el catálogo y en la ficha) actualiza ese atributo al cambiar el selector, sin guardar ni recompilar.

### 3. Banner de `/productos` en móvil

- Campo nuevo `shop.hero.titleMobile` ("Título en móvil"), opcional. Valor inicial: `Marcas de skincare\nelegidas para ti`.
- Hay un solo `<h1>`. Si `titleMobile` tiene texto, el `<h1>` contiene dos `<span>`: uno `md:hidden` con `titleMobile` y otro `hidden md:inline` con `title`. Si está vacío, se muestra `title` en todos los anchos.
- En páginas de categoría el `<h1>` sigue siendo el nombre de la categoría en todos los anchos.
- El párrafo (`hero.description`) pasa a `hidden md:block`, también en páginas de categoría.
- El resto del layout móvil no cambia: foto de 220px y texto debajo.

### 4. Banner de `/productos` en desktop

Desde `md`:

- Miga, enlaces de la miga, H1 y párrafo dejan `text-content-inverse` y usan los mismos tokens que en móvil: `text-content` para el H1 y la página actual, `text-content-muted` para la miga y el párrafo.
- Velo: se reemplaza `bg-gradient-to-tr from-ink/55 via-ink/20 via-45% to-transparent to-75%` por `bg-gradient-to-t from-surface/55 to-transparent to-55%`. Sigue oculto por debajo de `md`.
- Posición, tamaños y alto del banner no cambian.
- El campo `shop.hero.image` gana la descripción "Usa una foto clara: el texto del banner va en color oscuro encima."

### 5. Orden en móvil

- El drawer (`FilterDrawer.tsx`) muestra solo las opciones cuyo `key` está en `shop.catalog.mobileSortOptions`, en el orden de `SORT_OPTIONS`.
- Valor inicial: `destacados`, `mas-vendidos`, `novedades`, `descuento`.
- Lista vacía o ausente equivale al valor inicial.
- Si el orden activo no está en la lista (por ejemplo, un enlace con `?orden=precio-asc`), el drawer lo muestra igual, seleccionado. Así el estado nunca queda invisible.
- `SortMenu` (desktop) no cambia.

### 6. Filtros visibles y grupos abiertos

- `FilterPanel.tsx` muestra solo los grupos cuyo `key` está en `shop.catalog.visibleFilters`. El orden relativo es el actual: Disponibilidad, Precio, Categoría, Marca, Tipo de piel.
- Valor inicial: `categoria`, `marca`, `piel`.
- Lista vacía o ausente equivale al valor inicial.
- Un grupo sin opciones sigue sin mostrarse, igual que hoy.
- Los parámetros `?disponibilidad=` y `?precio=` siguen filtrando y mostrando su chip aunque el grupo esté oculto.
- Grupos abiertos al cargar. El panel de desktop y el drawer dejan de compartir estado:
  - Panel de desktop: todos los grupos visibles abiertos.
  - Drawer: solo `categoria` abierto.
  - Se elimina `DEFAULT_OPEN_GROUPS`.
  - El efecto que abre Marca y Tipo de piel cuando la URL ya trae esos filtros se conserva y aplica al drawer.
- Son dos estados fijos y no uno resuelto con `matchMedia`, para que el HTML del servidor coincida con el del navegador al hidratar.

## Modelo de datos

`tina/collections/home.ts`, dentro de `hero.slides`. Se agrega `imageMobile` después de `imageAlt` y se borra `focusMobile`:

```ts
{
  name: "imageMobile",
  label: "Imagen en móvil",
  description: "Opcional. Vertical, p. ej. 780×1700. Sin ella se usa la imagen principal, centrada.",
  type: "image",
}
```

`tina/collections/shop.ts`:

```ts
// dentro de hero, después de title
{
  name: "titleMobile",
  label: "Título en móvil",
  description: "Opcional. Admite saltos de línea. Vacío: se usa el título principal.",
  type: "string",
  ui: textarea,
}

// en la raíz, junto a newProductDays
{
  name: "discountBadgeStyle",
  label: "Etiqueta de descuento",
  type: "string",
  options: [
    { value: "horizontal", label: "Horizontal" },
    { value: "diagonal", label: "Diagonal (cinta en la esquina)" },
  ],
}

// en la raíz
{
  type: "object",
  name: "catalog",
  label: "Catálogo",
  fields: [
    {
      name: "visibleFilters",
      label: "Filtros visibles",
      type: "string",
      list: true,
      options: [
        { value: "categoria", label: "Categoría" },
        { value: "marca", label: "Marca" },
        { value: "piel", label: "Tipo de piel" },
        { value: "disponibilidad", label: "Disponibilidad" },
        { value: "precio", label: "Precio" },
      ],
    },
    {
      name: "mobileSortOptions",
      label: "Opciones de orden en móvil",
      type: "string",
      list: true,
      options: [/* las siete de SORT_OPTIONS, con su label */],
    },
  ],
}
```

`src/content/shop/index.json` gana:

```json
{
  "hero": { "titleMobile": "Marcas de skincare\nelegidas para ti" },
  "discountBadgeStyle": "diagonal",
  "catalog": {
    "visibleFilters": ["categoria", "marca", "piel"],
    "mobileSortOptions": ["destacados", "mas-vendidos", "novedades", "descuento"]
  }
}
```

Convenciones:

- Los valores de `visibleFilters` son los `FilterKey` de `src/utils/catalog/types.ts`. Los de `mobileSortOptions` son los `SortKey`.
- Los valores por defecto de ambas listas viven como constantes en `src/utils/catalog/types.ts` (`DEFAULT_VISIBLE_FILTERS`, `DEFAULT_MOBILE_SORT_KEYS`).
- `CatalogReact` recibe `visibleFilters: FilterKey[]` y `mobileSortKeys: SortKey[]` como props desde `CatalogPage.astro`. No usa `useTina`: un cambio en estas listas se ve tras un rebuild, no en la vista previa.
- `HeroSlide` cambia `focusMobile: string` por `imageMobile: string`.

## Plan de implementación

1. **Hero: schema y contenido.** Renombrar las dos fotos. Agregar `imageMobile` y borrar `focusMobile` en `tina/collections/home.ts`. Actualizar las tres slides de `src/content/home/index.json`.
2. **Hero: render.** Pasar `imageMobile` por `HeroReact.tsx` y pintar el `<picture>` en `HeroCarouselReact.tsx` con el encuadre centrado en móvil. Verificar a 390px y 1440px.
3. **Etiqueta de descuento.** Agregar `discountBadgeStyle` al schema y al contenido. Agregar la prop y la cinta a `ProductCard.astro`. Pasar el valor desde `CatalogPage.astro`, `FeaturedProducts.astro` y `[slug].astro` → `RelatedProducts.astro`. Verificar los dos estilos cambiando el valor en el JSON.
4. **Banner móvil.** Agregar `titleMobile` al schema y al contenido. Ajustar el `<h1>` y ocultar el párrafo en `ShopBannerReact.tsx`.
5. **Banner desktop.** Cambiar tokens de texto y velo en `ShopBannerReact.tsx` y agregar la descripción al campo `image`. Verificar a 1024px, 1440px y 1920px.
6. **Catálogo: schema y props.** Agregar `shop.catalog` al schema y al contenido, las dos constantes por defecto en `types.ts`, y pasar las dos listas de `CatalogPage.astro` a `CatalogReact`.
7. **Filtros visibles.** Filtrar los grupos en `FilterPanel.tsx` según `visibleFilters`.
8. **Grupos abiertos.** Separar el estado de grupos abiertos del panel y del drawer en `CatalogReact.tsx` y borrar `DEFAULT_OPEN_GROUPS`.
9. **Orden en móvil.** Filtrar las opciones de `FilterDrawer.tsx` según `mobileSortKeys`, incluyendo siempre la activa.
10. **Cierre.** Correr `npm run build` para regenerar `tina/__generated__/` y `tina/tina-lock.json`. Actualizar `CLAUDE.md`: colección `shop`, sección Catálogo y hero.

## Criterios de aceptación

- [ ] En `/admin`, cada slide del hero muestra "Imagen en móvil" y ya no muestra "Encuadre en móvil".
- [ ] `grep -rn "focusMobile" src tina/collections` no devuelve resultados.
- [ ] A 390px de ancho, las slides 2 y 3 del hero cargan `hero-2-mobile.webp` y `hero-3-mobile.webp`, y la pestaña Red no muestra `hero-2.webp` ni `hero-3.webp`.
- [ ] A 1440px, las slides 2 y 3 cargan `hero-2.webp` y `hero-3.webp` y ninguna foto `-mobile`.
- [ ] A 390px, la slide 1 muestra `hero-1.webp` con `object-position` computado `50% 50%`.
- [ ] A 1440px, el encuadre de las tres slides es idéntico al actual.
- [ ] `public/uploads/home/` no contiene `banner2mobile.webp` ni `banner3mobile.webp`.
- [ ] Con `discountBadgeStyle: "horizontal"`, las tarjetas se ven idénticas a antes de esta spec.
- [ ] En `/admin` → Tienda, cambiar "Etiqueta de descuento" cambia las tarjetas de la vista previa al instante.
- [ ] Con `discountBadgeStyle: "diagonal"`, un producto en oferta muestra la cinta en la esquina superior izquierda en `/productos`, en los destacados de la home y en los relacionados de una ficha.
- [ ] Con estilo diagonal, un producto en oferta y nuevo muestra "Nuevo" arriba a la derecha, sin tocar la cinta.
- [ ] Con estilo diagonal, hacer clic sobre la cinta abre la ficha del producto.
- [ ] A 390px, `/productos` muestra el título "Marcas de skincare / elegidas para ti" en dos líneas y no muestra el párrafo.
- [ ] A 1440px, `/productos` muestra "Productos / para tu piel." y el párrafo.
- [ ] `/productos` tiene un solo `<h1>` en el HTML.
- [ ] Con `titleMobile` vacío, a 390px se muestra el título principal.
- [ ] A 390px, `/productos/categoria/<slug>` muestra el nombre de la categoría como título y no muestra el párrafo.
- [ ] A 1440px, miga, H1 y párrafo del banner son oscuros y no hay velo oscuro sobre la foto.
- [ ] A 1440px, el párrafo del banner mide al menos 4.5:1 de contraste contra la zona de la foto que tiene detrás.
- [ ] En `ShopBannerReact.tsx` no queda ningún `text-content-inverse` ni `from-ink`.
- [ ] A 390px, el drawer de filtros muestra exactamente cuatro opciones de orden: Destacados, Más vendidos, Novedades y Mayor descuento.
- [ ] A 390px, `/productos?orden=precio-asc` muestra una quinta opción "Precio: menor a mayor", seleccionada.
- [ ] A 1440px, "Ordenar por" sigue ofreciendo las siete opciones.
- [ ] En desktop y en el drawer se ven solo los grupos Categoría, Marca y Tipo de piel.
- [ ] Agregar `disponibilidad` y `precio` a `visibleFilters` y recompilar hace aparecer esos dos grupos.
- [ ] `/productos?disponibilidad=en-stock` filtra el catálogo y muestra el chip "En stock" aunque el grupo esté oculto.
- [ ] Al abrir el drawer en `/productos`, solo Categoría está desplegada.
- [ ] Al abrir el drawer en `/productos?marca=ovaco`, Categoría y Marca están desplegadas.
- [ ] A 1440px, los tres grupos del panel lateral están desplegados al cargar.
- [ ] La consola no muestra avisos de hidratación en `/productos`.
- [ ] En `/admin` → Tienda aparecen "Título en móvil", "Etiqueta de descuento", "Filtros visibles" y "Opciones de orden en móvil".
- [ ] `npm run build` termina sin errores.

## Decisiones

- **Sí:** una sola spec para las seis observaciones. Cada ajuste es chico y vienen de la misma revisión, igual que SPEC 15.
- **No:** dos specs (hero y tienda). Elegido por el usuario.
- **Sí:** `<picture>` con `<source media>`. El navegador descarga solo la foto que va a usar.
- **No:** dos `<img>` alternados con `hidden` / `md:block`. Descargaría las dos fotos.
- **Sí:** eliminar `focusMobile`. En móvil la imagen siempre va centrada, y quien quiera otro encuadre sube una foto móvil. Es un campo menos para la editora.
- **No:** mantener `focusMobile` como ajuste opcional. Descartado por el usuario.
- **Sí:** la slide 1 pasa de `62% 50%` a centrada en móvil. Es consecuencia aceptada de la decisión anterior.
- **Sí:** el hero móvil sigue en 600px. A 390px de ancho la foto 780×1700 pierde cerca del 15% arriba y abajo, y se acepta.
- **No:** subir el alto del hero para mostrar más foto.
- **Sí:** renombrar las fotos a `hero-N-mobile.webp`. Sigue la convención de `hero-N.webp`.
- **Sí:** corte en `md` para la foto móvil. Es el mismo del resto del hero.
- **Sí:** selector de etiqueta global en `shop`. Un valor por tarjeta o por producto no tiene uso: el estilo es de la tienda.
- **Sí:** `diagonal` como valor inicial y como valor por defecto si el campo está vacío. Pedido del usuario al revisar la implementación; antes era `horizontal`.
- **Sí:** las dos variantes en el HTML, alternadas por CSS. `ProductCard` es Astro estático: sin eso, el selector no se reflejaba en la vista previa de Tina.
- **Sí:** "Nuevo" a la derecha en el estilo diagonal. A la izquierda quedaría debajo de la cinta. Esta ubicación se asumió: la respuesta del usuario a esa pregunta fue ambigua.
- **Sí:** `titleMobile` como campo aparte. El título de desktop no cambia.
- **No:** acortar el título para todos los anchos. La observación es solo de móvil.
- **Sí:** un solo `<h1>` con dos `<span>`. Dos `<h1>` alternados duplicarían el encabezado en el HTML.
- **Sí:** ocultar el párrafo en móvil con CSS y no con un interruptor en Tina. El usuario lo pidió fijo.
- **Sí:** texto oscuro con velo crema en el banner desktop. La foto es clara: el blanco daba cerca de 2.3:1 sobre el mármol y para llegar a 4.5:1 había que oscurecerla más o menos un 55%, que el cliente rechazó.
- **No:** texto blanco con velo oscuro solo en la franja inferior y sombra de texto. Mejora, pero queda cerca de 3.5:1.
- **No:** intensidad del velo editable en Tina. Con texto oscuro no hace falta.
- **Revierte SPEC 15:** allí se eligió texto claro porque "funciona con cualquier foto". Aquí se prioriza la legibilidad con la foto real y el pedido del cliente de no oscurecerla.
- **Sí:** las opciones de orden en móvil se eligen de una lista fija. Editar nombres y orden no se pidió.
- **Sí:** el drawer muestra el orden activo aunque no esté en la lista. Un orden aplicado e invisible confunde.
- **Sí:** Disponibilidad y Precio ocultos por defecto y reactivables en Tina. Pedido del usuario.
- **Sí:** los parámetros de un filtro oculto siguen funcionando. No rompe enlaces existentes y el chip permite quitarlos.
- **No:** ignorar `?disponibilidad=` y `?precio=` cuando el grupo está oculto.
- **Sí:** grupos abiertos fijos en código (drawer: solo Categoría; desktop: todos). El usuario no pidió un interruptor.
- **Sí:** dos estados de grupos abiertos en lugar de `matchMedia`. Evita diferencias de hidratación.
- **Sí:** corte en `lg` para orden y filtros. Es donde el catálogo ya cambia de panel a drawer.
- **Definición rápida:** las secciones de alcance a riesgos se escribieron sin revisión intermedia, a pedido del usuario.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Las fotos móviles miden 780px de ancho y se ven suaves en pantallas 3x | Aceptado por el usuario. Se reemplazan desde Tina sin tocar código. |
| La editora sube una foto oscura al banner de `/productos` y el texto oscuro no se lee | La descripción del campo pide una foto clara. El velo crema aclara la franja inferior. |
| El título del banner sigue pisando el frasco de la izquierda de la foto | Es un tema de encuadre de la foto, fuera de alcance. Se resuelve recortando la imagen. |
| La cinta diagonal tapa parte del producto en fotos con el producto pegado a la esquina | La cinta ocupa solo la esquina (unos 60px por lado). El estilo horizontal sigue disponible. |
| `visibleFilters` vacío dejaría el panel y el drawer sin grupos | Lista vacía equivale al valor por defecto. |
| El build de staging corre contra el índice de TinaCloud de la rama y el schema cambia | El schema y `tina-lock.json` van en el mismo push, como en SPEC 15. |
| Un cambio de `visibleFilters` o `mobileSortOptions` no se ve en la vista previa de Tina | Documentado en `CLAUDE.md`: se ve tras el rebuild que dispara guardar. |

## Lo que **no** entra en esta spec

- Foto móvil para el banner de `/productos`.
- Cambio de alto del hero en móvil.
- Encuadre o intensidad de velo editables para el banner de `/productos`.
- Nombres u orden editables de las opciones de "Ordenar por".
- Cambios en "Ordenar por" de desktop.
- Etiqueta de descuento en la ficha de producto.
- Estilo diagonal para "Nuevo".

Cada una, si llega, va en su propia spec.

# SPEC 17 — Ajustes de la tercera revisión de staging

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 09, SPEC 10, SPEC 15, SPEC 16
> **Fecha:** 2026-10-08
> **Objetivo:** Resolver las siete observaciones de la tercera revisión de staging (eyebrows de la home, letra "e" de Reserva una cita, ondas del botón de WhatsApp, título del banner de productos, orden "Novedades" y galería de la ficha) sin agregar campos nuevos al CMS.

## Por qué existe esta spec

El cliente revisó de nuevo el sitio de prueba y dejó siete observaciones:

1. Home, productos destacados: quitar el eyebrow "— Skincare".
2. Home, resultados: quitar el eyebrow "— Resultados".
3. Reserva una cita: la "e" del fondo debe ir en itálica y notarse un poco más.
4. Botón flotante de WhatsApp: debe emitir ondas.
5. Banner de `/productos`: el título se ve demasiado grande.
6. "Ordenar por": quitar "Novedades".
7. Galería ampliada de la ficha: debe cerrarse también al hacer clic fuera de la foto. Además, la foto de la ficha debe ampliarse más al pasar el cursor.

La observación 3 revierte una decisión de SPEC 15 ("e" recta de Playfair Display Regular). La 6 reduce la lista de órdenes que SPEC 09 y SPEC 16 daban por fija. Los motivos están en Decisiones.

## Alcance

**Entra:**

- **Eyebrows de la home.** Se vacían `products.eyebrow` y `results.eyebrow` en `src/content/home/index.json`.
- **Letra "e" de Booking.** Pasa a Playfair Display Italic como SVG inline y sube de 12% a 18% de opacidad.
- **Ondas de WhatsApp.** Dos ondas concéntricas en bucle continuo en `WhatsAppButton.astro`.
- **Título del banner de `/productos`.** Baja de `heading-xl` a `heading-lg` desde `md`. Aplica también a `/productos/categoria/<slug>`.
- **Orden "Novedades".** Se elimina por completo: código, selector de Tina, contenido de `shop` y enlace del mega-menú.
- **Galería ampliada.** `ProductZoom` se cierra al hacer clic fuera de la foto.
- **Lupa en la ficha.** En desktop, la foto principal de `ProductGalleryReact` se amplía 2x al pasar el cursor y sigue al puntero.
- Actualizar `CLAUDE.md`: lista de órdenes del catálogo y la lupa de la ficha.

**Fuera de alcance (para futuras specs):**

- Los demás eyebrows de la home (Servicios, Nuestra esencia, Skin Journal, Reserva una cita) y los de otras páginas.
- Eliminar el campo `eyebrow` del schema de Tina. Sigue disponible en las dos secciones.
- El título del banner de `/productos` en móvil. Sigue en `heading-xl`.
- Opacidad o estilo de la "e" editables en Tina.
- Interruptor en Tina para apagar las ondas de WhatsApp.
- La etiqueta "Nuevo" de las tarjetas y `shop.newProductDays`. No dependen del orden "Novedades" y no cambian.
- Lupa dentro de la galería ampliada, o lupa en móvil.
- Imágenes de mayor resolución para la lupa.

## Referencia de diseño

Cortes: **móvil** `< md` (768px) y **desktop** `≥ md` para la home y el banner. La lupa usa `lg` (1024px), el corte donde la galería de la ficha ya cambia de comportamiento.

### 1 y 2. Eyebrows de la home

- En `src/content/home/index.json`, `products.eyebrow` y `results.eyebrow` pasan a `""`.
- `FeaturedProductsReact.tsx` y `ResultsReact.tsx` ya no pintan el `<span class="eyebrow">` cuando el campo está vacío. No se toca código.
- El campo sigue visible en `/admin`. Escribir un texto lo vuelve a mostrar.

### 3. Letra "e" de Reserva una cita

- En `BookingReact.tsx`, el `path` de `PlayfairLetterE` se reemplaza por el de la "e" minúscula de **Playfair Display Italic** (400).
- El trazo se extrae una vez del archivo de la fuente (OFL), igual que en SPEC 15. La fuente no se agrega como dependencia.
- El `viewBox` se ajusta a la caja del nuevo glifo, para que la letra no quede recortada ni con aire sobrante.
- La opacidad pasa de `text-content-inverse/[.12]` a `text-content-inverse/[.18]`.
- No cambian el alto (`clamp(260px,32vw,500px)`), la posición (`bottom-gutter right-gutter`), `pointer-events-none`, `select-none` ni `aria-hidden`.

### 4. Ondas del botón de WhatsApp

- `WhatsAppButton.astro` gana dos ondas: círculos del tamaño del botón, color `bg-whatsapp`, que crecen y se desvanecen.
- Cada onda va de `scale(1)` y opacidad `.45` a `scale(1.8)` y opacidad `0`.
- Duración: 2.4s, `ease-out`, en bucle infinito. La segunda onda arranca 1.2s después de la primera.
- Animación nueva `whatsapp-pulse` en `keyframes` y `animation` de `tailwind.config.mjs`.
- Las ondas son hijas del enlace, van detrás del ícono, llevan `aria-hidden` y `pointer-events-none`.
- Con `prefers-reduced-motion: reduce` las ondas no se muestran.
- Al ser hijas del botón, heredan su comportamiento actual: desaparecen con él cuando hay scroll bloqueado o banner de cookies en móvil, y suben con él cuando aparece la barra de compra.
- El `hover:scale-[1.08]` y la sombra del botón no cambian.

### 5. Título del banner de `/productos`

- En `ShopBannerReact.tsx`, las tres variantes del `<h1>` pasan de `text-heading-xl` a `text-heading-xl md:text-heading-lg`.
- Resultado: a 1440px el título mide 60px en lugar de 72px. A 1024px, 43px en lugar de 51px.
- Por debajo de `md` sigue en `heading-xl` (40px).
- Miga, párrafo, velo, alto del banner y posición del bloque no cambian.

### 6. Orden "Novedades"

- `SORT_OPTIONS` queda con seis opciones: Destacados, Más vendidos, Precio: menor a mayor, Precio: mayor a menor, Mayor descuento y Alfabético, A–Z.
- `SortMenu` (desktop) y `FilterDrawer` (móvil) leen de `SORT_OPTIONS`: dejan de ofrecer "Novedades" sin cambios propios.
- `/productos?orden=novedades` se trata como un valor desconocido: `sortParam` de `urlState.ts` ya devuelve `destacados`.
- El valor por defecto del drawer pasa a tres opciones: `destacados`, `mas-vendidos`, `descuento`.
- Se borra el enlace "Novedades" (`/productos?orden=novedades`) de `nav.links[0].menu.featured` en `src/content/global/index.json`.
- La etiqueta "Nuevo" (`isNew`) no se toca.

### 7a. Cierre de la galería ampliada

- En `ProductZoom.tsx`, un clic sobre cualquier zona que no sea la foto, la X o los botones Anterior / Siguiente llama a `onClose`.
- Hoy el `<img>` ocupa toda la caja (`h-full w-full object-contain`), así que el aire alrededor de la foto es parte del `<img>`. Pasa a medir lo que mide la foto (`max-h-full max-w-full`, centrada en su contenedor), para que ese aire sea fondo clicable.
- La foto se ve del mismo tamaño y en la misma posición que hoy.
- El contador `1 / 2` entre los botones no cierra la galería.
- La X, `Esc` y las flechas del teclado siguen funcionando igual. Al cerrar, el foco vuelve al botón de la lupa, como hoy.

### 7b. Lupa en la foto de la ficha

- Aplica a la foto principal de `ProductGalleryReact.tsx`, desde `lg` y solo con puntero fino (`(hover: hover) and (pointer: fine)`).
- Al entrar el cursor, la slide activa escala a `2`. El `transform-origin` sigue al puntero, de modo que la zona bajo el cursor es la que se ve ampliada.
- Al salir, la foto vuelve a `scale(1)` con origen centrado.
- Reemplaza el `lg:group-hover:scale-[1.03]` actual.
- La transición de entrada y salida usa `ease-out-expo`. Con `prefers-reduced-motion: reduce` la lupa funciona, sin transición.
- El `overflow-hidden` del contenedor recorta la foto ampliada. La etiqueta de descuento, el botón de la lupa y las flechas quedan encima y no se amplían.
- Cambiar de foto (flechas, miniaturas o teclado) con el cursor encima mantiene la lupa sobre la foto nueva.
- En móvil y tablet no hay lupa: el gesto de deslizar y el botón "Ampliar imagen" siguen igual.

## Modelo de datos

Esta spec no introduce estructuras nuevas. Reduce dos existentes en `src/utils/catalog/types.ts`:

```ts
rank: { destacados: number; "mas-vendidos": number };

export const SORT_OPTIONS = [
  { key: "destacados", label: "Destacados" },
  { key: "mas-vendidos", label: "Más vendidos" },
  { key: "precio-asc", label: "Precio: menor a mayor" },
  { key: "precio-desc", label: "Precio: mayor a menor" },
  { key: "descuento", label: "Mayor descuento" },
  { key: "a-z", label: "Alfabético, A–Z" },
] as const;

export const DEFAULT_MOBILE_SORT_KEYS: SortKey[] = ["destacados", "mas-vendidos", "descuento"];
```

Cambios de contenido:

```json
// src/content/home/index.json
{ "products": { "eyebrow": "" }, "results": { "eyebrow": "" } }

// src/content/shop/index.json
{ "catalog": { "mobileSortOptions": ["destacados", "mas-vendidos", "descuento"] } }
```

Convenciones:

- `SortKey` se deriva de `SORT_OPTIONS`: al quitar la opción, TypeScript marca cada uso de `novedades` que quede.
- `tina/collections/shop.ts` pierde la opción `novedades` de `mobileSortOptions`. Su descripción pasa a "Sin ninguna marcada se muestran Destacados, Más vendidos y Mayor descuento."
- El schema de `home` no cambia.

## Plan de implementación

1. **Eyebrows.** Vaciar `products.eyebrow` y `results.eyebrow` en `src/content/home/index.json`. Verificar la home a 390px y 1440px.
2. **Letra "e".** Extraer el trazo de la "e" de Playfair Display Italic, reemplazar `path` y `viewBox` en `PlayfairLetterE` y subir la opacidad a `.18`. Verificar a 390px, 1024px y 1440px que la letra se ve entera.
3. **Ondas de WhatsApp.** Agregar `whatsapp-pulse` a `tailwind.config.mjs` y las dos ondas a `WhatsAppButton.astro`. Verificar en la home, en una ficha con barra de compra y con movimiento reducido activado.
4. **Título del banner.** Cambiar las tres clases del `<h1>` en `ShopBannerReact.tsx`. Verificar `/productos` y una categoría a 390px, 768px, 1024px y 1440px.
5. **Orden "Novedades": código.** Quitar la opción de `SORT_OPTIONS`, el campo `novedades` de `rank`, el comparador de `applyFilters.ts`, y `newestRank` de `src/lib/woo/catalog.ts`. Actualizar `DEFAULT_MOBILE_SORT_KEYS`.
6. **Orden "Novedades": CMS y contenido.** Quitar la opción y ajustar la descripción en `tina/collections/shop.ts`. Actualizar `mobileSortOptions` en `src/content/shop/index.json`. Borrar el enlace del mega-menú en `src/content/global/index.json`.
7. **Cierre de la galería ampliada.** Ajustar el tamaño del `<img>` y agregar el cierre por clic en el fondo en `ProductZoom.tsx`.
8. **Lupa.** Agregar el seguimiento del puntero y el escalado 2x en `ProductGalleryReact.tsx`, y quitar `lg:group-hover:scale-[1.03]`.
9. **Cierre.** Correr `npm run build` para regenerar `tina/__generated__/` y `tina/tina-lock.json`. Actualizar `CLAUDE.md`: lista de valores de `orden` y descripción de la ficha.

## Criterios de aceptación

- [ ] En la home, la sección de productos destacados no muestra "— Skincare" y la de resultados no muestra "— Resultados".
- [ ] En la home siguen visibles los eyebrows "— Servicios", "— Nuestra esencia", "— Skin Journal" y "— Reserva una cita".
- [ ] En `/admin` → Home, escribir un texto en el eyebrow de Productos lo muestra en la vista previa.
- [ ] La "e" de Reserva una cita es itálica y su color computado tiene opacidad `0.18`.
- [ ] A 390px, 1024px y 1440px, la "e" se ve completa: la sección no la corta por ningún borde.
- [ ] `BookingReact.tsx` no importa ninguna fuente y `package.json` no gana dependencias.
- [ ] El botón de WhatsApp muestra dos ondas que se expanden y desvanecen en bucle, desfasadas entre sí.
- [ ] Con `prefers-reduced-motion: reduce`, el botón de WhatsApp se ve sin ondas.
- [ ] Hacer clic en la zona de las ondas, fuera del círculo del botón, no abre WhatsApp.
- [ ] Con el carrito abierto, el botón de WhatsApp y sus ondas no se ven.
- [ ] A 1440px, el `<h1>` de `/productos` tiene un `font-size` computado de 60px.
- [ ] A 390px, el `<h1>` de `/productos` tiene un `font-size` computado de 40px.
- [ ] A 1440px, el `<h1>` de `/productos/categoria/<slug>` mide también 60px.
- [ ] A 1440px, "Ordenar por" ofrece exactamente seis opciones y ninguna es "Novedades".
- [ ] A 390px, el drawer de filtros ofrece exactamente tres opciones de orden: Destacados, Más vendidos y Mayor descuento.
- [ ] `/productos?orden=novedades` muestra el catálogo con "Destacados" seleccionado.
- [ ] El mega-menú de Productos no muestra el enlace "Novedades".
- [ ] En `/admin` → Tienda, "Opciones de orden en móvil" no lista "Novedades".
- [ ] `grep -rn "novedades" src/utils src/lib src/components tina/collections src/content/shop src/content/global` no devuelve resultados.
- [ ] Un producto nuevo sigue mostrando la etiqueta "Nuevo" en su tarjeta.
- [ ] En la galería ampliada, hacer clic en el fondo, a un lado de la foto, la cierra.
- [ ] En la galería ampliada, hacer clic sobre la foto no la cierra.
- [ ] En la galería ampliada, los botones Anterior y Siguiente cambian de foto sin cerrarla.
- [ ] Tras cerrar la galería ampliada con un clic en el fondo, el foco queda en el botón "Ampliar imagen".
- [ ] La X y `Esc` siguen cerrando la galería ampliada.
- [ ] A 1440px, pasar el cursor sobre la foto principal de la ficha la amplía 2x y la zona visible sigue al puntero.
- [ ] Al sacar el cursor, la foto vuelve a su tamaño original.
- [ ] Con la lupa activa, la etiqueta de descuento y el botón "Ampliar imagen" conservan su tamaño y siguen siendo clicables.
- [ ] A 390px, tocar la foto de la ficha no la amplía y deslizar cambia de foto.
- [ ] La consola no muestra errores ni avisos de hidratación en la home, `/productos` y una ficha.
- [ ] `npm run build` termina sin errores.

## Decisiones

- **Sí:** una sola spec para las siete observaciones. Son ajustes chicos de la misma revisión, igual que SPEC 15 y SPEC 16.
- **Sí:** vaciar los dos eyebrows en el contenido. Los componentes ya ocultan el campo vacío y la editora puede volver a usarlo.
- **No:** eliminar el campo `eyebrow` del schema en esas secciones. Obliga a tocar schema y componentes para un cambio que es de contenido.
- **No:** quitar todos los eyebrows de la home. El cliente señaló solo dos.
- **Sí:** "e" en Playfair Display Italic. Pedido del cliente: "debe estar en itálica para que funcione".
- **Revierte SPEC 15:** allí se pasó de la "e" itálica de DM Sans a la recta de Playfair. Se conserva la familia y el SVG inline; cambia solo el estilo.
- **Sí:** opacidad 18%. "Más claro" se confirmó como "que se note más sobre el verde".
- **No:** opacidad editable en Tina. Es un ajuste de diseño, no de contenido.
- **Sí:** seguir con SVG inline. Cargar Playfair como fuente web para una sola letra no se justifica.
- **Sí:** ondas en bucle continuo, dos y desfasadas. Es el efecto habitual de los botones de WhatsApp y el que describe el cliente ("que salgan las onditas").
- **No:** ondas solo al cargar o cada varios segundos. No se pidió.
- **Sí:** ondas apagadas con movimiento reducido. Es una animación infinita y decorativa.
- **Sí:** título del banner en `heading-lg` solo desde `md`. La captura del cliente es de desktop.
- **No:** `heading-md`, ni bajar también el título en móvil. Descartado por el usuario.
- **Sí:** tamaño fijo en código, con un token existente. No se crea un token nuevo ni un campo en Tina.
- **Sí:** eliminar "Novedades" por completo, incluido el enlace del mega-menú. Elegido por el usuario: no queda un enlace hacia un orden que ya no existe.
- **No:** ocultarlo de los menús y mantener la URL funcionando. Dejaría código y un rango calculado en build sin uso visible.
- **Sí:** `?orden=novedades` cae en "Destacados" sin redirección. Es el trato que ya recibe cualquier valor desconocido.
- **Sí:** el drawer queda con tres órdenes por defecto. No se agregó otro para reemplazar a "Novedades".
- **Sí:** la galería ampliada se cierra con clic en cualquier zona fuera de la foto y de los controles. Pedido del cliente.
- **Sí:** achicar el `<img>` al tamaño de la foto en lugar de calcular si el clic cayó en el aire del `object-contain`. Es más simple y no depende de medir la imagen.
- **Sí:** lupa 2x que sigue al puntero, en la foto principal de la ficha. Elegido por el usuario.
- **No:** lupa dentro de la galería ampliada, ni un simple aumento del escalado de 1.03 a 1.10. Descartados por el usuario.
- **Sí:** lupa solo desde `lg` y con puntero fino. En pantallas táctiles no hay hover y el gesto es deslizar.
- **Definición rápida:** las secciones de alcance a riesgos se escribieron sin revisión intermedia, a pedido del usuario. Los valores de las ondas (2.4s, escala 1.8, opacidad .45) y el factor 2x de la lupa son propuestas no revisadas.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| La foto de la ficha se ve suave al 2x si el original de Woo es chico | Aceptado. Subir fotos de al menos 1600px en WooCommerce lo resuelve sin tocar código. |
| La lupa y el gesto de deslizar comparten los eventos de puntero del mismo contenedor | La lupa solo corre con puntero fino desde `lg`. El criterio de deslizar a 390px lo verifica. |
| Al cruzar `md`, el título del banner baja de 40px (767px) a 34px (768px) | Es el mínimo de `heading-lg`. En desktop el título va sobre la foto y necesita menos tamaño. Se verifica a 768px. |
| Un enlace externo o guardado con `?orden=novedades` deja de ordenar por fecha | Muestra el catálogo completo en "Destacados". No da error ni página vacía. |
| El contenido de TinaCloud conserva `novedades` en `mobileSortOptions` | `resolveMobileSortKeys` ya descarta valores desconocidos. El JSON se limpia en el mismo push. |
| El build de staging corre contra el índice de TinaCloud de la rama y el schema cambia | El schema y `tina-lock.json` van en el mismo push, como en SPEC 15 y 16. |
| Las ondas llaman demasiado la atención sobre fondos claros | Opacidad inicial de `.45` y desvanecido a `0`. Los valores viven en un solo `keyframes` y se ajustan ahí. |
| La "e" itálica es más ancha que la recta y puede acercarse al texto en anchos intermedios | Se verifica a 1024px. El alto y el anclaje no cambian; el `viewBox` se ajusta al glifo. |

## Lo que **no** entra en esta spec

- Los demás eyebrows de la home y de otras páginas.
- Eliminar el campo `eyebrow` del schema.
- Título del banner de `/productos` en móvil.
- Opacidad de la "e" o ondas de WhatsApp configurables en Tina.
- Cambios en la etiqueta "Nuevo" o en `shop.newProductDays`.
- Lupa en móvil o dentro de la galería ampliada.
- Fotos de producto de mayor resolución.

Cada una, si llega, va en su propia spec.

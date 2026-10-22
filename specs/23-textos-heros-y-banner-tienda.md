# SPEC 23 — Textos de los heros y banner nuevo de la tienda

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 07, SPEC 09, SPEC 22
> **Fecha:** 2026-10-22
> **Objetivo:** Cambiar las bajadas de los heros de la home, `/productos` y `/servicios`, y poner en el banner de la tienda una foto para desktop y otra para móvil.

## Por qué existe esta spec

El cliente entregó textos nuevos para tres heros y dos fotos para el banner de la tienda:

1. **Hero de la home.** Una bajada nueva para cada slide, en orden:
   1. "Marcas elegidas con criterio e ingredientes que cumplen, para tu rutina real."
   2. "Tratamientos faciales avanzados y depilación láser, con tecnología, ciencia y acompañamiento experto para tu piel."
   3. "Adriana Paradisi y su equipo te acompañan con honestidad, ciencia y cariño. Nuestra promesa: nunca venderte lo que no necesitas."
2. **Hero de productos.** "Marcas premium, elegidas con criterio, para una rutina honesta que se adapta a tu piel."
3. **Hero de servicios.** "Sin protocolos en serie: cada tratamiento parte de un análisis y un plan a tu medida."
4. **Banner de la tienda.** Una foto horizontal para desktop y otra vertical para móvil (productos sobre mármol claro).

## Alcance

**Entra:**

- **Home.** Reemplazar `text` de los tres slides de `home.hero.slides`. Títulos, botones e imágenes no cambian.
- **Productos.** Reemplazar `shop.hero.description`.
- **Servicios.** Reemplazar `services.header.text`. El título "Donde tu piel se siente en casa." no cambia.
- **Imagen móvil del banner.** Campo nuevo `shop.hero.imageMobile` ("Imagen en móvil"). `ShopBannerReact` sirve las dos imágenes con `<picture>`: `imageMobile` bajo `md`, `image` desde `md`. Sin `imageMobile` se usa `image` en todos los anchos.
- **Altura del banner en móvil.** Pasa de 220 px fijos a proporción 4:5 (`aspect-[4/5]`), para mostrar la foto vertical entera. Desde `md` la altura no cambia (`clamp(420px,38vw,560px)`).
- **Bajada visible en móvil.** `hero.description` se muestra también bajo `md`, debajo del título, en `text-body-sm` y `text-content-subtle`, sin recortar. Desde `md` conserva su estilo y su posición actuales.
- **Archivos.** Mover las fotos entregadas a:
  - `public/uploads/home/Línea de skincare sobre mármol luminoso.webp` → `public/uploads/productos/linea-de-skincare-sobre-marmol-luminoso.webp` (desktop, 1774×887).
  - `public/uploads/home/Colección de cuidado facial botánico.webp` → `public/uploads/productos/coleccion-de-cuidado-facial-botanico.webp` (móvil, 1122×1402).
- Actualizar `CLAUDE.md` (colección `shop`: `hero.imageMobile`).

**Fuera de alcance (para futuras specs):**

- Cambiar títulos, botones o fotos del hero de la home.
- Imagen móvil en el hero de `/servicios` o de `/nosotras`.
- Un encuadre (`focus`) editable para el banner de la tienda.
- Un banner distinto por categoría en `/productos/categoria/<slug>`. Esas páginas usan las mismas dos fotos.
- Borrar `public/uploads/productos/banner.jpg`: lo usa como portada `src/content/blog/aceites-faciales.mdx` (ver Decisiones).

## Modelo de datos

Un campo nuevo en Tina:

```ts
// tina/collections/shop.ts → hero
{
  name: "imageMobile",
  label: "Imagen en móvil",
  description: "Opcional. Vertical 4:5, p. ej. 1122×1402. Sin ella se usa la imagen principal.",
  type: "image",
}
```

Contenido que cambia:

- `src/content/home/index.json`: `hero.slides[0..2].text`.
- `src/content/shop/index.json`: `hero.description`, `hero.image: "/uploads/productos/linea-de-skincare-sobre-marmol-luminoso.webp"`, `hero.imageMobile: "/uploads/productos/coleccion-de-cuidado-facial-botanico.webp"`.
- `src/content/services/index.json`: `header.text`.

Convenciones:

- `imageMobile` pasa por `mediaUrl()`, igual que `image`.
- `imageAlt` es el mismo para las dos imágenes.

## Plan de implementación

Cada paso deja el sitio compilando y se puede commitear solo. La rama sale de `staging`: `feat/textos-heros-y-banner-tienda`.

1. **Textos.** Reemplazar los tres `text` de `src/content/home/index.json`, `hero.description` de `src/content/shop/index.json` y `header.text` de `src/content/services/index.json` con los textos de "Por qué existe esta spec". Prueba: los tres heros muestran el texto nuevo.
2. **Archivos.** Mover las dos fotos (aún no están en git) a `public/uploads/productos/linea-de-skincare-sobre-marmol-luminoso.webp` y `coleccion-de-cuidado-facial-botanico.webp`. Apuntar `hero.image` a `linea-de-skincare-sobre-marmol-luminoso.webp`.
3. **Campo `imageMobile`.** Agregarlo a `tina/collections/shop.ts` después de `image`, escribir `hero.imageMobile` en `src/content/shop/index.json` y regenerar `tina/__generated__/` con el build.
4. **`<picture>` en el banner.** En `ShopBannerReact.tsx`, envolver la imagen en `<picture>` con un `<source media="(max-width: 767px)">` cuando haya `imageMobile`. El `<img>` conserva `fetchPriority="high"`, `alt` y `data-tina-field` de `image`; el `<source>` no lleva `data-tina-field`, para que el clic en el editor siga abriendo el campo principal.
5. **Altura en móvil.** Reemplazar `h-[220px]` por `aspect-[4/5]` bajo `md` y conservar `md:h-[clamp(420px,38vw,560px)]` (con `md:aspect-auto`). El encuadre `[object-position:50%_62%]` pasa a aplicar solo desde `md`; en móvil queda centrado.
6. **Bajada en móvil.** Quitar `hidden` de la descripción y darle `text-body-sm text-content-subtle` bajo `md`, y `md:text-body-md md:text-content-muted` desde `md`. Se pinta después del bloque del título, como hoy.
7. **Documentación.** En `CLAUDE.md`, en la colección `shop`: "cabecera (con `hero.titleMobile` para el título y `hero.imageMobile` para la foto bajo `md`)".

## Criterios de aceptación

**Textos**

- [ ] Los tres slides de la home muestran, en orden, las bajadas nuevas, palabra por palabra.
- [ ] Los títulos y botones de los slides no cambian.
- [ ] `/productos` muestra "Marcas premium, elegidas con criterio, para una rutina honesta que se adapta a tu piel."
- [ ] `/servicios` muestra "Sin protocolos en serie: cada tratamiento parte de un análisis y un plan a tu medida." bajo el mismo título de siempre.

**Banner de la tienda**

- [ ] En 1440 px, `/productos` muestra `linea-de-skincare-sobre-marmol-luminoso.webp` con la misma altura que antes.
- [ ] En 375 px, `/productos` muestra `coleccion-de-cuidado-facial-botanico.webp` entera, en proporción 4:5 (unos 469 px de alto), sin recortar los productos.
- [ ] En 375 px, el navegador descarga `coleccion-de-cuidado-facial-botanico.webp` y no `linea-de-skincare-sobre-marmol-luminoso.webp` (pestaña Red).
- [ ] Las páginas `/productos/categoria/<slug>` muestran las mismas fotos en los mismos anchos.
- [ ] Vaciar `imageMobile` en `/admin` hace que móvil use `linea-de-skincare-sobre-marmol-luminoso.webp`, sin romper el layout.
- [ ] El campo "Imagen en móvil" aparece en el Banner de la tienda en `/admin`.
- [ ] En 375 px, la bajada se ve bajo el título en 15 px y color `content-subtle`.
- [ ] Desde `md`, la bajada se ve igual que antes (16 px, `content-muted`, a la derecha).
- [ ] `public/uploads/home/` ya no contiene las dos fotos con tildes y espacios en el nombre.
- [ ] La portada de `/skin-journal/aceites-faciales` sigue cargando (`banner.jpg` existe).
- [ ] `npm run build` termina sin errores.

## Decisiones tomadas y descartadas

- **Una foto para desktop y otra para móvil (tomada).** Mismo patrón que `imageMobile` del hero de la home. Se descartaron usar una foto para `/productos` y otra para las categorías, y un carrusel de dos fotos.
- **Banner móvil en 4:5 (tomada).** La foto entregada es vertical; con 220 px solo se vería una franja y los productos quedarían recortados. Se descartaron 320 px con encuadre ajustado y conservar 220 px.
- **Bajada visible en móvil, pero discreta (tomada).** `body-sm` + `content-subtle`, sin `line-clamp`: es una sola oración y recortarla perdería el sentido. Se descartó `caption-md` (13 px) por legibilidad.
- **Renombrar las fotos en kebab case (tomada).** Se conserva el nombre descriptivo de cada foto, en minúsculas, sin tildes y con guiones: los nombres con tildes y espacios dan problemas en URLs y en el servidor. Van a `uploads/productos/` junto al banner que reemplazan.
- **Conservar `banner.jpg` (tomada).** Se acordó borrarlo, pero al revisar el repo apareció como `coverImage` de `src/content/blog/aceites-faciales.mdx`. Borrarlo rompería esa portada; se queda hasta que el artículo tenga foto propia.
- **Sin `data-tina-field` en el `<source>` (tomada).** El editor visual solo resuelve un campo por elemento; el clic en la foto abre "Imagen" y "Imagen en móvil" queda a un paso en el mismo formulario.
- **Sin `focus` editable para el banner (descartada por ahora).** Las dos fotos están compuestas para su formato; no hace falta encuadre fino.

## Riesgos identificados

- **Más alto en móvil empuja el catálogo hacia abajo.** El banner pasa de 220 a unos 470 px en 375 px de ancho; el primer producto queda fuera de la primera pantalla. Si el cliente lo nota, la salida es bajar a 4:4 o recortar la foto, sin cambiar código más allá de la proporción.
- **Fotos futuras con otra proporción.** Si el cliente sube una `imageMobile` horizontal, el contenedor 4:5 la recortará por los lados. La descripción del campo indica la proporción.

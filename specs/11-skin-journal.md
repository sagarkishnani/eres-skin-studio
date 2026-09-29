# SPEC 11 — Skin Journal: listado y artículo

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 03, SPEC 04, SPEC 05, SPEC 09, SPEC 10
> **Fecha:** 2026-09-29
> **Objetivo:** Rehacer el blog como Skin Journal en `/skin-journal` y `/skin-journal/<slug>` según las pantallas `journal` y `post` de la referencia de diseño, con categoría y etiquetas por post, filtrado en el navegador y contenido editable desde el CMS.

## Por qué existe esta spec

El blog actual es la plantilla del starter:

- vive en `/blog`, pero el footer enlaza a `/skin-journal`, que da 404;
- usa colores fuera de tema (`bg-accent/15`, `rounded-full`, `prose-a:text-sage-500`);
- no tiene hero, pestañas ni navegación entre artículos;
- el schema mezcla categoría y etiquetas en un solo campo `tags` con opciones que no son las de la referencia;
- los 3 MDX repiten el extracto como primer párrafo.

La referencia (`Eres Skin Studio (2).html`, pantallas `journal` y `post`) define:

- **listado:** miga, título, bajada, un post destacado a pantalla ancha, pestañas por categoría y una grilla de tarjetas;
- **artículo:** barra de progreso, cabecera centrada con fecha, título y "Por {autora} · en {categoría} · {lectura}", lead, imagen ancha, cuerpo, cita, etiquetas, "Compartir" y Anterior / Siguiente.

## Referencia de diseño (valores extraídos del bundle)

Breakpoints de SPEC 05:

- **móvil:** `< md` (768px);
- **tablet:** `md` a `lg`;
- **desktop:** `≥ lg` (1024px).

| Hex del bundle | Token |
|---|---|
| `#FFFFFF` | `bg-surface-raised` |
| `#F0F0EC` (fondo de imagen) | `bg-stone-100` |
| `#EEEAE3` (línea bajo pestañas) | `border-stone-150` |
| `#E4E0D8` / `#D9D6CF` | `border-line` / `bg-line-strong` (separadores) |
| `#4E5E55` (barra de progreso) | `bg-sage-700` |
| `#2E3A33` (fondo del hero) | `bg-accent` |
| `#1D1D1B` / `#3A3A36` / `#6B6A66` | `content` / `content-muted` / `content-subtle` |
| `rgba(29,29,27,…)` (scrim del hero) | `ink/…` |

El subrayado animado de los enlaces es el de SPEC 10: `background-size` de 1px, de 0 a 100%, en 500ms `ease-out-expo`. En esta spec se llama "subrayado animado".

### 1. Listado — cabecera (`/skin-journal`)

- Sección `bg-surface-raised`, con padding superior `clamp(24px,4vw,48px)` y sin padding inferior. El offset del header se resuelve como en las demás páginas.
- Bloque centrado en `container-xl`, en columna, con gap de 16px:
  - **Miga:** "Home › Skin Journal". Usa `caption-md` y `text-content-muted`, con un chevron de 12px. El último ítem va en `text-content` y "Home" lleva el subrayado animado.
  - **H1:** `journal.title`, en peso 400, `clamp(44px,6vw,88px)`, `leading-none` y tracking `-.045em`. Margen superior `clamp(16px,3vw,40px)`. Lleva `data-reveal="0"`.
  - **Bajada:** `journal.intro`, en `body-md` (16px), `leading-[1.65]`, `text-content-muted`, `max-w-[520px]` y `text-pretty`. Lleva `data-reveal="80"`.
- **Hero destacado:** en `container-xl`, con margen superior `clamp(32px,5vw,64px)` y `data-reveal="120"`.
  - Es un enlace `relative block overflow-hidden bg-accent text-content-inverse`. Mide 460px de alto en móvil y `min(72vh,640px)` desde `md`.
  - La imagen de portada va en `absolute inset-0 object-cover`. En hover (solo `lg`) hace `scale(1.04)` en 1600ms `ease-out-expo`.
  - Scrim: `linear-gradient(180deg, ink/5% 30%, ink/62% 100%)`.
  - El contenido va abajo, centrado, con padding `clamp(28px,5vw,64px) 24px` y gap de 16px:
    - la meta "{fecha} · {categoría}" en 14px;
    - el título en `clamp(28px,4vw,56px)`, `leading-[1.06]`, tracking `-.035em`, `max-w-[860px]` y `text-balance`;
    - el botón "Leer artículo →", de 52px de alto, `px-[30px]`, `bg-surface-raised text-content`, `caption-md` peso 500, tracking `.14em` y mayúsculas. En hover lo rellena de abajo hacia arriba un fondo `ink`: el texto pasa a `content-inverse` y el gap de la flecha va de 12 a 18px, en 550ms `ease-out-expo`.

### 2. Listado — pestañas y grilla

- Sección `bg-surface-raised`, con padding `clamp(36px,5vw,64px) 0 clamp(64px,8vw,120px)`, en `container-xl`.
- **Pestañas:** "Todos", "Cuidado", "Rutina", "Ingredientes" y "Tratamientos".
  - Van en una fila `overflow-x-auto` sin scrollbar, con `border-b border-stone-150`.
  - **Móvil:** alineadas a la izquierda con gap de 28px. **Desde `md`:** centradas con gap de 48px.
  - Cada pestaña es un `button` de 52px de alto, en 16px y `shrink-0`.
  - **Activa:** `text-content`, con el subrayado a 100% y `aria-pressed="true"`.
  - **Inactiva:** `text-content-subtle`, con el subrayado animado en hover.
- **Línea de etiqueta:** solo con `?etiqueta=`. Va sobre la grilla y dice "Etiqueta: {nombre} ×" en `body-sm`. La ✕ es un botón de 44px con `aria-label="Quitar etiqueta"`.
- **Grilla:** margen superior `clamp(32px,4vw,56px)`.
  - **Móvil:** 1 columna con gap de 44px.
  - **Tablet:** 2 columnas con gap `56px 32px`.
  - **Desktop:** 3 columnas con gap `56px 32px`.
  - Al cambiar de filtro, la grilla baja a opacidad 0 y `translateY(12px)` en 280ms. Después se reemplaza el contenido y vuelve a opacidad 1 y `translateY(0)`: opacidad en 350ms y posición en 500ms `ease-out-expo`.
- **Tarjeta:** es un enlace en columna con gap de 12px y `min-w-0`, con `data-reveal` de `(i % 3) × 90` ms (0 en tablet).
  - **Imagen:** `aspect-[16/10]` en móvil y `aspect-[4/3]` desde `md`, `overflow-hidden bg-stone-100` y `mb-2`. En hover (`lg`) hace `scale(1.05)` en 1400ms `ease-out-expo`.
  - **Meta:** "{fecha} · {categoría}", en `caption-md` y `text-content-subtle`.
  - **Título:** 22px en móvil y `clamp(22px,1.9vw,28px)` desde `md`, `leading-[1.2]`, tracking `-.02em` y `text-balance`. Lleva el subrayado animado en hover, en 600ms.
  - **Extracto:** `body-sm` (15px), `leading-[1.6]`, `text-content-muted` y `line-clamp-2`.
  - **CTA:** "Leer más →", en `body-sm` peso 500, `border-b border-ink`, `pb-1` y `self-start`. En hover el gap va de 8 a 14px.
- **Vacío:** `journal.emptyText` centrado, en `body-md` y `text-content-muted`, con `py-12`.

### 3. Artículo (`/skin-journal/<slug>`)

- **Barra de progreso:** `fixed` arriba, de 2px, `bg-sage-700`, `z-[60]` y `origin-left`. Hace `scaleX(p)`, donde `p` es lo que se ha avanzado por el `<article>`, entre 0 y 1.
- `<article>` `bg-surface-raised`, con padding `clamp(24px,4vw,48px) 0 clamp(56px,7vw,96px)`.
- **Cabecera:** centrada, `max-w-[920px]`, con padding horizontal `clamp(20px,5vw,40px)` y gap de 18px.
  - **Miga:** "Home › Skin Journal", ambos como enlaces con el subrayado animado.
  - **Fecha:** en `body-sm` y `text-content`, con margen superior `clamp(12px,3vw,32px)`. Lleva `data-reveal="0"`.
  - **H1:** peso 400, `clamp(34px,4.6vw,64px)`, `leading-[1.04]`, tracking `-.04em` y `text-balance`. Lleva `data-reveal="60"`.
  - **Meta:** "Por {autora} | en {categoría} | {N} min de lectura", con `data-reveal="120"`.
    - Va en `body-sm`, `text-content-muted`, `flex-wrap` y gap `8px 16px`.
    - Los separadores son de 1×16px en `bg-line-strong`.
    - La categoría es un enlace a `/skin-journal?categoria=<slug>`, en `text-content` y subrayado siempre.
    - Si falta la autora o el tiempo de lectura, ese ítem y su separador no se muestran.
- **Lead:** el `excerpt`, en `max-w-container-text` (760px) con margen superior `clamp(36px,5vw,64px)`. Tamaño `clamp(18px,1.6vw,21px)`, `leading-[1.6]` y `text-content`.
- **Imagen:** en `max-w-container-lg` (1200px), con margen vertical `clamp(36px,5vw,64px)`.
  - **Móvil:** a sangre (sin padding) en `aspect-[4/3]`.
  - **Desde `md`:** con padding `clamp(20px,5vw,72px)` en `aspect-video`.
  - Va en `bg-stone-100`, con `object-cover` y `data-reveal="0"`. Sin portada, este bloque no se renderiza.
- **Cuerpo:** el MDX en 760px, con padding horizontal `clamp(20px,5vw,40px)`, en columna y gap de 22px.
  - Párrafos en 17px (`body-lg`), `leading-[1.75]`, `text-content-muted` y `text-pretty`.
  - H2 en peso 400, `clamp(22px,2vw,28px)`, tracking `-.02em`, `leading-[1.2]` y margen `18px 0 -6px`.
  - **Cita (`>`):** `my-[20px_8px]` y `py-7`, con `border-t border-ink` y `border-b border-line`. Tamaño `clamp(22px,2.2vw,30px)`, `leading-[1.3]`, peso 300, itálica, tracking `-.015em`, `text-content` y `text-balance`. Se envuelve entre «».
  - Enlaces en `text-accent`, subrayados. Listas con viñetas `line-strong`.
- **Pie del artículo:** en la misma columna de 760px, con margen superior de 16px, `flex-wrap justify-between` y gap de 16px.
  - **Etiquetas:** el rótulo "Etiquetas:" en `body-sm text-content`, y después un enlace por etiqueta a `/skin-journal?etiqueta=<slug>`.
    - Cada enlace mide 38px de alto, con `px-4`, `border border-ink` y 14px.
    - En hover pasa a `bg-ink text-content-inverse` en 350ms.
  - **Compartir:** botón con un icono de flecha de 18px y el texto "Compartir" con el subrayado animado.
    - En móvil usa `navigator.share` si existe.
    - Si no, copia la URL y cambia el texto a "Enlace copiado" durante 2s.
- **Anterior / Siguiente:** `border-t border-line`, con margen superior de 28px, `pt-8` y 2 columnas con gap de 24px.
  - **Rótulo:** "‹ Anterior" / "Siguiente ›", en 14px y `text-content-muted`.
  - **Título:** 17px en móvil y 22px desde `md`, `leading-[1.25]`, tracking `-.015em` y `text-balance`, con el subrayado animado.
  - La columna derecha va alineada a la derecha.

### 4. Motion y accesibilidad

- Con `prefers-reduced-motion` no hay escala de imágenes, transición de grilla ni animación de subrayados. La barra de progreso sigue funcionando porque no es decorativa.
- Las pestañas son `button`, dentro de un `role="group"` con `aria-label="Filtrar por categoría"`.
- La barra de progreso lleva `aria-hidden="true"`.

## Alcance

**Entra:**

- Nuevas rutas `/skin-journal` y `/skin-journal/<slug>`. Se eliminan `src/pages/blog/`.
- Redirecciones 301 en `public/.htaccess`:
  - `/blog` y `/blog/` → `/skin-journal/`;
  - `/blog/<slug>` → `/skin-journal/<slug>/`.
- Schema de `post`:
  - campo nuevo `category` (una sola, obligatoria, con las opciones Cuidado, Rutina, Ingredientes y Tratamientos);
  - `tags` pasa a ser una lista libre de strings.
- Nueva colección singleton `journal` (`src/content/journal/index.json`) con los textos del listado y su SEO.
- Isla `JournalListReact` para filtrar por `?categoria=` y `?etiqueta=` en el navegador.
- Isla `PostProgressReact` (barra de progreso) e isla `ShareButtonReact` (compartir).
- Cuerpo MDX con el estilo de la referencia, incluida la cita.
- Anterior / Siguiente cronológico y circular, oculto si hay un solo post.
- JSON-LD `BlogPosting` en cada artículo.
- Migración de los 3 MDX existentes a `category` y a las etiquetas de la referencia, quitando el primer párrafo, que duplica el extracto.
- 4 MDX nuevos con los textos de la referencia (p4–p7) y sus imágenes existentes en `public/uploads/home/`.
- Enlaces actualizados:
  - la sección Journal de la home enlaza a `/skin-journal/<slug>` y muestra la categoría;
  - el `ctaUrl` de la home y el enlace "Skin Journal" del nav pasan a `/skin-journal`;
  - `search-index.json.ts` indexa `/skin-journal/<slug>`.
- `CLAUDE.md` documenta el Skin Journal y la colección `journal`.

**Fuera de alcance (para specs futuras):**

- Paginación del listado. Se asume que habrá menos de ~30 posts en el corto plazo.
- Buscador propio del journal. Ya existe el buscador global.
- Páginas estáticas por categoría o por etiqueta.
- Versión en inglés (`title_en`, `excerpt_en`, `body_en` quedan como están, sin usarse en el diseño).
- Imagen insertada automáticamente después del primer bloque del cuerpo, como en la referencia.
- Comentarios, newsletter y posts relacionados.
- Componentes MDX a medida (galerías, CTA de producto dentro del post).

## Modelo de datos

### `tina/collections/post.ts`

```ts
export const JOURNAL_CATEGORIES = ["Cuidado", "Rutina", "Ingredientes", "Tratamientos"] as const;

// campos que cambian
{ name: "category", label: "Categoría", type: "string", required: true, options: [...JOURNAL_CATEGORIES] },
{ name: "tags", label: "Etiquetas", type: "string", list: true }, // libre, sin options
```

`BLOG_TAG_OPTIONS` desaparece. El resto de los campos (`title`, `excerpt`, `coverImage`, `date`, `readTime`, `author`, `featured`, `body` y los `_en`) no cambia.

### Frontmatter de un post

```yaml
title: 'Hidratar vs humectar: la diferencia que puede cambiar tu rutina'
excerpt: Suenan parecido, pero no hacen lo mismo. …
coverImage: /uploads/blog/blog-roller.jpg
date: '2026-09-16T12:00:00.000Z'
readTime: 4 min
author: Adriana Paradisi
category: Cuidado
tags:
  - Cuidado
  - Hidratación
  - Ingredientes
featured: false
```

`readTime` se muestra como "{readTime} de lectura".

### `tina/collections/journal.ts` → `src/content/journal/index.json`

```json
{
  "title": "Skin Journal",
  "intro": "Guías honestas, rutinas reales y todo lo que aprendemos cuidando pieles en el estudio.",
  "emptyText": "Pronto publicaremos artículos en esta categoría.",
  "seo": { "title": "Skin Journal — ERES Skin Studio", "description": "…" }
}
```

Es una colección singleton (`allowedActions: { create: false, delete: false }`) y usa `seoField` de `tina/collections/fields.ts`, igual que `shop`.

### Slugs de filtro

- `toFilterSlug(label)` hace minúsculas, quita tildes y cambia los espacios por guiones. Por ejemplo, "Depilación láser" queda como `depilacion-laser`.
- `?categoria=` y `?etiqueta=` comparan contra ese slug.
- Un valor desconocido se ignora: equivale a "Todos".

### Props de la isla del listado

```ts
interface JournalCard {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  categorySlug: string;
  tagSlugs: string[];
  tagLabels: Record<string, string>;
}

interface Props {
  posts: JournalCard[];
  featuredSlug: string;
  categories: { label: string; slug: string }[];
  emptyText: string;
}
```

### Orden y selección

- **Orden:** `date` descendente.
- **Destacado:** el más reciente con `featured: true`. Si no hay ninguno, el más reciente.
- **Grilla:**
  - en "Todos" sin etiqueta: todos menos el destacado;
  - con categoría o etiqueta: todos los que coinciden, incluido el destacado.
- **Anterior / Siguiente:** vecinos en el orden por fecha. Anterior es el más reciente y Siguiente el más antiguo, con vuelta al otro extremo.

### Fechas

Se reutiliza `formatShortDate` de `src/utils/formatDate.ts` ("16 sep 2026"). Así el journal coincide con la home, aunque la referencia escriba "16 sep, 2026".

### JSON-LD

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "…",
  "description": "{excerpt}",
  "image": "{URL absoluta de la portada}",
  "datePublished": "{date}",
  "author": { "@type": "Person", "name": "{author}" },
  "publisher": { "@type": "Organization", "name": "ERES Skin Studio" },
  "mainEntityOfPage": "{URL canónica}",
  "articleSection": "{category}",
  "keywords": "{tags unidas por coma}"
}
```

## Plan de implementación

1. **Schema y contenido.**
   - Agregar `category` y liberar `tags` en `tina/collections/post.ts`.
   - Migrar los 3 MDX: agregar `category` y las etiquetas de la referencia, y quitar el primer párrafo duplicado.
   - Ajustar `Journal.astro` de la home para que lea `category` en vez de `tags[0]`.
   - Verificación: `npm run build` pasa.
2. **Colección `journal`.**
   - Crear `tina/collections/journal.ts`, registrarla en `tina/config.ts` y crear `src/content/journal/index.json`.
   - Verificación: se edita en `/admin`.
3. **Helpers.**
   - Crear `src/utils/journal.ts` con `toFilterSlug`, `getSortedPosts()`, `pickFeatured()` y `getAdjacentPosts()`.
   - Verificación: se importan sin romper el build.
4. **Artículo sin islas.**
   - Crear `src/pages/skin-journal/[slug].astro`: cabecera, lead, imagen, cuerpo, etiquetas, anterior / siguiente y JSON-LD.
   - Dar estilo al cuerpo en `PostBody.tsx` con componentes de `TinaMarkdown` (`p`, `h2`, `h3`, `blockquote`, `a`, `ul`, `ol`), sin `prose`.
5. **Islas del artículo.**
   - `PostProgressReact.tsx` con `client:idle`.
   - `ShareButtonReact.tsx` con `client:visible`, reutilizando la lógica de compartir de SPEC 10 si ya está extraída; si no, se extrae a `src/utils/share.ts`.
6. **Listado estático.**
   - Crear `src/pages/skin-journal/index.astro` con la cabecera y el hero, y `JournalListReact.tsx` renderizando la grilla completa sin filtrar (vista "Todos").
7. **Filtrado.**
   - Pestañas, línea de etiqueta, lectura y escritura de `?categoria=` y `?etiqueta=` con `history.replaceState`, transición de grilla y estado vacío.
   - La página no usa `ClientRouter`, como en SPEC 09.
8. **Contenido nuevo.**
   - Crear los 4 MDX de la referencia (p4–p7) con sus textos, categoría, etiquetas y portada:
     - `aceites-faciales.mdx` → `/uploads/productos/banner.jpg`;
     - `limpieza-facial-profesional.mdx` → `/uploads/home/svc-limpieza.webp`;
     - `radiofrecuencia-facial.mdx` → `/uploads/home/svc-tratamiento.webp`;
     - `depilacion-laser-mitos.mdx` → `/uploads/home/svc-depilacion.webp`.
9. **Rutas viejas y enlaces.**
   - Borrar `src/pages/blog/` y agregar las redirecciones en `public/.htaccess`.
   - Actualizar `href` en `Journal.astro`, `ctaUrl` en `src/content/home/index.json`, la URL del nav en `src/content/global/index.json` y la URL de `search-index.json.ts`.
10. **Documentación.**
    - Actualizar `CLAUDE.md`: la colección `journal`, `category` y `tags` en `post`, las rutas y los parámetros de filtro.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores y genera `/skin-journal/index.html` y una página por cada uno de los 7 posts.
- [ ] `/blog` y `/blog/hidratar-vs-humectar` responden 301 hacia `/skin-journal/` y `/skin-journal/hidratar-vs-humectar/`.
- [ ] El enlace "Skin journal" del footer, "Skin Journal" del nav y el CTA de la home llevan a `/skin-journal` sin 404.
- [ ] El hero muestra "Perimenopausia y piel", porque tiene `featured: true`. Con `featured: false` en todos, muestra el post más reciente.
- [ ] En "Todos" la grilla muestra 6 tarjetas y no repite el post del hero.
- [ ] La grilla tiene 1 columna a 360px, 2 a 768px y 3 a 1024px.
- [ ] Elegir "Tratamientos" muestra 3 tarjetas, cambia la URL a `?categoria=tratamientos` y no recarga la página.
- [ ] Abrir `/skin-journal?categoria=rutina` directamente deja "Rutina" activa y muestra el post del hero en la grilla.
- [ ] `/skin-journal?categoria=inexistente` se ve igual que "Todos".
- [ ] Una categoría sin posts muestra "Pronto publicaremos artículos en esta categoría.".
- [ ] En un post, el enlace de una etiqueta lleva a `/skin-journal?etiqueta=<slug>` y muestra solo los posts con esa etiqueta, más la línea "Etiqueta: {nombre} ×".
- [ ] Pulsar la ✕ o una pestaña quita `etiqueta` de la URL.
- [ ] El enlace de categoría en la meta del post lleva al listado con esa pestaña activa.
- [ ] La barra de progreso está en 0 al abrir el post y llega a 1 al final del artículo.
- [ ] En desktop, "Compartir" copia la URL y muestra "Enlace copiado". En móvil abre la hoja nativa.
- [ ] Anterior / Siguiente del post más reciente enlaza al más antiguo como "Anterior" y al siguiente por fecha como "Siguiente".
- [ ] Con un solo post publicado, el bloque Anterior / Siguiente no aparece.
- [ ] Una cita `>` del MDX se muestra con borde superior `ink`, borde inferior `line`, itálica 300 y entre «».
- [ ] Ningún MDX repite el extracto como primer párrafo del cuerpo.
- [ ] Un post sin `coverImage` no deja un hueco gris en lugar de la imagen.
- [ ] El JSON-LD de un post pasa el Rich Results Test de Google como `Article` sin errores.
- [ ] El buscador global devuelve resultados del journal con URL `/skin-journal/<slug>`.
- [ ] Editar `journal.intro` en `/admin` y reconstruir cambia la bajada del listado.
- [ ] Un post nuevo creado en `/admin` exige elegir categoría.
- [ ] No hay scroll horizontal a 360, 768, 1024 ni 1440px.
- [ ] `grep -rn "text-white\|bg-white\|rounded-lg\|prose" src/pages/skin-journal src/components/blog` no devuelve nada.
- [ ] Con `prefers-reduced-motion` no hay zoom de imágenes ni transición de grilla.
- [ ] Las pestañas y los enlaces se pueden usar con teclado, y la pestaña activa lleva `aria-pressed="true"`.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario, las secciones posteriores a la cabecera no se revisaron una por una. Se asumieron a partir de sus respuestas y de la referencia.
- **Sí: `/skin-journal` con 301 desde `/blog`.** Es el nombre de marca del apartado, y el footer ya apuntaba ahí.
- **No: quedarse en `/blog`.** Deja la URL desalineada con el nombre visible.
- **Sí: `category` única y `tags` libres.** La referencia usa la categoría para pestañas y meta, y las etiquetas como temas sueltos.
- **No: usar el primer `tag` como categoría.** Es implícito y fácil de romper desde el panel.
- **Sí: etiquetas como enlaces a `?etiqueta=`.** La referencia solo vuelve al listado; filtrar da más valor sin páginas nuevas.
- **Sí: filtrado en el navegador con query.** Mismo patrón que `/productos` (SPEC 09), y con pocos posts no hace falta generar páginas.
- **No: páginas estáticas por categoría.** Multiplican rutas para un contenido chico.
- **Sí: `history.replaceState` y no `pushState`.** Cambiar de pestaña no debería llenar el historial.
- **Sí: destacado = más reciente con `featured`, o el más reciente.** Reutiliza la misma regla que la home (SPEC 05).
- **Sí: mostrar siempre las 5 pestañas.** Es fiel a la referencia, y el mensaje vacío ya está diseñado.
- **Sí: lead = `excerpt`, y se quita el párrafo duplicado.** Una sola fuente para extracto, lead y meta description.
- **Sí: portada entre el lead y el cuerpo.** Es robusto con rich-text.
- **No: insertar la imagen tras el primer bloque del cuerpo.** Depende de la estructura del MDX y es frágil.
- **Sí: la cita es el `>` del MDX con estilo propio.** El editor ya la escribe así.
- **No: campo `quote` aparte.** Duplica una capacidad que el rich-text ya tiene.
- **Sí: componentes de `TinaMarkdown` en vez de `prose`.** Así los tamaños salen exactos de la referencia y no se pelean con los overrides de typography.
- **Sí: colección singleton `journal`.** Mismo patrón que `shop`, y `global` no crece.
- **Sí: categorías fijas en el schema.** Las pestañas dependen de ellas. Cambiarlas es un cambio de diseño, no de contenido.
- **Sí: Anterior / Siguiente circular.** Así lo define la referencia, y nunca queda una columna vacía.
- **Sí: `formatShortDate` sin coma.** Es coherente con la sección Journal de la home.
- **Sí: `navigator.share` en móvil con fallback al portapapeles.** Mismo criterio que SPEC 10.
- **Sí: JSON-LD `BlogPosting`.** Costo bajo, y habilita rich results de artículo.
- **Sí: crear los 4 posts de la referencia.** Sin ellos, la grilla de 3 columnas y las pestañas no se pueden validar.
- **Sí: reutilizar imágenes existentes para los posts nuevos.** Son las mismas que usa la referencia, y el equipo puede reemplazarlas desde `/admin`.
- **No: paginación.** Con menos de ~30 posts no hace falta. Va en su propia spec.
- **No: `useTina` en las páginas del journal.** Los textos se editan en `/admin` y se ven al reconstruir, igual que en la ficha de producto.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| TinaCloud indexa por rama y el schema de `post` cambia | Compilar y desplegar `staging` y `main` con su `TINA_BRANCH` después del merge, como indica `CLAUDE.md`. |
| Posts creados antes de la migración sin `category` | Los 7 MDX se migran en esta spec. `pickFeatured` y la grilla tratan una categoría vacía como "sin categoría", sin romper el build. |
| Enlaces externos a `/blog/<slug>` | Redirecciones 301 en `.htaccess`. |
| Hidratación del listado: la grilla estática y la del filtro inicial difieren | La isla lee la query en el primer render del cliente y aplica el filtro con la transición. El HTML estático siempre es la vista "Todos". |
| Etiquetas libres con variantes ("Hidratación" / "hidratacion") | Se filtran por slug, así que ambas coinciden. La etiqueta mostrada es la primera encontrada. |

## Qué **no** entra en esta spec

- Paginación del listado.
- Páginas estáticas por categoría o por etiqueta.
- Versión en inglés del journal.
- Imagen insertada en medio del cuerpo.
- Comentarios, newsletter y posts relacionados.
- Componentes MDX a medida.

Cada uno de esos, si llega, va en su propia spec.

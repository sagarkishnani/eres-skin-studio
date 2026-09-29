# SPEC 06 — Página Nosotras

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 04, SPEC 05
> **Fecha:** 2026-09-28
> **Objetivo:** Crear la página `/nosotras` a partir de la referencia de diseño (cabecera, propósito, pilares, diferenciales, comunidad, Instagram y primera visita), editable desde el CMS y correcta de 360px a 1920px.

## Por qué existe esta spec

`/nosotras` ya está enlazada desde el nav, el footer y dos CTAs del home (SPEC 04 y SPEC 05), pero hoy da 404.

La referencia (`Eres Skin Studio (2).html`, pantalla `nosotras`) define siete bloques en un orden fijo. Casi todo reutiliza piezas de SPEC 05:

- los pilares son la misma sección del home, con el mismo texto;
- los botones, el link subrayado, el eyebrow y las animaciones de entrada ya existen en `global.css` y `BaseLayout`.

## Referencia de diseño (valores extraídos del bundle)

Se aplican las mismas equivalencias hex → token y los mismos breakpoints de SPEC 05:

- **móvil:** `< md`;
- **tablet:** `md` a `lg`;
- **desktop:** `≥ lg`.

Todas las secciones usan `container-xl`.

Hay un layout de dos columnas que se repite (cabecera, propósito, diferentes, comunidad y primera visita). Lo llamamos **grid partido**:

- `grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]`;
- se apila solo cuando no entran dos columnas de 420px.

Tipografía:

| Uso en el bundle | Token |
|---|---|
| H1 `clamp(40px,5vw,72px)` | `heading-xl` |
| H2 de sección `clamp(32px,3.8vw,54px)` | `heading-md` |
| H2 itálico 300 `clamp(38px,4.6vw,66px)` (comunidad, primera visita) | valor arbitrario `text-[length:clamp(38px,4.6vw,66px)]` + `font-light italic` |
| Cita de la fundadora `clamp(20px,1.8vw,24px)` itálica 300 | `subtitle-lg` + `italic` |
| H3 de diferenciales `clamp(22px,2vw,26px)` | `heading-xs` |
| Cuerpo 16px / 15px | `body-md` / `body-sm` |

### 1. Cabecera

- Fondo `bg-blush`, con padding `clamp(28px,5vw,64px)` arriba y `clamp(48px,7vw,96px)` abajo.
- Grid partido con gap `20px 80px` y `items-end`.
- Columna izquierda (gap 20px):
  - Migas: `<nav aria-label="Migas de pan">` en `caption-sm`, uppercase, tracking `.18em`, `text-clay-800`.
    - `Home` es un link a `/` con `link-underline`, sin flecha.
    - Después va un `/` y la página actual en `text-content` con `aria-current="page"`.
  - `h1` en `heading-xl` con `whitespace-pre-line`. El salto de línea sale del CMS.
- Columna derecha:
  - bajada en `body-md`, `text-content-muted`, `max-w-[480px]`;
  - va con `justify-self-end`.
- `data-reveal` 0 y 120.

### 2. Propósito

- Fondo `bg-surface-raised`, padding `clamp(56px,8vw,120px)`.
- Grid partido con gap `40px clamp(40px,6vw,96px)` e `items-center`.
- Imagen:
  - caja `aspect-[4/3]`, `overflow-hidden`, `bg-stone-150`;
  - `<img>` con `object-cover` y `object-position` que sale del CMS (por defecto `74% 30%`);
  - en `≥ lg` hace zoom a `scale(1.04)` al pasar el mouse, en 1.4s `ease-out-expo`, con CSS `group-hover`, sin estado de React.
- Texto (`max-w-[560px]`, gap 18px):
  - eyebrow `— Nuestro propósito` en `text-sage-700`;
  - `h2` en `heading-md` con `whitespace-pre-line`;
  - párrafos en `body-md` y `text-content-muted`.
- Cita:
  - bloque con `border-t border-line`, `mt-3` y `pt-6`;
  - la frase va en `subtitle-lg italic text-content`;
  - la autoría va en `caption-xs`, uppercase, tracking `.18em`, `text-content-subtle`.

### 3. Nuestra forma

Es la sección `Pillars` del home, sin cambios visuales, y lee `home.pillars`.

### 4. Diferentes

- Fondo `bg-surface-raised`, sin padding arriba y con `clamp(64px,9vw,128px)` abajo.
- Encabezado:
  - grid partido con eyebrow `— Por qué Eres` (`text-sage-700`) y `h2` a la izquierda;
  - bajada `max-w-[460px]` a la derecha;
  - margen inferior de `clamp(32px,4vw,56px)`.
- 3 tarjetas con padding `clamp(24px,3vw,40px)` y alto mínimo de 400px (340px en móvil). Dentro de cada una:
  - un icono en un círculo de 48px (`rounded-full`) con `mb-auto`;
  - el número `01`–`03` en `caption-sm tabular-nums`, con `mt-8`;
  - `h3` en `heading-xs`;
  - el texto en `body-sm`.
- Colores:
  - tarjetas 1 y 3: `bg-blush` y `text-content`, con el círculo en `bg-surface-raised`;
  - tarjeta 2: `bg-sage-700` y `text-content-inverse`, con el círculo en `bg-ink`.
- Iconos: SVG en línea de 20px con trazo de 1.5 (persona, check y gota), copiados del bundle. Cada tarjeta elige el suyo desde el CMS.
- Desktop (`≥ lg`):
  - 3 columnas con gap de 24px;
  - al pasar el mouse la tarjeta sube 6px y aparece la sombra `0 24px 40px -28px` de tinta, en 600ms `ease-out-expo`.
- Tablet y móvil (`< lg`):
  - carrusel horizontal con `grid-flow-col`, `overflow-x-auto` y `snap-x snap-mandatory`, sin scrollbar visible;
  - cada columna mide 46% en tablet y 84% en móvil;
  - `padding-inline` y `scroll-padding-inline` iguales a `px-gutter`, con gap de 12px en móvil;
  - no hay efecto hover.

### 5. Comunidad

- Fondo `bg-sage-700`, `text-content-inverse`, `overflow-hidden` y padding `clamp(64px,9vw,120px)`.
- La "e" decorativa gigante es la misma de `BookingReact`.
- Grid partido con eyebrow, `h2` itálico 300 y texto.
- **No tiene formulario** (ver Decisiones).
- En el contenido inicial va con `enabled: false`.

### 6. Instagram

- Fondo `bg-surface-raised`, padding `clamp(56px,8vw,112px)`.
- Encabezado:
  - `flex justify-between items-end flex-wrap`;
  - a la izquierda, eyebrow `— Comunidad` en `text-content-muted` y `h2` en `heading-md` itálico 300;
  - a la derecha, `link-underline` con flecha `→` y el texto del CMS.
- Grilla:
  - 5 columnas con gap de 12px en `≥ md`;
  - 2 columnas con gap de 8px en móvil, donde se muestran solo las primeras 4 fotos.
- Cada foto:
  - es un `<a>` con `aspect-[4/5]`, `bg-stone-150` y `aria-label="Ver en Instagram"`;
  - la imagen tiene `alt=""` y `object-position` que sale del CMS;
  - en `≥ lg`, al pasar el mouse, la imagen hace zoom a `1.06` (1.2s) y aparece un velo `bg-ink/40` con el icono de Instagram. Es un fondo oscuro fijo, así que es una excepción válida según CLAUDE.md.
- Debajo va el handle (`@eres.skinstudio`), centrado, en `caption-md` y con `link-underline`.
- Todos los links salen de `footer.social` → `instagram`, con `target="_blank"` y `rel="noopener noreferrer"`.

### 7. Primera visita

- Fondo `bg-blush`, padding `clamp(64px,9vw,120px)`.
- Grid partido con gap `28px 80px`:
  - a la izquierda, eyebrow `— Tu primera visita` en `text-clay-800` y `h2` itálico 300 con `whitespace-pre-line`;
  - a la derecha, texto en `body-md text-content-muted` (`max-w-[500px]`) y un botón `btn-fill-dark` con flecha.
- El botón abre la URL de `footer.social` → `whatsapp`. Sin esa red, el botón no se renderiza.

## Alcance

**Entra:**

- Ruta `src/pages/nosotras.astro` con las siete secciones en el orden del diseño.
- Colección nueva `about` (`tina/collections/about.ts`) y su contenido inicial en `src/content/about/index.json`, con los textos del bundle.
- Componentes en `src/components/about/`, cada uno con el patrón doble (`.astro` + `React.tsx`, hidratados con `client:tina`):
  - `AboutHeader`;
  - `Purpose`;
  - `Differentiators`;
  - `Community`;
  - `InstagramGrid`;
  - `FirstVisit`.
- Reutilizar `src/components/home/Pillars.astro` con una prop nueva `standalone`.
- La foto de Adriana, extraída del bundle y guardada en `public/uploads/nosotras/adriana-paradisi.webp`.
- Las fotos de Instagram apuntan a imágenes que ya están en el repo:
  - `public/uploads/home/svc-limpieza.webp`;
  - `public/uploads/blog/blog-roller.jpg`;
  - `public/uploads/home/svc-tratamiento.webp`;
  - `public/uploads/blog/blog-oil.jpg`;
  - `public/uploads/home/svc-depilacion.webp`.
- SEO propio de la página (`about.seo`) que se pasa a `BaseLayout`.

**Queda fuera (para specs futuras):**

- Suscripción al newsletter, ya sea con un formulario, `dynamicForms` o un proveedor externo.
- Feed real de Instagram por API.
- Pilares propios de `/nosotras`, distintos de los del home.
- Traducciones.
- Datos estructurados (`AboutPage` / `Organization` en JSON-LD).

## Modelo de datos

Colección `about` (un solo documento, sin crear ni borrar, igual que `home`):

```ts
about: {
  header: {
    enabled: boolean;
    breadcrumb: string;           // "Nosotras"
    title: string;                // "Donde tu piel\nse siente en casa."
    text: string;
  };
  purpose: {
    enabled: boolean;
    image: string;                // "/uploads/nosotras/adriana-paradisi.webp"
    imageAlt: string;
    imagePosition: string;        // "74% 30%"
    eyebrow: string;
    title: string;                // "Acompañarte\na entender tu piel."
    paragraphs: { text: string }[];
    quote: string;
    quoteAuthor: string;          // "— Adriana Paradisi · Fundadora"
  };
  pillars: {
    enabled: boolean;             // el contenido vive en home.pillars
  };
  differentiators: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    items: { icon: "person" | "check" | "drop"; title: string; text: string }[];
  };
  community: {
    enabled: boolean;             // false en el contenido inicial
    eyebrow: string;
    title: string;
    text: string;
  };
  instagram: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    ctaLabel: string;             // "Ver más en Instagram"
    handle: string;               // "@eres.skinstudio"
    images: { src: string; position: string }[];
  };
  firstVisit: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    ctaLabel: string;             // "Agendar ahora"
  };
  seo: { title: string; description: string };
}
```

Convenciones:

- Los campos `title` y `text` largos usan `component: "textarea"`, reutilizando los helpers de `home.ts` (`enabledField`, `eyebrowField`, `paragraphsField`).
- Los tres diferenciales se muestran en el orden del CMS. El color verde lo lleva siempre la segunda tarjeta, porque depende de la posición y no del contenido.
- Si una sección tiene `enabled: false`, no aparece en el HTML.

## Plan de implementación

1. Crear `tina/collections/about.ts` y registrarla en `tina/config.ts`. Crear `src/content/about/index.json` con los textos del bundle. Extraer la foto de Adriana a `public/uploads/nosotras/`.
   - **Prueba:** `npm run build` pasa y `/admin` muestra "Nosotras".
2. Crear `src/pages/nosotras.astro`. La página resuelve `client.queries.about`, `home` y `global` (este último, para las redes), pasa el SEO a `BaseLayout` y monta `AboutHeader`.
   - **Prueba:** `/nosotras` responde 200 y muestra la cabecera.
3. Agregar `Purpose` (imagen, texto y cita).
4. Agregar la prop `standalone` a `Pillars.astro`: con ella, la visibilidad depende de `about.pillars.enabled` y de que haya ítems, e ignora `home.pillars.enabled`. Montarla en `/nosotras` con la query del home.
   - **Prueba:** el home sigue igual.
5. Agregar `Differentiators`, con la grilla en desktop y el carrusel con snap en `< lg`.
6. Agregar `Community`, sin formulario y con `enabled: false` en el contenido.
7. Agregar `InstagramGrid`. Recibe la URL de Instagram desde `footer.social` y, si no la hay, no se renderiza.
8. Agregar `FirstVisit`, que recibe la URL de WhatsApp igual que `Booking`.

## Criterios de aceptación

- [ ] `/nosotras` responde 200 en `npm run build && npm run preview`, y los links del nav, del footer y del home ya no dan 404.
- [ ] La página tiene un solo `h1`, que es el título de la cabecera.
- [ ] Las secciones aparecen en este orden: cabecera, propósito, nuestra forma, diferentes, (comunidad), Instagram y primera visita.
- [ ] Con el contenido inicial, "Comunidad" no está en el HTML. Con `enabled: true` aparece, sin ningún `<form>` ni `<input>`.
- [ ] Las migas tienen `Home` como link a `/` y la página actual con `aria-current="page"`.
- [ ] Los pilares muestran el mismo título y los mismos 4 ítems que el home. Si se edita un pilar en `home`, cambia en las dos páginas.
- [ ] Con `home.pillars.enabled: false`, los pilares siguen visibles en `/nosotras`. Con `about.pillars.enabled: false`, desaparecen solo de `/nosotras`.
- [ ] Los diferenciales ocupan 3 columnas en `≥ lg`. En `< lg` son un carrusel horizontal con snap, sin scrollbar visible, y se ve un pedazo de la tarjeta siguiente.
- [ ] La segunda tarjeta de diferenciales usa `bg-sage-700` y su texto alcanza 4.5:1.
- [ ] La grilla de Instagram tiene 5 columnas en `≥ md` y 2 columnas con 4 fotos en móvil.
- [ ] Todas las fotos y links de Instagram abren la URL de `footer.social` → `instagram` en una pestaña nueva. Sin esa red, la sección no se renderiza.
- [ ] "Agendar ahora" abre la URL de `footer.social` → `whatsapp`. Sin esa red, el botón no se renderiza.
- [ ] Los efectos de hover (zoom de fotos y elevación de tarjetas) solo ocurren en `≥ lg`.
- [ ] Con `enabled: false` en cualquier sección, esa sección no está en el HTML.
- [ ] Desde `/admin` se editan todos los textos, las imágenes, el `object-position` y el SEO, y el cambio se ve en la vista previa.
- [ ] No hay scroll horizontal del `body` en ningún ancho de 360px a 1920px.
- [ ] Ningún componente nuevo escribe colores en hex ni usa `text-white/*` o `bg-white/*`. La única excepción es el velo `bg-ink/40` de Instagram.
- [ ] Con `global.motion.revealAnimations: false`, con `prefers-reduced-motion` o sin JS, todo el contenido es visible desde la carga.
- [ ] La consola del navegador no muestra errores en `/nosotras`.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario, las secciones posteriores a la cabecera no se revisaron una por una. Se asumieron a partir de sus respuestas y de la referencia.
- **Sí: la ruta `/nosotras`.** Ya la usan el nav, el footer y el home.
- **No: newsletter en esta spec.** Elección del usuario (opción c). El formulario del diseño solo validaba en el cliente y no enviaba nada. La sección se construye sin formulario y con `enabled: false`, porque su texto promete una suscripción que todavía no existe. Cuando llegue la spec del newsletter, solo hay que agregar el formulario y encenderla.
- **No: `dynamicForms` + `send-email.php` para el newsletter.** Se consideró, pero se descartó por ahora.
- **No: un proveedor de email marketing.** Iría en su propia spec.
- **Sí: los pilares se leen de `home.pillars`.** Elección del usuario. Se editan en un solo lugar y se reutiliza `PillarsReact` sin tocarlo.
- **Sí: interruptor propio `about.pillars.enabled`.** Permite ocultar los pilares en una página sin afectar a la otra.
- **Sí: Instagram con imágenes estáticas desde el CMS.** Elección del usuario. El feed por API necesita un token que expira y un proxy, así que iría en otra spec.
- **Sí: reutilizar las fotos que ya están en `public/uploads/` para Instagram.** Son las mismas del bundle, así que no hace falta duplicarlas.
- **Sí: extraer la foto de Adriana del bundle.** Elección del usuario. Es contenido inicial y se puede reemplazar desde el CMS.
- **Sí: WhatsApp e Instagram desde `footer.social`.** Es el mismo criterio que en SPEC 04 y SPEC 05, y evita tener URLs duplicadas.
- **Sí: `sage-700` en lugar de `#718471`.** Es lo que se decidió en SPEC 05, porque el texto blanco sobre `#718471` no llega a 4.5:1.
- **Sí: colección `about` con secciones fijas que se apagan con `enabled`, no bloques de Tina.** Es el mismo criterio que en el home. El orden del diseño es intencional.
- **Sí: hover con CSS (`group-hover`) en lugar de estado de React.** Así no hace falta hidratar en producción, y todo queda en `client:tina`.
- **Sí: el carrusel de diferenciales en CSS puro (scroll-snap).** No hacen falta flechas ni JS.
- **Sí: el color verde lo lleva la segunda tarjeta por posición.** Es lo que hace el diseño, y así se evita un campo de color en el CMS.
- **Sí: los H2 itálicos de 38–66px como valor arbitrario.** No hay token para ese rango y se usa en solo dos lugares.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Cuando se edita `/nosotras` en Tina, los pilares vienen de otra colección (`home`). | Se editan desde el documento Home. Documentarlo en el `label` del campo `about.pillars.enabled`. |
| El carrusel con `padding-inline` genera scroll horizontal del `body`. | El carrusel va fuera de `container-xl`, con `max-w-container` y `overflow-x-auto` en su propio contenedor. Verificar a 360px. |
| La foto de Adriana del bundle es de baja resolución para el ancho de desktop. | Revisar su tamaño al extraerla. Si mide menos de 1200px de ancho, pedir el original al cliente. |
| Lenis intercepta el scroll horizontal táctil del carrusel. | Agregar `data-lenis-prevent` al contenedor del carrusel si el arrastre falla en iOS. |

## Lo que **no** entra en esta spec

- Suscripción al newsletter.
- Feed de Instagram por API.
- Pilares distintos entre el home y `/nosotras`.
- Traducciones.
- JSON-LD de la página.

Cada una de estas cosas, si se hace, va en su propia spec.

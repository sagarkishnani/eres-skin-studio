# SPEC 01 — Tokens de diseño y estilos base

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-09-27
> **Objetivo:** Reemplazar los tokens genéricos del starter por el sistema visual de ERES (paleta cálida, DM Sans autoalojada, escala tipográfica, espaciado, motion y esquinas rectas) extraído del HTML de diseño y de la web en vivo.

## Por qué existe esta spec

El proyecto nació del starter, así que `tailwind.config.mjs` trae neutros fríos (`#16181D`, `#F7F8FA`), radios de 4–24px y títulos en peso 500.
El diseño de ERES (`Eres Skin Studio (1).html`) y la web en vivo (`eresskinstudio.com`) usan otro lenguaje: neutros cálidos, fondo crema, títulos finos con tracking negativo y esquinas completamente rectas.
Si los componentes se construyen sobre los tokens actuales, cada uno terminaría resolviendo el estilo con valores arbitrarios.

Fuentes de los valores:

- **Paleta:** coincide 1:1 entre el HTML de diseño y las variables globales de Elementor de la web en vivo (`--e-global-color-*`).
- **Tipografía, espaciado, motion y sombras:** sacados de los estilos en línea del HTML de diseño, por frecuencia de uso.
- **Fuentes:** el HTML de diseño usa solo DM Sans. La web en vivo usa Playfair Display + Inter, y el diseño nuevo las reemplaza.

## Alcance

**Entra:**

- Paleta cruda (`ink`, `stone`, `sage`, `clay`, `blush`) y tokens semánticos (`surface`, `content`, `line`, `accent`) con los valores de ERES.
- DM Sans variable autoalojada con `@fontsource-variable/dm-sans` (normal e itálica) y eliminación de Google Fonts.
- Nuevos valores para la escala tipográfica existente (`heading-xxl` … `caption-sm`) y tres tamaños nuevos (`body-xs`, `caption-md`, `caption-xs`).
- Tokens de layout: ancho máximo, gutter lateral y padding vertical de sección.
- Radios en `0` y solo `rounded-full` disponible.
- Sombras, curvas de easing y keyframes (`fade-up`, `marquee`).
- Estilos base en `src/styles/global.css`: `body`, títulos, foco y `prefers-reduced-motion`.
- Clases de componente: `container-xl`, `container-lg`, `container-text`, `section`, `section-alt`, `btn`, `btn-primary`, `btn-secondary`, `btn-link`, `eyebrow` y `card`.
- Colores de `prose` (`@tailwindcss/typography`) mapeados a los tokens.
- Reemplazo **mecánico** de las clases eliminadas en los 17 archivos que las usan, según la tabla de equivalencias.
- Actualización de la sección **Estilos** de `CLAUDE.md`.

**Fuera de alcance (para specs futuras):**

- Rediseño visual de cualquier componente o página (header, hero, footer, tienda, blog…).
- Reemplazo de valores arbitrarios ya escritos en componentes (`text-[#3f3f3f]`, `text-[13px]`…).
- Modo oscuro o cambio de tema.
- Importar al repo las imágenes del HTML de diseño.
- Animaciones específicas de componentes (barra de progreso, reveal al hacer scroll, Lenis).

## Modelo de datos

Los tokens viven en `tailwind.config.mjs`. Estos son los valores exactos.

### Color

```js
colors: {
  ink: '#1D1D1B',
  stone: {
    800: '#3A3A36', 600: '#6B6A66', 500: '#7C7B78', 400: '#B0AFAA',
    300: '#D9D6CF', 200: '#E4E0D8', 150: '#EEEAE3', 100: '#F0F0EC', 50: '#FAFAF5',
  },
  sage: {
    900: '#2E3A33', 700: '#4E5E55', 600: '#556555',
    500: '#718471', 300: '#B0BAA8', 100: '#DCE2D5',
  },
  clay: { 800: '#5E4F3F', 600: '#8C7A66', 300: '#D8C9B8', 100: '#E8DDCF' },
  blush: '#F2EDE9',

  surface: { DEFAULT: '#FAFAF5', raised: '#FFFFFF', sunken: '#EEEAE3' },
  content: { DEFAULT: '#1D1D1B', muted: '#3A3A36', subtle: '#6B6A66', inverse: '#FAFAF5' },
  line:    { DEFAULT: '#E4E0D8', strong: '#D9D6CF' },
  accent:  '#2E3A33',

  semantics: { /* sin cambios: success, alert, error */ },
}
```

Contraste medido (WCAG, texto normal ≥ 4.5:1):

| Texto | sobre `surface` | sobre `surface-raised` | sobre `surface-sunken` |
|---|---|---|---|
| `content` `#1D1D1B` | 16.13 | 16.88 | 14.08 |
| `content-muted` `#3A3A36` | 10.91 | 11.42 | 9.53 |
| `content-subtle` `#6B6A66` | 5.17 | 5.41 | 4.52 |
| `accent` `#2E3A33` | 11.34 | 11.87 | 9.90 |
| `sage-500` `#718471` | 3.83 ✗ | 4.01 ✗ | 3.34 ✗ |
| `clay-600` `#8C7A66` | 3.94 ✗ | 4.13 ✗ | 3.44 ✗ |

`sage-500` y `clay-600` son solo decorativos: se usan en fondos, líneas o texto ≥ 24px.

### Tipografía

```js
fontFamily: {
  sans:    ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
  heading: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
}
```

`mono` desaparece.
Cada entrada de `fontSize` usa la forma `[size, { lineHeight, letterSpacing, fontWeight }]`:

| Token | Tamaño | Rango en px | lineHeight | letterSpacing | Peso | Uso en el diseño |
|---|---|---|---|---|---|---|
| `heading-xxl` | `clamp(2.625rem, 5.4vw, 5rem)` | 42–80 | 1.02 | -0.035em | 400 | Título de hero y bloques de impacto |
| `heading-xl` | `clamp(2.5rem, 5vw, 4.5rem)` | 40–72 | 1.02 | -0.035em | 400 | H1 de página |
| `heading-lg` | `clamp(2.125rem, 4.2vw, 3.75rem)` | 34–60 | 1.04 | -0.035em | 400 | H2 destacado |
| `heading-md` | `clamp(2rem, 3.8vw, 3.375rem)` | 32–54 | 1.06 | -0.03em | 400 | H2 de sección (el más usado) |
| `heading-sm` | `clamp(1.75rem, 4vw, 3rem)` | 28–48 | 1.06 | -0.03em | 400 | H1 de artículo y títulos medianos |
| `heading-xs` | `clamp(1.375rem, 1.9vw, 1.625rem)` | 22–26 | 1.15 | -0.02em | 400 | H3 de tarjeta |
| `subtitle-lg` | `clamp(1.25rem, 1.8vw, 1.5rem)` | 20–24 | 1.35 | -0.01em | 300 | Citas y frases destacadas (con `italic`) |
| `subtitle-md` | `clamp(1.125rem, 1.6vw, 1.3125rem)` | 18–21 | 1.6 | 0 | 400 | Lead de artículo |
| `subtitle-sm` | `clamp(0.9375rem, 1.3vw, 1.125rem)` | 15–18 | 1.55 | 0 | 400 | Bajada de hero |
| `body-lg` | `1.0625rem` | 17 | 1.75 | 0 | 400 | Cuerpo largo |
| `body-md` | `1rem` | 16 | 1.65 | 0 | 400 | Cuerpo por defecto |
| `body-sm` | `0.9375rem` | 15 | 1.6 | 0 | 400 | Cuerpo compacto y FAQ |
| `body-xs` | `0.875rem` | 14 | 1.5 | 0 | 400 | Formularios y notas |
| `caption-md` | `0.8125rem` | 13 | 1.4 | 0 | 400 | Botones y links de UI |
| `caption-sm` | `0.75rem` | 12 | 1.4 | 0 | 400 | Eyebrows y etiquetas |
| `caption-xs` | `0.6875rem` | 11 | 1.4 | 0 | 400 | Metadatos |

Los límites van en `rem` para que el texto respete el zoom del navegador.

### Layout y espaciado

```js
maxWidth: { container: '1440px', 'container-lg': '1200px', 'container-text': '760px' },
spacing: {
  gutter:       'clamp(1.25rem, 5vw, 4.5rem)',
  section:      'clamp(4rem, 9vw, 7.5rem)',
  'section-sm': 'clamp(2.5rem, 5vw, 4rem)',
  'section-lg': 'clamp(4.5rem, 10vw, 8.75rem)',
}
```

Los valores de gutter y sección salen de los paddings más repetidos del HTML de diseño: `clamp(20px,5vw,72px)` aparece 36 veces y `clamp(64px,9vw,120px)` aparece 6.

### Radios, sombras y motion

```js
borderRadius: { none: '0px', full: '9999px' },
boxShadow: {
  sm: '0 2px 10px rgba(29,29,27,.08)',
  md: '0 4px 20px rgba(29,29,27,.15)',
  lg: '0 20px 40px -20px rgba(29,29,27,.25)',
  xl: '0 30px 60px -30px rgba(29,29,27,.25)',
},
transitionTimingFunction: {
  DEFAULT:    'cubic-bezier(.16,1,.3,1)',
  'out-expo': 'cubic-bezier(.16,1,.3,1)',
  'out-soft': 'cubic-bezier(.22,.61,.36,1)',
  spring:     'cubic-bezier(.34,1.56,.64,1)',
},
transitionDuration: { DEFAULT: '400ms', 400: '400ms' },
keyframes: { 'fade-up': { /* igual que hoy */ }, marquee: { from: 'translateX(0)', to: 'translateX(-50%)' } },
animation: { 'fade-up': 'fade-up 600ms cubic-bezier(.16,1,.3,1) both', marquee: 'marquee 48s linear infinite' },
```

`borderRadius` **reemplaza** el tema de Tailwind (no lo extiende), así que `rounded`, `rounded-lg` y el resto dejan de existir.

### Clases de componente (`src/styles/global.css`)

| Clase | Estilo |
|---|---|
| `container-xl` | `max-w-container`, centrado, `px-gutter` |
| `container-lg` | `max-w-container-lg`, centrado, `px-gutter` |
| `container-text` | `max-w-container-text`, centrado, `px-gutter` |
| `section` | `py-section` |
| `section-alt` | `bg-surface-sunken` |
| `eyebrow` | `caption-sm`, mayúsculas, `tracking-[.22em]`, peso 500, `text-content-muted` |
| `btn` | 52px de alto, `px-[30px]`, `caption-md`, mayúsculas, `tracking-[.14em]`, peso 500, sin radio, `gap-3` |
| `btn-primary` | Fondo `ink`, texto `content-inverse`. En hover, un relleno `sage-900` sube desde abajo (`background-size` 100% 0% → 100% 100%). |
| `btn-secondary` | Fondo `surface-raised`, borde `ink`, texto `ink`. En hover, un relleno `ink` sube desde abajo y el texto pasa a `content-inverse`. |
| `btn-link` | `caption-md`, mayúsculas, `tracking-[.14em]`, peso 500, con un subrayado de 1px que crece de 0% a 100% en hover |
| `card` | `bg-surface-raised`, `border border-line`, `p-6`, sin radio. En hover, el borde pasa a `line-strong`. |

Estilos base:

- `body`: `bg-surface text-content font-sans antialiased`, con `text-rendering: optimizeLegibility`.
- `h1`–`h6`: `font-heading font-normal` y `text-wrap: balance`.
- `p`: `text-wrap: pretty`.
- Foco: `ring-2 ring-accent ring-offset-2 ring-offset-surface`.

### Tabla de equivalencias para el reemplazo mecánico

| Clase eliminada | Reemplazo |
|---|---|
| `*-greyscale-darkest` | `*-content` |
| `*-greyscale-dark` | `*-content-muted` |
| `*-greyscale` / `*-greyscale-medium` | `*-content-subtle` |
| `*-greyscale-light` | `*-line-strong` (bordes) / `*-stone-300` (texto) |
| `*-greyscale-lightest` | `*-stone-100` |
| `text-greyscale-white` | `text-content-inverse` |
| `bg-greyscale-white` | `bg-surface-raised` |
| `*-brand-primary` | `*-accent` |
| `bg-brand-primary-dark` / `-darkest` | `bg-ink` |
| `text-brand-primary-dark` / `-darkest` | `text-accent` |
| `*-brand-primary-light` | `*-sage-500` |
| `*-brand-primary-lightest` | `*-sage-100` |
| `font-mono` | se elimina la clase |
| `rounded`, `rounded-sm` … `rounded-2xl` (con o sin lado, p. ej. `rounded-t-lg`) | se elimina la clase |
| `rounded-full` | se conserva |

`*` representa cualquier prefijo de utilidad (`text-`, `bg-`, `border-`, `ring-`, `from-`…), incluidos los modificadores de opacidad (`/50`) y de estado (`hover:`).

## Plan de implementación

1. Crear la rama `feat/tokens-diseno-eres` desde `staging` actualizado.
2. **Fuentes.** Instalar `@fontsource-variable/dm-sans`. Importar `index.css` y `wght-italic.css` en `BaseLayout.astro`. Quitar los tres `<link>` de Google Fonts. Actualizar `fontFamily` y eliminar `mono`. Verificación: `npm run build` pasa y en `dist/` no aparece `fonts.googleapis`.
3. **Paleta.** Agregar `ink`, `stone`, `sage`, `clay` y `blush`, y actualizar `surface`, `content`, `line` y `accent` con los valores nuevos. `greyscale` y `brand` se quedan por ahora para no romper nada. Verificación: el build pasa y el fondo de la home es `#FAFAF5`.
4. **Reemplazo de colores.** Aplicar la tabla de equivalencias a las clases de color en los 17 archivos afectados y en `global.css`. Después, eliminar `greyscale` y `brand` del config. Verificación: el build pasa y el grep del criterio de aceptación devuelve 0 resultados.
5. **Escala tipográfica.** Poner los valores nuevos en `fontSize` y agregar `body-xs`, `caption-md` y `caption-xs`. Verificación: el build pasa.
6. **Radios y mono.** Reemplazar `borderRadius` en el tema, borrar las clases `rounded*` que ya no existen (salvo `rounded-full`) y borrar `font-mono`. Verificación: el build pasa.
7. **Layout.** Agregar `maxWidth` y `spacing`, y reescribir `container-xl`, `container-lg`, `container-text`, `section` y `section-alt`. Verificación: el build pasa y el contenedor de la home mide como máximo 1440px.
8. **Sombras y motion.** Agregar `boxShadow`, `transitionTimingFunction`, `transitionDuration`, `keyframes` y `animation`. Verificación: el build pasa.
9. **Base y componentes.** Reescribir `@layer base` y agregar `eyebrow`, `btn`, `btn-primary`, `btn-secondary`, `btn-link` y `card` en `global.css`. Verificación: el build pasa y el hover de `btn-primary` rellena desde abajo.
10. **Prose.** Configurar `theme.extend.typography` para que el cuerpo use `content-muted`, los títulos `content` con peso 400, los links `accent`, y los bordes y reglas `line`. Verificación: un artículo del blog se ve con esos colores.
11. **Documentación.** Actualizar la sección **Estilos** de `CLAUDE.md`: tabla de tokens semánticos, paleta cruda, escala tipográfica, fuentes, radios y la regla de "texto sobre `bg-accent` / `bg-ink`".

Cada paso se commitea por separado, por ejemplo `chore(estilos): autoaloja DM Sans y elimina Google Fonts`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `grep -rE "greyscale|brand-primary|font-mono|rounded(-(t|b|l|r|tl|tr|bl|br))?(-(sm|md|lg|xl|2xl))?\b[^-]" src` no devuelve usos de clases eliminadas (`rounded-full` está permitido).
- [ ] `grep -r "fonts.googleapis\|fonts.gstatic" dist src` no devuelve resultados.
- [ ] `dist/` incluye los archivos `.woff2` de DM Sans variable (normal e itálica).
- [ ] En la home, el `background-color` computado del `body` es `rgb(250, 250, 245)` y el `color` es `rgb(29, 29, 27)`.
- [ ] En la home, un `h1` o `h2` tiene computados `font-family` "DM Sans Variable" y `font-weight` 400.
- [ ] El CSS generado no contiene reglas `border-radius` distintas de `0px` y `9999px`, salvo las que traen plugins de terceros.
- [ ] `tailwind.config.mjs` contiene exactamente los valores de color, `fontSize`, `maxWidth`, `spacing`, `borderRadius`, `boxShadow` y `transitionTimingFunction` de esta spec.
- [ ] Las clases `container-xl`, `container-lg`, `container-text`, `section`, `section-alt`, `eyebrow`, `btn`, `btn-primary`, `btn-secondary`, `btn-link` y `card` existen en `src/styles/global.css`.
- [ ] En desktop, pasar el mouse sobre un `btn-primary` cambia el fondo de `#1D1D1B` a `#2E3A33` con un relleno que sube desde abajo.
- [ ] Con `prefers-reduced-motion: reduce`, las transiciones y animaciones duran ≤ 0.01ms.
- [ ] La tabla de tokens de `CLAUDE.md` coincide con los valores del config y ya no menciona `brand-primary`, `greyscale`, DM Mono ni `#16181D`.

## Decisiones

- **Sí:** esta spec cubre tokens, estilos base y clases de componente, y solo corrige mecánicamente los usos de clases eliminadas. El rediseño de cada componente va en specs propias.
- **No:** rediseñar los componentes en esta spec. Sería demasiado grande y mezclaría dos tipos de cambio en un mismo PR.
- **Sí:** reemplazo mecánico de las clases eliminadas, aunque el build no fallaría sin él. Tailwind no falla con clases inexistentes: las omite. Un `text-greyscale-white` sin reemplazo dejaría texto oscuro sobre fondo oscuro sin que nada avise.
- **Sí:** mantener los nombres de la escala tipográfica (`heading-xxl` … `caption-sm`) con valores nuevos. No rompe usos existentes y `CLAUDE.md` ya los documenta.
- **No:** nombres semánticos (`display`, `h1`, `h2`…). Obligaría a renombrar en todos los componentes sin ganar nada.
- **Sí:** fondo de página crema `#FAFAF5`, tarjetas `#FFFFFF` y sección alternativa `#EEEAE3`. Es lo que usa el diseño.
- **No:** fondo blanco puro. Pierde la calidez de la marca.
- **Sí:** esquinas rectas, con `borderRadius` reemplazado en el tema y solo `rounded-full`. En el HTML de diseño no hay ningún radio aparte del 50%. Quitar la escala impide que alguien vuelva a meter `rounded-xl` por inercia.
- **Sí:** DM Sans variable autoalojada con Fontsource. Evita la petición a Google (rendimiento y RGPD) y un solo archivo cubre los pesos 300–600.
- **No:** Google Fonts.
- **No:** DM Mono. En el diseño aparece en solo 4 lugares, así que no justifica una segunda familia.
- **No:** Playfair Display, Inter ni Cormorant Garamond de la web en vivo. El diseño nuevo los reemplaza por DM Sans.
- **Sí:** títulos en peso 400 con tracking negativo. Son el patrón del diseño, frente al 500 del starter.
- **Sí:** paleta cruda con nombres de material (`stone`, `sage`, `clay`) y tokens semánticos encima. Los componentes deben usar los semánticos; la paleta cruda es para acentos puntuales.
- **Sí:** conservar `semantics` (success, alert, error) sin cambios. Los formularios los necesitan y el diseño no define alternativas.
- **Sí:** `cubic-bezier(.16,1,.3,1)` como easing por defecto. Aparece en 138 lugares del diseño.
- **Nota de proceso:** las secciones de alcance en adelante no se confirmaron una por una. El usuario pidió asumirlas y guardar directamente después de confirmar el encabezado.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `body-lg` (20 → 17px) y `body-sm` (14 → 15px) cambian de tamaño y pueden desacomodar componentes existentes | Se acepta: el rediseño de componentes va en otras specs. Revisar a ojo la home y la tienda después del paso 5. |
| El reemplazo mecánico cambia el tono de algunos elementos (de gris frío a cálido) | Es el objetivo. La tabla de equivalencias hace que el cambio sea predecible. |
| `sage-500` y `clay-600` no llegan a 4.5:1 sobre fondos claros | Documentarlos en `CLAUDE.md` como solo decorativos o para texto ≥ 24px. |
| `content-subtle` sobre `surface-sunken` queda justo en 4.52:1 | No oscurecer `surface-sunken`. Si cambia, volver a medir. |
| Quitar la escala de radios deja sin esquinas a elementos que hoy dependen de ella (inputs, badges, el banner de cookies) | Es coherente con el diseño. Si algún caso lo necesita, se decide en la spec de ese componente. |

## Qué **no** entra en esta spec

- Rediseño de header, hero, footer, tienda, blog o formularios.
- Limpieza de valores arbitrarios (`[#3f3f3f]`, `[13px]`) dentro de los componentes.
- Modo oscuro.
- Imágenes del HTML de diseño.
- Animaciones de componentes (reveal, barra de progreso, smooth scroll).

Cada una de estas, si llega, va en su propia spec.

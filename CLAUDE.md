# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Comandos

```bash
npm run dev        # TinaCMS + Astro (siempre juntos: /admin necesita el server de Tina)
npm run build      # tinacms build → astro build
npm run preview     # previsualiza el build de producción
```

No hay test runner configurado.

## Entorno

Copia `.env.example` a `.env`. Deja `TINA_CLIENT_ID`/`TINA_TOKEN` vacíos para
trabajar en **modo local** (Tina lee y escribe los archivos de `src/content/`
sin cuenta en la nube).

**`TINA_BRANCH` importa más de lo que parece.** TinaCloud indexa el contenido
**por rama**, y el valor se hornea dentro de `tina/__generated__/client.ts` al
correr `tinacms build`: *no* se lee en runtime. Compilar un árbol contra el
índice de otra rama falla si los schemas difieren.

## Flujo de trabajo

### Ramas

`main` es producción y `staging` la línea de desarrollo. Las ramas de trabajo
**siempre salen de `staging` actualizado** y se PR-ean contra `staging`:

```
tipo/descripcion-corta
```

| Tipo | Cuándo |
|------|--------|
| `feat/` | Nueva funcionalidad |
| `fix/` | Corrección de error |
| `chore/` | Mantenimiento, dependencias, configuración, limpieza |

Ejemplos: `feat/formulario-contacto`, `fix/total-checkout-igv`,
`chore/actualizar-dependencias`. Minúsculas, palabras separadas por guiones, sin
tildes ni espacios.

### Commits

Conventional Commits, descripción **en presente y en español**:

```
tipo(alcance opcional): descripción en presente
```

```
feat: agrega formulario de contacto
fix(checkout): corrige cálculo del total con IGV
chore: actualiza dependencias
```

### Código sin comentarios

El código tiene que explicarse solo: nombres claros de variables, funciones y
componentes, y funciones pequeñas con una sola responsabilidad. **No agregues
comentarios** salvo que sea estrictamente necesario, es decir, cuando expliquen
un *por qué* que el código no puede expresar (un workaround de un bug externo,
una restricción de una API, una decisión no obvia). Nunca comentes *qué* hace
el código, no dejes código comentado y no agregues comentarios de sección o
decorativos. Si algo parece necesitar un comentario, primero renombra o extrae.

## Arquitectura

**Astro 5 SSG + React 19 (islas) + TinaCMS 2 (CMS sobre git)**

El sitio se compila estático (sin adaptador SSR). Todo lo dinámico en runtime es
una isla de React hidratada.
La excepción son los formularios, que hablan con el backend PHP (ver **Formularios**).

### Patrón de componente doble

Cada sección alimentada por el CMS son dos archivos:

- `Componente.astro` — resuelve la consulta a TinaCMS **en build time** con
  `client` de `tina/__generated__/client` y pasa `{ query, variables, data }`.
- `ComponenteReact.tsx` — recibe esas props y renderiza; envuelve el contenido en
  `useTina()`, que es lo que habilita la edición visual en el panel.

Directivas de hidratación: `client:load` arriba del fold, `client:visible`
debajo. `client:tina` (integración propia en `astro-tina-directive/`) hidrata
**solo dentro del editor de Tina**: en producción no carga React.

Las secciones de una misma página comparten una sola consulta: la página la
resuelve y se la pasa a cada isla (ver `src/pages/index.astro`).

### Contenido y colecciones

El contenido vive en `src/content/` como JSON (páginas estructuradas).
Los artículos del blog son MDX en `src/content/blog/`.
El schema de `tina/config.ts` es la única fuente de verdad sobre la forma del
contenido; cada colección vive en su propio archivo en `tina/collections/`.
Los tipos, las queries y el cliente se generan en `tina/__generated__/`
(**no editar a mano**).

Colecciones:

- `global` — navegación, footer, SEO por defecto, código inyectado.
- `home` — contenido de la portada.
- `post` — artículos del blog en MDX (`src/content/blog/`).
- `formConfig` — por formulario: `formType`, `label`, `enabled`, `recipients[]`.
- `dynamicForms` — definición completa de cada formulario (un JSON por formulario).
- `maintenance` — modo mantenimiento del sitio.
- `cookieConsent` — textos del banner de cookies.

### Formularios (definidos en el CMS)

Los formularios no están hardcodeados:

- Cada uno es un JSON de `dynamicForms` con `fields[]` ordenados (`text`, `email`,
  `select`, `radio`, `checkbox`, `file`, `currency`, `date_triplet`,
  `section_header`, `note`…), con `validation`, `width` y visibilidad
  condicional por campo (`conditionalField`).
- `dynamic-form/DynamicForm.astro` carga un formulario por `formSlug` y lo
  renderiza con `DynamicFormReact.tsx`, que arma la UI con las primitivas de
  `shared/FormControls.tsx`.
- El envío pasa por `src/utils/submitForm.ts` → `POST` a **`send-email.php`**
  (JSON normalmente; `multipart/form-data` si hay adjuntos). Incluye honeypot
  (`website`) y token de Turnstile.
- `src/pages/form-config.json.ts` emite `/form-config.json` en build time: el
  mapa de destinatarios que lee el backend PHP.

**Secretos**: viven solo en `public/site-config.php` (git-ignored, plantilla en
`public/config.example.php`). `send-email.php` hace `require` de ese archivo.

**Captcha (Cloudflare Turnstile)**: el widget usa la site key **pública** de
`PUBLIC_TURNSTILE_SITE_KEY`; `send-email.php` verifica el token contra
`siteverify` con `turnstile_secret` y **falla cerrado** (token inválido o
`siteverify` inalcanzable ⇒ no se envía correo), solo mientras el secreto esté
configurado.

### Modo mantenimiento

`BaseLayout.astro` consulta la colección `maintenance` en build time; con
`enabled: true` reemplaza todo el cuerpo de la página por una pantalla de aviso.

### Estilos

Tailwind CSS 3 con tokens propios en `tailwind.config.mjs`. Las clases
reutilizables (`container-xl`, `container-lg`, `container-text`, `section`,
`section-alt`, `eyebrow`, `btn`, `btn-primary`, `btn-secondary`, `btn-link`,
`card`) están en `src/styles/global.css`, que **BaseLayout importa** — un CSS
que nadie importa no se bundlea y no llega al sitio.

Iconos: `react-icons` (Font Awesome 6, `react-icons/fa6`).

El origen de los valores es `specs/01-tokens-y-estilos-base.md`.

**Tema: light, cálido.** Los componentes NO escriben colores: piden tokens
semánticos, y por eso el tema se puede cambiar sin tocar una sola clase.

| Token | Para qué | Valor |
|---|---|---|
| `surface` | Fondo de la página (crema) | `#FAFAF5` |
| `surface-raised` | Tarjetas, inputs | `#FFFFFF` |
| `surface-sunken` | Secciones alternas (`section-alt`) | `#EEEAE3` |
| `content` | Texto principal | `#1D1D1B` |
| `content-muted` | Texto secundario | `#3A3A36` |
| `content-subtle` | Metadatos | `#6B6A66` |
| `content-inverse` | Texto sobre `bg-ink` / `bg-accent` | `#FAFAF5` |
| `line` / `line-strong` | Bordes | `#E4E0D8` / `#D9D6CF` |
| `accent` | Marca legible sobre el fondo | `#2E3A33` |

Los tonos de texto cumplen 4.5:1 sobre las tres superficies (`content-subtle`
sobre `surface-sunken` queda justo en 4.52:1: no oscurezcas ese fondo). Si
cambias uno, vuelve a medir.

**Nunca escribas `text-white/65` ni `bg-white/5`**: asumen fondo oscuro y rompen
el tema. Las únicas excepciones legítimas son los bloques con fondo oscuro fijo
(el scrim del hero sobre una foto, el degradado de marca del CTA) y el texto
sobre `bg-ink` o `bg-accent`, que usa `text-content-inverse`.

Para "texto en color de marca" usa `text-accent`.

**Paleta cruda** (para acentos puntuales; los componentes usan los semánticos):

- `ink` `#1D1D1B`
- `stone` — `800 #3A3A36`, `600 #6B6A66`, `500 #7C7B78`, `400 #B0AFAA`,
  `300 #D9D6CF`, `200 #E4E0D8`, `150 #EEEAE3`, `100 #F0F0EC`, `50 #FAFAF5`
- `sage` — `900 #2E3A33`, `700 #4E5E55`, `600 #556555`, `500 #718471`,
  `300 #B0BAA8`, `100 #DCE2D5`
- `clay` — `800 #5E4F3F`, `600 #8C7A66`, `300 #D8C9B8`, `100 #E8DDCF`
- `blush` `#F2EDE9`
- `semantics` — `success`, `alert`, `error` (estados de formulario)

`sage-500` y `clay-600` no llegan a 4.5:1 sobre fondos claros: úsalos solo en
fondos, líneas o texto de 24px o más.

**Tipografía**: DM Sans variable autoalojada (`@fontsource-variable/dm-sans`,
normal e itálica, importada en `BaseLayout.astro`). No hay segunda familia ni
Google Fonts. Los títulos van en peso 400 con tracking negativo; las frases
destacadas, en `subtitle-lg` + `italic`.

| Token | Rango | Uso |
|---|---|---|
| `heading-xxl` | 42–80px | Hero, bloques de impacto |
| `heading-xl` | 40–72px | H1 de página |
| `heading-lg` | 34–60px | H2 destacado |
| `heading-md` | 32–54px | H2 de sección |
| `heading-sm` | 28–48px | H1 de artículo |
| `heading-xs` | 22–26px | H3 de tarjeta |
| `subtitle-lg` | 20–24px, peso 300 | Citas |
| `subtitle-md` | 18–21px | Lead de artículo |
| `subtitle-sm` | 15–18px | Bajada de hero |
| `body-lg` / `body-md` / `body-sm` / `body-xs` | 17 / 16 / 15 / 14px | Cuerpo |
| `caption-md` / `caption-sm` / `caption-xs` | 13 / 12 / 11px | Botones, eyebrows, metadatos |

**Esquinas rectas.** La escala de radios solo tiene `rounded-none` y
`rounded-full` (círculos y pills): `rounded-lg` y compañía no existen.

**Layout**: `max-w-container` (1440px), `max-w-container-lg` (1200px),
`max-w-container-text` (760px); `px-gutter` y `py-section` / `py-section-sm` /
`py-section-lg` son `clamp()` fluidos.

**Motion**: el easing por defecto es `ease-out-expo`
(`cubic-bezier(.16,1,.3,1)`), con `ease-out-soft` y `ease-spring` como
alternativas; la duración por defecto es 400ms. Sombras `shadow-sm` → `shadow-xl`
basadas en la tinta (`rgba(29,29,27,…)`).

### Panel del CMS

Disponible en `/admin` con `npm run dev`. Las imágenes se suben a `public/`.

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
reutilizables (`btn-primary`, `btn-secondary`, `card`, `section`, `container-xl`,
`container-lg`) están en `src/styles/global.css`, que **BaseLayout importa** —
un CSS que nadie importa no se bundlea y no llega al sitio.

Iconos: `react-icons` (Font Awesome 6, `react-icons/fa6`).

**Tema: light.** Los componentes NO escriben colores: piden tokens
semánticos, y por eso el tema se puede cambiar sin tocar una sola clase.

| Token | Para qué | Valor |
|---|---|---|
| `surface` | Fondo de la página | `#FFFFFF` |
| `surface-raised` | Tarjetas, footer | `#F7F8FA` |
| `content` | Texto principal | `#16181D` |
| `content-muted` | Texto secundario | `#4B5563` |
| `content-subtle` | Metadatos | `#6B7280` |
| `line` / `line-strong` | Bordes | `#E5E7EB` / `#CBD1D9` |
| `accent` | Marca legible sobre el fondo | `#232C26` |

Los tonos de texto cumplen 4.5:1 sobre su fondo. Si cambias uno, vuelve a medir.

**Nunca escribas `text-white/65` ni `bg-white/5`**: asumen fondo oscuro y rompen
el tema. Las únicas excepciones legítimas son los bloques con fondo oscuro fijo
(el scrim del hero sobre una foto, el degradado de marca del CTA) y el texto
sobre `bg-brand-primary`.

Para "texto en color de marca" usa `text-accent`, **no** `text-brand-primary-light`:
sobre fondo claro ese tono es ilegible.

**Rampa de marca**: `brand-primary` (`#2E3A33`), `brand-primary-dark`
(`#232C26`), `brand-primary-darkest` (`#171D1A`).

**Tipografías**: DM Sans (títulos), DM Sans (cuerpo),
DM Mono (acentos técnicos). La escala está como utilidades de Tailwind
(`heading-xxl` → `caption-sm`).


### Panel del CMS

Disponible en `/admin` con `npm run dev`. Las imágenes se suben a `public/`.

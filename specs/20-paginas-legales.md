# SPEC 20 — Páginas legales y libro de reclamaciones

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 08
> **Fecha:** 2026-10-09
> **Objetivo:** Publicar en Astro `/terminos-y-condiciones`, `/cambios-y-devoluciones` y `/libro-de-reclamaciones`, editables desde el CMS, para que dejen de depender de WordPress.

## Por qué existe esta spec

- **Son las únicas páginas de contenido que siguen en WordPress.** El footer de Astro (`global.footer`) y el del checkout (`legal_links` de `eres-checkout/config.php`) ya enlazan a esas tres rutas, pero Astro no las tiene.
- **Bloquean la limpieza de WordPress.** Están hechas con Elementor y JetThemeCore. Mientras vivan ahí, esos plugins no se pueden retirar (SPEC 21).
- **El libro de reclamaciones depende de un plugin.** El formulario actual lo pinta el plugin "Reclamaciones" de WordPress (campos `ldr_*`).

Lo que se verificó antes de escribirla (API REST pública de WordPress, 2026-10-09):

| Página | ID | Contenido |
|---|---|---|
| `terminos-y-condiciones` | 3367 | Eyebrow "— Información legal", título, "Última actualización: 06 de junio de 2026", bajada y secciones numeradas (01, 02, …) |
| `cambios-y-devoluciones` | 3382 | Misma estructura. Incluye un párrafo "Importante:" destacado |
| `libro-de-reclamaciones` | 3425 | Eyebrow "— Atención al cliente", título y un formulario en cuatro bloques |

- `public/send-email.php` ya genera un correlativo por tipo de formulario (`data/counter.json`) y guarda cada envío en `data/submissions/`.
- `DynamicFormReact` ya soporta `section_header`, `note`, `select`, `currency`, `textarea` y `showCorrelativo`.

## Alcance

**Entra:**

- Colección nueva `legal` en `tina/collections/legal.ts`, con un MDX por página en `src/content/legal/`.
- Ruta `src/pages/[legal].astro`, que genera una página por documento de la colección.
- Componentes `src/components/legal/LegalPage.astro` y `LegalPageReact.tsx` (patrón de componente doble).
- Documentos `terminos-y-condiciones.mdx` y `cambios-y-devoluciones.mdx`, con el texto de WordPress copiado tal cual.
- Página `src/pages/libro-de-reclamaciones.astro`, que monta `DynamicForm` con `formSlug="libro-de-reclamaciones"`.
- Formulario `src/content/dynamic-forms/libro-de-reclamaciones.json`, con los mismos campos que el de WordPress.
- Entrada `libro-de-reclamaciones` en `src/content/form-config/index.json`.
- En `public/send-email.php`: prefijo `LDR` para el correlativo y un correo de constancia propio para la consumidora.
- Bloque `legalClaims` en la colección `systemPages`, con el título, la bajada y el SEO de `/libro-de-reclamaciones`.
- Viñeta nueva en `CLAUDE.md`.

**Fuera de alcance (para futuras specs):**

- Política de privacidad y política de cookies. Hoy no existen en WordPress (`/politica-de-privacidad/` responde 404).
- Borrar las páginas de WordPress y el plugin "Reclamaciones". Va en SPEC 21.
- Migrar a Astro los reclamos ya registrados en WordPress. SPEC 21 los exporta.
- Panel para consultar o responder reclamos. Llegan por correo y quedan en `data/submissions/`.
- Revisión legal del texto. Se copia el vigente; ver "Pendiente de confirmar".
- Cambiar los enlaces del footer o del checkout. Ya apuntan a estas rutas.

## Referencia de diseño

### Página legal (`/terminos-y-condiciones`, `/cambios-y-devoluciones`)

- Contenedor `container-text` (760px) sobre `surface`, con `py-section`.
- Cabecera: eyebrow (`eyebrow`), H1 en `heading-xl`, "Última actualización: …" en `caption-md` color `content-subtle` y bajada en `subtitle-md`.
- Cada H2 del cuerpo es una sección. Lleva encima su número (`01`, `02`, …) en `caption-sm` color `content-subtle`, generado con un contador CSS. El número no se escribe en el contenido.
- H2 en `heading-xs`, con una línea `line` arriba y `py-section-sm` entre secciones.
- Párrafos y listas en `body-md` color `content-muted`. Enlaces en `text-accent` subrayados.
- Una cita (`>`) se pinta como aviso: fondo `surface-sunken`, borde izquierdo `accent`, texto `body-sm`.
- Sin imagen de cabecera ni índice lateral.

### Libro de reclamaciones

- Misma cabecera, con el eyebrow "— Atención al cliente".
- Bajo la cabecera, una nota con los datos del proveedor: razón social, RUC y domicilio.
- El formulario usa `styleVariant` `contact` y cuatro `section_header` numerados.
- Al enviar se muestra el estado de éxito con el correlativo (`showCorrelativo: true`).

## Modelo de datos

### Colección `legal`

```ts
{
  name: "legal",
  label: "Páginas legales",
  path: "src/content/legal",
  format: "mdx",
  fields: [
    { name: "title", type: "string", required: true, isTitle: true },
    { name: "eyebrow", type: "string" },
    { name: "updatedAt", type: "datetime" },
    { name: "intro", type: "string", ui: { component: "textarea" } },
    { name: "body", type: "rich-text", isBody: true },
    { name: "seo", type: "object", fields: [/* title, description */] },
  ],
}
```

- El nombre del archivo es el slug de la URL: `terminos-y-condiciones.mdx` → `/terminos-y-condiciones`.
- `updatedAt` se muestra como "06 de junio de 2026" (`es-PE`).
- Un documento nuevo en la colección publica su página tras el rebuild, sin tocar código.

### Formulario `libro-de-reclamaciones`

| # | `name` | Tipo | Ancho | Obligatorio | Opciones |
|---|---|---|---|---|---|
| — | — | `section_header` "1. Identificación del consumidor" | full | — | |
| 1 | `nombreCompleto` | `text` | full | Sí | |
| 2 | `direccion` | `text` | full | Sí | |
| 3 | `tipoDocumento` | `select` | half | Sí | DNI, Carné de Extranjería, Pasaporte, RUC |
| 4 | `numeroDocumento` | `text` | half | Sí | |
| 5 | `correo` | `email` | half | Sí | |
| 6 | `telefono` | `text` | half | Sí | |
| — | — | `section_header` "2. Identificación del bien contratado" | full | — | |
| 7 | `tipoBien` | `select` | half | Sí | Producto, Servicio |
| 8 | `montoReclamado` | `currency` | half | No | |
| 9 | `descripcionBien` | `textarea` | full | Sí | |
| — | — | `section_header` "3. Detalle de reclamación o pedido" | full | — | |
| 10 | `tipoSolicitud` | `select` | full | Sí | Reclamo, Queja |
| 11 | `detalle` | `textarea` | full | Sí | |
| 12 | `pedido` | `textarea` | full | Sí | |
| — | — | `section_header` "4. Observaciones y acciones adoptadas por el proveedor" | full | — | |
| — | — | `note` con los tres avisos legales de la página actual | full | — | |

- `formId`: `libro-de-reclamaciones`. `submitButtonText`: "Ingresar reclamo".
- `correo` y `nombreCompleto` usan esos nombres porque `send-email.php` ya los lee para el correo de confirmación.

### `form-config`

```json
{
  "formType": "libro-de-reclamaciones",
  "label": "Libro de reclamaciones",
  "enabled": true,
  "recipients": ["hola@eresskinstudio.com"]
}
```

### Correlativo y constancia

- Prefijo `LDR`: el primer reclamo es `LDR-000001`. El contador es independiente del de `contacto`.
- La consumidora recibe un correo "Constancia de tu reclamo [LDR-000001] — ERES Skin Studio" con la fecha, el correlativo y todos los datos que envió.
- El estudio recibe el correo de siempre, con el mismo correlativo.

## Plan de implementación

1. Crear `tina/collections/legal.ts`, registrarla en `tina/config.ts` y crear `terminos-y-condiciones.mdx` con el texto de la página 3367. `npm run dev` abre la colección en `/admin`.
2. Crear `LegalPage.astro`, `LegalPageReact.tsx` y `src/pages/[legal].astro`. `/terminos-y-condiciones` se ve con la cabecera y las secciones numeradas.
3. Crear `cambios-y-devoluciones.mdx` con el texto de la página 3382. El párrafo "Importante:" va como cita.
4. Agregar el bloque `legalClaims` a `tina/collections/systemPages.ts` y a `src/content/system-pages/index.json`.
5. Crear `src/content/dynamic-forms/libro-de-reclamaciones.json` y la entrada de `form-config`.
6. Crear `src/pages/libro-de-reclamaciones.astro` con la cabecera, la nota del proveedor y `DynamicForm`.
7. En `public/send-email.php`, agregar el prefijo `LDR` y la constancia para `libro-de-reclamaciones`.
8. Agregar la viñeta "Páginas legales" a `CLAUDE.md`.

## Criterios de aceptación

- [ ] `npm run build` genera `dist/terminos-y-condiciones/index.html`, `dist/cambios-y-devoluciones/index.html` y `dist/libro-de-reclamaciones/index.html`.
- [ ] El texto de las dos páginas legales coincide con el de WordPress, sección por sección.
- [ ] Cada sección muestra su número (`01`, `02`, …) sin que esté escrito en el MDX.
- [ ] Cambiar `updatedAt` en el CMS cambia la fecha visible.
- [ ] Las tres URLs aparecen en `sitemap-0.xml`.
- [ ] Los tres enlaces "Legales" del footer abren su página sin 404.
- [ ] El libro de reclamaciones muestra los 12 campos y los 4 encabezados de la tabla.
- [ ] Enviar el formulario vacío marca los 11 campos obligatorios y no envía nada.
- [ ] Un envío válido muestra el correlativo `LDR-` seguido de seis dígitos.
- [ ] Dos envíos seguidos reciben correlativos consecutivos.
- [ ] La consumidora recibe la constancia con su correlativo y los datos que envió.
- [ ] El estudio recibe el reclamo en los `recipients` de `form-config`.
- [ ] Con `enabled: false` en `form-config`, el envío responde "Este formulario está desactivado."
- [ ] No hay `text-white/…`, `bg-white/…` ni colores escritos a mano en los archivos nuevos.

## Decisiones

- **Sí:** una colección `legal` con una ruta dinámica. Agregar la política de privacidad será crear un MDX, sin código.
- **No:** un JSON por página con secciones estructuradas. El texto legal es prosa larga: el editor de texto enriquecido es más cómodo.
- **Sí:** numeración por CSS. Reordenar o quitar una sección no obliga a renumerar a mano.
- **Sí:** el libro de reclamaciones como `dynamicForms`. Reutiliza validación, Turnstile, honeypot, correlativo y guardado en disco.
- **No:** un formulario hecho a mano. Duplicaría lo que `DynamicFormReact` ya resuelve.
- **Sí:** los mismos campos que el formulario de WordPress. La paridad evita reabrir una discusión legal en esta spec.
- **Sí:** constancia por correo con los datos del reclamo. La consumidora necesita una copia de lo que presentó.
- **Sí:** copiar el texto vigente sin corregirlo. La revisión del contenido es del cliente.
- **Definición rápida:** el usuario pidió crear esta spec junto con SPEC 21, sin ronda de preguntas propia. Las decisiones de arriba son la recomendación y quedan por confirmar al revisar el borrador.

## Pendiente de confirmar

No son tareas de implementación: son datos del texto actual que conviene que el cliente valide antes de aprobar.

- **RUC.** Los términos dicen "Eres Skin Studio S.A.C., RUC 20600123456". El número parece de relleno.
- **Plazo de respuesta.** El formulario actual dice "treinta (30) días calendario". La norma vigente del libro de reclamaciones puede fijar un plazo distinto.
- **Correo de contacto.** Las páginas citan `eresskinstudio@gmail.com`; `form-config` usa `hola@eresskinstudio.com`.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `send-email.php` no envía correos hasta que exista `site-config.php` en el servidor | El reclamo queda guardado en `data/submissions/` aunque falle el correo. SPEC 21 crea `site-config.php` en producción. |
| Dos reclamos simultáneos leen el mismo contador | Riesgo ya existente en `generateCorrelative()`. Con el volumen de un libro de reclamaciones es improbable; no se cambia aquí. |
| Un documento de `legal` con un slug que choque con otra página (`contacto.mdx`) | El build de Astro falla por ruta duplicada: se detecta antes de publicar. |

## Lo que **no** entra en esta spec

- Política de privacidad y de cookies.
- Borrar páginas o plugins de WordPress.
- Migrar reclamos anteriores.
- Panel de gestión de reclamos.
- Revisión legal del contenido.

# SPEC 08 — Página Contacto

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 04, SPEC 05, SPEC 06, SPEC 07
> **Fecha:** 2026-09-28
> **Objetivo:** Rehacer `/contacto` según la referencia de diseño (datos de contacto con horarios en vivo y mapa condicionado a las cookies), editable desde el CMS y correcta de 360px a 1920px.

## Por qué existe esta spec

Hoy `/contacto` es un placeholder: un `h1`, una línea de texto y el `DynamicForm` "contacto". Todos los "Contacto" del nav, el footer y la barra de anuncios llevan ahí.

La referencia (`Eres Skin Studio (2).html`, pantalla `contacto`) define dos bloques:

- **Datos:** teléfono, correo, dirección y horarios, junto a una foto de la cabina;
- **Visítanos:** texto y mapa.

No incluye formulario.

Dos piezas del diseño obligan a tocar cosas que ya existen:

- **Horarios en vivo.** El indicador "Abierto ahora" y la etiqueta "Hoy" necesitan horarios estructurados. Hoy `global.contact.hours` es texto libre, así que cambia de formato, y el footer se adapta.
- **Mapa.** El iframe de Google deja cookies de terceros. Solo se carga con la categoría "funcional" aceptada, y para eso el banner de cookies tiene que avisar cuando cambia el consentimiento.

## Referencia de diseño (valores extraídos del bundle)

Se aplican las equivalencias hex → token y los breakpoints de SPEC 05:

- **móvil:** `< md`;
- **tablet:** `md` a `lg`;
- **desktop:** `≥ lg`.

Equivalencias nuevas para esta página:

| Hex del bundle | Token |
|---|---|
| `#5E8C61` (punto "abierto") | `bg-sage-500`, con anillo `ring-4 ring-sage-500/20` |
| `#B0AFAA` (punto "cerrado") | `bg-stone-400`, con anillo `ring-4 ring-stone-400/20` |
| `#C9D1C2` (fondo del mapa) | `bg-sage-300` |

Las dos secciones usan `container-xl`.

### 1. Datos

- Fondo `bg-surface-raised`. Padding `clamp(24px,5vw,72px)` arriba y `clamp(56px,7vw,96px)` abajo.
- Encabezado (gap 18px, margen inferior `clamp(28px,4vw,48px)`), con `data-reveal` 0:
  - migas `Home / Contacto`, igual que en `ServicesHeader`: `text-content-muted`, y la página actual en `text-content`;
  - `h1` en `heading-xl`.
- Grid:
  - en desktop, columnas `minmax(0,1.1fr) minmax(0,1fr)`, gap `32px clamp(40px,6vw,96px)`, `items-start`;
  - en `< lg`, una columna, con la foto arriba (`order-first`).
- La columna izquierda es una pila de bloques con `border-b border-line-strong`. Cada bloque:
  - `border-t border-line-strong`, padding `28px 0 36px`, gap 18px;
  - eyebrow en `caption-sm` uppercase, tracking `.22em`, peso 500, `text-sage-700`.
- **Bloque "Atención al cliente"** (`data-reveal` 0):
  - grid `repeat(auto-fit,minmax(200px,1fr))` con gap 20px y dos ítems con gap 6px;
  - cada ítem tiene su etiqueta en `caption-md text-content-subtle` y el dato en 18px (`subtitle-md`) con `link-underline`;
  - "Teléfono · WhatsApp" enlaza a `phoneHref(global.contact)`, en una pestaña nueva si es `https`;
  - "Correo" enlaza a `mailto:` con `overflow-wrap:anywhere`;
  - un ítem sin dato no se renderiza.
- **Bloque "Estudio"** (`data-reveal` 80):
  - la dirección de `global.contact.address`, en 18px con `leading-[1.5]`;
  - el botón "Copiar dirección": icono de 16px con trazo 1.5 (dos rectángulos, del bundle) y texto en `body-xs` con `link-underline`;
  - al copiar, el texto pasa a "Dirección copiada" durante 2.2s y vuelve;
  - sin la API de portapapeles, el botón no se muestra.
- **Bloque "Horarios"** (`data-reveal` 160):
  - estado: un punto de 8px `rounded-full` y el texto en `body-xs`, "Abierto ahora" o "Cerrado ahora";
  - lista de filas con `flex justify-between`, gap 16px, `py-3`, `border-b border-stone-150` y `body-md`;
  - a la izquierda, la etiqueta de días en `text-content-subtle`. En la fila de hoy va en `text-content`, peso 500, con una pastilla "Hoy" (10px, tracking `.14em`, peso 600, `bg-sage-100 text-sage-900`, `px-[7px] py-1`);
  - a la derecha, los turnos en `text-content tabular-nums`, con el formato `09:30 — 14:00` y un turno por línea. Una fila sin turnos muestra "Cerrado".
- **Foto** (`data-reveal` 100):
  - caja `overflow-hidden bg-stone-150`, `aspect-[4/3]` en móvil y `aspect-[4/5]` desde `md`;
  - en desktop es `sticky`, con `top` igual al alto del header (72px) + 24px;
  - el `<img>` lleva `object-cover` y un `alt` editable.

### 2. Visítanos

- Fondo `bg-sage-100`, padding `clamp(56px,8vw,112px)`.
- Grid `repeat(auto-fit,minmax(min(100%,420px),1fr))`, gap `36px clamp(40px,6vw,96px)`, `items-center`.
- Texto (`max-w-[540px]`, gap 20px, `data-reveal` 0):
  - eyebrow en `text-accent`;
  - `h2` en `heading-md` con `whitespace-pre-line` y `mb-1.5`;
  - párrafo en `body-md text-accent`;
  - botón `btn-fill-dark` "Ver en Google Maps →" (`mt-2.5`), que abre `mapsUrl` en una pestaña nueva.
- Mapa (`data-reveal` 120):
  - caja `relative overflow-hidden bg-sage-300`, de 320px de alto en móvil y 480px desde `md`;
  - con consentimiento "funcional", un `<iframe>` con `title`, `loading="lazy"`, `absolute inset-0`, `border-0` y `filter: grayscale(.35) contrast(1.02)`;
  - sin consentimiento, un placeholder centrado con un texto en `body-sm text-accent` y un botón `btn-link` "Activar mapa". El botón dispara `open-cookie-consent`.

## Alcance

**Entra:**

- Reescritura de `src/pages/contacto.astro` con las dos secciones. **El `DynamicForm` sale de la página.**
- Colección nueva `contact` (`tina/collections/contact.ts`), registrada en `tina/config.ts`, con `router: () => "/contacto"` y su contenido inicial en `src/content/contact/index.json` con los textos del bundle.
- Componentes en `src/components/contact/`, cada uno con el patrón doble (`.astro` + `React.tsx`, hidratado con `client:tina`):
  - `ContactDetails`;
  - `VisitUs`.
- Comportamiento de producción con `<script>` de Astro (vanilla, sin React), cada uno en su propio archivo de `src/scripts/`:
  - `openingHours.ts` calcula en hora de Lima (`America/Lima`, con `Intl.DateTimeFormat`) la fila de hoy y si el estudio está abierto;
  - `copyAddress.ts` maneja "Copiar dirección";
  - `consentMap.ts` inserta el iframe del mapa según el consentimiento.
- Cambio de formato de `global.contact.hours` a horarios estructurados (ver Modelo de datos), con migración de `src/content/global/index.json` al horario vigente:
  - lunes a viernes, 09:30–14:00 y 15:00–20:00;
  - sábados, 09:30–14:00 y 15:00–18:00;
  - domingo, cerrado.
- `FooterReact.tsx` renderiza los horarios nuevos: la etiqueta, y debajo un turno por línea con el formato `09:30 — 14:00`.
- Utilidad compartida `src/utils/openingHours.ts` (tipos, formateo de turnos y cálculo de abierto u hoy), que usan el footer, la página y el script.
- `CookieConsentReact.tsx` emite el evento `cookie-consent-change` en `window` (con las preferencias en `detail`) cada vez que guarda el consentimiento.
- Interruptor `enabled` en cada sección.
- SEO propio (`contact.seo`) que se pasa a `BaseLayout`.
- Foto de la cabina del bundle, convertida a `public/uploads/contacto/cabina.webp`.

**Queda fuera (para specs futuras):**

- El formulario de contacto en la página. El JSON `dynamic-forms/contacto.json` y su `form-config` no se borran.
- JSON-LD `LocalBusiness` con dirección y horarios.
- Horarios especiales por feriado o fecha puntual.
- Mapa propio (Leaflet/Mapbox) o una imagen estática del mapa.
- Traducciones.

## Modelo de datos

Colección `contact` (un solo documento, sin crear ni borrar, igual que `services`):

```ts
contact: {
  details: {
    enabled: boolean;
    breadcrumb: string;            // "Contacto"
    title: string;                 // "Hablemos."
    support: {
      eyebrow: string;             // "— Atención al cliente"
      phoneLabel: string;          // "Teléfono · WhatsApp"
      emailLabel: string;          // "Correo"
    };
    studio: {
      eyebrow: string;             // "— Estudio"
      copyLabel: string;           // "Copiar dirección"
      copiedLabel: string;         // "Dirección copiada"
    };
    hours: {
      eyebrow: string;             // "— Horarios"
      openNowLabel: string;        // "Abierto ahora"
      closedNowLabel: string;      // "Cerrado ahora"
      todayLabel: string;          // "Hoy"
      closedLabel: string;         // "Cerrado"
    };
    image: string;                 // "/uploads/contacto/cabina.webp"
    imageAlt: string;              // "Cabina de tratamiento de Eres Skin Studio"
  };
  visit: {
    enabled: boolean;
    eyebrow: string;               // "— Visítanos"
    title: string;                 // "Te esperamos\nen Miraflores."
    text: string;
    ctaLabel: string;              // "Ver en Google Maps"
    mapsUrl: string;               // https://www.google.com/maps/search/?api=1&query=…
    embedUrl: string;              // https://maps.google.com/maps?q=…&z=16&output=embed
    mapTitle: string;              // "Mapa Eres Skin Studio"
    consentText: string;           // "Activa las cookies funcionales para ver el mapa."
    consentCtaLabel: string;       // "Activar mapa"
  };
  seo: { title: string; description: string };
}
```

`global.contact.hours` cambia de `{ label, text }` a:

```ts
hours: {
  label: string;                   // "Lunes — Viernes"
  days: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
  shifts: { open: string; close: string }[];   // "09:30" / "14:00"; vacío = cerrado
}[];
```

Convenciones:

- `days` es una lista `string` con `options` y el componente `checkbox-group` de Tina.
- `open` y `close` se validan en el CMS con el formato `HH:MM` de 24h, y `close` tiene que ser mayor que `open`.
- Un día que no aparece en ninguna fila se trata como cerrado, pero no se muestra.
- Un día en dos filas es un error de validación de la lista.
- "Abierto" significa que la hora de Lima está en `[open, close)` de algún turno del día.
- Teléfono, correo y dirección no se duplican: la página los lee de `global.contact`.
- Si una sección tiene `enabled: false`, no aparece en el HTML.
- Sin `global.contact.hours`, el bloque "Horarios" no se renderiza. Sin `embedUrl`, "Visítanos" se muestra sin mapa, con el texto a todo el ancho.

## Plan de implementación

1. Crear `src/utils/openingHours.ts` y cambiar el schema de `global.contact.hours`. Migrar `global/index.json` y adaptar `FooterReact.tsx`.
   - **Prueba:** `npm run build` pasa y el footer muestra los tres horarios con el formato nuevo.
2. Crear `tina/collections/contact.ts`, registrarla y crear `src/content/contact/index.json`. Copiar la foto a `public/uploads/contacto/cabina.webp`.
   - **Prueba:** `/admin` muestra "Contacto".
3. Reescribir `src/pages/contacto.astro`: consulta `contact` y `global`, pasa el SEO y monta `ContactDetails`, con los bloques "Atención al cliente" y "Estudio" y la foto sticky.
   - **Prueba:** `/contacto` ya no muestra el formulario.
4. Agregar el bloque "Horarios" a `ContactDetails` con la lista estática, más `src/scripts/openingHours.ts` para el indicador y la etiqueta "Hoy". Sin JS, el indicador y la pastilla quedan ocultos.
5. Agregar `src/scripts/copyAddress.ts` y el botón "Copiar dirección".
6. Hacer que `CookieConsentReact.tsx` emita `cookie-consent-change` al guardar.
   - **Prueba:** el banner sigue funcionando igual en el home.
7. Agregar `VisitUs` con el placeholder y `src/scripts/consentMap.ts`, que lee `eres-skin-studio-cookie-consent:v1` al cargar y escucha `cookie-consent-change`.

## Criterios de aceptación

- [ ] `/contacto` muestra, en este orden, "Datos" y "Visítanos", sin formulario.
- [ ] El teléfono, el correo y la dirección de la página cambian al editarlos en `global.contact`, y el footer muestra los mismos valores.
- [ ] El teléfono enlaza a `phoneHref(global.contact)` y el correo a `mailto:`.
- [ ] Un lunes a las 10:00 de Lima, el indicador dice "Abierto ahora" y la fila "Lunes — Viernes" lleva "Hoy".
- [ ] Un lunes a las 14:30 de Lima, el indicador dice "Cerrado ahora".
- [ ] Un domingo, el indicador dice "Cerrado ahora" y la fila "Domingo" lleva "Hoy" y muestra "Cerrado".
- [ ] El resultado depende de la hora de Lima y no de la zona horaria del navegador (probado con el sistema en otra zona).
- [ ] Sin JS, los horarios se ven completos y no aparecen ni el indicador ni "Hoy".
- [ ] "Copiar dirección" copia `global.contact.address`, cambia a "Dirección copiada" y vuelve a los 2.2s.
- [ ] Sin consentimiento "funcional", no hay ninguna petición a `google.com` al cargar la página, y el mapa muestra el placeholder.
- [ ] "Activar mapa" abre el banner de preferencias. Al aceptar "funcional", el iframe aparece sin recargar.
- [ ] Con "funcional" aceptado de antes, el iframe aparece al cargar.
- [ ] "Ver en Google Maps" abre `mapsUrl` en una pestaña nueva, con o sin consentimiento.
- [ ] En desktop, la foto queda sticky mientras se recorren los bloques. En `< lg`, va arriba y no es sticky.
- [ ] El mapa mide 320px de alto en móvil y 480px desde `md`.
- [ ] Con `enabled: false` en una sección, esa sección no está en el HTML.
- [ ] El CMS no deja guardar un turno con formato distinto de `HH:MM`, con `close <= open`, ni un día repetido en dos filas.
- [ ] Desde `/admin` se editan todos los textos, la foto, las URL del mapa, los horarios y el SEO, y el cambio se ve en la vista previa.
- [ ] No hay scroll horizontal del `body` en ningún ancho de 360px a 1920px.
- [ ] Ningún componente nuevo escribe colores en hex ni usa `text-white/*` o `bg-white/*`.
- [ ] En producción, `/contacto` no carga el runtime de React. El banner de cookies es la excepción, porque ya hidrataba antes.
- [ ] Con `global.motion.revealAnimations: false`, con `prefers-reduced-motion` o sin JS, todo el contenido es visible desde la carga.
- [ ] La consola del navegador no muestra errores en `/contacto`.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario ("asume el resto"), se confirmaron las respuestas a las preguntas, el encabezado y el horario vigente. El resto de las secciones se escribieron sin revisión intermedia.
- **Sí: quitar el formulario de la página.** Elección del usuario. El diseño no lo tiene. Su JSON y su `form-config` se quedan para no tocar el backend.
- **Sí: teléfono, correo y dirección desde `global.contact`.** Elección del usuario. Es una sola fuente para el footer y la página.
- **No: duplicarlos en `contact`.** Se desincronizarían.
- **Sí: horarios estructurados en `global.contact.hours`.** Elección del usuario. Es lo que hace posibles "Abierto ahora" y "Hoy", y el footer usa los mismos datos.
- **Sí: horario vigente de `global`, con el corte de 14:00 a 15:00.** Elección del usuario frente al 09:30–20:00 corrido del diseño.
- **Sí: turnos múltiples por fila.** El horario real tiene refrigerio, y un rango único mentiría sobre la disponibilidad.
- **Sí: cálculo en el navegador con `Intl` y `America/Lima`.** El sitio es estático, así que un cálculo en build time quedaría viejo al día siguiente.
- **Sí: formato 24h (`09:30 — 14:00`).** Es el del diseño y alinea en `tabular-nums`. El footer lo adopta también.
- **Sí: scripts vanilla de Astro en lugar de islas React.** Mantienen la regla de no cargar React en producción.
- **Sí: mapa condicionado a la categoría "funcional".** Elección del usuario. El iframe de Google deja cookies de terceros.
- **Sí: evento `cookie-consent-change` en el banner.** Hoy el banner guarda en `localStorage` sin avisar. Sin el evento, el mapa solo aparecería al recargar.
- **Sí: `mapsUrl` y `embedUrl` como campos del CMS.** Derivarlos de la dirección fallaría con direcciones ambiguas, y el editor puede pegar el enlace exacto de Google.
- **Sí: dirección en una sola línea, tal como está en `global`.** El diseño la parte en tres líneas, pero convertir el campo en multilínea cambiaría el footer y el menú móvil sin necesidad.
- **Sí: `sage-500` para el punto "abierto".** `#5E8C61` no existe en la paleta. Como es un fondo y no texto, `sage-500` es válido según SPEC 01.
- **Sí: interruptor `enabled` en cada sección y SEO propio.** Elección del usuario, con el mismo patrón que `home`, `about` y `services`.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| La foto del bundle mide 500×499px y se ve blanda en la columna sticky de desktop (~600px de ancho). | Usarla como placeholder y documentar en el `description` del campo que se reemplace por una foto de al menos 1200×1500px. |
| El cambio de formato de `hours` rompe un consumidor que no se revisó. | Hoy solo lo usa `FooterReact.tsx` (verificado con grep). `npm run build` falla si el tipo generado no coincide. |
| `position: sticky` no funciona si un ancestro tiene `overflow: hidden`. | La sección "Datos" no lleva `overflow-hidden`. Verificar en desktop. |
| Header oculto o visible cambia el `top` ideal del sticky. | `top` fijo = alto del header + 24px, igual que en SPEC 07. Aceptar el hueco cuando el header está oculto. |
| El navegador no soporta `timeZone` en `Intl`. | Sin soporte, el script no muestra el indicador ni "Hoy". Los horarios se siguen viendo. |
| `navigator.clipboard` no existe fuera de HTTPS o en navegadores viejos. | El botón solo se muestra si la API existe. |
| El consentimiento se guarda en otra pestaña. | Escuchar también el evento `storage` de la clave `eres-skin-studio-cookie-consent:v1`. |

## Lo que **no** entra en esta spec

- Formulario de contacto en la página.
- JSON-LD `LocalBusiness`.
- Horarios especiales por feriado.
- Mapa propio o imagen estática del mapa.
- Dirección multilínea en `global`.
- Traducciones.

Cada una de estas cosas, si se hace, va en su propia spec.

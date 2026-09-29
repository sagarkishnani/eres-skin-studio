# SPEC 07 — Página Servicios

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 04, SPEC 05, SPEC 06
> **Fecha:** 2026-09-28
> **Objetivo:** Crear la página `/servicios` a partir de la referencia de diseño (cabecera, bloques de servicio, experiencia, preguntas frecuentes y reserva), editable desde el CMS, con cada sección ocultable y correcta de 360px a 1920px.

## Por qué existe esta spec

Hoy no existe `/servicios`:

- el home enlaza a `/servicios` y a `/servicios/<slug>`, que dan 404;
- el nav y el footer mandan "Servicios" y cada servicio a `/contacto`.

La referencia (`Eres Skin Studio (2).html`, pantalla `servicios`) define cinco bloques en un orden fijo. Varios reutilizan piezas existentes:

- el CTA de reserva es la sección `Booking` del home, con el mismo texto;
- las fotos de los servicios son las de `public/uploads/home/svc-*.webp`;
- migas, eyebrow, botones, `link-underline` y animaciones de entrada ya existen (SPEC 05 y SPEC 06).

## Referencia de diseño (valores extraídos del bundle)

Se aplican las mismas equivalencias hex → token y los mismos breakpoints de SPEC 05:

- **móvil:** `< md`;
- **tablet:** `md` a `lg`;
- **desktop:** `≥ lg`.

Todas las secciones usan `container-xl`. El **grid partido** es el de SPEC 06.

### 1. Cabecera

- Fondo `bg-surface-raised`, padding `clamp(28px,5vw,64px)` arriba y `clamp(40px,6vw,80px)` abajo.
- Igual que `AboutHeader` (migas `Home / Servicios`, `h1` en `heading-xl` con `whitespace-pre-line`, bajada a la derecha), con dos diferencias:
  - las migas van en `text-content-muted` en lugar de `text-clay-800`;
  - la bajada mide `max-w-[460px]`.
- `data-reveal` 0 y 120.

### 2. Bloques de servicio (uno por ítem del CMS)

- Padding `clamp(40px,6vw,96px)`. Cada bloque lleva `id` igual al `slug` del servicio, que sirve de ancla.
- Colores por posición (índice desde 0):
  - pares (0, 2, …): `bg-blush`, `text-content`, eyebrow `text-clay-800`, párrafos `text-content-muted`, botón `btn-fill-dark`;
  - impares (1, 3, …): `bg-sage-700`, `text-content-inverse` en todo el texto, botón `btn-outline-light`.
- Desktop (`≥ lg`):
  - 2 columnas iguales, gap `clamp(28px,5vw,88px)`, `items-center`;
  - imagen a la izquierda en los pares y a la derecha en los impares.
- `< lg`: una columna, con la imagen siempre arriba.
- Imagen:
  - caja `aspect-[4/3]` en móvil y `aspect-[5/4]` desde `md`, `overflow-hidden`, `bg-stone-150`;
  - `<img>` con `object-cover` y `alt` igual al nombre del servicio;
  - en `≥ lg` hace zoom a `scale(1.04)` al pasar el mouse, en 1.4s `ease-out-expo`, con `group-hover`.
- Texto (`max-w-[560px]`, gap 18px):
  - eyebrow `— 01 / Limpiezas faciales` (número por posición + nombre);
  - `h2` en `heading-md` con `whitespace-pre-line`;
  - párrafos en `body-md`;
  - botón "Reservar →" (`mt-3.5`) a la URL de `footer.social` → `whatsapp`. Sin esa red, el botón no se renderiza.
- `data-reveal` 0 (imagen) y 120 (texto).

### 3. Tu experiencia Eres

- Fondo `bg-surface-raised`, padding `clamp(64px,9vw,128px)`.
- Encabezado centrado (`max-w-container-text`, gap 18px, margen inferior `clamp(40px,6vw,80px)`):
  - eyebrow en `text-content-muted`;
  - `h2` en `heading-md`;
  - bajada en `body-md text-content-muted`, `max-w-[560px]`.
- Pasos: 1 columna con gap 28px en móvil, 2 en tablet y 4 en desktop con gap `40px 32px`. Es la misma grilla que `PillarsReact`.
- Cada paso:
  - `border-t border-stone-800`, `pt-5`, gap 12px;
  - número `01`–`04` en `caption-sm tabular-nums text-content-subtle`;
  - `h3` en `subtitle-lg` con peso 400;
  - texto en `body-sm text-content-muted`.
- `data-reveal` escalonado cada 110ms en `≥ md` y 0 en móvil.

### 4. Preguntas frecuentes

- Fondo `bg-surface`, padding `clamp(64px,8vw,120px)`, `id="preguntas-frecuentes"`.
- Desktop (`≥ lg`):
  - columnas `minmax(0,.8fr) minmax(0,1.4fr)`, gap `36px 80px`, `items-start`;
  - la columna izquierda es `sticky` con `top` igual a la altura del header (72px) + 88px.
- `< lg`: una columna, sin sticky.
- Columna izquierda (gap 18px):
  - eyebrow en `text-content-muted` y `h2` en `heading-md`;
  - frase `¿No encuentras lo que buscas?` en `body-sm text-content-muted`;
  - `link-underline` con flecha a WhatsApp (`footer.social`). Sin esa red, el link no se renderiza.
- Lista con `border-t border-line`. Cada pregunta es un `<details name="faq">` con `border-b border-line`:
  - `<summary>` en `body-lg` desde `md` y `body-md` en móvil, con padding `24px 0` (`20px 0` en móvil), sin el marcador nativo;
  - a la derecha, un "+" de 14px dibujado con dos barras de 1.5px; al abrir, la vertical pasa a `scaleY(0)` en 450ms `ease-out-expo`;
  - respuesta en `body-sm text-content-muted`, `pr-10 pb-6`;
  - la apertura se anima con CSS progresivo (`::details-content` + `interpolate-size`); donde no hay soporte, abre sin transición;
  - la primera pregunta va `open` al cargar.
- `data-reveal` 0 y 100.

### 5. Reserva

Es la sección `Booking` del home, sin cambios visuales, y lee `home.booking`.

## Alcance

**Entra:**

- Ruta `src/pages/servicios.astro` con las cinco secciones en el orden del diseño.
- Colección nueva `services` (`tina/collections/services.ts`), registrada en `tina/config.ts`, con su contenido inicial en `src/content/services/index.json` y los textos del bundle (3 servicios, 4 pasos y 13 preguntas).
- Componentes en `src/components/services/`, cada uno con el patrón doble (`.astro` + `React.tsx`, hidratados con `client:tina`):
  - `ServicesHeader`;
  - `ServiceBlocks`;
  - `Experience`;
  - `Faq`.
- Reutilizar `src/components/home/Booking.astro` con una prop nueva `standalone`, igual que `Pillars` en SPEC 06.
- Clase nueva `btn-outline-light` en `src/styles/global.css` (borde y texto `content-inverse`; al hacer hover se rellena de `surface-raised` y el texto pasa a `ink`).
- Interruptor `enabled` en cada sección. El de preguntas frecuentes es el requisito explícito de esta spec.
- JSON-LD `FAQPage` con las preguntas visibles, emitido solo si la sección de FAQ se muestra y tiene preguntas.
- SEO propio de la página (`services.seo`) que se pasa a `BaseLayout`.
- Enlaces actualizados al contenido nuevo:
  - `src/content/home/index.json`: las tarjetas de servicio pasan de `/servicios/<slug>` a `/servicios#<slug>`;
  - `src/content/global/index.json`: "Servicios" del nav y del footer apunta a `/servicios`, y cada servicio del menú a `/servicios#<slug>`.

**Queda fuera (para specs futuras):**

- Subpáginas por servicio (`/servicios/<slug>`).
- Sub-navegación sticky con el servicio activo según el scroll.
- Ocultar la página completa o quitar sus enlaces automáticamente.
- Precios, duración o reserva online por servicio.
- Contenido de reserva distinto entre el home y `/servicios`.
- Traducciones.

## Modelo de datos

Colección `services` (un solo documento, sin crear ni borrar, igual que `home` y `about`):

```ts
services: {
  header: {
    enabled: boolean;
    breadcrumb: string;           // "Servicios"
    title: string;                // "Donde tu piel\nse siente en casa."
    text: string;
  };
  blocks: {
    enabled: boolean;
    ctaLabel: string;             // "Reservar"
    items: {
      name: string;               // "Limpiezas faciales"
      slug: string;               // "limpiezas-faciales" → id del bloque y ancla
      title: string;              // "Donde empieza\ntodo cuidado."
      image: string;              // "/uploads/home/svc-limpieza.webp"
      paragraphs: { text: string }[];
    }[];
  };
  experience: {
    enabled: boolean;
    eyebrow: string;              // "— Tu experiencia Eres"
    title: string;
    text: string;
    steps: { title: string; text: string }[];
  };
  faq: {
    enabled: boolean;
    eyebrow: string;              // "— Preguntas frecuentes"
    title: string;                // "Resolvemos tus dudas."
    helpText: string;             // "¿No encuentras lo que buscas?"
    ctaLabel: string;             // "Escríbenos por WhatsApp"
    items: { question: string; answer: string }[];
  };
  booking: {
    enabled: boolean;             // el contenido vive en home.booking
  };
  seo: { title: string; description: string };
}
```

Convenciones:

- Los campos `title` y `text` largos usan `textarea` y los helpers de `tina/collections/fields.ts` (`enabledField`, `eyebrowField`, `paragraphsField`, `seoField`).
- `slug` se valida en el CMS: solo minúsculas, números y guiones.
- Los números (`01`, `02`…) y el color de cada bloque dependen de la posición, no del contenido.
- Si una sección tiene `enabled: false`, no aparece en el HTML. Si una lista está vacía, su sección tampoco.

## Plan de implementación

1. Crear `tina/collections/services.ts` y registrarla en `tina/config.ts`. Crear `src/content/services/index.json` con los textos del bundle.
   - **Prueba:** `npm run build` pasa y `/admin` muestra "Servicios".
2. Crear `src/pages/servicios.astro`. La página resuelve `client.queries.services`, `home` y `global` (para las redes), pasa el SEO a `BaseLayout` y monta `ServicesHeader`.
   - **Prueba:** `/servicios` responde 200 y muestra la cabecera.
3. Agregar `btn-outline-light` a `global.css` y la sección `ServiceBlocks`, con la alternancia de color y de lado de la imagen.
4. Agregar `Experience`.
5. Agregar `Faq` con `<details name="faq">`, la columna sticky en desktop y el JSON-LD `FAQPage` ligado a la visibilidad de la sección.
6. Agregar la prop `standalone` a `Booking.astro`: con ella, la visibilidad depende de `services.booking.enabled` e ignora `home.booking.enabled`. Montarla en `/servicios`.
   - **Prueba:** el home sigue igual.
7. Actualizar los enlaces de `home/index.json` y `global/index.json` a `/servicios` y `/servicios#<slug>`.

## Criterios de aceptación

- [ ] `/servicios` responde 200 en `npm run build && npm run preview`, y "Ver servicios" del home ya no da 404.
- [ ] La página tiene un solo `h1`, que es el título de la cabecera.
- [ ] Las secciones aparecen en este orden: cabecera, bloques de servicio, experiencia, preguntas frecuentes y reserva.
- [ ] Las migas tienen `Home` como link a `/` y la página actual con `aria-current="page"`.
- [ ] Con el contenido inicial hay 3 bloques. El segundo usa `bg-sage-700` con la imagen a la derecha en `≥ lg`. El primero y el tercero usan `bg-blush` con la imagen a la izquierda.
- [ ] Al agregar un cuarto servicio desde el CMS, aparece un cuarto bloque en `bg-sage-700` con el número `04`, sin tocar código.
- [ ] En `< lg`, cada bloque es una columna con la imagen arriba.
- [ ] `/servicios#limpiezas-faciales`, `#tratamientos-faciales` y `#depilacion-laser` llevan a su bloque sin que el header tape el título.
- [ ] Las tarjetas de servicio del home y los links del nav y del footer apuntan a `/servicios` o a `/servicios#<slug>`, y ninguno a `/contacto` ni a `/servicios/<slug>`.
- [ ] Los pasos de la experiencia ocupan 1 columna en móvil, 2 en tablet y 4 en desktop.
- [ ] Al cargar, la primera pregunta está abierta. Al abrir otra, la anterior se cierra.
- [ ] Las preguntas se abren y cierran con el teclado (Tab + Enter o Espacio) y con JS desactivado.
- [ ] En `≥ lg`, la columna izquierda del FAQ queda fija al hacer scroll por la lista. En `< lg` no.
- [ ] Con `faq.enabled: false`, la sección de preguntas no está en el HTML y la página no emite JSON-LD `FAQPage`.
- [ ] Con `faq.enabled: true`, el HTML contiene un `<script type="application/ld+json">` de tipo `FAQPage` con las mismas preguntas y respuestas que se ven, y pasa el Rich Results Test de Google sin errores.
- [ ] Con `enabled: false` en cualquier otra sección, esa sección no está en el HTML.
- [ ] Con `home.booking.enabled: false`, la reserva sigue visible en `/servicios`. Con `services.booking.enabled: false`, desaparece solo de `/servicios`.
- [ ] Los botones "Reservar", el link del FAQ y el de la reserva abren la URL de `footer.social` → `whatsapp`. Sin esa red, no se renderizan.
- [ ] El texto de los bloques en `bg-sage-700` alcanza 4.5:1.
- [ ] El zoom de las imágenes solo ocurre en `≥ lg`.
- [ ] Desde `/admin` se editan todos los textos, las imágenes, los servicios, los pasos, las preguntas y el SEO, y el cambio se ve en la vista previa.
- [ ] No hay scroll horizontal del `body` en ningún ancho de 360px a 1920px.
- [ ] Ningún componente nuevo escribe colores en hex ni usa `text-white/*` o `bg-white/*`.
- [ ] En producción, `/servicios` no carga el runtime de React.
- [ ] Con `global.motion.revealAnimations: false`, con `prefers-reduced-motion` o sin JS, todo el contenido es visible desde la carga.
- [ ] La consola del navegador no muestra errores en `/servicios`.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario, solo se revisó la sección de referencia de diseño. El alcance, el modelo de datos, el plan y los criterios se asumieron a partir de sus respuestas y de la referencia.
- **Sí: lo que se oculta desde Tina es el bloque de preguntas frecuentes, no la página.** Aclaración del usuario. La página siempre se genera.
- **Sí: interruptor `enabled` en todas las secciones.** Elección del usuario. Es el mismo patrón que en `home` y `about`, y el FAQ es uno más.
- **No: ocultar la página completa.** Obligaría a filtrar los links del header, el footer y el home. Si hace falta, va en otra spec.
- **Sí: una sola página con anclas (`/servicios#<slug>`).** Elección del usuario. Es lo que define el diseño.
- **No: subpáginas por servicio.** El diseño no las define y duplicarían el alcance.
- **Sí: `slug` como campo del CMS en lugar de derivarlo del nombre.** Así un cambio de nombre no rompe los links del home y del nav.
- **Sí: lista libre de servicios con color alterno por posición.** Elección del usuario. Con 3 servicios queda igual al diseño, y un servicio nuevo no necesita código.
- **Sí: reutilizar `Booking` del home con interruptor propio.** Elección del usuario. El texto es idéntico en la referencia y se edita en un solo lugar.
- **Sí: `<details name="faq">` nativo.** Elección del usuario. Funciona sin JS, es accesible por teclado y no carga React en producción.
- **No: isla React para el acordeón.** Replicaría la animación exacta en todos los navegadores, pero a costa de hidratar en producción.
- **Sí: animación de apertura como mejora progresiva.** Donde no hay soporte para `::details-content`, la pregunta abre sin transición, pero abre.
- **Sí: JSON-LD `FAQPage` ligado a la visibilidad del FAQ.** Elección del usuario. Si la sección no se ve, no se declara.
- **No: sub-navegación sticky.** Elección del usuario. El bundle la calcula, pero no la pinta en la pantalla.
- **Sí: `sage-700` en lugar de `#718471`.** Es lo que se decidió en SPEC 05, porque el texto blanco sobre `#718471` no llega a 4.5:1.
- **Sí: `btn-outline-light` como clase nueva en `global.css`.** El botón con borde blanco del diseño no existe todavía, y así los componentes no escriben colores.
- **Sí: `h3` de los pasos en `subtitle-lg` con peso 400.** Es el token que cubre 20–24px, y evita un valor arbitrario.
- **Sí: fotos de `public/uploads/home/svc-*.webp`.** Son las mismas del bundle, así que no hace falta duplicarlas.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Cuando se edita `/servicios` en Tina, la reserva viene de otra colección (`home`). | Documentarlo en el `description` del campo `services.booking`, igual que con los pilares en SPEC 06. |
| Un editor cambia un `slug` y rompe los links de `/servicios#<slug>` en el home y el nav. | El `description` del campo lo advierte. Revisar los links al cambiar un slug. |
| Dos servicios con el mismo `slug` generan `id` duplicados. | Validar unicidad en el `ui.validate` de la lista. |
| `position: sticky` no funciona si un ancestro tiene `overflow: hidden`. | La sección de FAQ no lleva `overflow-hidden`. Verificar en desktop. |
| El header se oculta y reaparece al hacer scroll, y el `top` del sticky queda mal en uno de los dos estados. | Usar `top` = alto del header + 88px, igual que el bundle con el header visible. Aceptar el hueco cuando está oculto. |
| `name` en `<details>` no funciona en navegadores viejos. | Se degrada a varias preguntas abiertas a la vez. No rompe nada. |

## Lo que **no** entra en esta spec

- Subpáginas por servicio.
- Sub-navegación sticky con el servicio activo.
- Ocultar la página completa.
- Precios, duración o reserva online por servicio.
- Reserva con contenido distinto al del home.
- Traducciones.

Cada una de estas cosas, si se hace, va en su propia spec.

# SPEC 15 — Ajustes visuales de la primera revisión de staging

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 05, SPEC 07, SPEC 09, SPEC 10
> **Fecha:** 2026-10-02
> **Objetivo:** Resolver las siete observaciones de diseño de la revisión de staging (flechas, letra "e" de Reserva una cita, banner de productos, numeración de servicios, barra de compra móvil y velo del hero) sin cambiar el comportamiento del sitio.

## Por qué existe esta spec

El cliente revisó el sitio de prueba y dejó siete observaciones puntuales:

1. Hero de la home: quitar las flechas de los botones.
2. Las flechas que quedan deben usar un trazo fino. No hay SVG, así que se usa un ícono de `react-icons` parecido.
3. Reserva una cita: la "e" del fondo debe ir en Playfair Display y notarse. Hoy está cortada a la mitad.
4. `/productos` en desktop: el título y la bajada van encima del banner para ahorrar espacio.
5. Servicios: quitar la numeración ("— 01 /") del eyebrow de cada bloque.
6. Ficha en móvil: la barra fija de compra tiene demasiado espacio en blanco abajo. Hay que bajarla unos 12px.
7. Hero de la home: un velo mínimo sobre la slide de productos para que el texto se lea.

## Alcance

**Entra:**

- **Flechas en botones.** Se quita la `→` de todo botón con caja: `btn-*` y el botón "Leer artículo" de `JournalHero.astro`.
- **Flechas en enlaces de texto.** La `→` de los enlaces sin caja pasa a ser `PiArrowRightLight` (`react-icons/pi`).
- **Flecha en el contenido.** Se borra la `→` escrita en `src/content/global/index.json` ("Reserva tu primera consulta →").
- **Letra "e" de Booking.** Pasa a ser la "e" regular de Playfair Display como SVG inline, completa y con más opacidad.
- **Banner de `/productos`.** En desktop (`≥ md`) la miga, el H1 y la bajada van sobre la foto, con texto claro y degradado oscuro. Aplica también a `/productos/categoria/<slug>`.
- **Numeración de servicios.** El eyebrow de `ServiceBlocksReact` muestra solo el nombre del servicio.
- **Barra fija de la ficha.** El relleno inferior baja 12px en dispositivos con `safe-area-inset-bottom`.
- **Velo del hero.** Nuevo campo por slide en Tina para oscurecer la imagen, con valor inicial en la slide "Tu ritual, en casa".

**Fuera de alcance (para futuras specs):**

- La numeración de `PillarsReact`, `DifferentiatorsReact` y `ExperienceReact`. La observación habla solo de los bloques de servicios.
- El contador "01 — 03" del hero. Es un indicador de progreso, no una numeración de contenido.
- Los chevrons (`PiCaret*`) de galería, zoom, drawer, paginación, migas y Anterior / Siguiente. Son controles de navegación, no flechas de llamada a la acción.
- `PiArrowBendUpRightLight` de "Compartir".
- El banner de `/productos` en móvil: el texto sigue debajo de la foto.
- Cargar Playfair Display como fuente web.

## Referencia de diseño

Breakpoints de SPEC 05: **móvil** `< md` (768px), **desktop** `≥ md`.

### 1. Flechas

Botones con caja. Se borra el `<span aria-hidden="true">→</span>` y el espacio que lo precede:

| Archivo | Botón |
|---|---|
| `src/components/home/HeroCarouselReact.tsx` | CTA de cada slide (`btn-fill-light`) |
| `src/components/home/BookingReact.tsx` | "Háblanos por WhatsApp" (`btn-fill-light`) |
| `src/components/home/FeaturedProductsReact.tsx` | CTA de productos (`btn-fill-dark`) |
| `src/components/services/ServiceBlocksReact.tsx` | CTA de cada bloque (`theme.button`) |
| `src/components/contact/VisitUsReact.tsx` | CTA (`btn-fill-dark`) |
| `src/components/about/FirstVisitReact.tsx` | CTA (`btn-fill-dark`) |
| `src/components/shop/CartReact.tsx` | "Finalizar compra" (`btn-primary`) |
| `src/components/shared/MobileDrawer.tsx` | CTA del drawer (`btn-primary`) |
| `src/components/blog/JournalHero.astro` | "Leer artículo" |

En "Leer artículo" se quitan también `gap-3`, `group-hover:gap-[18px]`, `group-focus-visible:gap-[18px]` y `gap_450ms…` de la transición: sin flecha, el `gap` animado no tiene qué mover.

Enlaces de texto. La `→` se reemplaza por `<PiArrowRightLight aria-hidden />`, conservando las clases de movimiento que ya tenga el `span` (por ejemplo `group-hover:translate-x-1`):

| Archivo | Enlace |
|---|---|
| `src/components/home/ServicesReact.tsx` | Pie de cada tarjeta |
| `src/components/home/JournalReact.tsx` | "Ver todos" |
| `src/components/home/EssenceReact.tsx` | CTA (`link-underline`) |
| `src/components/shared/MegaMenu.tsx` | Enlace de cada tarjeta |
| `src/components/about/InstagramGridReact.tsx` | CTA (`link-underline`) |
| `src/components/services/FaqReact.tsx` | CTA (`link-underline`) |
| `src/components/blog/JournalCard.tsx` | "Leer más" |

Tamaño del ícono: `1em` (`size="1em"`), para que siga el tamaño de letra de cada enlace. Se alinea con `inline-flex items-center` en el contenedor cuando haga falta.

### 2. Letra "e" de Reserva una cita

- El `<span>` con la "e" itálica se reemplaza por un `<svg aria-hidden="true">` con el trazo de la "e" minúscula de Playfair Display Regular (400, recta).
- El trazo se extrae una vez del archivo de la fuente (OFL) y queda como `path` dentro de `BookingReact.tsx`. La fuente no se agrega como dependencia.
- `fill="currentColor"` con `text-content-inverse/[.12]` (antes `.07`).
- Alto `clamp(260px,32vw,500px)`, anclada abajo a la derecha con un margen igual a `px-gutter`, entera: ni el borde inferior ni el derecho de la sección la cortan.
- Mantiene `pointer-events-none`, `select-none` y queda detrás del contenido (el contenedor ya es `relative`).

### 3. Banner de `/productos`

Móvil sin cambios. Desde `md`:

- El banner pasa a `md:h-[clamp(420px,38vw,560px)]` para que entren miga, título y bajada sobre la foto.
- El bloque de texto deja de estar debajo: se posiciona `absolute inset-x-0 bottom-0` dentro del banner, con `container-xl` y `pb-[clamp(32px,4vw,56px)]`.
- Velo: `md:bg-gradient-to-tr from-ink/55 via-ink/20 via-45% to-transparent to-75%`. En móvil el velo no se muestra.
- Texto en `text-content-inverse`: miga, enlaces de la miga, H1 y bajada. La bajada pasa de `text-content-muted` a `text-content-inverse/85`. Es excepción legítima según CLAUDE.md (bloque sobre foto).
- El `pt-[clamp(28px,4vw,56px)]` de la grilla aplica solo en móvil.

### 4. Numeración de servicios

- El eyebrow pasa de `— {number} / {service.name}` a `— {service.name}`.
- Se elimina la constante `number`.

### 5. Barra fija de la ficha

- `StickyBuyBar` cambia `pb-[env(safe-area-inset-bottom)]` por `pb-[max(0px,calc(env(safe-area-inset-bottom)-12px))]`.
- En `FooterReact.tsx` el relleno que compensa la barra pasa a usar la misma expresión en lugar de `env(safe-area-inset-bottom)`, para no dejar 12px de más al final de la página.
- `WhatsAppButton.astro` no cambia: su `bottom` no depende del safe area.

### 6. Velo del hero

- Nuevo campo `scrim` en cada slide: número entero de 0 a 40, "Oscurecer imagen (%)". Vacío equivale a 0.
- Se pinta como un `div` `absolute inset-0 bg-ink` con `opacity: scrim / 100`, entre la imagen y el degradado actual.
- Valor inicial: `15` en la slide "Tu ritual, en casa". Las otras dos slides quedan sin valor.

## Modelo de datos

Un solo campo nuevo, en `tina/collections/home.ts`, dentro de `hero.slides`:

```ts
{
  name: "scrim",
  label: "Oscurecer imagen (%)",
  description: "De 0 a 40. Úsalo si el texto no se lee sobre la foto.",
  type: "number",
}
```

`HeroReact.tsx` lo pasa a `HeroSlide` como `scrim: number` (acotado a 0–40) y con su `tinaField` en `fields.scrim`.

## Plan de implementación

1. Quitar la `→` de los nueve botones de la tabla y el `gap` animado de "Leer artículo". Verificar en `npm run dev` home, servicios, contacto, nosotras, carrito, drawer y Skin Journal.
2. Reemplazar la `→` por `PiArrowRightLight` en los siete enlaces de texto. Verificar que las animaciones de hover siguen moviendo el ícono.
3. Borrar la `→` de "Reserva tu primera consulta" en `src/content/global/index.json`.
4. Quitar la numeración del eyebrow en `ServiceBlocksReact.tsx`.
5. Extraer el trazo de la "e" de Playfair Display Regular (script temporal fuera del repo) y reemplazar el `span` de `BookingReact.tsx` por el SVG.
6. Ajustar el relleno de `StickyBuyBar` y el del footer.
7. Agregar `scrim` al schema, pasarlo por `HeroReact.tsx`, pintarlo en `HeroCarouselReact.tsx` y poner `15` en la slide "Tu ritual, en casa".
8. Rehacer el layout desktop de `ShopBannerReact.tsx` con el texto sobre la foto.
9. Correr `npm run build` para regenerar `tina/__generated__/` y comprobar que compila.

## Criterios de aceptación

- [ ] Ningún botón con caja del sitio muestra una flecha.
- [ ] `grep -rn "→" src` no devuelve resultados.
- [ ] Los siete enlaces de texto muestran `PiArrowRightLight` y su animación de hover sigue funcionando.
- [ ] La "e" de Reserva una cita está en Playfair Display regular, se ve completa en 375px, 768px y 1440px de ancho y no tapa el texto ni el botón.
- [ ] La página no descarga ningún archivo de fuente Playfair Display.
- [ ] En `/productos` y en `/productos/categoria/<slug>`, desde 768px, miga, H1 y bajada están sobre la foto y el texto es claro.
- [ ] En `/productos` por debajo de 768px el layout es idéntico al actual.
- [ ] Los eyebrows de `/servicios` muestran "— Limpiezas faciales" sin número.
- [ ] En un iPhone con barra de inicio, la barra fija de la ficha tiene 12px menos de relleno inferior que antes.
- [ ] En desktop la barra fija de la ficha no cambia de alto.
- [ ] El campo "Oscurecer imagen (%)" aparece en cada slide del hero en `/admin` y al editarlo el velo cambia en la vista previa.
- [ ] La slide "Tu ritual, en casa" muestra el velo al 15% y las otras dos se ven igual que antes.
- [ ] `npm run build` termina sin errores.

## Decisiones

- **Sí:** quitar la flecha de los botones con caja y usar ícono en los enlaces. Así se cumplen las observaciones 1 y 2 sin contradecirse.
- **No:** ícono también dentro de los botones. Contradice la observación 1.
- **Sí:** `PiArrowRightLight`. Es el trazo fino más cercano a la flecha que mandó el cliente y es de la familia Phosphor Light que ya usa el sitio.
- **Sí:** la "e" como SVG inline. Respeta la regla de una sola familia tipográfica y no suma descargas.
- **No:** autoalojar `@fontsource/playfair-display`. Sumaría una fuente entera para un solo glifo decorativo.
- **Sí:** Playfair regular (recta). Elegido por el usuario frente a la itálica.
- **Sí:** velo por slide en Tina. Solo la slide de productos lo necesita; un velo global oscurecería las que ya se leen bien.
- **No:** subir el degradado común del hero. Mismo motivo.
- **Sí:** banner con texto encima solo en desktop. Los 220px del banner móvil no alcanzan para miga, título y bajada.
- **Sí:** texto claro con degradado oscuro en el banner. Funciona con cualquier foto que se suba, no solo con la clara actual.
- **No:** texto oscuro sin velo. Deja de leerse si cambian la foto por una oscura.
- **Sí:** quitar numeración solo en los bloques de servicios. Es lo que muestra la captura.
- **Definición rápida:** las secciones de alcance a decisiones se escribieron sin revisión intermedia, a pedido del usuario.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El trazo de la "e" sale con coordenadas que no encajan en el `viewBox` | Se calcula el `viewBox` a partir de la caja del glifo al extraerlo. |
| El texto del banner tapa productos importantes de la foto | El degradado y el texto van abajo a la izquierda; el encuadre (`object-position`) se puede ajustar si hace falta. |
| `env(safe-area-inset-bottom)` menor a 12px deja relleno negativo | `max(0px, …)` lo evita. |
| Una editora pone `scrim` alto y la foto queda casi negra | El campo se acota a 0–40 al leerlo en `HeroReact.tsx`. |

## Lo que **no** entra en esta spec

- Numeración de pilares, diferenciales y experiencia.
- Contador del hero.
- Chevrons de navegación y el ícono de "Compartir".
- Banner de `/productos` con texto encima en móvil.
- Playfair Display como fuente web.

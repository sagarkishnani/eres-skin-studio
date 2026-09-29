# SPEC 12 — Popup promocional configurable

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 04
> **Fecha:** 2026-09-29
> **Objetivo:** Mostrar un popup promocional editable desde Tina, con campañas que tienen cupón o CTA, vigencia por fechas, disparadores por tiempo, scroll o intención de salida, y una frecuencia controlada por `localStorage`.

## Por qué existe esta spec

La captura de referencia muestra un popup de captura de correo ("Únete a ERES · 10% de descuento"). El sitio no tiene lista de correo. Lo que la tienda necesita es comunicar cupones, descuentos y mensajes puntuales.

Esta spec conserva el layout de la referencia:

- la imagen a la izquierda;
- el contenido centrado a la derecha;
- "No, gracias";
- los iconos de redes.

El formulario de correo se reemplaza por un bloque de cupón y/o un CTA.

## Referencia de diseño (captura)

Breakpoints de SPEC 05:

- **móvil:** `< md` (768px);
- **desktop:** `≥ md`.

| Elemento de la captura | Token |
|---|---|
| Fondo del panel | `bg-surface-raised` |
| Velo sobre la página | `bg-ink/50` |
| Fondo de la imagen | `bg-stone-100` |
| Borde del botón cerrar / bloque de cupón | `border-line` / `border-line-strong` |
| Fondo del código del cupón | `bg-surface` |
| Botón principal | `btn-primary` (`bg-ink`, `text-content-inverse`) |
| Eyebrow, "No, gracias", iconos | `text-content-muted` |
| Bajada | `text-content-muted` |

### 1. Contenedor

- `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al título.
- Capa `fixed inset-0 z-[80]` con el velo `bg-ink/50`. El panel va centrado y el padding exterior es `px-gutter`.
- El panel mide `max-w-[1040px] w-full` y `max-h-[90dvh]`, con `overflow-y-auto`. Esquinas rectas y `shadow-xl`.
- **Desde `md`:** 2 columnas iguales. La imagen ocupa toda la altura de la columna izquierda (`object-cover`) y el contenido va a la derecha.
- **Móvil:** 1 columna, con la imagen arriba en `aspect-[16/9]` `object-cover`.
- Sin imagen, el panel pasa a una sola columna de `max-w-[560px]`.
- **Botón cerrar:** cuadrado de 44px, `absolute` arriba a la derecha con 12px de margen, `border border-line`, `bg-surface-raised` y el icono `PiXLight` de 18px. Lleva `aria-label="Cerrar"`.

### 2. Contenido (columna derecha)

Va en columna, centrado, con padding `clamp(32px,5vw,56px)` y el contenido `max-w-[420px] mx-auto`.

- **Eyebrow:** "— {eyebrow}", en `caption-sm`, mayúsculas, tracking `.2em` y `text-content-muted`. Opcional.
- **Título:** `heading-sm`, peso 400, tracking negativo, `leading-[1.05]`, `text-balance` y margen superior de 16px.
- **Bajada:** `body-md`, `leading-[1.65]`, `text-content-muted` y `text-pretty`, con margen superior de 16px. Opcional.
- **Cupón** (opcional), con margen superior de 28px:
  - el código en una caja de 56px de alto, `border border-dashed border-line-strong`, `bg-surface`, `body-lg`, peso 500, tracking `.12em`, mayúsculas y centrado; el texto es seleccionable;
  - debajo, un `btn-primary` a lo ancho con `copyLabel` ("Copiar código"); al copiar muestra `copiedLabel` ("¡Código copiado!") durante 2s.
- **CTA** (opcional): un enlace a lo ancho con `ctaLabel` hacia `ctaUrl`.
  - Sin cupón es `btn-primary`, con margen superior de 28px.
  - Con cupón es `btn-secondary`, con margen superior de 12px.
- **Letra chica** (opcional): `caption-sm` y `text-content-subtle`, con margen superior de 12px (p. ej. "Válido hasta el 31/10. No acumulable.").
- **"No, gracias":** un botón de texto en `caption-md`, `text-content-muted` y el subrayado animado, con margen superior de 20px.
- **Redes:** fila centrada con gap de 24px y margen superior de 28px.
  - Salen de `global.social` vía `presentSocials`: son las mismas del footer.
  - Cada una es un enlace de 44×44 con un icono Phosphor Light de 20px (`PiInstagramLogoLight`, `PiFacebookLogoLight`, `PiTiktokLogoLight`, `PiWhatsappLogoLight`, `PiLinkedinLogoLight`, `PiXLogoLight` y `PiYoutubeLogoLight`).
  - Cada enlace lleva `aria-label={socialLabel(network)}`, `target="_blank"` y `rel="noopener"`.
  - Se ocultan con `showSocials: false` o si no hay redes.

### 3. Motion y accesibilidad

- **Entrada:** el velo pasa de opacidad 0 a 1 en 400ms. El panel pasa de opacidad 0 y `translateY(16px)` a 1 y `0` en 600ms `ease-out-expo`.
- **Salida:** la inversa, en 300ms. Después el popup se desmonta.
- Con `prefers-reduced-motion` solo hay fundido, sin desplazamiento.
- El foco va al botón cerrar al abrir. Queda atrapado dentro del panel y vuelve al elemento que tenía el foco antes de abrir.
- `Esc`, un clic en el velo, la ✕ y "No, gracias" cierran el popup. Los cuatro cuentan como **cierre** (ver frecuencia).
- Mientras está abierto se bloquea el scroll de la página: Lenis `stop()` y `overflow:hidden` en `<html>`. Al cerrar se restaura.

## Alcance

**Entra:**

- Nueva colección singleton `promoPopup` (`src/content/promo-popup/index.json`) con la configuración global y una lista de campañas.
- Isla `PromoPopupReact` montada en `BaseLayout.astro` junto a `CookieConsent`, con `client:idle` y `transition:persist="promo-popup"`.
- **Campañas:** se muestra una sola, la **primera** de la lista con `enabled: true` que esté dentro de su vigencia (`startsAt`/`endsAt`, evaluadas en el navegador).
- **Disparadores** combinados con "lo que ocurra primero": segundos en la página, % de scroll e intención de salida (solo con puntero fino).
- **Frecuencia** por campaña en `localStorage`: días de espera tras un cierre y tras una conversión (copiar el cupón o hacer clic en el CTA).
- **Rutas excluidas:** una lista de prefijos editable en Tina.
- **Espera a cookies:** si la persona no ha respondido el banner de cookies, los disparadores no arrancan hasta `CONSENT_CHANGE_EVENT`.
- **Vista previa en Tina:** dentro del editor visual el popup se muestra al instante con la primera campaña habilitada, sin mirar vigencia, disparadores ni frecuencia, para poder editarlo en vivo.
- Contenido inicial: una campaña de ejemplo con cupón, deshabilitada.
- `CLAUDE.md` documenta la colección y el comportamiento.

**Fuera de alcance (para specs futuras):**

- Captura de correo o integración con una lista de correo.
- Crear o validar cupones en WooCommerce. El código es texto: quien edita debe crearlo antes en Woo.
- Aplicar el cupón automáticamente al carrito.
- Rotación o A/B entre varias campañas activas.
- Segmentación por dispositivo, idioma, origen del tráfico o por si la persona ya compró.
- Métricas o eventos de analítica (impresiones, cierres, conversiones).
- Contar tiempo o scroll acumulado entre páginas.

## Modelo de datos

### Contenido (`src/content/promo-popup/index.json`)

```json
{
  "enabled": true,
  "triggers": {
    "delaySeconds": 8,
    "scrollPercent": 40,
    "exitIntent": true
  },
  "frequency": {
    "daysAfterDismiss": 7,
    "daysAfterConvert": 30
  },
  "excludedPaths": ["/contacto"],
  "dismissLabel": "No, gracias",
  "showSocials": true,
  "campaigns": [
    {
      "id": "primera-compra-10",
      "enabled": false,
      "startsAt": "2026-10-01T05:00:00.000Z",
      "endsAt": "2026-10-31T04:59:00.000Z",
      "image": "/uploads/popup/primera-compra.jpg",
      "imageAlt": "Aplicación de sérum con gotero",
      "eyebrow": "Únete a ERES",
      "title": "10% de descuento en tu primera compra",
      "body": "Usa este código al finalizar tu compra.",
      "couponCode": "ERES10",
      "copyLabel": "Copiar código",
      "copiedLabel": "¡Código copiado!",
      "ctaLabel": "Ver productos",
      "ctaUrl": "/productos",
      "finePrint": "Válido hasta el 31/10. No acumulable."
    }
  ]
}
```

### Schema (`tina/collections/promoPopup.ts`)

| Campo | Tipo Tina | Notas |
|---|---|---|
| `enabled` | boolean | Interruptor general. En `false` la isla se hidrata solo dentro del editor (`client:tina`). |
| `triggers.delaySeconds` | number | `0` = apagado. |
| `triggers.scrollPercent` | number | 1–100 sobre la altura scrolleable; `0` = apagado. |
| `triggers.exitIntent` | boolean | Solo con `(pointer: fine)`. |
| `frequency.daysAfterDismiss` | number | `0` = puede volver en la siguiente carga de página. |
| `frequency.daysAfterConvert` | number | `0` = igual que arriba. |
| `excludedPaths` | string, list | Prefijo de ruta. `/contacto` excluye también `/contacto/…`. |
| `dismissLabel` | string | Default "No, gracias". |
| `showSocials` | boolean | |
| `campaigns[]` | object, list | `itemProps` muestra `title` y "(inactiva)" si `enabled` es `false`. |
| `campaigns[].id` | string, required | Slug estable. Es la clave de la frecuencia: cambiarlo reinicia el contador. |
| `campaigns[].enabled` | boolean | |
| `campaigns[].startsAt` / `endsAt` | datetime, opcionales | Vacío = sin límite por ese lado. Se guardan en ISO UTC y se editan en hora local. |
| `campaigns[].image` / `imageAlt` | image / string | Opcionales. |
| `campaigns[].eyebrow` | string | Opcional. |
| `campaigns[].title` | string, required | |
| `campaigns[].body` | string (textarea) | Opcional. |
| `campaigns[].couponCode` | string | Opcional. Sin código, no hay bloque de cupón. |
| `campaigns[].copyLabel` / `copiedLabel` | string | Defaults "Copiar código" / "¡Código copiado!". |
| `campaigns[].ctaLabel` / `ctaUrl` | string | Opcionales. El CTA aparece solo si están los dos. |
| `campaigns[].finePrint` | string | Opcional. |

La colección usa `allowedActions: { create: false, delete: false }`, como `cookieConsent`.

### Estado en el navegador

- Clave: `eres-skin-studio-promo-popup:v1`.

```ts
type PromoPopupHistory = Record<string, {
  dismissedAt?: number;
  convertedAt?: number;
}>;
```

- Una campaña está **en espera** si `now < dismissedAt + daysAfterDismiss × 86400000` o si `now < convertedAt + daysAfterConvert × 86400000`.
- La conversión solo se registra una vez por apertura. Después de convertir, cerrar el popup no escribe `dismissedAt`.
- Si `localStorage` falla (modo privado), el popup se muestra como mucho una vez por carga de página y no persiste nada.

### Lógica pura (`src/utils/promoPopup.ts`)

- `pickActiveCampaign(campaigns, now)` devuelve la primera campaña habilitada y vigente, o `null`.
- `isPathExcluded(pathname, excludedPaths)` compara por prefijo, normalizando la barra final.
- `isCampaignSnoozed(history, campaignId, frequency, now)`.
- `readHistory()` / `recordDismiss(id)` / `recordConvert(id)` envuelven `localStorage` en `try/catch`.

## Plan de implementación

1. **Schema y contenido.** Crear `tina/collections/promoPopup.ts`, registrarlo en `tina/config.ts` y crear `src/content/promo-popup/index.json` con `enabled: false` y la campaña de ejemplo. Verificación: `npm run dev` levanta y la colección se edita en `/admin`.
2. **Lógica pura.** Crear `src/utils/promoPopup.ts` con las funciones del modelo de datos. No se monta nada todavía.
3. **Isla estática.** Crear `src/components/promo-popup/PromoPopup.astro`:
   - consulta `promoPopup` y `global`;
   - pasa `{ query, variables, data }` de `promoPopup` y las redes ya filtradas por `presentSocials` como prop plana.

   Crear `PromoPopupReact.tsx` con `useTina()` y el panel de la sección 2, abierto siempre. Montarlo en `BaseLayout.astro` después de `CookieConsent`. Verificación: con `enabled: true` el popup se ve en todas las páginas, en desktop y en móvil.
4. **Selección de campaña y exclusiones.** Aplicar `pickActiveCampaign` e `isPathExcluded`. Con `ClientRouter`, reevaluar la ruta en `astro:page-load`. Verificación: con la campaña fuera de fecha, o en `/contacto`, no aparece.
5. **Disparadores.** Conectar el temporizador, el scroll (listener pasivo) y la intención de salida (`mouseout` con `relatedTarget` nulo y `clientY <= 0`). El primero que ocurra abre el popup y limpia los demás. Todos se reinician en cada carga de página. Si los tres están apagados, no se abre. Verificación: cada uno abre el popup por separado.
6. **Espera a cookies.** Si `readConsent()` es `null`, arrancar los disparadores recién con `CONSENT_CHANGE_EVENT`.
7. **Frecuencia.** Registrar el cierre y la conversión, y consultar `isCampaignSnoozed` antes de armar los disparadores. Verificación: tras cerrar, recargar no lo muestra. Borrar la clave de `localStorage` lo vuelve a mostrar.
8. **Cupón.** Copiar con `navigator.clipboard.writeText`. Si falla, seleccionar el texto del código para copiarlo a mano, sin mostrar "copiado".
9. **Accesibilidad y motion.** Foco inicial, trampa de foco, devolución del foco, `Esc`, clic en el velo, bloqueo de scroll con Lenis, animaciones y `prefers-reduced-motion`.
10. **Vista previa en Tina.** Dentro del editor (`useEditState().edit === true`), abrir al instante con la primera campaña habilitada, sin mirar fechas ni frecuencia y sin escribir en `localStorage`.
11. **Documentación.** Agregar `promoPopup` a la lista de colecciones de `CLAUDE.md` y un apartado "Popup promocional" con las reglas de disparo y frecuencia.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores con `promoPopup.enabled` en `true` y en `false`.
- [ ] Con `enabled: false` el popup no aparece ni carga JS fuera del editor (la isla usa `client:tina`), pero se puede editar y previsualizar en Tina.
- [ ] Con `enabled: true` y sin campañas vigentes, el popup no aparece.
- [ ] Con dos campañas vigentes, se muestra la que está más arriba en la lista.
- [ ] Una campaña con `endsAt` en el pasado no aparece, sin necesidad de rebuild.
- [ ] Una campaña con `startsAt` en el futuro no aparece hasta esa hora.
- [ ] Con `delaySeconds: 5` y los demás disparadores apagados, el popup aparece a los 5s (±1s) de cargar la página.
- [ ] Con `scrollPercent: 40` y los demás apagados, aparece al pasar el 40% del scroll.
- [ ] Con `exitIntent: true`, en desktop, aparece al sacar el mouse por el borde superior de la ventana. En un dispositivo táctil nunca aparece por este motivo.
- [ ] Con los tres disparadores apagados, el popup no aparece nunca fuera del editor.
- [ ] Mientras el banner de cookies espera respuesta, el popup no aparece. Tras aceptar o rechazar, los disparadores arrancan desde cero.
- [ ] En una ruta de `excludedPaths`, o en una subruta, el popup no aparece.
- [ ] Cerrar con ✕, `Esc`, clic en el velo o "No, gracias" escribe `dismissedAt`. El popup no vuelve a aparecer durante `daysAfterDismiss` días.
- [ ] Copiar el cupón o hacer clic en el CTA escribe `convertedAt`. El popup no vuelve durante `daysAfterConvert` días.
- [ ] Cambiar el `id` de la campaña hace que vuelva a aparecer para quien ya la había cerrado.
- [ ] "Copiar código" deja el código en el portapapeles y muestra `copiedLabel` durante 2s.
- [ ] Sin `couponCode` no se renderiza el bloque de cupón. Sin `ctaLabel` o sin `ctaUrl` no se renderiza el CTA.
- [ ] Sin imagen, el panel se ve en una sola columna de 560px como máximo.
- [ ] En 375px de ancho, la imagen va arriba en 16:9 y el panel no supera el 90% del alto de la pantalla (hace scroll interno si hace falta).
- [ ] Las redes que se muestran son exactamente las del footer, con iconos y `aria-label`.
- [ ] Al abrir, el foco está en la ✕. `Tab` no sale del panel y al cerrar el foco vuelve a donde estaba.
- [ ] Con el popup abierto la página no scrollea. Al cerrarlo, el scroll con Lenis funciona de nuevo.
- [ ] Con `prefers-reduced-motion`, la entrada es solo un fundido.
- [ ] En el editor visual de Tina, el popup aparece al instante y los cambios de texto se ven en vivo.
- [ ] Ningún componente del popup usa colores fuera de tema, `rounded-*` distinto de `none`/`full` ni `text-white`.

## Decisiones

- **Sí:** definición rápida. La persona pidió "asume el resto y guarda" después de la cabecera, así que las secciones 2 a 7 no se revisaron una por una. Hay que releerlas antes de aprobar.
- **Sí:** una lista de campañas y solo una visible, la primera vigente. Permite dejar promos programadas sin rotaciones ni prioridades numéricas.
- **No:** rotar o hacer A/B entre campañas activas. Complica la frecuencia y no hay analítica para medirlo.
- **Sí:** vigencia evaluada en el navegador. Una promo vence a la hora exacta aunque el último build sea de la madrugada.
- **No:** filtrar campañas por fecha en build time. El rebuild diario de las 04:00 dejaría promos vencidas visibles hasta un día.
- **Sí:** tres disparadores combinados con "lo que ocurra primero". Cubren los casos pedidos (tiempo, scroll) más la intención de salida.
- **Sí:** tiempo y scroll contados por página. Sin `ClientRouter` en catálogo y journal, cada navegación es una carga completa. Acumular entre páginas exigiría `sessionStorage` y más casos borde.
- **Sí:** la frecuencia en días, separada en cierre y conversión, por campaña. Quien ya copió el cupón no necesita verlo pronto. Una campaña nueva debe llegarle a todo el mundo.
- **No:** presets "una vez por sesión" o "una sola vez". Se expresan con días (`0` o un número grande) y así hay un único modelo.
- **Sí:** el `id` de la campaña como clave de la frecuencia, editable. Reusar el `id` da continuidad, y cambiarlo reinicia la campaña a propósito.
- **Sí:** esperar la respuesta del banner de cookies. Evita dos modales apilados en la primera visita.
- **Sí:** lista de rutas excluidas por prefijo. Es más simple que una lista de rutas incluidas y cubre el caso normal (mostrar en casi todo el sitio).
- **Sí:** las redes de `global.social` pasadas como prop plana. Se editan en el footer, y un segundo `useTina` para una lista que no se edita aquí no aporta.
- **Sí:** iconos Phosphor Light en lugar del texto del footer. Coinciden con la captura y con el resto de iconos del header. Las redes son las mismas, solo cambia la presentación.
- **No:** captura de correo. No hay lista de correo y lo pedido son mensajes informativos.
- **No:** validar el cupón contra WooCommerce. Exigiría una ruta nueva en el proxy y el cupón es solo texto informativo.
- **Sí:** `client:idle`. El popup nunca se muestra en el primer render, así que no compite con la carga inicial.
- **Sí:** vista previa inmediata dentro del editor de Tina. Sin ella, editar el popup obligaría a esperar un disparador y a limpiar `localStorage` en cada prueba.
- **Sí:** con `enabled: false` la isla se monta igual, con `client:tina`. Si no se monta, el `router` de la colección lleva a la home sin formulario y no hay forma de activar el popup desde el editor.
- **Sí:** en el editor la vista previa se muestra aunque el popup o la campaña estén desactivados y se puede cerrar. Vuelve a abrirse al editar un campo del popup, para no tapar la edición del resto de la página.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El cupón no existe en Woo y la persona no puede usarlo | La descripción del campo en Tina lo avisa. La validación queda fuera de alcance. |
| `localStorage` bloqueado hace que aparezca en cada página | Como mucho una vez por carga de página. Es el mismo comportamiento degradado que el banner de cookies. |
| El reloj del dispositivo está desfasado y muestra una campaña fuera de fecha | Aceptado: el impacto es bajo y no hay hora de servidor en un sitio estático. |
| Choca con otras capas fijas (header, WhatsApp, barra de compra, progreso del journal) | `z-[80]` queda por encima de todas y el velo las cubre. |
| Lenis sigue scrolleando la página detrás del modal | `lenis.stop()` al abrir y `start()` al cerrar, más `data-lenis-prevent` en el panel para su scroll interno. |
| Con `ClientRouter`, la isla persistida no reevalúa la ruta | Escuchar `astro:page-load` y reevaluar exclusiones y disparadores. |
| Intrusivo en móvil (penaliza la experiencia y el SEO) | Sin intención de salida en táctil, con un umbral configurable y cierre siempre visible de 44px. |

## Qué **no** entra en esta spec

- Captura de correo o integración con una lista de correo.
- Creación, validación o aplicación automática de cupones en WooCommerce.
- Rotación o A/B de campañas.
- Segmentación por dispositivo, tráfico o historial de compra.
- Analítica de impresiones y conversiones.
- Tiempo o scroll acumulado entre páginas.

Cada una de esas, si llega, va en su propia spec.

# SPEC 04 — Rediseño del footer

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 03
> **Fecha:** 2026-09-27
> **Objetivo:** Reemplazar el footer del starter por el de la referencia de diseño (marca, columnas Explora / Legales / Contacto, barra inferior y botón flotante de WhatsApp), editable desde el CMS y correcto de 360px a 1920px.

## Por qué existe esta spec

El footer actual viene del starter:

- es claro (`bg-surface-raised`);
- tiene una sola columna de links ("Sitio") y ningún dato de contacto;
- no tiene redes cargadas;
- no tiene crédito ni botón de WhatsApp.

La referencia (`Eres Skin Studio (2).html`) y el sitio en producción (eresskinstudio.com) definen otra cosa:

- un footer oscuro con logo y bajada;
- tres columnas, que en móvil pasan a ser un acordeón;
- horarios de atención;
- una barra inferior con copyright, redes y el crédito a TWNSTUDIOS;
- un botón flotante de WhatsApp.

Hoy los datos de contacto viven en `nav.contact` y solo los usa el drawer móvil. Esta spec los sube a un bloque `contact` raíz para que el header y el footer lean de una sola fuente.

## Referencia de diseño (valores extraídos del bundle)

El footer es un bloque con fondo oscuro fijo. Es la excepción que admite CLAUDE.md: usa la paleta cruda (`ink`, `stone-*`) en vez de los tokens semánticos de superficie.

**Contenedor**

- `<footer>` con `bg-ink` y `text-content-inverse`.
- Padding superior `clamp(56px, 7vw, 88px)` e inferior 28px.
- Interior con `container-xl`: 1440px y gutter fluido.

**Grilla**

| Ancho | Columnas | Gap |
|---|---|---|
| ≥ `lg` (1024px) | `minmax(0,1.6fr) repeat(3,minmax(0,1fr))` | 48px |
| `md` a `lg` (768–1023px) | `repeat(2,minmax(0,1fr))` | 48px |
| < `md` (768px) | `minmax(0,1fr)` | 0 |

Entre 768 y 1023px la marca ocupa la primera celda y las tres columnas siguen el flujo normal: queda una grilla 2×2.

**Marca**

- Columna flex con gap de 24px.
- Logo claro a 48px de alto con ancho automático, alineado a la izquierda.
- Bajada en `body-sm` (15px), line-height 1.6, `text-stone-300`, `max-w-[340px]` y `text-wrap: pretty`.
- Debajo de `md` lleva `padding-bottom: 36px`.

**Columnas (Explora, Legales, Contacto)**

- Título en `caption-sm` (12px), tracking `.18em`, `uppercase`, peso 500 y `text-stone-400`.
- En `md+` el título es un `<p>` con `padding-bottom: 20px` y el contenido siempre está visible.
- Links con gap de 14px, `body-xs` (14px), line-height 1.45 y `text-content-inverse`.
- Los links llevan el mismo subrayado de 1px que la nav del header (SPEC 03): crece en 500ms `ease-out-expo`.
- Columna Contacto, en este orden:
  - la dirección, como texto;
  - el teléfono, como `tel:` o `phoneUrl`;
  - el email, como `mailto:`;
  - los horarios: cada bloque va en 14px, line-height 1.55, `text-stone-300` y `white-space: pre-line`.

**Acordeón (< `md`)**

- Cada columna lleva `border-t border-stone-800`.
- El título es un `<button>` a todo el ancho, con padding de `20px 0` y `aria-expanded`.
  - A la derecha tiene un `PiPlusLight` de 18px que rota 45° en 450ms `ease-out-expo`.
- El contenido se anima con `grid-template-rows` de `0fr` a `1fr` en 550ms `ease-out-expo`. Abierto lleva `padding-bottom: 24px`.
- Al cargar, todas las columnas están cerradas. Abrir una cierra la anterior.
- El `<button>` es `md:hidden` y el `<p>` es `hidden md:block`. El estado cerrado sale por CSS (`max-md:`), así que antes de hidratar no hay columnas abiertas en móvil.

**Barra inferior**

- `border-t border-stone-800`, `margin-top: clamp(40px, 5vw, 64px)` y `padding-top: 24px`.
- Flex con `flex-wrap`, gap `18px 32px`, `justify-between` y `items-center`.
- Todo en `caption-xs` (11px), tracking `.14em`, `uppercase` y `text-stone-400`.
- Tres bloques:
  1. `© {año} {footer.legal}`. El año sale de `new Date().getFullYear()` en build.
  2. Redes como links de texto (Instagram, Facebook, WhatsApp) con gap de 24px, `text-content-inverse` y el subrayado de las columnas.
  3. "Diseño y desarrollo por **TWNSTUDIOS**". Solo "TWNSTUDIOS" es link y va en `text-content-inverse`.

**Crédito**

- URL fija en código: `https://twnstudios.com/?utm_source=eresskin&utm_medium=referral&utm_campaign=client_portfolio`.
- `target="_blank"` y `rel="noopener"`, sin `noreferrer`, para no perder el referrer.

**Botón flotante de WhatsApp**

- `fixed right-5 bottom-5`, 56×56, `rounded-full`, fondo `bg-whatsapp` (token nuevo, `#25D366`) y texto blanco.
- Icono `FaWhatsapp` de `react-icons/fa6` a 26px.
- Sombra `shadow-lg`.
- Al hacer hover sube a `scale(1.08)` en 500ms con `ease-spring`.
- `z-[46]`: queda debajo del header (`z-50`) y de sus paneles.
- Se oculta (`scale(0)`) cuando `html` tiene `data-scroll-locked`, es decir, con el drawer, la búsqueda o el carrito abiertos.
- `aria-label="Escríbenos por WhatsApp"`, `target="_blank"` y `rel="noopener noreferrer"`.
- La URL sale de la entrada `whatsapp` de `footer.social`. Sin esa entrada o con `whatsappButton.enabled: false`, el botón no se renderiza.

## Alcance

**Entra:**

- Nuevo bloque raíz `contact` en `global` (dirección, teléfono, email, horarios) y migración de `nav.contact`.
- El drawer móvil pasa a leer `global.contact`.
- Campos nuevos en `footer`: `logo`, `logoAlt` y `contactTitle`.
- Nuevo bloque `whatsappButton` con `enabled`.
- Reescritura de `FooterReact.tsx`: layout de la referencia en tres anchos, acordeón en móvil y barra inferior.
- Crédito a TWNSTUDIOS fijo en código.
- Año del copyright automático.
- `WhatsAppButton.astro`, renderizado sin hidratar desde `BaseLayout`.
- Token de color `whatsapp` en `tailwind.config.mjs`.
- `scrollLock.ts` marca `html[data-scroll-locked]`.
- Contenido sembrado desde el sitio en producción.
- El `email` del JSON-LD de `BaseLayout` sale de `global.contact.email`.

**No entra (para futuras specs):**

- Newsletter ("Recibe novedades, cuidados y rituales en tu correo."): necesita backend y proveedor de email.
- Las páginas `/nosotras`, `/servicios`, `/skin-journal`, `/terminos-y-condiciones`, `/cambios-y-devoluciones` y `/libro-de-reclamaciones`.
- Renombrar la ruta del blog de `/blog` a `/skin-journal`.
- Subir el botón de WhatsApp cuando haya una barra sticky de "Agregar al carrito".
- Estado "Abierto ahora" calculado a partir de los horarios.
- Traducciones de los campos nuevos.

## Modelo de datos

Cambios en `tina/collections/global.ts` y en `src/content/global/index.json`:

```jsonc
{
  "contact": {
    "address": "Calle Libertad 176, oficina 413 – Miraflores, Lima",
    "phone": "+51 908 686 767",
    "phoneUrl": "",
    "email": "eresskinstudio@gmail.com",
    "hours": [
      { "label": "Lunes a viernes", "text": "Mañana: 9:30 am a 2:00 pm\nTarde: 3:00 pm a 8:00 pm" },
      { "label": "Sábados", "text": "Mañana: 9:30 am a 2:00 pm\nTarde: 3:00 pm a 6:00 pm" }
    ]
  },
  "nav": { /* sin "contact" */ },
  "footer": {
    "logo": "/uploads/eres-studio-logo.svg",
    "logoAlt": "ERES Skin Studio",
    "tagline": "Limpiezas faciales, tratamientos faciales avanzados y depilación láser en Lima. Cada piel es única; cada experiencia en Eres también.",
    "columns": [
      {
        "title": "Explora",
        "links": [
          { "label": "Sobre nosotras", "url": "/contacto" },
          { "label": "Servicios", "url": "/contacto" },
          { "label": "Productos", "url": "/productos" },
          { "label": "Skin journal", "url": "/skin-journal" }
        ]
      },
      {
        "title": "Legales",
        "links": [
          { "label": "Términos y condiciones", "url": "/terminos-y-condiciones" },
          { "label": "Cambios y devoluciones", "url": "/cambios-y-devoluciones" },
          { "label": "Libro de reclamaciones", "url": "/libro-de-reclamaciones" }
        ]
      }
    ],
    "contactTitle": "Contacto",
    "social": [
      { "network": "instagram", "url": "https://www.instagram.com/eres.skinstudio/" },
      { "network": "facebook", "url": "https://www.facebook.com/eres.skinstudio/" },
      { "network": "whatsapp", "url": "https://wa.link/9tjyvn" }
    ],
    "legal": "Eres Skin Studio · Todos los derechos reservados"
  },
  "whatsappButton": { "enabled": true }
}
```

Convenciones:

- `contact.hours[].text` es un `textarea`. Los saltos de línea se respetan con `white-space: pre-line`.
- `contact.phoneUrl` vacío genera `tel:` con el número sin espacios, como hoy en el drawer.
- `footer.legal` no lleva ni `©` ni año: el componente los antepone.
- La columna Contacto siempre va última y no forma parte de `footer.columns`: su contenido sale de `contact`.
- Las etiquetas de las redes ("Instagram", "Facebook", "WhatsApp") se derivan de `network`. La función `socialLabel` sale de `MobileDrawer.tsx` a `src/components/shared/socialLinks.ts` para que la usen el drawer y el footer.
- La URL del crédito es una constante en `FooterReact.tsx` (`TWNSTUDIOS_CREDIT_URL`) y no tiene campo en Tina.

## Plan de implementación

1. **Contacto compartido.**
   - Agregar el objeto raíz `contact` al schema con `address`, `phone`, `phoneUrl`, `email` y `hours[]` (`label`, `text`).
   - Mover los valores de `nav.contact` al JSON y borrar `nav.contact` del schema.
   - `HeaderReact` pasa `global.contact` al drawer.
   - Correr `npm run build`. Verificar que el drawer móvil muestra la misma dirección y el mismo teléfono.
2. **Schema y contenido del footer.**
   - Agregar `footer.logo`, `footer.logoAlt`, `footer.contactTitle` y el bloque `whatsappButton` con `enabled`.
   - Sembrar el JSON con el contenido del modelo de datos.
   - El footer viejo sigue funcionando porque `columns`, `social` y `legal` mantienen su forma.
3. **`socialLabel` compartido.** Mover la función a `src/components/shared/socialLinks.ts` e importarla desde `MobileDrawer.tsx`. Sin cambio visual.
4. **Footer en desktop y tablet.**
   - Reescribir `FooterReact.tsx`: fondo, grilla `lg` y `md`, marca, columnas del CMS, columna Contacto con horarios y barra inferior (año, redes y crédito).
   - Cada texto editable lleva `data-tina-field`.
   - `Footer.astro` también consulta `contact`, que llega con la misma query de `global`.
5. **Acordeón móvil.** Estado `openColumn` con un solo panel abierto, `<button>` con `aria-expanded` y `aria-controls`, animación `grid-template-rows` y `PiPlusLight`. Los cierres salen por las clases `max-md:`.
6. **Botón de WhatsApp.**
   - Agregar `whatsapp: '#25D366'` a los colores de `tailwind.config.mjs`.
   - `lockScroll` y `unlockScroll` ponen y quitan `data-scroll-locked` en `document.documentElement`.
   - Crear `src/components/shared/WhatsAppButton.astro`: lee `global`, renderiza `FaWhatsapp` sin directiva de cliente y se oculta con `html[data-scroll-locked]`.
   - Montarlo en `BaseLayout.astro` junto al footer, fuera del modo mantenimiento.
7. **JSON-LD.** `BaseLayout.astro` toma `email` de `global.contact.email` en lugar del valor fijo.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] En ≥ 1024px el footer muestra marca más 3 columnas en una fila, en proporción 1.6 : 1 : 1 : 1.
- [ ] Entre 768 y 1023px el footer es una grilla de 2 columnas y todas las columnas están abiertas.
- [ ] Debajo de 768px, Explora, Legales y Contacto cargan cerradas. Tocar un título la abre, rota el `+` a 45° y cierra la que estaba abierta.
- [ ] En móvil, recargar la página no muestra columnas abiertas durante la carga.
- [ ] A 360px no hay scroll horizontal y la barra inferior se parte en varias líneas sin cortar texto.
- [ ] La columna Contacto muestra dirección, teléfono (`tel:+51908686767`), email (`mailto:eresskinstudio@gmail.com`) y los dos bloques de horarios con sus saltos de línea.
- [ ] El copyright muestra el año actual seguido de "Eres Skin Studio · Todos los derechos reservados".
- [ ] "TWNSTUDIOS" enlaza a `https://twnstudios.com/?utm_source=eresskin&utm_medium=referral&utm_campaign=client_portfolio` en otra pestaña, y el crédito no aparece en `/admin`.
- [ ] Instagram, Facebook y WhatsApp aparecen como texto en la barra inferior y abren sus URLs en otra pestaña.
- [ ] El botón flotante usa `FaWhatsapp`, enlaza a `https://wa.link/9tjyvn` y tiene `aria-label`.
- [ ] El botón desaparece al abrir el drawer, la búsqueda o el carrito, y vuelve al cerrarlos.
- [ ] Con `whatsappButton.enabled: false` o sin la red `whatsapp`, el botón no está en el HTML.
- [ ] El drawer móvil sigue mostrando la dirección, el teléfono y las redes, ahora leídos de `global.contact` y `footer.social`.
- [ ] Desde `/admin` se editan el logo, la bajada, las columnas, los datos de contacto, los horarios, las redes, la línea legal y el interruptor del botón, y el cambio se ve en la vista previa.
- [ ] Los textos del footer sobre `bg-ink` alcanzan al menos 4.5:1: `stone-300` y `stone-400` sobre `ink`.

## Decisiones

- **Sí: definición rápida.** Por pedido del usuario, las secciones posteriores a la cabecera no se revisaron una por una. Se asumieron a partir de sus respuestas y de la referencia.
- **Sí: botón flotante de WhatsApp en esta spec, con `FaWhatsapp`.** Es parte de la referencia y del sitio en producción, y el usuario pidió el icono de react-icons.
- **Sí: el botón se oculta mediante `html[data-scroll-locked]`.** El estado de los paneles vive en `HeaderReact`. Con un atributo que ya fija `scrollLock.ts`, el botón puede ser HTML estático sin hidratar React.
- **No: un contexto de React compartido entre el header y el botón.** Obligaría a hidratar el botón y a acoplar dos islas.
- **Sí: la URL del botón sale de la entrada `whatsapp` de `footer.social`.** Así el número no se mantiene en dos lugares.
- **Sí: `contact` como bloque raíz de `global`.** Es la única fuente para el header, el footer y el JSON-LD.
- **No: `email` y `hours` dentro de `nav.contact`.** El nombre `nav` confunde cuando los datos los usa el footer.
- **No: un bloque de contacto propio del footer.** Duplicaría datos.
- **Sí: el crédito a TWNSTUDIOS fijo en código.** El cliente no puede quitarlo ni alterar los UTM desde el CMS.
- **Sí: `rel="noopener"` sin `noreferrer` en el crédito.** El referrer ayuda a atribuir el tráfico, además de los UTM.
- **Sí: año automático en build.** El workflow de deploy recompila todos los días a las 04:00, así que el año cambia solo.
- **Sí: links sembrados con destinos reales cuando existen.** "Sobre nosotras" y "Servicios" van a `/contacto`, como en el header de SPEC 03.
- **Sí: "Skin journal" apunta a `/skin-journal` y la columna Legales va con sus URLs finales,** aunque den 404 hasta que existan esas páginas. Así lo eligió el usuario, y el Libro de reclamaciones es obligatorio en Perú.
- **No: renombrar `/blog` a `/skin-journal` en esta spec.** Toca las rutas del blog, el header y las redirecciones.
- **Sí: el acordeón con el estado cerrado en CSS (`max-md:`) y `<button>` y `<p>` separados por breakpoint.** Evita el parpadeo antes de hidratar y que en desktop quede un `aria-expanded` falso.
- **Sí: la isla del footer mantiene `client:visible`.** Solo la necesita el acordeón.
- **Sí: paleta cruda (`ink`, `stone-300/400/800`) dentro del footer.** Es un bloque de fondo oscuro fijo, la excepción que admite CLAUDE.md. Los tokens semánticos asumen el tema claro.
- **Sí: token `whatsapp` en Tailwind.** El verde de marca de WhatsApp no pertenece a la paleta de ERES, pero ningún componente escribe hex.
- **No: newsletter.** Requiere backend y proveedor, así que va en su propia spec.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `/uploads/eres-studio-logo.svg` no es la versión clara del logo. | El paso 2 lo comprueba visualmente sobre `bg-ink`. Si no lo es, se exporta una versión clara y se sube desde Tina. |
| El banner de cookies, abajo, tapa el botón de WhatsApp o queda debajo de él. | Verificar a 360px y en desktop con el banner visible. El banner queda por encima (`z` mayor que 46) hasta que se acepte. |
| Un panel queda abierto al navegar con `ClientRouter` y `data-scroll-locked` persiste, así que el botón no vuelve a aparecer. | `unlockScroll` ya se llama al cerrar los paneles. Verificar navegando desde el drawer. Si persiste, limpiar el atributo en `astro:after-swap`. |
| Los links de Legales y `/skin-journal` dan 404. | Es una decisión aceptada y temporal. Se resuelve con las specs de esas páginas. |
| Quitar `nav.contact` rompe una consulta que no se detectó. | El paso 1 incluye `npm run build`. Los tipos generados por Tina fallan si queda alguna referencia. |

## Qué **no** entra en esta spec

- Newsletter.
- Páginas `/nosotras`, `/servicios`, `/skin-journal` y las páginas legales.
- Renombrar `/blog` a `/skin-journal`.
- Reubicar el botón de WhatsApp sobre una barra sticky de compra.
- Estado "Abierto ahora" a partir de los horarios.
- Traducciones de los campos nuevos.

Cada una de esas piezas, si llega, va en su propia spec.

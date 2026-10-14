# SPEC 22 — Ajustes de la cuarta revisión de staging

> **Estado:** Aprobado
> **Depende de:** SPEC 03, SPEC 05, SPEC 09, SPEC 10, SPEC 17, SPEC 18, SPEC 19
> **Fecha:** 2026-10-13
> **Objetivo:** Resolver las observaciones de la cuarta revisión de staging: mensaje de entrega gratis desde S/ 250, hero de la home más rápido y con texto oscuro, "e" del logo en Reserva una cita, carrito que se abre al agregar desde la tarjeta, y mensajes de recojo y de pasarela de pago.

## Por qué existe esta spec

El cliente revisó de nuevo el sitio y dejó siete observaciones:

1. Banner superior: agregar un tercer mensaje de entrega gratis desde S/ 250, y bajar el umbral en WooCommerce.
2. Hero de la home: los slides pasan demasiado lento.
3. Reserva una cita: la "e" del fondo no es la del logo.
4. Tarjeta de producto: al agregar al carrito parece que no pasa nada.
5. Recojo en el local: avisar que incluye una evaluación computarizada de regalo.
6. Checkout: decir quién procesa el pago, para dar confianza.
7. Hero de la home: letras negras en lugar de blancas, para poder usar fotos más claras.

La observación 3 revierte la "e" de Playfair Display Italic de SPEC 17. La 7 revierte el texto claro sobre foto oscurecida de SPEC 05. Los motivos están en Decisiones.

## Alcance

**Entra:**

- **Banner superior.** Tercer mensaje en `global.announcement.items`: "Entrega gratis para compras desde S/ 250", con enlace a `/productos`.
- **Umbral de envío gratis.** `free_shipping_threshold` baja de 300 a 250 en `wordpress/mu-plugins/eres-checkout/config.php`. Se cambia también a mano en WooCommerce → Ajustes → Checkout ERES.
- **Tiempo del hero.** Campo nuevo `home.hero.slideSeconds` ("Segundos por slide"), único para todo el carrusel, con 4 por defecto. Reemplaza los 6,5 s fijos.
- **Texto oscuro en el hero de la home.** Título, bajada, botón y contador de `HeroCarouselReact` pasan a color oscuro. El degradado oscuro se reemplaza por un velo crema detrás del texto.
- **Campo `scrim` del slide.** Pasa de "Oscurecer imagen (%)" a "Aclarar imagen (%)": pinta crema en vez de tinta. El nombre del campo no cambia.
- **"e" de Reserva una cita.** `BookingReact` usa el trazo de la primera "e" de `public/uploads/logo-eres.svg` en lugar de la "e" de Playfair Display.
- **Agregar desde la tarjeta.** `QuickAddReact` abre el carrito al agregar con éxito, igual que la ficha. Aplica al botón de desktop y al ícono de móvil.
- **Mensaje de recojo.** "Si recoges en el local te regalamos una evaluación computarizada" en el checkout (opción "Recojo en el local") y en la ficha (bloque de recojo).
- **Mensaje de pasarela.** "Pago procesado por Culqi, pasarela del grupo Credicorp (BCP)" en el paso Pago del checkout.
- Actualizar `CLAUDE.md` y `wordpress/README.md` §13 donde describen el hero, el umbral y los textos del checkout.

**Fuera de alcance (para futuras specs):**

- Fotos nuevas del hero. Se suben desde Tina cuando el cliente las entregue.
- Texto oscuro en el hero de `/skin-journal` y en la tarjeta destacada del Journal de la home.
- La "e" decorativa del bloque Comunidad de `/nosotras`. Sigue como está.
- Tiempo distinto por cada slide del hero.
- Cambiar el texto del botón de la tarjeta a "Ver tu carrito".
- Rotación del banner superior. Sigue en 4,5 s por mensaje.
- Mensaje de recojo en el carrito lateral o en los correos de pedido.
- Editar el mensaje de pasarela desde Ajustes → Checkout ERES.
- Logos de Culqi, BCP o tarjetas en el checkout.

## Modelo de datos

Dos campos nuevos en Tina, una clave nueva en la configuración del checkout y un cambio de significado.

```ts
// tina/collections/home.ts → hero
{ name: "slideSeconds", label: "Segundos por slide", type: "number" }

// tina/collections/shop.ts → productPage
{ name: "pickupNote", label: "Recojo · beneficio", type: "string" }
```

```php
// wordpress/mu-plugins/eres-checkout/config.php
'delivery' => [
    'local_pickup' => ['title' => '…', 'subtitle' => '…', 'summary' => '…', 'note' => 'Si recoges en el local te regalamos una evaluación computarizada'],
    'flat_rate' => [/* igual */ 'note' => ''],
    'free_shipping' => [/* igual */ 'note' => ''],
],
'free_shipping_threshold' => 250,
```

Convenciones:

- `slideSeconds` vacío, no numérico o fuera de rango vale 4. El rango válido es de 2 a 15.
- `autoplay` conserva su función. Su etiqueta pasa de "Avanzar solo cada 6,5 s" a "Avanzar solo".
- `scrim` conserva nombre y rango (0 a 40). Ahora es la opacidad de una capa `surface` sobre la foto.
- `pickupNote` vacío no pinta nada en la ficha. `note` vacío no pinta nada en el checkout.
- `note` se guarda en la opción `eres_checkout_settings` junto a `subtitle`, con el mismo límite de longitud.
- El mensaje de pasarela es una constante en `eres-checkout/layout.php`. No entra en `eres_checkout_config()`.

Contenido que cambia:

- `src/content/global/index.json`: tercer ítem en `announcement.items`.
- `src/content/home/index.json`: `hero.slideSeconds: 4`.
- `src/content/shop/index.json`: `productPage.pickupNote`.

## Plan de implementación

Cada paso deja el sitio compilando y se puede commitear solo. La rama sale de `staging`: `feat/ajustes-cuarta-revision`.

1. **Banner.** Agregar el tercer ítem a `announcement.items` en `src/content/global/index.json`. `AnnouncementBar.tsx` no cambia. Prueba: los tres mensajes rotan en la home.
2. **Umbral.** Cambiar `free_shipping_threshold` a 250 en `eres-checkout/config.php` y el valor de ejemplo en `wordpress/README.md` §13.
3. **Campo `slideSeconds`.** Agregarlo a `tina/collections/home.ts`, cambiar la etiqueta de `autoplay` y escribir `4` en `src/content/home/index.json`. Regenerar `tina/__generated__/` con el build.
4. **Tiempo del hero.** `HeroReact.tsx` normaliza `slideSeconds` (2 a 15, 4 por defecto) y lo pasa a `HeroCarouselReact`. El carrusel lo aplica como `animationDuration` en la barra de progreso. La animación `hero-progress` de `tailwind.config.mjs` baja a 4 s como valor base.
5. **Texto oscuro del hero.** En `HeroCarouselReact.tsx`:
   - El bloque de texto y el contador pasan de `text-content-inverse` a `text-content`. La barra del contador usa `bg-content/25` y `bg-content`.
   - El botón pasa de `btn-fill-light` a `btn-fill-dark`.
   - El degradado `from-ink…` se reemplaza por uno de `surface`: de abajo hacia arriba en móvil y de izquierda a derecha desde `md`, transparente desde el 65 %.
   - La capa de `scrim` pasa de `bg-ink` a `bg-surface`.
   - El fondo de la sección pasa de `bg-accent` a `bg-surface-sunken`, para que el texto se lea antes de que cargue la foto.
6. **Etiqueta de `scrim`.** En `tina/collections/home.ts`: "Aclarar imagen (%)" y descripción "De 0 a 40. Úsalo si el texto no se lee sobre la foto."
7. **"e" del logo.** En `BookingReact.tsx`, reemplazar el `path` y el `viewBox` de `PlayfairLetterE` por los de la primera "e" de `public/uploads/logo-eres.svg` (el primer `<path>`, con el `viewBox` ajustado a su caja). Renombrar el componente a `LogoLetterE`. Posición, tamaño y opacidad (18 %) no cambian.
8. **Carrito al agregar.** En `QuickAddReact.tsx`, llamar a `requestCartOpen()` cuando `addToCart` devuelve un carrito. El estado "Agregado" se mantiene. En error no se abre nada.
9. **Recojo en la ficha.** Agregar `pickupNote` a `tina/collections/shop.ts` y a `src/content/shop/index.json`. `src/pages/productos/[slug].astro` lo pinta bajo `pickupText`, en `text-caption-md text-accent`.
10. **Recojo en el checkout.** Agregar `note` a los tres métodos de `delivery` en `config.php`. `eres_checkout_rate_texts()` lo devuelve y la opción de entrega lo pinta bajo el subtítulo. `settings.php` lo lee, lo sanea y lo muestra como segundo campo por método. Estilo en `eres-checkout/assets/checkout.css`.
11. **Pasarela en el checkout.** En `eres_checkout_payment_step()`, pintar un párrafo `eres-payment-note` entre el encabezado "Pago" y los métodos de pago. Texto en una constante. Estilo en `checkout.css`.
12. **Documentación.** `CLAUDE.md`: `slideSeconds`, hero con texto oscuro y velo crema, `scrim` que aclara, tarjeta que abre el carrito. `wordpress/README.md` §13: campo de beneficio por método de entrega y mensaje de pasarela.
13. **Servidor.** Subir los archivos de `eres-checkout/` según `wordpress/README.md` §13. En WooCommerce → Ajustes → Checkout ERES, poner 250 en "Monto para envío gratuito" y guardar.

## Criterios de aceptación

**Banner y umbral**

- [ ] El banner superior rota tres mensajes y el tercero dice "Entrega gratis para compras desde S/ 250".
- [ ] El tercer mensaje enlaza a `/productos`.
- [ ] Con un carrito de S/ 250 o más, el envío a domicilio cuesta S/ 0 en el checkout.
- [ ] Con un carrito de S/ 249, la barra del checkout dice "Te faltan S/ 1,00 para obtener envío gratuito".

**Hero de la home**

- [ ] Con `slideSeconds: 4`, el carrusel cambia de slide a los 4 s.
- [ ] Cambiar `slideSeconds` a 8 en `/admin` hace que el slide dure 8 s.
- [ ] Con `slideSeconds` vacío, 0 o 100, el slide dura 4 s.
- [ ] Con `autoplay` apagado o `prefers-reduced-motion`, el carrusel no avanza solo.
- [ ] Título, bajada y contador se pintan en `content` (`#1D1D1B`) en los tres slides, en móvil y en desktop.
- [ ] El botón de cada slide tiene fondo `ink` y texto claro.
- [ ] `HeroCarouselReact.tsx` no contiene `from-ink`, `to-ink` ni `text-content-inverse`.
- [ ] Un slide con `scrim: 40` se ve más claro que el mismo slide con `scrim: 0`.
- [ ] El campo se llama "Aclarar imagen (%)" en `/admin`.

**Reserva una cita**

- [ ] La letra de fondo coincide con la primera "e" de `logo-eres.svg` superpuesta a la misma escala.
- [ ] La letra no se recorta en 375 px ni en 1440 px de ancho.
- [ ] `BookingReact.tsx` no contiene el trazo de Playfair Display.

**Tarjeta de producto**

- [ ] Al agregar desde la barra de una tarjeta en desktop, el carrito lateral se abre con el producto.
- [ ] Al agregar desde el ícono de una tarjeta en móvil, el carrito lateral se abre con el producto.
- [ ] Se cumple en `/productos`, en los destacados de la home y en los relacionados de la ficha.
- [ ] Si `addToCart` falla, el carrito no se abre y el botón muestra "No se pudo agregar".

**Mensajes**

- [ ] La ficha muestra "Si recoges en el local te regalamos una evaluación computarizada" bajo el detalle de recojo.
- [ ] Vaciar `pickupNote` en `/admin` quita ese texto sin dejar un hueco.
- [ ] El checkout muestra el mismo mensaje bajo "Recojo en el local" y no bajo "Envío a domicilio".
- [ ] El mensaje de recojo se puede editar en Ajustes → Checkout ERES y el cambio se ve en el checkout.
- [ ] El paso Pago muestra "Pago procesado por Culqi, pasarela del grupo Credicorp (BCP)" sobre los métodos de pago.
- [ ] Un pedido de prueba con Culqi termina en `/gracias/?pedido=<número>`.

**General**

- [ ] `npm run build` termina sin errores.
- [ ] `CLAUDE.md` y `wordpress/README.md` describen los cambios.

## Decisiones

- **Sí:** una sola spec para las siete observaciones. Es el mismo formato de SPEC 15, 16 y 17.
- **Sí:** definición rápida. El usuario confirmó la cabecera y el alcance y pidió asumir el resto sin revisar sección por sección.
- **Sí:** "compras desde S/ 250" en el banner. El checkout aplica el envío gratis con monto mayor o igual al umbral.
- **No:** "mayores de S/ 250", como venía en la observación. Un carrito de S/ 250 exactos tendría envío gratis y el banner diría lo contrario.
- **Sí:** cambiar el umbral en `config.php` y en el panel. La opción guardada en WooCommerce pisa el valor por defecto, así que el archivo solo no alcanza.
- **No:** leer el umbral de WooCommerce para armar el texto del banner. El mensaje es contenido de Tina y el umbral cambia rara vez.
- **Sí:** `slideSeconds` editable en Tina con 4 por defecto. El cliente dudaba entre 3 y 4 s y podrá probar sin pedir un cambio de código.
- **No:** tiempo por slide. Un solo valor cubre la observación.
- **Sí:** rango de 2 a 15 s. Menos de 2 s no deja leer el título y corta la transición de 1,4 s.
- **Sí:** texto oscuro solo en el carrusel de la home. Es el único bloque que el cliente llama "hero".
- **No:** texto oscuro en el hero de `/skin-journal` ni en la tarjeta del Journal. Usan portadas de artículos, que no se eligen pensando en el texto.
- **Sí:** velo crema detrás del texto. El texto negro se lee con las fotos actuales y las nuevas se suben después sin código.
- **No:** quitar el velo y depender de las fotos nuevas. Una foto oscura dejaría el título ilegible.
- **Sí:** mantener el nombre `scrim`. Evita migrar contenido y regenerar el índice de TinaCloud por un cambio de etiqueta.
- **Sí:** la "e" sale de `logo-eres.svg`. Es el trazo oficial y ya está en el repo. Cierra tres rondas de versiones dibujadas a partir de una fuente (SPEC 15 y 17).
- **No:** `public/isotipo.svg`. Trae la "e" calada dentro de un óvalo, no la letra sola.
- **No:** cambiar la "e" de `/nosotras`. El cliente solo observó la del CTA.
- **Sí:** abrir el carrito al agregar desde la tarjeta. Es lo que ya hace la ficha y deja un solo comportamiento.
- **No:** botón "Ver tu carrito". En móvil el botón es un ícono y el cambio de texto no se vería.
- **Sí:** mensaje de recojo en la ficha y en el checkout. En la ficha motiva la compra y en el checkout motiva elegir recojo.
- **Sí:** clave `note` separada de `subtitle`. El subtítulo guardado en el panel pisaría un texto agregado al valor por defecto.
- **Sí:** "Pago procesado por Culqi, pasarela del grupo Credicorp (BCP)". Culqi pertenece a Credicorp, la matriz del BCP.
- **No:** "Pasarela de Pagos del BCP". Atribuye la pasarela al banco, y esa afirmación no es exacta.
- **No:** mensaje de pasarela editable en el panel. Es un dato del proveedor, no un texto de campaña.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El umbral del panel rige en producción apenas se guarda, antes de que el banner lo anuncie. | Guardar el 250 el mismo día del deploy a `main`. Bajar el umbral antes solo beneficia a la clienta. |
| El banner y el umbral son dos datos separados y pueden desincronizarse. | `wordpress/README.md` §13 indica editar el mensaje del banner al cambiar el monto. |
| El slide 1 tiene `scrim: 15` y pasará de oscurecer a aclarar. | Revisar los tres slides tras el paso 5 y ajustar el valor en el contenido. |
| El velo crema lava las fotos actuales, pensadas para texto blanco. | Es temporal hasta que lleguen las fotos claras. `scrim` permite afinar cada slide desde Tina. |
| Con texto oscuro, una foto oscura subida a futuro deja el título ilegible. | La descripción del campo de imagen pide fotos claras, como en el banner de `/productos`. |
| El schema de Tina cambia y TinaCloud indexa por rama. | Compilar con `TINA_BRANCH` igual a la rama de trabajo, como indica `CLAUDE.md`. |
| El script de Culqi manipula el bloque de pago del checkout. | El mensaje va fuera de `#payment`, sobre los métodos, y se prueba con un pedido real. |

## Lo que **no** entra en esta spec

- Fotos nuevas del hero.
- Texto oscuro en el hero de `/skin-journal` y en la tarjeta del Journal de la home.
- La "e" del bloque Comunidad de `/nosotras`.
- Tiempo distinto por slide.
- Botón "Ver tu carrito" en la tarjeta.
- Mensaje de recojo en el carrito lateral o en los correos.
- Mensaje de pasarela editable y logos de medios de pago.

Cada uno, si llega, va en su propia spec.

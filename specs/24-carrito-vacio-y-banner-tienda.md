# SPEC 24 — Carrito vacío tras la compra y encuadre del banner de la tienda

> **Estado:** Aprobado
> **Depende de:** SPEC 02, SPEC 13, SPEC 18, SPEC 23
> **Fecha:** 2026-10-26
> **Objetivo:** Que el carrito del sitio quede vacío después de pagar un pedido, aunque la clienta no pase por `/gracias`, y que el banner de `/productos` muestre los productos completos y sin tanto mármol vacío.

## Por qué existe esta spec

El cliente probó compras completas en producción y dejó tres observaciones:

1. **El carrito sigue lleno después de comprar.** Pasa al agregar desde la ficha y finalizar la compra. Tras el pago, la clienta llega a la página "pedido recibido" de WordPress y no a `/gracias`. `forgetCart()` solo corre en `/gracias`, así que el `Cart-Token` sigue en `localStorage`. Woo vacía el carrito de la sesión del navegador, pero no la sesión de la Store API a la que apunta el token. Al volver a la tienda, el sitio lee esa sesión y muestra el producto ya comprado.
2. **Banner de desktop.** La foto `linea-de-skincare-sobre-marmol-luminoso.webp` (1774×887) se encuadra en `50% 62%`. En pantallas anchas el recorte corta la parte de arriba de los productos y deja mucho mármol abajo.
3. **Banner de móvil.** La foto `coleccion-de-cuidado-facial-botanico.webp` (1122×1402) se ve entera en 4:5. Debajo de los productos quedan unos 700 px de mármol vacío.

## Alcance

**Entra:**

- **Vaciado en el servidor.** `eres-cart-handoff.php` guarda en el pedido el id de la sesión de la Store API que traspasó. Lo guarda en un meta del pedido, al crearse el pedido. Cuando el pedido pasa a `processing`, `on-hold` o `completed`, el plugin borra esa sesión. El siguiente `getCart()` del sitio devuelve un carrito vacío, venga de donde venga la clienta.
- **Varias pestañas.** `useCart` escucha el evento `storage`. Si otra pestaña borra el `Cart-Token` (en `/gracias`), la pestaña actual vacía su carrito sin recargar. Si otra pestaña cambia el token, la actual vuelve a pedir el carrito.
- **Banner en desktop.** El encuadre pasa de `md:[object-position:50%_62%]` a `md:[object-position:50%_30%]`. La altura no cambia.
- **Banner en móvil.** La proporción pasa de `aspect-[4/5]` a `aspect-[5/4]`, con encuadre `[object-position:50%_30%]` bajo `md`.
- La descripción del campo `shop.hero.imageMobile` se actualiza: la foto se recorta a 5:4.
- Actualizar `CLAUDE.md` (Tienda: Checkout y Gracias; colección `shop`) y `wordpress/README.md`, en la sección del traspaso de carrito.

**Fuera de alcance (para futuras specs):**

- Averiguar por qué la redirección de "pedido recibido" a `/gracias` (`eres-thank-you-redirect.php`) casi nunca ocurre. El vaciado ya no depende de ella, pero `/gracias` sigue sin verse.
- Recortar o reemplazar los archivos de las fotos del banner.
- Un encuadre (`focus`) editable desde Tina para el banner de la tienda.
- Vaciar el carrito cuando el pago falla o se cancela. En ese caso el carrito debe seguir lleno para reintentar.
- Sincronizar el carrito entre dispositivos distintos.

## Modelo de datos

Una clave nueva en la sesión de WooCommerce y un meta nuevo en el pedido:

```php
// wordpress/mu-plugins/eres-cart-handoff.php
const ERES_HANDOFF_SOURCE_SESSION = 'eres_handoff_source_session'; // clave en WC()->session
const ERES_HANDOFF_ORDER_META = '_eres_handoff_source_session';    // meta del pedido
const ERES_PAID_ORDER_STATUSES = ['processing', 'on-hold', 'completed'];
```

- `eres_cart_handoff_copy_session()` guarda en la sesión del navegador el `user_id` del payload del token. Ese `user_id` es el id de la sesión de la Store API.
- Al crearse el pedido (`woocommerce_checkout_order_created`), ese valor pasa al meta `_eres_handoff_source_session` y se borra de la sesión del navegador.
- Al entrar el pedido en un estado de `ERES_PAID_ORDER_STATUSES`, se borra esa sesión de la tabla `woocommerce_sessions` y luego el meta. Si el meta no existe, no pasa nada.
- Si el id coincide con el de la sesión del navegador, no se borra. Ese caso no debería darse, porque el traspaso copia el carrito a otra sesión.

En el navegador no aparece ninguna clave nueva: se reutiliza `TOKEN_KEY` de `src/utils/wooClient.ts`.

La descripción del campo de Tina cambia:

```ts
// tina/collections/shop.ts → hero.imageMobile
description: "Opcional. Vertical 4:5, p. ej. 1122×1402. En móvil se muestra recortada a 5:4: deja los productos en el tercio superior.",
```

## Plan de implementación

La rama sale de `staging` actualizado: `fix/carrito-y-banner-tienda`. Cada paso compila y se puede commitear solo.

1. **Recordar la sesión de origen.** En `eres-cart-handoff.php`, `eres_cart_handoff_copy_session()` recibe el id de la sesión del token y lo guarda en `WC()->session` con la clave `eres_handoff_source_session`. Prueba: después del traspaso, la sesión del navegador tiene la clave.
2. **Pasarla al pedido.** Agregar un hook a `woocommerce_checkout_order_created` que copie el valor al meta `_eres_handoff_source_session` del pedido y lo quite de la sesión. Prueba: un pedido nuevo creado desde el sitio muestra el meta en la base de datos.
3. **Borrar la sesión al pagarse.** Agregar hooks a `woocommerce_order_status_processing`, `woocommerce_order_status_on-hold` y `woocommerce_order_status_completed`. Cada uno lee el meta, borra la sesión con `WC_Session_Handler::delete_session()` y borra el meta. Si `WC()->session` no existe (webhook o IPN de la pasarela), se instancia un `WC_Session_Handler` solo para borrar. Prueba: tras pagar, la fila de esa sesión desaparece de `woocommerce_sessions` y `/woo-api.php?resource=cart` con el token viejo devuelve 0 productos.
4. **Sincronizar pestañas.** En `src/utils/wooClient.ts`, exportar `watchCartTokenFromOtherTabs(): () => void`. Escucha `storage` para `TOKEN_KEY`. Si `newValue` es `null`, sube `cartGeneration` y emite `CART_UPDATED` con `null`. Si no, llama a `getCart()`. Devuelve la función que quita el listener. `useCart` la llama en su `useEffect` de montaje. Prueba: con dos pestañas abiertas, borrar el token en una vacía el carrito de la otra.
5. **Banner.** En `src/components/shop/ShopBannerReact.tsx`, cambiar el contenedor a `aspect-[5/4] … md:aspect-auto md:h-[clamp(420px,38vw,560px)]`. La imagen pasa a `[object-position:50%_30%]` en todos los anchos (reemplaza `md:[object-position:50%_62%]`). Prueba: en 375 px el banner mide unos 300 px de alto.
6. **Descripción del campo.** Actualizar `hero.imageMobile` en `tina/collections/shop.ts` y regenerar `tina/__generated__/` y `tina/tina-lock.json` con el build.
7. **Documentación.** En `CLAUDE.md`:
   - Checkout: el mu-plugin de traspaso borra la sesión de origen al pagarse el pedido.
   - Gracias: `/gracias` ya no es el único lugar que vacía el carrito.
   - Colección `shop`: la foto móvil se muestra en 5:4, no en 4:5.

   En `wordpress/README.md`, en la sección del traspaso, indicar que el mu-plugin actualizado se sube a mano a `wp-content/mu-plugins/` de producción.

## Criterios de aceptación

**Carrito**

- [ ] En producción, agregar un producto desde la ficha, finalizar la compra y pagar deja la página "pedido recibido" de WordPress. Al volver a `/productos` sin pasar por `/gracias`, el contador del carrito marca 0 y el carrito lateral está vacío.
- [ ] Lo mismo vale al agregar desde la tarjeta del catálogo y con "Comprar ahora".
- [ ] Un pedido pagado con un método que lo deja en `on-hold` también vacía el carrito.
- [ ] Si el pago falla o se abandona el checkout, al volver a la tienda el carrito conserva sus productos.
- [ ] Después de una compra, agregar un producto nuevo crea un carrito que funciona y llega bien al checkout.
- [ ] Con la tienda abierta en una pestaña y `/gracias/?pedido=123` abierto en otra, la primera pestaña vacía su carrito sin recargar.
- [ ] El pedido pagado no conserva el meta `_eres_handoff_source_session`.
- [ ] No aparecen errores de PHP en `debug.log` al pagar, ni al recibir el webhook o IPN de la pasarela.

**Banner**

- [ ] En 1440 px y en 1920 px, `/productos` muestra los productos de la foto completos, sin cortar arriba, y el título y la bajada quedan sobre el mármol.
- [ ] En 768 px el banner no corta los productos.
- [ ] En 375 px el banner mide unos 300 px de alto (5:4), muestra los productos completos y el mármol bajo ellos ocupa menos de un tercio del alto.
- [ ] Las páginas `/productos/categoria/<slug>` se ven igual.
- [ ] La descripción nueva del campo "Imagen en móvil" aparece en `/admin`.
- [ ] `npm run build` termina sin errores.

## Decisiones tomadas y descartadas

- **Vaciar en el servidor, no solo en `/gracias` (tomada).** La clienta casi nunca llega a `/gracias`. Ligar el vaciado al pedido lo vuelve independiente de la redirección, de la pestaña y del dispositivo con que vuelva.
- **Disparar con el estado del pedido, no con la creación (tomada).** Si el pago falla, el carrito tiene que seguir lleno. `processing`, `on-hold` y `completed` cubren tarjeta (Culqi) y los métodos manuales.
- **Guardar la sesión de origen en el pedido, no solo en la sesión del navegador (tomada).** La pasarela puede confirmar el pago por webhook o IPN, sin la sesión del navegador. El meta del pedido está disponible en los dos casos.
- **Borrar la sesión de la Store API en vez de vaciar su carrito (tomada).** `delete_session()` es un método público de WooCommerce. Con el token viejo, la Store API arranca una sesión vacía. Reescribir el carrito dentro de la sesión serializada sería frágil.
- **Hook `woocommerce_cart_emptied` (descartada).** Depende de que la pasarela llame a `empty_cart()` en la petición del navegador. No está garantizado con Culqi en mantenimiento ni con los métodos manuales.
- **Arreglar solo la redirección a `/gracias` (descartada como solución).** No cubre el botón atrás, otra pestaña ni una pasarela que lleve a otra página. Investigarla queda para otra spec.
- **Escuchar `storage` (tomada).** Son pocas líneas y cubren la compra en otra pestaña, que con el vaciado en el servidor solo se notaría al recargar.
- **Encuadre por CSS, no recortar los archivos (tomada).** Las fotos siguen editables desde Tina y no hay que regenerar los archivos. Se descartaron recortar las fotos y agregar un `focus` editable.
- **Móvil en 5:4 (tomada).** En 375 px queda en unos 300 px de alto: muestra los productos, quita la mayor parte del mármol vacío y acerca el catálogo a la primera pantalla. Se descartó 1:1, que deja casi 400 px de mármol en la foto original.
- **Definición rápida (tomada).** Las secciones desde el modelo de datos se escribieron sin revisión intermedia, a pedido del usuario.

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| La pasarela marca el pedido como pagado sin pasar por los tres estados (p. ej., un estado propio) | Criterio de aceptación con pago real. Si aparece otro estado, se agrega a `ERES_PAID_ORDER_STATUSES`. |
| La Store API responde con el token viejo y una sesión vacía, y un `addToCart` posterior falla | Criterio "agregar después de comprar". Si falla, `forgetCart()` se llama cuando el carrito llega vacío con token, en otro paso. |
| El mu-plugin actualizado no se sube a producción (el deploy no toca WordPress) | Paso 7 documenta la subida manual en `wordpress/README.md`. |
| Pedidos creados antes del cambio no tienen el meta | No vacían nada. Ese carrito se vacía a mano o caduca con la sesión de Woo. |
| Una foto futura con los productos en otra altura queda mal encuadrada | La descripción del campo indica dónde poner los productos. Un `focus` editable queda fuera de alcance. |

## Lo que **no** entra en esta spec

- Diagnosticar o arreglar la redirección a `/gracias`.
- Recortar o reemplazar las fotos del banner.
- Encuadre editable del banner desde Tina.
- Vaciar el carrito ante pagos fallidos o cancelados.
- Sincronizar el carrito entre dispositivos.

Cada uno, si llega, va en su propia spec.

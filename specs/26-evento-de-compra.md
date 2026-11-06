# SPEC 26 — Evento de compra (Purchase) deduplicado

> **Estado:** Aprobado
> **Depende de:** SPEC 13, SPEC 21
> **Fecha:** 2026-11-06
> **Objetivo:** Que cada pedido pagado registre una sola compra en Meta y en GA4, con el mismo identificador en el navegador y en el servidor.

## Por qué existe esta spec

La revisión de medición del cliente encontró dos fallas:

1. **No sale el Purchase.** `eres-thank-you-redirect.php` redirige "pedido recibido" a `/gracias` en `template_redirect` y corta la página antes del hook `woocommerce_thankyou`. Ahí disparan la compra del navegador Google Analytics for WooCommerce (`purchase`) y Meta for WooCommerce (Pixel `Purchase`). En Meta solo sale el CAPI, que el plugin envía al crear el pedido, todavía en `pending`: un pago rechazado cuenta como compra.
2. **GA4 duplicado en `/checkout/`.** Site Kit by Google sigue activo y carga una segunda etiqueta (`GT-PZZMGZKQ` → `G-5LF55GGHSM`) además de la del plugin de GA4 (`G-YFZP4QY4NP`): salen dos `page_view` y dos `begin_checkout`.

## Alcance

**Entra:**

- **Mu-plugin `wordpress/mu-plugins/eres-purchase-tracking.php`.**
  - Mueve el CAPI de Purchase de Meta for WooCommerce de la creación del pedido a `processing` y `completed`. Sigue siendo el método del plugin: mismos datos, mismo `_meta_event_id` y mismo candado contra envíos dobles.
  - Endpoint `POST /wp-json/eres/v1/order-tracking` con `{ key }` (la clave del pedido). Si el pedido está pagado y no se midió antes, marca `_eres_purchase_tracked_browser`, `_meta_purchase_tracked_browser` y `_ga_tracked` y devuelve los datos de la compra. Si no, devuelve `track: false`.
  - `content_ids` con `get_fb_retailer_id()` del plugin de Meta e `item_id` con el ajuste "identificador de producto" del plugin de GA4: los mismos IDs que el CAPI y que `begin_checkout`.
- **Redirección.** `eres-thank-you-redirect.php` agrega `?clave=<order_key>` a `/gracias`.
- **Proxy.** Ruta `order-tracking` en `public/woo-api.php`, proyectada campo a campo.
- **`/gracias`.** `useTrackPurchase` lee `clave`, la quita de la URL y, solo con consentimiento de `analitica`, pide la compra y envía `fbq('track', 'Purchase', …, { eventID })` y `gtag('event', 'purchase', { transaction_id, … })`. Si la persona acepta el banner en esa misma página, se envía en ese momento.
- **Site Kit.** Se desactiva en WP Admin (ya estaba en "Se retiran" de la SPEC 21).

**Fuera de alcance:**

- Measurement Protocol de GA4 desde el servidor. GA4 deduplica `purchase` por `transaction_id`; un envío desde el servidor exige un `api_secret`.
- Compras de pedidos que se pagan después de llegar a `/gracias` (pago asíncrono): solo las registra el CAPI de Meta al pasar a `processing`.
- Unificar el `item_id` de `view_item` y `add_to_cart` (ID de Woo) con el de `begin_checkout` y `purchase` (SKU, según el ajuste del plugin).

## Deduplicación

| Plataforma | Navegador | Servidor | Clave |
|---|---|---|---|
| Meta | Pixel `Purchase` en `/gracias` | CAPI del plugin al pasar a `processing` o `completed` | `event_id` = `_meta_event_id` del pedido |
| GA4 | `purchase` en `/gracias` | — | `transaction_id` = número de pedido |

El endpoint entrega la compra una sola vez por pedido: recargar `/gracias` no la repite. Sin consentimiento no se reclama, para no gastar ese único envío.

## Verificación

1. Pedido de prueba pagado con Culqi: termina en `/gracias/?pedido=<n>` y la URL pierde `clave`.
2. Meta Events Manager → Probar eventos: un `Purchase` "Navegador y servidor" deduplicado.
3. GA4 → DebugView o Tag Assistant: un `purchase` con el `transaction_id` del pedido. En `/checkout/` un solo `page_view` y un solo `begin_checkout`.
4. Recargar `/gracias/?pedido=<n>&clave=<clave>`: no sale un segundo Purchase.
5. WooCommerce → Estado → Registros (`facebook_for_woocommerce`): `Purchase event fired … by hook woocommerce_order_status_processing (context: server)`.
6. Un pago rechazado no deja Purchase en Meta.

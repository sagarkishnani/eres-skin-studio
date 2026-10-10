# SPEC 19 — Ajustes del checkout en el admin de WooCommerce

> **Estado:** Aprobado
> **Depende de:** SPEC 18
> **Fecha:** 2026-10-09
> **Objetivo:** Agregar a WooCommerce → Ajustes una pestaña "Checkout ERES" donde el cliente edita los campos, distritos, tipos de documento, textos de entrega, umbral de envío gratuito y textos de confianza del checkout, sin tocar archivos.

## Por qué existe esta spec

- SPEC 18 dejó toda la configuración en `eres-checkout/config.php`. Editarla exige SFTP y saber PHP.
- El cliente necesita cambiar cosas frecuentes por su cuenta: agregar un distrito, volver opcional un campo, cambiar el monto del envío gratuito.
- SPEC 18 ya lee la configuración con `eres_checkout_config()` y el filtro `eres_checkout_config`. Esta spec solo se engancha ahí: no toca el maquetado ni el checkout.

## Alcance

**Entra:**

- Pestaña **Checkout ERES** en WooCommerce → Ajustes.
- Sección **Campos**: una fila por campo con Visible, Obligatorio, Etiqueta y Placeholder.
- Sección **Tipos de documento**: activar o desactivar cada tipo y cambiar su etiqueta.
- Sección **Distritos**: lista editable, uno por línea.
- Sección **Entrega**: subtítulo de cada tarjeta.
- Sección **Envío gratuito**: monto desde el que el envío a domicilio es gratis.
- Sección **Textos de confianza**: título y texto de los tres ítems del resumen.
- Botón **Restablecer valores**, que vuelve a los de `config.php`.
- Guardado en una sola opción de WordPress, `eres_checkout_settings`.
- Archivo nuevo `wordpress/mu-plugins/eres-checkout/settings.php`.
- Actualizar `wordpress/README.md` §13 y la viñeta **Checkout** de `CLAUDE.md`.

**Fuera de alcance (para futuras specs):**

- Crear campos nuevos, borrarlos o reordenarlos.
- Tipos de documento que no estén en `config.php`. Cada tipo tiene su regla de formato en código.
- Títulos de los pasos, texto del botón y título de las tarjetas de entrega.
- Enlace de WhatsApp y enlaces legales del footer.
- Reglas de formato (celular, DNI, RUC, dirección).
- Precios y métodos de envío. Siguen en WooCommerce → Ajustes → Envío.
- Colores, tipografía o cualquier estilo.
- Traducciones o varios idiomas.

## Referencia de la pantalla

La pestaña usa el formulario y el botón **Guardar los cambios** propios de WooCommerce. Cada sección es un título con una tabla `form-table` o `widefat`, con los estilos del admin de WordPress.

### Campos

Tabla con una fila por campo de `config.php`, en su orden:

| Columna | Control |
|---|---|
| Campo | Nombre fijo del campo (no editable) |
| Visible | Casilla |
| Obligatorio | Casilla |
| Etiqueta | Texto, hasta 60 caracteres |
| Placeholder | Texto, hasta 80 caracteres |

- Nombre, Apellidos y Correo electrónico llevan Visible y Obligatorio marcados y deshabilitados. Su etiqueta y placeholder sí se editan.
- Distrito, Dirección y Referencia muestran la nota "Solo con envío a domicilio".
- Bajo la tabla: "Si ocultas Distrito o Dirección, los pedidos con envío a domicilio llegarán sin ese dato."
- Un campo con Visible desmarcado guarda Obligatorio como desmarcado.
- Una etiqueta vacía se reemplaza por la de `config.php`.

### Tipos de documento

- Una fila por tipo de `config.php` (DNI, CE, Pasaporte, RUC): casilla **Activo** y etiqueta editable.
- Tiene que quedar al menos un tipo activo. Si se desmarcan todos, no se guarda la sección y se muestra el error "Deja al menos un tipo de documento activo."

### Distritos

- Un `textarea` con un distrito por línea.
- Al guardar se quitan espacios sobrantes, líneas vacías y repetidos. El orden se respeta.
- Tiene que quedar al menos un distrito. Si la lista queda vacía, no se guarda la sección y se muestra el error "Agrega al menos un distrito."

### Entrega

- Una fila por método de `config.php` (`local_pickup`, `flat_rate`, `free_shipping`), con su título fijo a la vista y el subtítulo editable, hasta 120 caracteres.
- Un subtítulo vacío es válido: la tarjeta se muestra sin subtítulo.

### Envío gratuito

- Campo numérico "Monto para envío gratuito", en soles, mayor o igual a 0.
- Desde ese monto de compra, descontados los cupones, el mu-plugin pone en S/0 el costo de todo método que no sea recojo. La barra usa el mismo monto.
- Con 0 no hay envío gratuito y la barra no se muestra.
- No depende del método "Envío gratuito" de WooCommerce.

### Textos de confianza

- Tres filas, una por ítem de `config.php`. Cada una con Título (hasta 40 caracteres) y Texto (hasta 80).
- El ícono de cada ítem no se edita.
- Un ítem con título y texto vacíos no se muestra en el checkout.

### Restablecer valores

- Enlace al pie: "Restablecer valores". Pide confirmación con el diálogo nativo del navegador.
- Borra la opción `eres_checkout_settings`. El checkout vuelve a los valores de `config.php`.

## Modelo de datos

### Opción `eres_checkout_settings`

Una sola fila en `wp_options`, con `autoload` activo:

```php
[
    'version' => 1,
    'fields' => [
        'billing_phone' => ['visible' => true, 'required' => true, 'label' => 'Celular', 'placeholder' => 'Ej. 987654321'],
        // una entrada por campo de config.php
    ],
    'document_types' => [
        'DNI' => ['active' => true, 'label' => 'DNI'],
        'CE' => ['active' => true, 'label' => 'Carné de Extranjería'],
        'Pasaporte' => ['active' => false, 'label' => 'Pasaporte'],
        'RUC' => ['active' => true, 'label' => 'RUC'],
    ],
    'districts' => ['Barranco', 'Chorrillos', 'Miraflores'],
    'delivery' => [
        'local_pickup' => ['subtitle' => 'Calle Libertad 176, of. 413 · Miraflores'],
        'flat_rate' => ['subtitle' => 'Envío en 48h · Distritos seleccionados de Lima'],
        'free_shipping' => ['subtitle' => 'Envío en 48h · Distritos seleccionados de Lima'],
    ],
    'free_shipping_threshold' => 300,
    'trust' => [
        ['title' => 'Pago 100% seguro', 'text' => 'Encriptado SSL'],
        ['title' => 'Envío en 48h', 'text' => 'Lima · Distritos disponibles'],
        ['title' => 'Devoluciones', 'text' => 'Hasta 14 días. Revisar condiciones.'],
    ],
]
```

### Cómo se combina con `config.php`

`settings.php` registra un filtro en `eres_checkout_config` (prioridad 10) que devuelve la configuración final:

| Clave | Regla |
|---|---|
| `fields` | Por cada campo de `config.php`: se toman `visible`, `required`, `label` y `placeholder` guardados. `locked` y `delivery_only` siempre salen de `config.php`. |
| `document_types` | Solo los tipos activos, con la etiqueta guardada, en el orden de `config.php`. |
| `districts` | La lista guardada, si no está vacía. |
| `delivery` | Se reemplaza `subtitle`. `title` y `summary` salen de `config.php`. |
| `free_shipping_threshold` | El valor guardado. |
| `trust` | Se reemplazan `title` y `text` por posición. `icon` sale de `config.php`. Los ítems vacíos se descartan. |
| `whatsapp_url`, `legal_links` | Siempre de `config.php`. |

Convenciones:

- Sin la opción guardada, el filtro devuelve `config.php` sin cambios.
- Una clave guardada que ya no existe en `config.php` (un campo o tipo retirado del código) se ignora.
- Una clave de `config.php` que no está guardada (un campo agregado después) usa su valor de `config.php`.
- `version` permite migrar el formato más adelante. Esta spec solo escribe `1`.
- Todo texto se guarda con `sanitize_text_field`. Los valores booleanos se guardan como `true` / `false`.

### Permisos

- La pestaña y el guardado exigen la capacidad `manage_woocommerce`.
- El guardado usa el nonce del formulario de ajustes de WooCommerce. "Restablecer valores" usa un nonce propio.

## Plan de implementación

Rama: `feat/spec-19-ajustes-del-checkout`, desde `staging` actualizado y con SPEC 18 ya mergeada.

1. **Lectura.** Crear `settings.php` con la lectura de `eres_checkout_settings` y el filtro que la combina con `config.php`. Cargarlo desde `eres-checkout.php`. Sin opción guardada, el checkout no cambia.
2. **Pestaña.** Registrar la pestaña "Checkout ERES" en `woocommerce_settings_tabs_array` y pintar la sección **Campos**, de solo lectura por ahora, con los valores actuales.
3. **Guardado de campos.** Sanear y guardar la sección **Campos** en `woocommerce_update_options_eres_checkout`. Respetar los campos `locked`.
4. **Tipos de documento y distritos.** Pintar y guardar las dos secciones, con sus errores de mínimo uno.
5. **Entrega, envío gratuito y textos de confianza.** Pintar y guardar las tres secciones. Leer el monto del método "Envío gratuito" de las zonas y mostrar el aviso.
6. **Restablecer.** Enlace con nonce y confirmación que borra la opción.
7. **Documentación.** En `wordpress/README.md` §13, reemplazar la tabla de `config.php` por la descripción de la pestaña y dejar `config.php` como "valores por defecto". Ajustar la viñeta **Checkout** de `CLAUDE.md`.
8. **Pase.** Subir la carpeta `eres-checkout/` y `eres-checkout.php`. No hay que desactivar nada: sin opción guardada el checkout queda igual.

## Criterios de aceptación

**Pestaña**

- [ ] WooCommerce → Ajustes muestra la pestaña "Checkout ERES".
- [ ] Un usuario sin `manage_woocommerce` no ve la pestaña ni puede guardar con una petición directa.
- [ ] Antes de guardar por primera vez, cada control muestra el valor de `config.php`.
- [ ] Recién instalada, sin guardar nada, el checkout se ve y valida igual que antes.

**Campos**

- [ ] Desmarcar Obligatorio en "N° de documento" y guardar quita el asterisco en el checkout y deja pasar un pedido sin ese dato.
- [ ] Desmarcar Visible en "Referencia" y guardar la quita del checkout.
- [ ] Cambiar la etiqueta de "Celular" a "Teléfono" la cambia en el checkout y en el mensaje "Teléfono es un campo obligatorio."
- [ ] Las casillas Visible y Obligatorio de Nombre, Apellidos y Correo electrónico están deshabilitadas.
- [ ] Una petición manipulada que desmarca Visible en Nombre no lo oculta en el checkout.
- [ ] Guardar una etiqueta vacía deja la etiqueta de `config.php`.
- [ ] Desmarcar Obligatorio en "Distrito" permite un pedido con envío a domicilio sin distrito, con ciudad `Lima`.

**Tipos de documento y distritos**

- [ ] Desactivar "Pasaporte" lo quita del selector del checkout.
- [ ] Desmarcar los cuatro tipos y guardar muestra el error y conserva los tipos anteriores.
- [ ] Agregar "Callao" al final de la lista lo muestra como última opción de Distrito.
- [ ] Guardar la lista con líneas vacías, espacios y un distrito repetido deja una entrada por distrito, sin espacios sobrantes.
- [ ] Guardar la lista vacía muestra el error y conserva los distritos anteriores.
- [ ] Un pedido con el distrito nuevo se guarda con ese distrito como ciudad.

**Entrega, envío gratuito y confianza**

- [ ] Cambiar el subtítulo de "Recojo en el local" lo cambia en su tarjeta.
- [ ] Guardar el subtítulo vacío muestra la tarjeta solo con su título.
- [ ] Con el monto en 250 y un subtotal de S/209.00, la barra dice "Te faltan S/41.00 para obtener envío gratuito".
- [ ] Con el monto en 0, la barra no se muestra.
- [ ] Con el monto en 250 y un subtotal de S/418.00, la tarjeta dice "Envío a domicilio · Gratis" y elegirla no suma nada al total.
- [ ] Con el monto en 250 y un subtotal de S/209.00, el envío a domicilio cuesta S/12.00.
- [ ] Cambiar el título del primer texto de confianza lo cambia bajo el total, con el mismo ícono.
- [ ] Vaciar título y texto del tercer ítem deja dos textos de confianza en el checkout.

**Restablecer y cierre**

- [ ] "Restablecer valores" pide confirmación. Al aceptar, la pestaña y el checkout vuelven a los valores de `config.php`.
- [ ] Tras restablecer, `get_option('eres_checkout_settings')` devuelve `false`.
- [ ] Guardar `<script>alert(1)</script>` como etiqueta no ejecuta código en el admin ni en el checkout.
- [ ] La pestaña no muestra avisos ni errores PHP con `WP_DEBUG` activo.
- [ ] `wordpress/README.md` §13 describe la pestaña y `CLAUDE.md` la menciona.

## Decisiones

- **Sí:** pestaña dentro de WooCommerce → Ajustes. Es donde el cliente ya configura envíos y pagos, y WooCommerce aporta el formulario, el nonce y el botón de guardar.
- **No:** un submenú propio o una página de opciones aparte. Sería un lugar más que recordar.
- **Sí:** una sola opción con todo. Se lee una vez por petición, se restablece borrando una fila y se respalda fácil.
- **No:** una opción por ajuste con la API de ajustes de WooCommerce. La tabla de campos no encaja en sus tipos de control.
- **Sí:** `config.php` queda como valores por defecto y la opción los sobrescribe. Restablecer no necesita copiar nada y un campo nuevo en código aparece solo.
- **Sí:** no es un constructor de campos. Confirmado por el usuario: sin crear ni reordenar.
- **Sí:** Nombre, Apellidos y Correo siempre visibles y obligatorios. WooCommerce y Culqi los necesitan. Confirmado por el usuario.
- **Sí:** Distrito y Dirección configurables, con una advertencia. El usuario los incluyó en la lista de campos editables.
- **No:** bloquear Distrito y Dirección como obligatorios. Quita una libertad que el usuario pidió.
- **Sí:** tipos de documento como lista fija con casilla y etiqueta. Cada tipo tiene una regla de formato en `validation.php`, y un tipo inventado no tendría ninguna.
- **No:** tipos de documento libres. Requeriría editar reglas de formato desde el admin.
- **Sí:** distritos en un `textarea`, uno por línea. Es la forma más rápida de pegar o corregir una lista.
- **No:** un repetidor con botones de agregar y quitar. Más código para el mismo resultado.
- **Sí:** solo el subtítulo de las tarjetas de entrega. Confirmado por el usuario.
- **Sí:** el monto de la pestaña aplica el envío gratuito (filtro `woocommerce_package_rates`). Tras el pase, la barra anunciaba un envío gratuito que WooCommerce no aplicaba porque la zona no tenía ese método. Con un solo monto no hay nada que desincronizar.
- **Revierte:** el aviso de "no coincide con WooCommerce" de la primera versión de esta spec. Ya no hay dos montos.
- **No:** usar el método "Envío gratuito" nativo. Mostraría dos tarjetas de envío a domicilio, una paga y una gratis, y el monto viviría en otra pantalla.
- **Sí:** títulos de pasos, botón, WhatsApp y enlaces legales siguen en código. Confirmado por el usuario para pasos y botón. Los otros dos son una propuesta.
- **Sí:** capacidad `manage_woocommerce`. Es la que ya protege el resto de Ajustes.
- **Definición rápida:** el alcance lo confirmó el usuario al definir SPEC 18. Son propuestas no revisadas: los límites de caracteres, que los tipos de documento sean una lista fija, que WhatsApp y los enlaces legales queden en código, la advertencia de Distrito y Dirección, el aviso del monto y el botón de restablecer.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El cliente oculta Dirección o Distrito y llegan pedidos de envío sin dirección | Advertencia fija bajo la tabla de campos. Restablecer devuelve los valores originales. |
| El cliente vuelve opcional el celular y no hay cómo coordinar la entrega | Decisión del cliente. La guía explica para qué se usa cada campo. |
| El cliente renombra un distrito y los pedidos anteriores conservan el nombre viejo | Es el comportamiento esperado: el distrito se guarda como texto en cada pedido. |
| La zona también tiene el método "Envío gratuito" de WooCommerce | Aparece como una tarjeta más. La guía indica que no hace falta y que conviene quitarlo. |
| Una actualización del mu-plugin cambia las claves de `config.php` | Las claves guardadas que ya no existen se ignoran y las nuevas usan su valor por defecto. `version` queda para migraciones. |
| LiteSpeed sirve el checkout anterior tras guardar | WooCommerce excluye el checkout de la caché de página. La guía indica purgar si un cambio no se ve. |
| Texto con HTML en una etiqueta | Se guarda con `sanitize_text_field` y se escapa al pintar, en el admin y en el checkout. |
| El mu-plugin se actualiza subiendo la carpeta y alguien edita `config.php` en el servidor | `config.php` se pisa en cada subida. La guía indica que los cambios del cliente van por la pestaña. |

## Lo que **no** entra en esta spec

- Crear, borrar o reordenar campos.
- Tipos de documento nuevos y reglas de formato editables.
- Títulos de pasos, texto del botón y título de las tarjetas de entrega.
- Enlace de WhatsApp y enlaces legales.
- Precios y métodos de envío.
- Estilos del checkout.

Cada una, si llega, va en su propia spec.

<?php

defined('ABSPATH') || exit;

return [
    'fields' => [
        'billing_first_name' => ['label' => 'Nombre', 'required' => true, 'visible' => true, 'placeholder' => '', 'locked' => true],
        'billing_last_name' => ['label' => 'Apellidos', 'required' => true, 'visible' => true, 'placeholder' => '', 'locked' => true],
        'billing_email' => ['label' => 'Correo electrónico', 'required' => true, 'visible' => true, 'placeholder' => 'tu@correo.com', 'locked' => true],
        'billing_phone' => ['label' => 'Celular', 'required' => true, 'visible' => true, 'placeholder' => 'Ej. 987654321'],
        'billing_tipo_documento' => ['label' => 'Tipo de documento', 'required' => true, 'visible' => true, 'placeholder' => 'Selecciona'],
        'billing_numero_documento' => ['label' => 'N° de documento', 'required' => true, 'visible' => true, 'placeholder' => 'Ej. 12345678'],
        'billing_distrito' => ['label' => 'Distrito', 'required' => true, 'visible' => true, 'placeholder' => 'Selecciona un distrito', 'delivery_only' => true],
        'billing_address_1' => ['label' => 'Dirección', 'required' => true, 'visible' => true, 'placeholder' => 'Calle, número y departamento', 'delivery_only' => true],
        'billing_address_2' => ['label' => 'Referencia', 'required' => false, 'visible' => true, 'placeholder' => 'Ej. frente al parque', 'delivery_only' => true],
    ],
    'document_types' => [
        'DNI' => 'DNI',
        'CE' => 'Carné de Extranjería',
        'Pasaporte' => 'Pasaporte',
        'RUC' => 'RUC',
    ],
    'districts' => [
        'Barranco', 'Chorrillos', 'Jesús María', 'La Molina', 'La Victoria',
        'Lince', 'Magdalena del Mar', 'Miraflores', 'Pueblo Libre', 'San Borja',
        'San Isidro', 'San Luis', 'San Miguel', 'Santiago de Surco', 'Surquillo',
    ],
    'delivery' => [
        'local_pickup' => ['title' => 'Recojo en el local', 'subtitle' => 'Calle Libertad 176, of. 413 · Miraflores', 'summary' => 'Recojo'],
        'flat_rate' => ['title' => 'Envío a domicilio', 'subtitle' => 'Envío en 48h · Distritos seleccionados de Lima', 'summary' => 'Envío a domicilio'],
        'free_shipping' => ['title' => 'Envío a domicilio', 'subtitle' => 'Envío en 48h · Distritos seleccionados de Lima', 'summary' => 'Envío a domicilio'],
    ],
    'free_shipping_threshold' => 300,
    'trust' => [
        ['icon' => 'shield', 'title' => 'Pago 100% seguro', 'text' => 'Encriptado SSL'],
        ['icon' => 'truck', 'title' => 'Envío en 48h', 'text' => 'Lima · Distritos disponibles'],
        ['icon' => 'return', 'title' => 'Devoluciones', 'text' => 'Hasta 14 días. Revisar condiciones.'],
    ],
    'whatsapp_url' => 'https://wa.link/9tjyvn',
    'legal_links' => [
        'Términos y condiciones' => '/terminos-y-condiciones/',
        'Cambios y devoluciones' => '/cambios-y-devoluciones/',
        'Libro de reclamaciones' => '/libro-de-reclamaciones/',
    ],
];

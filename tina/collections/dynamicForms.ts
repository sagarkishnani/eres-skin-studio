import type { Collection } from "tinacms";

export const dynamicFormsCollection: Collection = {
  name: "dynamicForms",
  label: "Formularios Dinámicos",
  path: "src/content/dynamic-forms",
  format: "json",
  ui: {
    router: ({ document }) => {
      const slug = document._sys.filename;
      const routes: Record<string, string> = {
        contacto: "/contacto",
      };
      return routes[slug] || `/${slug}`;
    },
  },
  fields: [
    {
      name: "formId",
      label: "ID del formulario",
      type: "string",
      required: true,
      description:
        "Identificador único. Debe coincidir con formType en 'Configuración de formularios' para el envío de correos.",
    },
    {
      name: "formTitle",
      label: "Título del formulario",
      type: "string",
    },
    { name: "formTitle_en", label: "Título del formulario (EN)", type: "string" },
    {
      name: "badge",
      label: "Badge (opcional)",
      type: "string",
      description:
        "Texto pequeño encima del título. Solo aplica en estilo Estándar.",
    },
    {
      name: "description",
      label: "Descripción",
      type: "string",
      ui: { component: "textarea" },
    },
    {
      name: "description_en",
      label: "Descripción (EN)",
      type: "string",
      ui: { component: "textarea" },
    },
    {
      name: "styleVariant",
      label: "Estilo visual",
      type: "string",
      options: [
        { value: "default", label: "Estándar (fondo claro)" },
        { value: "contact", label: "Contacto (estilo Tailwind, claro)" },
        { value: "contact-dark", label: "Contacto (oscuro / corp)" },
      ],
      description: "Define la apariencia visual del formulario.",
    },

    {
      name: "submitButtonText",
      label: "Texto botón enviar",
      type: "string",
    },
    { name: "submitButtonText_en", label: "Texto botón enviar (EN)", type: "string" },
    {
      name: "successTitle",
      label: "Título de éxito",
      type: "string",
      description:
        "Título que se muestra después de enviar exitosamente.",
    },
    { name: "successTitle_en", label: "Título de éxito (EN)", type: "string" },
    {
      name: "successMessage",
      label: "Mensaje de éxito",
      type: "string",
      ui: { component: "textarea" },
    },
    {
      name: "successMessage_en",
      label: "Mensaje de éxito (EN)",
      type: "string",
      ui: { component: "textarea" },
    },
    {
      name: "errorMessage",
      label: "Mensaje de error (servidor)",
      type: "string",
      description: "Se muestra cuando falla el envío al servidor.",
    },
    { name: "errorMessage_en", label: "Mensaje de error (EN)", type: "string" },
    {
      name: "validationMessage",
      label: "Mensaje de validación",
      type: "string",
      description:
        "Se muestra cuando el usuario intenta enviar con campos inválidos. Ej: 'Por favor completa los campos marcados en rojo'.",
    },
    { name: "validationMessage_en", label: "Mensaje de validación (EN)", type: "string" },
    {
      name: "showCorrelativo",
      label: "Mostrar N° correlativo",
      type: "boolean",
      description:
        "Mostrar número de correlativo en la pantalla de éxito (si el servidor lo retorna).",
    },

    {
      name: "privacyText",
      label: "Texto de privacidad",
      type: "string",
    },
    {
      name: "privacyUrl",
      label: "URL Política de Privacidad",
      type: "string",
    },
    {
      name: "dataUrl",
      label: "URL Tratamiento de Datos",
      type: "string",
    },

    {
      name: "fields",
      label: "Campos del formulario",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => {
          const type = item?.fieldType || "campo";
          const label = item?.label || item?.name || "";
          const icons: Record<string, string> = {
            section_header: "📌",
            divider: "──",
            note: "📝",
            text: "Aa",
            email: "✉",
            tel: "📞",
            ruc: "🆔",
            number: "#",
            textarea: "¶",
            select: "▼",
            radio: "◉",
            radioGroup: "◉◉",
            checkbox: "☑",
            checkboxGroup: "☑☑",
            upload: "📎",
            currency: "S/",
            date: "📅",
            hidden: "👁‍🗨",
          };
          const icon = icons[type] || "•";
          return { label: `${icon} ${type} — ${label}` };
        },
      },
      fields: [
        {
          name: "fieldType",
          label: "Tipo de campo",
          type: "string",
          required: true,
          options: [
            {
              value: "section_header",
              label: "📌 Encabezado de sección",
            },
            { value: "divider", label: "── Separador" },
            { value: "note", label: "📝 Nota / Texto" },
            { value: "text", label: "Texto" },
            { value: "email", label: "Email" },
            { value: "tel", label: "Teléfono (9 díg., empieza en 9)" },
            { value: "ruc", label: "RUC (11 dígitos)" },
            { value: "number", label: "Número" },
            { value: "textarea", label: "Área de texto" },
            { value: "select", label: "Desplegable" },
            { value: "radio", label: "Radio (inline)" },
            {
              value: "radioGroup",
              label: "Radio (cards con descripción)",
            },
            { value: "checkbox", label: "Casilla de verificación" },
            { value: "checkboxGroup", label: "Grupo de casillas" },
            { value: "upload", label: "Subir archivo" },
            { value: "currency", label: "Moneda (S/)" },
            { value: "date", label: "Fecha (día/mes/año)" },
            { value: "hidden", label: "Campo oculto" },
          ],
        },
        {
          name: "name",
          label: "Nombre interno",
          type: "string",
          description:
            "Identificador único del campo. Se usa como key en el JSON enviado. Sin espacios ni tildes. Ej: nombreCompleto, tipoDoc, adjuntos.",
        },
        {
          name: "label",
          label: "Etiqueta visible",
          type: "string",
          description: "Para section_header es el título de la sección.",
        },
        { name: "label_en", label: "Etiqueta visible (EN)", type: "string" },
        {
          name: "placeholder",
          label: "Placeholder",
          type: "string",
        },
        { name: "placeholder_en", label: "Placeholder (EN)", type: "string" },
        {
          name: "required",
          label: "Obligatorio",
          type: "boolean",
        },
        {
          name: "width",
          label: "Ancho",
          type: "string",
          options: [
            { value: "full", label: "Completo (100%)" },
            { value: "half", label: "Mitad (50%) — 2 por fila" },
            { value: "third", label: "Tercio (33%) — 3 por fila" },
          ],
          description: "En mobile siempre se muestra al 100%.",
        },
        {
          name: "order",
          label: "Orden (desktop)",
          type: "number",
          description:
            "Orden de aparición en desktop. Menor = más arriba.",
        },
        {
          name: "orderMobile",
          label: "Orden (mobile)",
          type: "number",
          description:
            "Orden en mobile. Si se deja vacío, usa el orden de desktop.",
        },

        {
          name: "sectionNumber",
          label: "Número de sección",
          type: "number",
          description:
            "Solo para section_header. Número que se muestra en el círculo.",
        },
        {
          name: "noteContent",
          label: "Contenido de nota",
          type: "string",
          ui: { component: "textarea" },
          description: "Solo para note. El texto del párrafo.",
        },
        {
          name: "noteContent_en",
          label: "Contenido de nota (EN)",
          type: "string",
          ui: { component: "textarea" },
        },
        {
          name: "rows",
          label: "Filas",
          type: "number",
          description: "Solo para textarea. Default: 4.",
        },

        {
          name: "validation",
          label: "Validación",
          type: "object",
          fields: [
            {
              name: "minLength",
              label: "Largo mínimo",
              type: "number",
            },
            {
              name: "maxLength",
              label: "Largo máximo",
              type: "number",
            },
            {
              name: "pattern",
              label: "Patrón (regex)",
              type: "string",
              description:
                "Expresión regular. Ej: ^\\d{11}$ para RUC de 11 dígitos, ^\\d{8}$ para DNI.",
            },
            {
              name: "patternMessage",
              label: "Mensaje del patrón",
              type: "string",
              description:
                "Mensaje cuando el valor no cumple el patrón. Ej: 'El RUC debe tener 11 dígitos'.",
            },
            { name: "patternMessage_en", label: "Mensaje del patrón (EN)", type: "string" },
          ],
        },
        {
          name: "errorMessage",
          label: "Mensaje de error personalizado",
          type: "string",
          description:
            "Si se deja vacío, se genera un mensaje automático según la validación que falle.",
        },
        { name: "errorMessage_en", label: "Mensaje de error personalizado (EN)", type: "string" },
        {
          name: "helpText",
          label: "Texto de ayuda",
          type: "string",
          description:
            "Texto pequeño debajo del campo. Para upload aparece como instrucción de archivos.",
        },
        { name: "helpText_en", label: "Texto de ayuda (EN)", type: "string" },
        {
          name: "defaultValue",
          label: "Valor por defecto",
          type: "string",
        },

        {
          name: "options",
          label: "Opciones",
          type: "object",
          list: true,
          description: "Para select, radio, radioGroup y checkboxGroup.",
          ui: {
            itemProps: (item) => ({ label: item?.label || "Opción" }),
          },
          fields: [
            { name: "value", label: "Valor", type: "string" },
            { name: "label", label: "Etiqueta", type: "string" },
            { name: "label_en", label: "Etiqueta (EN)", type: "string" },
            {
              name: "group",
              label: "Grupo / Categoría",
              type: "string",
              description:
                "Solo para select: agrupa las opciones bajo un encabezado (optgroup). Ej: la categoría del servicio.",
            },
            { name: "group_en", label: "Grupo / Categoría (EN)", type: "string" },
            {
              name: "description",
              label: "Descripción",
              type: "string",
              description:
                "Solo para radioGroup (aparece debajo del título en la tarjeta).",
            },
            { name: "description_en", label: "Descripción (EN)", type: "string" },
          ],
        },

        {
          name: "accept",
          label: "Tipos de archivo",
          type: "string",
          description: "Solo para upload. Ej: .pdf,.jpg,.png,.doc,.docx",
        },
        {
          name: "maxFileSize",
          label: "Tamaño máximo (MB)",
          type: "number",
          description: "Solo para upload.",
        },
        {
          name: "multiple",
          label: "Múltiples archivos",
          type: "boolean",
          description: "Solo para upload. Default: true.",
        },
        {
          name: "linkText",
          label: "Texto del enlace",
          type: "string",
          description:
            "Solo para checkbox. Parte del label que se convierte en enlace. Ej: 'Política de Privacidad'.",
        },
        { name: "linkText_en", label: "Texto del enlace (EN)", type: "string" },
        {
          name: "linkUrl",
          label: "URL del enlace",
          type: "string",
          description:
            "Solo para checkbox. URL a la que apunta el enlace.",
        },

        {
          name: "conditionalField",
          label: "Campo condicional",
          type: "object",
          description:
            "Solo mostrar este campo si otro campo tiene un valor específico.",
          fields: [
            {
              name: "dependsOn",
              label: "Depende del campo (nombre interno)",
              type: "string",
              description: "El 'name' del campo del cual depende.",
            },
            {
              name: "showWhen",
              label: "Mostrar cuando el valor es",
              type: "string",
              description:
                "Valor exacto. Para checkbox usa 'true' o 'false'.",
            },
          ],
        },
      ],
    },
  ],
};

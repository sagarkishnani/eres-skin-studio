import type { Collection } from "tinacms";

export const formConfigCollection: Collection = {
  name: "formConfig",
  label: "Configuración de formularios",
  path: "src/content/form-config",
  format: "json",
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      name: "forms",
      label: "Formularios",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.label || item?.formType || "Formulario",
        }),
      },
      fields: [
        {
          name: "formType",
          label: "Tipo (no modificar)",
          type: "string",
          description:
            "Identificador interno del formulario. No cambiar.",
        },
        {
          name: "label",
          label: "Nombre visible",
          type: "string",
        },
        {
          name: "enabled",
          label: "Activo",
          type: "boolean",
          description:
            "Si está desactivado, el formulario no enviará correos.",
        },
        {
          name: "recipients",
          label: "Correos destinatarios",
          type: "string",
          list: true,
          description:
            "Agrega uno o más correos. Cada formulario puede tener diferentes destinatarios.",
        },
      ],
    },
  ],
};

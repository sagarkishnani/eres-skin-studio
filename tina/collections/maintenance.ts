import type { Collection } from "tinacms";

export const maintenanceCollection: Collection = {
  name: "maintenance",
  label: "Modo Mantenimiento",
  path: "src/content/maintenance",
  format: "json",
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      name: "enabled",
      label: "Activar modo mantenimiento",
      type: "boolean",
      description:
        "Al activar, TODAS las páginas mostrarán la pantalla de mantenimiento después del próximo deploy.",
    },
    {
      name: "title",
      label: "Título",
      type: "string",
    },
    {
      name: "message",
      label: "Mensaje",
      type: "string",
      ui: { component: "textarea" },
    },
    {
      name: "showContact",
      label: "Mostrar contacto",
      type: "boolean",
    },
    {
      name: "contactText",
      label: "Texto de contacto",
      type: "string",
    },
    {
      name: "contactUrl",
      label: "URL de contacto",
      type: "string",
    },
  ],
};

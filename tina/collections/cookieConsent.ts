import type { Collection } from "tinacms";

export const cookieConsentCollection: Collection = {
  name: "cookieConsent",
  label: "Consentimiento de cookies (modal)",
  path: "src/content/cookie-consent",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { name: "title", label: "Título del modal", type: "string" },
    { name: "intro", label: "Texto introductorio", type: "rich-text" },
    {
      name: "showMoreText",
      label: "Texto del enlace 'Mostrar más'",
      type: "string",
    },
    {
      name: "showMoreUrl",
      label: "URL 'Mostrar más'",
      type: "string",
    },
    { name: "btnReject", label: "Texto botón rechazar", type: "string" },
    { name: "btnSave", label: "Texto botón guardar", type: "string" },
    { name: "btnAccept", label: "Texto botón aceptar", type: "string" },
    {
      name: "alwaysActiveLabel",
      label: "Etiqueta 'siempre activa'",
      type: "string",
    },
    {
      name: "categories",
      label: "Categorías",
      type: "object",
      list: true,
      ui: { itemProps: (c) => ({ label: c?.name || "Categoría" }) },
      fields: [
        { name: "key", label: "Clave", type: "string" },
        { name: "name", label: "Nombre", type: "string" },
        {
          name: "description",
          label: "Descripción",
          type: "string",
          ui: { component: "textarea" },
        },
        {
          name: "alwaysActive",
          label: "Siempre activa",
          type: "boolean",
        },
      ],
    },
  ],
};

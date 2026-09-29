import type { Collection } from "tinacms";
import { seoField, textarea } from "./fields";

export const journalCollection: Collection = {
  name: "journal",
  label: "Skin Journal",
  path: "src/content/journal",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/skin-journal" },
  fields: [
    { name: "title", label: "Título", type: "string", required: true },
    { name: "intro", label: "Bajada", type: "string", ui: textarea },
    {
      name: "emptyText",
      label: "Mensaje sin artículos",
      description: "Se muestra cuando una categoría o etiqueta no tiene posts.",
      type: "string",
      required: true,
    },
    seoField("SEO"),
  ],
};

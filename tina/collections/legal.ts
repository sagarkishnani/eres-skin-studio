import type { Collection } from "tinacms";
import { eyebrowField, seoField, textarea } from "./fields";

export const legalCollection: Collection = {
  name: "legal",
  label: "Páginas legales",
  path: "src/content/legal",
  format: "mdx",
  ui: { router: ({ document }) => `/${document._sys.filename}` },
  fields: [
    { name: "title", label: "Título", type: "string", required: true, isTitle: true },
    eyebrowField,
    {
      name: "updatedAt",
      label: "Última actualización",
      type: "datetime",
      ui: { dateFormat: "DD/MM/YYYY" },
    },
    { name: "intro", label: "Bajada", type: "string", ui: textarea },
    {
      name: "body",
      label: "Contenido",
      description: "Cada Título 2 abre una sección numerada. Una cita se muestra como aviso destacado.",
      type: "rich-text",
      isBody: true,
    },
    seoField("SEO"),
  ],
};

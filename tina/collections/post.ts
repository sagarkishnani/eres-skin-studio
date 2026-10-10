import type { Collection } from "tinacms";

export const JOURNAL_CATEGORIES = ["Cuidado", "Rutina", "Ingredientes", "Tratamientos"] as const;

export const postCollection: Collection = {
  name: "post",
  label: "Blog",
  path: "src/content/blog",
  format: "mdx",
  fields: [
    {
      name: "title",
      label: "Título",
      type: "string",
      required: true,
      isTitle: true,
    },
    { name: "title_en", label: "Título (EN)", type: "string" },
    {
      name: "excerpt",
      label: "Extracto",
      type: "string",
      ui: { component: "textarea" },
    },
    { name: "excerpt_en", label: "Extracto (EN)", type: "string", ui: { component: "textarea" } },
    { name: "body_en", label: "Contenido (EN)", type: "rich-text" },
    { name: "coverImage", label: "Imagen de portada", type: "image" },
    { name: "date", label: "Fecha", type: "datetime" },
    { name: "readTime", label: "Tiempo de lectura", type: "string" },
    { name: "author", label: "Autora", description: "Se muestra como \"Por {autora}\".", type: "string" },
    {
      name: "category",
      label: "Categoría",
      description: "Define la pestaña del Skin Journal en la que aparece el post.",
      type: "string",
      required: true,
      options: [...JOURNAL_CATEGORIES],
    },
    {
      name: "tags",
      label: "Etiquetas",
      description: "Temas libres del post. Cada una enlaza al listado filtrado por esa etiqueta.",
      type: "string",
      list: true,
    },
    { name: "featured", label: "Destacado", type: "boolean" },
    { name: "body", label: "Contenido", type: "rich-text", isBody: true },
  ],
};

import type { Collection } from "tinacms";

export const homeCollection: Collection = {
  name: "home",
  label: "Home",
  path: "src/content/home",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "hero",
      label: "Hero",
      fields: [
        { name: "eyebrow", label: "Antetítulo", type: "string" },
        { name: "title", label: "Título", type: "string", required: true },
        { name: "subtitle", label: "Subtítulo", type: "string", ui: { component: "textarea" } },
        { name: "image", label: "Imagen de fondo", type: "image" },
        {
          type: "object",
          name: "buttons",
          label: "Botones",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.text || "Botón" }) },
          fields: [
            { name: "text", label: "Texto", type: "string" },
            { name: "url", label: "URL", type: "string" },
            {
              name: "variant",
              label: "Estilo",
              type: "string",
              options: [
                { value: "primary", label: "Primario" },
                { value: "secondary", label: "Secundario" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "features",
      label: "Sección de features",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
        {
          type: "object",
          name: "items",
          label: "Items",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.title || "Item" }) },
          fields: [
            {
              name: "icon",
              label: "Ícono",
              type: "string",
              // Keep in sync with ICONS in src/components/home/FeaturesReact.tsx.
              options: [
                { value: "bolt", label: "Rayo / velocidad" },
                { value: "shield", label: "Escudo / seguridad" },
                { value: "chart", label: "Gráfico / métricas" },
                { value: "clock", label: "Reloj / 24-7" },
                { value: "users", label: "Personas / equipo" },
                { value: "check", label: "Check" },
                { value: "none", label: "Sin ícono" },
              ],
            },
            { name: "title", label: "Título", type: "string" },
            { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "cta",
      label: "Llamada a la acción",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
        { name: "buttonText", label: "Texto del botón", type: "string" },
        { name: "buttonUrl", label: "URL del botón", type: "string" },
      ],
    },
    {
      type: "object",
      name: "seo",
      label: "SEO de la home",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};

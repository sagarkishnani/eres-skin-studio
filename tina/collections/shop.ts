import type { Collection } from "tinacms";

export const shopCollection: Collection = {
  name: "shop",
  label: "Tienda",
  path: "src/content/shop",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "hero",
      label: "Cabecera",
      fields: [
        { name: "eyebrow", label: "Antetítulo", type: "string" },
        { name: "title", label: "Título", type: "string", required: true },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
        { name: "image", label: "Imagen", type: "image" },
        {
          type: "object",
          name: "badges",
          label: "Sellos de confianza",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.label || "Sello" }) },
          fields: [
            { name: "label", label: "Texto", type: "string" },
            {
              name: "icon",
              label: "Ícono",
              type: "string",
              options: [
                { value: "truck", label: "Envío" },
                { value: "shield", label: "Garantía" },
                { value: "card", label: "Pago seguro" },
                { value: "returns", label: "Devoluciones" },
                { value: "support", label: "Soporte" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "lowStockThreshold",
      label: "Avisar “quedan pocas” desde",
      type: "number",
      description:
        "Unidades en stock a partir de las cuales el producto muestra el aviso de últimas unidades. Es la señal que más mueve la conversión.",
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        { name: "title", label: "Título", type: "string" },
        { name: "description", label: "Descripción", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};

import type { Collection } from "tinacms";
import { seoField, textarea } from "./fields";

export const shopCollection: Collection = {
  name: "shop",
  label: "Tienda",
  path: "src/content/shop",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/productos" },
  fields: [
    {
      type: "object",
      name: "hero",
      label: "Banner",
      fields: [
        { name: "title", label: "Título", description: "Admite saltos de línea.", type: "string", required: true, ui: textarea },
        { name: "description", label: "Descripción", type: "string", ui: textarea },
        { name: "image", label: "Imagen", type: "image" },
        { name: "imageAlt", label: "Texto alternativo", type: "string" },
      ],
    },
    {
      type: "object",
      name: "benefits",
      label: "Beneficios",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.title || "Beneficio" }) },
      fields: [
        { name: "title", label: "Título", type: "string", required: true },
        { name: "text", label: "Texto", type: "string" },
        {
          name: "icon",
          label: "Ícono",
          type: "string",
          options: [
            { value: "check", label: "Check" },
            { value: "drop", label: "Gota" },
            { value: "truck", label: "Envío" },
            { value: "chat", label: "Conversación" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "productPage",
      label: "Ficha de producto",
      fields: [
        { name: "shippingNote", label: "Nota bajo el precio", type: "string", required: true },
        { name: "deliveryText", label: "Envío", type: "string", required: true },
        { name: "pickupTitle", label: "Recojo · título", type: "string", required: true },
        { name: "pickupText", label: "Recojo · detalle", type: "string" },
        { name: "relatedEyebrow", label: "Relacionados · antetítulo", type: "string", required: true },
        { name: "relatedTitle", label: "Relacionados · título", type: "string", required: true },
        {
          name: "askMessage",
          label: "Mensaje de “Hacer una pregunta”",
          type: "string",
          required: true,
          description: "Se envía por WhatsApp. {producto} se reemplaza por el nombre del producto.",
        },
      ],
    },
    {
      name: "newProductDays",
      label: "Días con la etiqueta “Nuevo”",
      type: "number",
      description: "Un producto muestra “Nuevo” durante estos días desde que se publica en Woo. Se recalcula en cada build.",
    },
    {
      name: "lowStockThreshold",
      label: "Avisar “quedan pocas” desde",
      type: "number",
      description:
        "Unidades en stock a partir de las cuales el producto muestra el aviso de últimas unidades. Es la señal que más mueve la conversión.",
    },
    {
      name: "discountBadgeStyle",
      label: "Etiqueta de descuento",
      type: "string",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "diagonal", label: "Diagonal (cinta en la esquina)" },
      ],
    },
    seoField("SEO"),
  ],
};

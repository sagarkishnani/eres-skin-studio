import type { Collection } from "tinacms";
import { eyebrowField, seoField, textarea } from "./fields";

export const systemPagesCollection: Collection = {
  name: "systemPages",
  label: "Páginas de sistema",
  path: "src/content/system-pages",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/gracias" },
  fields: [
    {
      type: "object",
      name: "notFound",
      label: "Página 404",
      description: "Se previsualiza en /404.",
      fields: [
        eyebrowField,
        { name: "title", label: "Título", type: "string", required: true },
        { name: "intro", label: "Bajada", type: "string", ui: textarea },
        { name: "primaryCtaLabel", label: "Texto del botón", type: "string", required: true },
        { name: "primaryCtaUrl", label: "URL del botón", type: "string", required: true },
        { name: "quickLinksTitle", label: "Título de los enlaces rápidos", type: "string" },
        {
          type: "object",
          name: "quickLinks",
          label: "Enlaces rápidos",
          description: "Sin enlaces, el bloque no se muestra.",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.label || "Enlace" }) },
          fields: [
            { name: "label", label: "Texto", type: "string", required: true },
            { name: "url", label: "URL", type: "string", required: true },
          ],
        },
        seoField("SEO"),
      ],
    },
    {
      type: "object",
      name: "thankYou",
      label: "Gracias por tu compra",
      fields: [
        eyebrowField,
        { name: "title", label: "Título", type: "string", required: true },
        { name: "intro", label: "Bajada", type: "string", ui: textarea },
        {
          name: "orderLabel",
          label: "Línea del número de pedido",
          description: "{numero} se reemplaza por el número de pedido. Solo aparece si WooCommerce lo envía.",
          type: "string",
        },
        { name: "emailNote", label: "Aviso de correo", type: "string" },
        { name: "primaryCtaLabel", label: "Texto del botón", type: "string", required: true },
        { name: "primaryCtaUrl", label: "URL del botón", type: "string", required: true },
        {
          name: "whatsappLabel",
          label: "Texto del botón de WhatsApp",
          description: "El número sale de Global → Contacto → Teléfono.",
          type: "string",
        },
        seoField("SEO"),
      ],
    },
    {
      type: "object",
      name: "legalClaims",
      label: "Libro de reclamaciones",
      description: "Se previsualiza en /libro-de-reclamaciones. Los campos del formulario están en Formularios Dinámicos.",
      fields: [
        eyebrowField,
        { name: "title", label: "Título", type: "string", required: true },
        { name: "intro", label: "Bajada", type: "string", ui: textarea },
        {
          type: "object",
          name: "provider",
          label: "Datos del proveedor",
          description: "Se muestran sobre el formulario. Un dato vacío no aparece.",
          fields: [
            { name: "name", label: "Razón social", type: "string" },
            { name: "ruc", label: "RUC", type: "string" },
            { name: "address", label: "Domicilio", type: "string" },
          ],
        },
        seoField("SEO"),
      ],
    },
  ],
};

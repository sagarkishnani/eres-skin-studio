import type { Collection } from "tinacms";
import { enabledField, eyebrowField, paragraphsField, seoField, textarea } from "./fields";

const multilineTitle = {
  name: "title",
  label: "Título",
  description: "Admite saltos de línea.",
  type: "string",
  ui: textarea,
} as const;

export const aboutCollection: Collection = {
  name: "about",
  label: "Nosotras",
  path: "src/content/about",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/nosotras" },
  fields: [
    {
      type: "object",
      name: "header",
      label: "Cabecera",
      fields: [
        enabledField,
        { name: "breadcrumb", label: "Nombre en las migas", type: "string" },
        multilineTitle,
        { name: "text", label: "Texto", type: "string", ui: textarea },
      ],
    },
    {
      type: "object",
      name: "purpose",
      label: "Propósito",
      fields: [
        enabledField,
        { name: "image", label: "Imagen (4:3)", type: "image" },
        { name: "imageAlt", label: "Texto alternativo", type: "string" },
        {
          name: "imagePosition",
          label: "Encuadre",
          description: "Posición del foco de la imagen, p. ej. 74% 30%.",
          type: "string",
        },
        eyebrowField,
        multilineTitle,
        paragraphsField,
        { name: "quote", label: "Cita", type: "string", ui: textarea },
        { name: "quoteAuthor", label: "Autora de la cita", type: "string" },
      ],
    },
    {
      type: "object",
      name: "pillars",
      label: "Nuestra forma",
      description: "El título y los pilares se editan en el documento Home → Nuestra forma.",
      fields: [enabledField],
    },
    {
      type: "object",
      name: "differentiators",
      label: "Lo que nos hace diferentes",
      fields: [
        enabledField,
        eyebrowField,
        multilineTitle,
        { name: "text", label: "Texto", type: "string", ui: textarea },
        {
          type: "object",
          name: "items",
          label: "Tarjetas",
          description: "La segunda tarjeta se muestra en verde.",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.title || "Tarjeta" }) },
          fields: [
            {
              name: "icon",
              label: "Icono",
              type: "string",
              options: [
                { value: "person", label: "Persona" },
                { value: "check", label: "Check" },
                { value: "drop", label: "Gota" },
              ],
            },
            { name: "title", label: "Título", type: "string" },
            { name: "text", label: "Texto", type: "string", ui: textarea },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "community",
      label: "Comunidad",
      fields: [
        enabledField,
        eyebrowField,
        { name: "title", label: "Título", type: "string", ui: textarea },
        { name: "text", label: "Texto", type: "string", ui: textarea },
      ],
    },
    {
      type: "object",
      name: "instagram",
      label: "Instagram",
      description: "Los enlaces usan la URL de Instagram de las redes del footer.",
      fields: [
        enabledField,
        eyebrowField,
        { name: "title", label: "Título", type: "string" },
        { name: "ctaLabel", label: "Texto del enlace", type: "string" },
        { name: "handle", label: "Usuario", description: "p. ej. @eres.skinstudio", type: "string" },
        {
          type: "object",
          name: "images",
          label: "Fotos (4:5)",
          description: "En móvil se muestran las primeras 4.",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.src?.split("/").pop() || "Foto" }) },
          fields: [
            { name: "src", label: "Imagen", type: "image" },
            { name: "position", label: "Encuadre", description: "p. ej. 50% 40%.", type: "string" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "firstVisit",
      label: "Primera visita",
      description: "El botón usa la URL de WhatsApp de las redes del footer.",
      fields: [
        enabledField,
        eyebrowField,
        multilineTitle,
        { name: "text", label: "Texto", type: "string", ui: textarea },
        { name: "ctaLabel", label: "Texto del botón", type: "string" },
      ],
    },
    seoField("SEO de la página"),
  ],
};

import type { Collection } from "tinacms";
import { enabledField, eyebrowField, paragraphsField, seoField, textarea } from "./fields";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const multilineTitle = {
  name: "title",
  label: "Título",
  description: "Admite saltos de línea.",
  type: "string",
  ui: textarea,
} as const;

function findDuplicateSlug(items: { slug?: string }[] = []) {
  const slugs = items.map((item) => item?.slug).filter(Boolean);
  return slugs.find((slug, index) => slugs.indexOf(slug) !== index);
}

export const servicesCollection: Collection = {
  name: "services",
  label: "Servicios",
  path: "src/content/services",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/servicios" },
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
      name: "blocks",
      label: "Servicios",
      description: "Los botones usan la URL de WhatsApp de las redes del footer.",
      fields: [
        enabledField,
        { name: "ctaLabel", label: "Texto del botón", type: "string" },
        {
          type: "object",
          name: "items",
          label: "Servicios",
          description: "Se alternan en crema y verde según su posición.",
          list: true,
          ui: {
            itemProps: (item) => ({ label: item?.name || "Servicio" }),
            validate: (items: { slug?: string }[]) => {
              const duplicate = findDuplicateSlug(items);
              if (duplicate) return `El identificador "${duplicate}" está repetido.`;
            },
          },
          fields: [
            { name: "name", label: "Nombre", type: "string" },
            {
              name: "slug",
              label: "Identificador",
              description:
                "Forma el enlace /servicios#identificador que usan el home y el menú. Si lo cambias, actualiza esos enlaces.",
              type: "string",
              ui: {
                validate: (value?: string) => {
                  if (value && !SLUG_PATTERN.test(value)) return "Solo minúsculas, números y guiones.";
                },
              },
            },
            multilineTitle,
            { name: "image", label: "Imagen (5:4)", type: "image" },
            paragraphsField,
          ],
        },
      ],
    },
    {
      type: "object",
      name: "experience",
      label: "Tu experiencia",
      fields: [
        enabledField,
        eyebrowField,
        { name: "title", label: "Título", type: "string", ui: textarea },
        { name: "text", label: "Texto", type: "string", ui: textarea },
        {
          type: "object",
          name: "steps",
          label: "Pasos",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.title || "Paso" }) },
          fields: [
            { name: "title", label: "Título", type: "string" },
            { name: "text", label: "Texto", type: "string", ui: textarea },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "faq",
      label: "Preguntas frecuentes",
      description: "El enlace usa la URL de WhatsApp de las redes del footer.",
      fields: [
        enabledField,
        eyebrowField,
        { name: "title", label: "Título", type: "string" },
        { name: "helpText", label: "Frase de ayuda", type: "string" },
        { name: "ctaLabel", label: "Texto del enlace", type: "string" },
        {
          type: "object",
          name: "items",
          label: "Preguntas",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.question || "Pregunta" }) },
          fields: [
            { name: "question", label: "Pregunta", type: "string" },
            { name: "answer", label: "Respuesta", type: "string", ui: textarea },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "booking",
      label: "Reserva",
      description: "El texto se edita en el documento Home → Reserva.",
      fields: [enabledField],
    },
    seoField("SEO de la página"),
  ],
};

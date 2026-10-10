import type { Collection } from "tinacms";
import { enabledField, eyebrowField, seoField, textarea } from "./fields";

export const contactCollection: Collection = {
  name: "contact",
  label: "Contacto",
  path: "src/content/contact",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/contacto" },
  fields: [
    {
      type: "object",
      name: "details",
      label: "Datos",
      description: "Teléfono, correo, dirección y horarios se editan en Global → Contacto.",
      fields: [
        enabledField,
        { name: "breadcrumb", label: "Nombre en las migas", type: "string" },
        { name: "title", label: "Título", type: "string" },
        {
          type: "object",
          name: "support",
          label: "Atención al cliente",
          fields: [
            eyebrowField,
            { name: "phoneLabel", label: "Etiqueta del teléfono", type: "string" },
            { name: "emailLabel", label: "Etiqueta del correo", type: "string" },
          ],
        },
        {
          type: "object",
          name: "studio",
          label: "Estudio",
          fields: [
            eyebrowField,
            { name: "copyLabel", label: "Texto del botón de copiar", type: "string" },
            { name: "copiedLabel", label: "Texto al copiar", type: "string" },
          ],
        },
        {
          type: "object",
          name: "hours",
          label: "Horarios",
          fields: [
            eyebrowField,
            { name: "openNowLabel", label: "Texto \"abierto ahora\"", type: "string" },
            { name: "closedNowLabel", label: "Texto \"cerrado ahora\"", type: "string" },
            { name: "todayLabel", label: "Etiqueta del día de hoy", type: "string" },
            { name: "closedLabel", label: "Texto de un día sin turnos", type: "string" },
          ],
        },
        {
          name: "image",
          label: "Foto",
          description: "Vertical 4:5, de al menos 1200×1500px.",
          type: "image",
        },
        { name: "imageAlt", label: "Texto alternativo de la foto", type: "string" },
      ],
    },
    {
      type: "object",
      name: "visit",
      label: "Visítanos",
      fields: [
        enabledField,
        eyebrowField,
        { name: "title", label: "Título", description: "Admite saltos de línea.", type: "string", ui: textarea },
        { name: "text", label: "Texto", type: "string", ui: textarea },
        { name: "ctaLabel", label: "Texto del botón", type: "string" },
        { name: "mapsUrl", label: "Enlace a Google Maps", type: "string" },
        {
          name: "embedUrl",
          label: "URL del mapa embebido",
          description: "Vacío = sin mapa. Solo se carga si el visitante acepta las cookies funcionales.",
          type: "string",
        },
        { name: "mapTitle", label: "Título accesible del mapa", type: "string" },
        { name: "consentText", label: "Texto sin consentimiento de cookies", type: "string", ui: textarea },
        { name: "consentCtaLabel", label: "Botón para abrir las preferencias de cookies", type: "string" },
      ],
    },
    seoField("SEO de la página"),
  ],
};

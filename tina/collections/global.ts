import type { Collection, TinaField } from "tinacms";

const labelOf = (fallback: string) => (item: any) => ({ label: item?.label || item?.title || fallback });

const simpleLinkFields: TinaField[] = [
  { name: "label", label: "Texto", type: "string" },
  { name: "url", label: "URL", type: "string" },
];

const submenuField: TinaField = {
  type: "object",
  name: "menu",
  label: "Submenú (mega-menú en escritorio, panel en el móvil)",
  description: "Déjalo vacío para que el enlace no tenga submenú.",
  fields: [
    {
      type: "object",
      name: "featured",
      label: "Enlaces destacados",
      list: true,
      ui: { itemProps: labelOf("Enlace") },
      fields: simpleLinkFields,
    },
    {
      type: "object",
      name: "columns",
      label: "Columnas",
      list: true,
      ui: { itemProps: labelOf("Columna") },
      fields: [
        { name: "title", label: "Título", type: "string" },
        {
          type: "object",
          name: "links",
          label: "Enlaces",
          list: true,
          ui: { itemProps: labelOf("Enlace") },
          fields: simpleLinkFields,
        },
      ],
    },
    {
      type: "object",
      name: "card",
      label: "Tarjeta destacada",
      fields: [
        { name: "image", label: "Imagen (4:3)", type: "image" },
        { name: "eyebrow", label: "Antetítulo", type: "string" },
        { name: "title", label: "Título", type: "string" },
        { name: "ctaLabel", label: "Texto del enlace", type: "string" },
        { name: "url", label: "URL", type: "string" },
      ],
    },
  ],
};

export const globalCollection: Collection = {
  name: "global",
  label: "Global (nav / footer / SEO)",
  path: "src/content/global",
  format: "json",
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "announcement",
      label: "Barra de anuncio",
      fields: [
        { name: "enabled", label: "Mostrar", type: "boolean" },
        {
          type: "object",
          name: "items",
          label: "Mensajes (rotan cada 4,5 s)",
          list: true,
          ui: { itemProps: labelOf("Mensaje") },
          fields: [
            { name: "label", label: "Texto", type: "string" },
            { name: "url", label: "URL (opcional)", type: "string" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "nav",
      label: "Navegación",
      fields: [
        { name: "logo", label: "Logo", type: "image" },
        { name: "logoAlt", label: "Texto alternativo del logo", type: "string" },
        {
          type: "object",
          name: "links",
          label: "Enlaces",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.label || "Enlace" }) },
          fields: [
            { name: "label", label: "Texto", type: "string" },
            { name: "url", label: "URL", type: "string" },
            { name: "external", label: "Abre en otra pestaña", type: "boolean" },
            submenuField,
          ],
        },
        {
          type: "object",
          name: "cta",
          label: "Botón principal (menú móvil)",
          fields: [
            { name: "label", label: "Texto", type: "string" },
            { name: "url", label: "URL", type: "string" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "contact",
      label: "Contacto (menú móvil y footer)",
      fields: [
        { name: "address", label: "Dirección", type: "string" },
        { name: "phone", label: "Teléfono", type: "string" },
        {
          name: "phoneUrl",
          label: "Enlace del teléfono (opcional)",
          description: "Vacío = tel: con el número sin espacios. Útil para poner un enlace de WhatsApp.",
          type: "string",
        },
        { name: "email", label: "Email", type: "string" },
        {
          type: "object",
          name: "hours",
          label: "Horarios",
          list: true,
          ui: { itemProps: labelOf("Horario") },
          fields: [
            { name: "label", label: "Días", type: "string" },
            { name: "text", label: "Horas (una línea por turno)", type: "string", ui: { component: "textarea" } },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "search",
      label: "Búsqueda",
      fields: [
        { name: "placeholder", label: "Texto del campo", type: "string" },
        {
          type: "object",
          name: "popular",
          label: "Búsquedas populares",
          list: true,
          ui: { itemProps: labelOf("Búsqueda") },
          fields: [{ name: "label", label: "Texto", type: "string" }],
        },
      ],
    },
    {
      type: "object",
      name: "footer",
      label: "Footer",
      fields: [
        { name: "logo", label: "Logo (versión clara)", type: "image" },
        { name: "logoAlt", label: "Texto alternativo del logo", type: "string" },
        { name: "tagline", label: "Frase", type: "string", ui: { component: "textarea" } },
        {
          type: "object",
          name: "columns",
          label: "Columnas",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.title || "Columna" }) },
          fields: [
            { name: "title", label: "Título", type: "string" },
            {
              type: "object",
              name: "links",
              label: "Enlaces",
              list: true,
              ui: { itemProps: (item) => ({ label: item?.label || "Enlace" }) },
              fields: [
                { name: "label", label: "Texto", type: "string" },
                { name: "url", label: "URL", type: "string" },
              ],
            },
          ],
        },
        { name: "contactTitle", label: "Título de la columna de contacto", type: "string" },
        {
          type: "object",
          name: "social",
          label: "Redes sociales",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.network || "Red" }) },
          fields: [
            {
              name: "network",
              label: "Red",
              type: "string",
              options: ["linkedin", "instagram", "facebook", "x", "youtube", "tiktok", "whatsapp"],
            },
            { name: "url", label: "URL", type: "string" },
          ],
        },
        {
          name: "legal",
          label: "Línea legal",
          description: "Sin © ni año: se agregan solos.",
          type: "string",
        },
      ],
    },
    {
      type: "object",
      name: "whatsappButton",
      label: "Botón flotante de WhatsApp",
      description: "Usa la URL de la red \"whatsapp\" del footer.",
      fields: [{ name: "enabled", label: "Mostrar", type: "boolean" }],
    },
    {
      type: "object",
      name: "seo",
      label: "SEO por defecto",
      fields: [
        { name: "title", label: "Título por defecto", type: "string" },
        { name: "description", label: "Descripción por defecto", type: "string", ui: { component: "textarea" } },
        { name: "ogImage", label: "Imagen para compartir (1200×630)", type: "image" },
      ],
    },
    {
      type: "object",
      name: "codeInjection",
      label: "Código inyectado (analytics, píxeles)",
      description: "HTML crudo. Se inserta tal cual; un error aquí puede romper el sitio.",
      fields: [
        { name: "head", label: "Antes de </head>", type: "string", ui: { component: "textarea" } },
        { name: "bodyEnd", label: "Antes de </body>", type: "string", ui: { component: "textarea" } },
      ],
    },
  ],
};

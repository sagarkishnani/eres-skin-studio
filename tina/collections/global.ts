import type { Collection, TinaField } from "tinacms";

const labelOf = (fallback: string) => (item: any) => ({ label: item?.label || item?.title || fallback });

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const WEEKDAY_OPTIONS = [
  { value: "mon", label: "Lunes" },
  { value: "tue", label: "Martes" },
  { value: "wed", label: "Miércoles" },
  { value: "thu", label: "Jueves" },
  { value: "fri", label: "Viernes" },
  { value: "sat", label: "Sábado" },
  { value: "sun", label: "Domingo" },
];

function validateTime(value: unknown) {
  if (value && !TIME_PATTERN.test(String(value))) return "Usa el formato HH:MM de 24h, p. ej. 09:30.";
}

function validateShift(shifts: unknown) {
  if (!Array.isArray(shifts)) return undefined;
  const invalid = shifts.find((shift) => shift?.open && shift?.close && shift.close <= shift.open);
  if (invalid) return `El turno ${invalid.open} — ${invalid.close} cierra antes de abrir.`;
}

function validateHoursRows(rows: unknown) {
  if (!Array.isArray(rows)) return undefined;
  const days = rows.flatMap((row) => row?.days || []);
  const repeated = days.find((day, index) => days.indexOf(day) !== index);
  if (repeated) {
    const label = WEEKDAY_OPTIONS.find((option) => option.value === repeated)?.label || repeated;
    return `${label} aparece en más de una fila.`;
  }
}

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
          description: "Una fila por grupo de días. Se usan en el footer y en /contacto (\"Abierto ahora\", en hora de Lima).",
          ui: { itemProps: labelOf("Horario"), validate: validateHoursRows },
          fields: [
            { name: "label", label: "Días (texto visible)", type: "string" },
            {
              name: "days",
              label: "Días que cubre",
              type: "string",
              list: true,
              options: WEEKDAY_OPTIONS,
              ui: { component: "checkbox-group" },
            },
            {
              type: "object",
              name: "shifts",
              label: "Turnos",
              description: "Vacío = cerrado. Formato 24h, p. ej. 09:30 a 14:00.",
              list: true,
              ui: {
                itemProps: (item: any) => ({ label: item?.open && item?.close ? `${item.open} — ${item.close}` : "Turno" }),
                validate: validateShift,
              },
              fields: [
                { name: "open", label: "Abre (HH:MM)", type: "string", ui: { validate: validateTime } },
                { name: "close", label: "Cierra (HH:MM)", type: "string", ui: { validate: validateTime } },
              ],
            },
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
      name: "motion",
      label: "Movimiento",
      fields: [
        { name: "smoothScroll", label: "Scroll suave (Lenis)", type: "boolean" },
        {
          name: "revealAnimations",
          label: "Animaciones de entrada al hacer scroll",
          type: "boolean",
        },
      ],
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

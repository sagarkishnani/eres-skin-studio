import type { TinaField } from "tinacms";

export const enabledField: TinaField = { name: "enabled", label: "Mostrar sección", type: "boolean" };
export const eyebrowField: TinaField = { name: "eyebrow", label: "Antetítulo", type: "string" };
export const textarea = { component: "textarea" } as const;

export function linkField(name: string, label: string): TinaField {
  return {
    type: "object",
    name,
    label,
    fields: [
      { name: "label", label: "Texto", type: "string" },
      { name: "url", label: "URL", type: "string" },
    ],
  };
}

export const paragraphsField: TinaField = {
  type: "object",
  name: "paragraphs",
  label: "Párrafos",
  list: true,
  ui: { itemProps: (item) => ({ label: item?.text?.slice(0, 48) || "Párrafo" }) },
  fields: [{ name: "text", label: "Texto", type: "string", ui: textarea }],
};

export function seoField(label: string): TinaField {
  return {
    type: "object",
    name: "seo",
    label,
    fields: [
      { name: "title", label: "Título", type: "string" },
      { name: "description", label: "Descripción", type: "string", ui: textarea },
    ],
  };
}

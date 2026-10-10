import type { Collection } from "tinacms";
import { eyebrowField, textarea } from "./fields";

export const promoPopupCollection: Collection = {
  name: "promoPopup",
  label: "Popup promocional",
  path: "src/content/promo-popup",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/" },
  fields: [
    {
      name: "enabled",
      label: "Mostrar popup",
      description: "Interruptor general. Apagado, el popup no se carga en ninguna página.",
      type: "boolean",
    },
    {
      name: "triggers",
      label: "Cuándo aparece",
      description: "Aparece con lo que ocurra primero. Si los tres están apagados, no aparece nunca.",
      type: "object",
      fields: [
        {
          name: "delaySeconds",
          label: "Segundos en la página",
          description: "0 = apagado.",
          type: "number",
        },
        {
          name: "scrollPercent",
          label: "% de scroll",
          description: "Entre 1 y 100. 0 = apagado.",
          type: "number",
        },
        {
          name: "exitIntent",
          label: "Intención de salida",
          description: "Al sacar el mouse por el borde superior de la ventana. Solo en computadoras.",
          type: "boolean",
        },
      ],
    },
    {
      name: "frequency",
      label: "Cada cuánto aparece",
      description: "Se cuenta por campaña y por navegador.",
      type: "object",
      fields: [
        {
          name: "daysAfterDismiss",
          label: "Días de espera tras cerrarlo",
          description: "0 = puede volver en la siguiente página.",
          type: "number",
        },
        {
          name: "daysAfterConvert",
          label: "Días de espera tras copiar el cupón o usar el botón",
          description: "0 = puede volver en la siguiente página.",
          type: "number",
        },
      ],
    },
    {
      name: "excludedPaths",
      label: "Rutas donde no aparece",
      description: "Por prefijo: /contacto excluye también /contacto/…",
      type: "string",
      list: true,
    },
    { name: "dismissLabel", label: "Texto 'No, gracias'", type: "string" },
    { name: "showSocials", label: "Mostrar redes sociales", description: "Son las del footer.", type: "boolean" },
    {
      name: "campaigns",
      label: "Campañas",
      description: "Se muestra la primera habilitada y vigente de la lista.",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `${item?.title || "Campaña"}${item?.enabled ? "" : " (inactiva)"}`,
        }),
      },
      fields: [
        {
          name: "id",
          label: "Identificador",
          description:
            "Slug estable (p. ej. primera-compra-10). Cambiarlo hace que la campaña vuelva a aparecer para quien ya la cerró.",
          type: "string",
          required: true,
        },
        { name: "enabled", label: "Habilitada", type: "boolean" },
        {
          name: "startsAt",
          label: "Desde",
          description: "Vacío = desde ya.",
          type: "datetime",
          ui: { timeFormat: "HH:mm" },
        },
        {
          name: "endsAt",
          label: "Hasta",
          description: "Vacío = sin fecha de fin.",
          type: "datetime",
          ui: { timeFormat: "HH:mm" },
        },
        { name: "image", label: "Imagen", type: "image" },
        { name: "imageAlt", label: "Texto alternativo de la imagen", type: "string" },
        eyebrowField,
        { name: "title", label: "Título", type: "string", required: true },
        { name: "body", label: "Bajada", type: "string", ui: textarea },
        {
          name: "couponCode",
          label: "Código de cupón",
          description: "Créalo antes en WooCommerce: el sitio no lo valida. Vacío = sin bloque de cupón.",
          type: "string",
        },
        { name: "copyLabel", label: "Texto del botón copiar", type: "string" },
        { name: "copiedLabel", label: "Texto tras copiar", type: "string" },
        { name: "ctaLabel", label: "Texto del botón", description: "Aparece solo con texto y URL.", type: "string" },
        { name: "ctaUrl", label: "URL del botón", type: "string" },
        { name: "finePrint", label: "Letra chica", type: "string" },
      ],
    },
  ],
};

const SHORT_MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const limaDateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Lima",
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

// Intl escribe "set." en es-PE y "sept" en es: el diseño pide la abreviatura de tres letras.
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = Object.fromEntries(limaDateParts.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.day} ${SHORT_MONTHS[Number(parts.month) - 1]} ${parts.year}`;
}

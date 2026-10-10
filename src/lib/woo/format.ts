// Puede viajar al navegador: no toca credenciales.

import type { WooProduct, StockStatus } from "./types";

const CURRENCY = "PEN";
const LOCALE = "es-PE";

export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
  }).format(n);
}

export function discountPercent(p: Pick<WooProduct, "regular_price" | "sale_price" | "on_sale">): number | null {
  if (!p.on_sale) return null;
  const regular = parseFloat(p.regular_price);
  const sale = parseFloat(p.sale_price);
  if (!regular || Number.isNaN(sale) || sale >= regular) return null;
  return Math.round(((regular - sale) / regular) * 100);
}

export interface StockLabel {
  text: string;
  tone: "ok" | "low" | "out";
}

export const DEFAULT_LOW_STOCK_THRESHOLD = 1;
export const LOW_STOCK_TEXT = "Quedan pocas unidades";

type StockLevel = { stock_status: StockStatus; stock_quantity: number | null };

export function isSoldOut(s: StockLevel): boolean {
  if (s.stock_status === "outofstock") return true;
  return s.stock_status === "instock" && typeof s.stock_quantity === "number" && s.stock_quantity <= 0;
}

export function isLowStock(s: StockLevel, lowThreshold = DEFAULT_LOW_STOCK_THRESHOLD): boolean {
  return s.stock_status === "instock" && typeof s.stock_quantity === "number" && s.stock_quantity > 0 && s.stock_quantity <= lowThreshold;
}

export function stockLabel(s: StockLevel, lowThreshold = DEFAULT_LOW_STOCK_THRESHOLD): StockLabel {
  if (isSoldOut(s)) return { text: "Agotado", tone: "out" };
  if (s.stock_status === "onbackorder") return { text: "Bajo pedido", tone: "low" };
  if (isLowStock(s, lowThreshold)) return { text: LOW_STOCK_TEXT, tone: "low" };
  return { text: "Disponible", tone: "ok" };
}

export function isBuyable(p: StockLevel & { purchasable: boolean }): boolean {
  return p.purchasable && !isSoldOut(p);
}

export function stripHtml(html: string, max = 160): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

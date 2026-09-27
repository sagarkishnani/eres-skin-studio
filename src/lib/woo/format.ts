// Puede viajar al navegador: no toca credenciales.

import type { WooProduct, WooStock, StockStatus } from "./types";

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

export function stockLabel(
  s: Pick<WooStock, "stock_status" | "stock_quantity">,
  lowThreshold = 5
): StockLabel {
  if (s.stock_status === "outofstock") return { text: "Agotado", tone: "out" };
  if (s.stock_status === "onbackorder") return { text: "Bajo pedido", tone: "low" };
  if (typeof s.stock_quantity === "number" && s.stock_quantity <= lowThreshold) {
    return { text: `Quedan ${s.stock_quantity}`, tone: "low" };
  }
  return { text: "Disponible", tone: "ok" };
}

export function isBuyable(p: { purchasable: boolean; stock_status: StockStatus }): boolean {
  return p.purchasable && p.stock_status !== "outofstock";
}

export function stripHtml(html: string, max = 160): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

import type { WooCartItem } from "../lib/woo/types";
import { hasAnalyticsConsent } from "./cookieConsent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const CURRENCY = "PEN";

export interface TrackedProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// El plugin Facebook for WooCommerce identifica los productos por su ID de Woo en el catálogo y en el checkout.
function metaContentId(id: number): string {
  return String(id);
}

function sendToMeta(event: string, product: TrackedProduct) {
  window.fbq?.("track", event, {
    content_ids: [metaContentId(product.id)],
    content_name: product.name,
    content_type: "product",
    contents: [{ id: metaContentId(product.id), quantity: product.quantity }],
    value: product.price * product.quantity,
    currency: CURRENCY,
  });
}

function sendToGoogle(event: string, product: TrackedProduct) {
  window.gtag?.("event", event, {
    currency: CURRENCY,
    value: product.price * product.quantity,
    items: [{ item_id: String(product.id), item_name: product.name, price: product.price, quantity: product.quantity }],
  });
}

function canTrack(product: TrackedProduct): boolean {
  return Number.isFinite(product.price) && hasAnalyticsConsent();
}

export function trackViewItem(product: TrackedProduct) {
  if (!canTrack(product)) return;
  sendToMeta("ViewContent", product);
  sendToGoogle("view_item", product);
}

export function trackAddToCart(product: TrackedProduct) {
  if (!canTrack(product)) return;
  sendToMeta("AddToCart", product);
  sendToGoogle("add_to_cart", product);
}

export function cartItemUnitPrice(item: WooCartItem): number {
  if (!item.prices) return Number.NaN;
  return Number(item.prices.price) / 10 ** item.prices.currency_minor_unit;
}

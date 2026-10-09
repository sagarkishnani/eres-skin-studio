// Sin credenciales: solo habla con public/woo-api.php. Un recurso nuevo se agrega primero a $ROUTES del proxy.

import type { WooProduct, WooStock, WooCategory } from "../lib/woo/types";
import type { WooCart } from "../lib/woo/types";

function endpoint(): string {
  const external = import.meta.env.PUBLIC_WOO_API_URL;
  if (external) return external;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}woo-api.php`.replace(/([^:])\/\//g, "$1/");
}

interface ApiOk<T> { ok: true; data: T }
interface ApiErr { ok: false; error: string }

async function call<T>(
  resource: string,
  params: Record<string, string | number> = {},
  init?: RequestInit
): Promise<T | null> {
  const qs = new URLSearchParams({ resource, ...Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ) });

  const generation = cartGeneration;
  try {
    const res = await fetch(`${endpoint()}?${qs}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.headers || {}) },
    });
    const body = (await res.json()) as ApiOk<T> | ApiErr;
    if (!body.ok) {
      console.warn(`[woo] ${resource}: ${body.error}`);
      return null;
    }
    // Una respuesta pedida antes de forgetCart() traería el carrito ya comprado y volvería a guardar su token.
    if (generation !== cartGeneration) return null;
    rememberCartToken(res);
    return body.data;
  } catch (err) {
    console.warn(`[woo] ${resource} no respondió`, err);
    return null;
  }
}

export async function fetchStock(ids: number[]): Promise<Map<number, WooStock>> {
  const out = new Map<number, WooStock>();
  if (!ids.length) return out;
  const rows = await call<WooStock[]>("stock", { include: ids.join(",") });
  for (const r of rows ?? []) out.set(r.id, r);
  return out;
}

export async function searchProducts(term: string, perPage = 12): Promise<WooProduct[]> {
  if (term.trim().length < 2) return [];
  return (await call<WooProduct[]>("products", { search: term, per_page: perPage })) ?? [];
}

export async function fetchProducts(
  params: { category?: string; page?: number; per_page?: number; orderby?: string; order?: "asc" | "desc" } = {}
): Promise<WooProduct[]> {
  return (await call<WooProduct[]>("products", params as Record<string, string | number>)) ?? [];
}

export async function fetchCategories(): Promise<WooCategory[]> {
  return (await call<WooCategory[]>("categories")) ?? [];
}

// Cart-Token solo apunta a un carrito anónimo, no autentica a nadie: puede vivir en localStorage.
const TOKEN_KEY = "eres-skin-studio:cart-token";
let cartGeneration = 0;

function cartToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function rememberCartToken(res: Response) {
  const token = res.headers.get("Cart-Token");
  if (!token) return;
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

function cartHeaders(): Record<string, string> {
  const token = cartToken();
  return token ? { "Cart-Token": token } : {};
}

export const CART_UPDATED = "eres-skin-studio:cart-updated";
export const CART_OPEN_REQUEST = "eres-skin-studio:cart-open";
export const CART_OPEN_QUERY_PARAM = "carrito";
export const CART_OPEN_QUERY_VALUE = "abierto";

export function requestCartOpen(): void {
  window.dispatchEvent(new Event(CART_OPEN_REQUEST));
}

export function consumeCartOpenQuery(): boolean {
  const url = new URL(window.location.href);
  if (url.searchParams.get(CART_OPEN_QUERY_PARAM) !== CART_OPEN_QUERY_VALUE) return false;

  url.searchParams.delete(CART_OPEN_QUERY_PARAM);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

function announce(cart: WooCart | null) {
  if (cart) window.dispatchEvent(new CustomEvent(CART_UPDATED, { detail: cart }));
  return cart;
}

export function forgetCart(): void {
  cartGeneration += 1;
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
  window.dispatchEvent(new CustomEvent(CART_UPDATED, { detail: null }));
}

export async function getCart(): Promise<WooCart | null> {
  return announce(await call<WooCart>("cart", {}, { headers: cartHeaders() }));
}

export async function addToCart(id: number, quantity = 1): Promise<WooCart | null> {
  return announce(
    await call<WooCart>("cart-add", {}, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...cartHeaders() },
      body: JSON.stringify({ id, quantity }),
    })
  );
}

export async function updateCartItem(key: string, quantity: number): Promise<WooCart | null> {
  return announce(
    await call<WooCart>("cart-update", {}, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...cartHeaders() },
      body: JSON.stringify({ key, quantity }),
    })
  );
}

export async function removeCartItem(key: string): Promise<WooCart | null> {
  return announce(
    await call<WooCart>("cart-remove", {}, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...cartHeaders() },
      body: JSON.stringify({ key }),
    })
  );
}

// El carrito vive en la sesión de la Store API, no en la cookie de WordPress: wordpress/mu-plugins/eres-cart-handoff.php lo traspasa con ?cart-token.
export function checkoutUrl(): string | null {
  const checkout = import.meta.env.PUBLIC_WOO_CHECKOUT_URL;
  if (!checkout) return null;
  const token = cartToken();
  if (!token) return checkout;
  const url = new URL(checkout);
  url.searchParams.set("cart-token", token);
  return url.toString();
}

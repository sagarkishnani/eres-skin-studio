import { DEFAULT_LOCALE, type Locale } from "../i18n/config";

const BASE = import.meta.env.BASE_URL || "/";

function normBase(): string {
  let b = BASE;
  if (!b.startsWith("/")) b = "/" + b;
  if (!b.endsWith("/")) b = b + "/";
  return b;
}

export function stripBase(pathname: string): string {
  const b = normBase();
  let p = pathname.startsWith(b) ? pathname.slice(b.length) : pathname.replace(/^\//, "");
  return p.replace(/^\/+|\/+$/g, "");
}

export function getLocale(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const rel = stripBase(pathname);
  // Cast: in single-locale projects the second locale is not part of the Locale union.
  return rel === "en" || rel.startsWith("en/")
    ? ("en" as Locale)
    : DEFAULT_LOCALE;
}

export function localizedPath(pathname: string, locale: Locale): string {
  const b = normBase();
  const hadTrailing = pathname.endsWith("/");
  let rel = stripBase(pathname);

  if (rel === "en") rel = "";
  else if (rel.startsWith("en/")) rel = rel.slice("en/".length);

  const localized =
    locale === DEFAULT_LOCALE ? rel : rel ? `${locale}/${rel}` : locale;
  let out = `${b}${localized}`.replace(/\/{2,}/g, "/");
  if (hadTrailing && !out.endsWith("/")) out += "/";
  return out;
}

export function localizeHref(
  url: string | null | undefined,
  locale: Locale,
  external?: boolean | null
): string {
  const u = url || "";
  if (!u || locale === DEFAULT_LOCALE || external) return u;
  if (/^([a-z]+:)?\/\//i.test(u) || /^(#|mailto:|tel:)/i.test(u)) return u;
  if (!u.startsWith("/")) return u;
  return localizedPath(u, locale);
}

export function tField(
  obj: Record<string, any> | null | undefined,
  key: string,
  locale: Locale
): string {
  if (!obj) return "";
  if (locale !== DEFAULT_LOCALE) {
    const translated = obj[`${key}_${locale}`];
    if (translated != null && translated !== "") return translated;
  }
  return obj[key] ?? "";
}

// Tina returns a truthy but empty rich-text object for absent translations, so truthiness is not enough.
export function richHasContent(node: any): boolean {
  const walk = (n: any): string => {
    if (!n) return "";
    if (typeof n.text === "string") return n.text;
    if (Array.isArray(n?.children)) return n.children.map(walk).join("");
    if (Array.isArray(n)) return n.map(walk).join("");
    return "";
  };
  return walk(node?.children ?? node).trim().length > 0;
}

export function richField(obj: any, key: string, locale: Locale): any {
  if (!obj) return null;
  if (locale !== DEFAULT_LOCALE && richHasContent(obj[`${key}_${locale}`])) {
    return obj[`${key}_${locale}`];
  }
  return obj[key];
}

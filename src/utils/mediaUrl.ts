// On the client useTina() returns Tina CDN URLs for git media; always serve the local public/ copy.
export function mediaUrl(value?: string | null): string {
  if (!value) return "";
  const base = import.meta.env.BASE_URL || "/";

  // Tina glues its CDN prefix even onto absolute URLs: https://assets.tina.io/<id>https://...
  const idx = Math.max(value.lastIndexOf("https://"), value.lastIndexOf("http://"));
  if (idx > 0) {
    value = value.slice(idx);
  }

  // Unanchored because Tina may glue its prefix without a slash; the trailing `/` skips hosts like images.unsplash.com.
  const match = value.match(/((?:images|videos|models|uploads)\/[^?#\s]+)/);
  if (match) {
    return `${base}${match[1]}`.replace(/([^:])\/\//g, "$1/");
  }

  return value;
}

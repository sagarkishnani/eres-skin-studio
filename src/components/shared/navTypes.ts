export interface SimpleLink {
  label?: string | null;
  url?: string | null;
}

export interface SubmenuColumn {
  title?: string | null;
  links?: (SimpleLink | null)[] | null;
}

export interface SubmenuCard {
  image?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  ctaLabel?: string | null;
  url?: string | null;
}

export interface Submenu {
  featured?: (SimpleLink | null)[] | null;
  columns?: (SubmenuColumn | null)[] | null;
  card?: SubmenuCard | null;
}

export interface NavLink extends SimpleLink {
  external?: boolean | null;
  menu?: Submenu | null;
}

export function presentLinks<T extends SimpleLink>(links?: (T | null)[] | null): T[] {
  return (links || []).filter((link): link is T => Boolean(link?.label));
}

export function hasSubmenu(link: NavLink): boolean {
  return presentLinks(link.menu?.featured).length > 0 || (link.menu?.columns || []).some(Boolean);
}

function normalizePath(path: string): string {
  return path.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
}

export function activeLinkIndex(links: NavLink[], currentPath: string): number {
  const current = normalizePath(currentPath);
  let bestIndex = -1;
  let bestLength = -1;
  links.forEach((link, index) => {
    if (link.external || !link.url?.startsWith("/")) return;
    const target = normalizePath(link.url);
    const matches = target === "/" ? current === "/" : current === target || current.startsWith(`${target}/`);
    if (matches && target.length >= bestLength) {
      bestIndex = index;
      bestLength = target.length;
    }
  });
  return bestIndex;
}

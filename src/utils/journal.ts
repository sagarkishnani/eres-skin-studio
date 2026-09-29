import client from "../../tina/__generated__/client";

export const JOURNAL_PATH = "/skin-journal";

export interface JournalPostNode {
  _sys: { filename: string };
  title?: string | null;
  excerpt?: string | null;
  coverImage?: string | null;
  date?: string | null;
  readTime?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: (string | null)[] | null;
  featured?: boolean | null;
  body?: unknown;
}

export interface AdjacentPosts {
  previous: JournalPostNode;
  next: JournalPostNode;
}

export function toFilterSlug(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function journalPostHref(post: JournalPostNode): string {
  return `${JOURNAL_PATH}/${post._sys.filename}`;
}

export function journalFilterHref(key: "categoria" | "etiqueta", label: string): string {
  return `${JOURNAL_PATH}?${key}=${toFilterSlug(label)}`;
}

export function postTags(post: JournalPostNode): string[] {
  return (post.tags || []).filter((tag): tag is string => Boolean(tag?.trim()));
}

function timestamp(post: JournalPostNode): number {
  return new Date(post.date || 0).getTime() || 0;
}

export async function getSortedPosts(): Promise<JournalPostNode[]> {
  const result = await client.queries.postConnection({ first: -1 });
  return (result.data?.postConnection?.edges || [])
    .map((edge) => edge?.node as JournalPostNode | undefined)
    .filter((post): post is JournalPostNode => Boolean(post))
    .sort((a, b) => timestamp(b) - timestamp(a));
}

export function pickFeatured(posts: JournalPostNode[]): JournalPostNode | undefined {
  return posts.find((post) => post.featured) ?? posts[0];
}

export function getAdjacentPosts(posts: JournalPostNode[], current: JournalPostNode): AdjacentPosts | null {
  const index = posts.findIndex((post) => post._sys.filename === current._sys.filename);
  if (index === -1 || posts.length < 2) return null;
  return {
    previous: posts[(index - 1 + posts.length) % posts.length],
    next: posts[(index + 1) % posts.length],
  };
}

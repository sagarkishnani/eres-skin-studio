import { useEffect, useRef, useState } from "react";
import { PiXLight } from "react-icons/pi";
import JournalCard, { type JournalCardData } from "./JournalCard";
import { hoverUnderline } from "./underline";

interface FilterOption {
  label: string;
  slug: string;
}

interface Props {
  posts: JournalCardData[];
  featuredSlug: string;
  categories: FilterOption[];
  tagLabels: Record<string, string>;
  emptyText: string;
}

interface JournalFilter {
  category: string | null;
  tag: string | null;
}

const ALL_FILTER: JournalFilter = { category: null, tag: null };
const FADE_OUT_MS = 280;
const REVEAL_STEP_MS = 90;
const COLUMNS = 3;

function readFilterFromUrl(categorySlugs: string[], tagLabels: Record<string, string>): JournalFilter {
  const params = new URLSearchParams(window.location.search);
  const tag = params.get("etiqueta");
  if (tag && tagLabels[tag]) return { category: null, tag };
  const category = params.get("categoria");
  if (category && categorySlugs.includes(category)) return { category, tag: null };
  return ALL_FILTER;
}

function writeFilterToUrl(filter: JournalFilter) {
  const url = new URL(window.location.href);
  url.searchParams.delete("categoria");
  url.searchParams.delete("etiqueta");
  if (filter.category) url.searchParams.set("categoria", filter.category);
  if (filter.tag) url.searchParams.set("etiqueta", filter.tag);
  history.replaceState(history.state, "", url);
}

function sameFilter(a: JournalFilter, b: JournalFilter): boolean {
  return a.category === b.category && a.tag === b.tag;
}

function visiblePosts(posts: JournalCardData[], filter: JournalFilter, featuredSlug: string): JournalCardData[] {
  if (filter.tag) return posts.filter((post) => post.tagSlugs.includes(filter.tag!));
  if (filter.category) return posts.filter((post) => post.categorySlug === filter.category);
  return posts.filter((post) => post.slug !== featuredSlug);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function JournalListReact({ posts, featuredSlug, categories, tagLabels, emptyText }: Props) {
  const [filter, setFilter] = useState<JournalFilter>(ALL_FILTER);
  const [fading, setFading] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const applyFilter = (next: JournalFilter) => {
    writeFilterToUrl(next);
    clearTimeout(fadeTimer.current);
    setHasFiltered(true);
    if (prefersReducedMotion()) {
      setFilter(next);
      return;
    }
    setFading(true);
    fadeTimer.current = setTimeout(() => {
      setFilter(next);
      setFading(false);
    }, FADE_OUT_MS);
  };

  useEffect(() => {
    const initial = readFilterFromUrl(
      categories.map((category) => category.slug),
      tagLabels,
    );
    if (!sameFilter(initial, ALL_FILTER)) applyFilter(initial);
    return () => clearTimeout(fadeTimer.current);
  }, []);

  const pickCategory = (category: string | null) => {
    const next = { category, tag: null };
    if (!sameFilter(next, filter)) applyFilter(next);
  };

  const visible = visiblePosts(posts, filter, featuredSlug);
  const activeTagLabel = filter.tag ? tagLabels[filter.tag] : null;
  const tabs: FilterOption[] = [{ label: "Todos", slug: "" }, ...categories];

  return (
    <div>
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="flex gap-7 overflow-x-auto border-b border-stone-150 [scrollbar-width:none] md:justify-center md:gap-12 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const active = (filter.category ?? "") === tab.slug;
          return (
            <button
              key={tab.slug || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => pickCategory(tab.slug || null)}
              className={`group h-[52px] shrink-0 whitespace-nowrap text-body-md transition-colors duration-300 ${
                active ? "text-content" : "text-content-subtle hover:text-content"
              }`}
            >
              <span className={`pb-1.5 ${active ? "bg-[length:100%_1px] bg-left-bottom bg-no-repeat [background-image:linear-gradient(currentColor,currentColor)]" : hoverUnderline}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeTagLabel && (
        <div className="mt-6 flex items-center justify-center gap-1 text-body-sm text-content-muted">
          <span>
            Etiqueta: <span className="text-content">{activeTagLabel}</span>
          </span>
          <button
            type="button"
            aria-label="Quitar etiqueta"
            onClick={() => applyFilter(ALL_FILTER)}
            className="inline-flex h-11 w-11 items-center justify-center text-content"
          >
            <PiXLight size={16} aria-hidden />
          </button>
        </div>
      )}

      <div
        className={`[transition:opacity_350ms_ease,transform_500ms_cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${
          fading ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {visible.length > 0 ? (
          <div className="mt-[clamp(32px,4vw,56px)] grid gap-11 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-3">
            {visible.map((post, index) => (
              <JournalCard
                key={post.slug}
                post={post}
                revealDelay={(index % COLUMNS) * REVEAL_STEP_MS}
                shown={hasFiltered}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-body-md text-content-muted">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

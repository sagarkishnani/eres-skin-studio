import { useEffect, useMemo, useRef, useState } from "react";
import { PiMagnifyingGlassLight, PiXLight } from "react-icons/pi";
import type { Locale } from "../../i18n/config";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface Entry {
  type: "blog" | "product";
  locale: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  meta?: string;
  price?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  placeholder?: string | null;
  popular: string[];
}

const SUGGESTED_COUNT = 4;
const MAX_RESULTS = 8;
const FOCUS_DELAY_MS = 300;

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function resultsLabel(query: string, count: number): string {
  if (!query) return "Productos sugeridos";
  return count ? `Resultados (${count})` : "Sin resultados — prueba con otra palabra";
}

export default function SearchOverlay({ open, onClose, locale, placeholder, popular }: Props) {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open || entries) return;
    const base = import.meta.env.BASE_URL || "/";
    fetch(`${base}search-index.json`.replace(/\/\//g, "/"))
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [open, entries]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open]);

  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    const localeEntries = (entries || []).filter((entry) => entry.locale === locale);
    if (!trimmedQuery) return localeEntries.filter((entry) => entry.type === "product").slice(0, SUGGESTED_COUNT);
    const needle = normalize(trimmedQuery);
    return localeEntries
      .filter((entry) => normalize(`${entry.title} ${entry.meta || ""} ${entry.description}`).includes(needle))
      .slice(0, MAX_RESULTS);
  }, [trimmedQuery, entries, locale]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar"
      inert={!open}
      data-lenis-prevent
      className={`fixed inset-x-0 top-0 z-[70] max-h-[100dvh] overflow-y-auto bg-surface-raised shadow-xl transition-transform duration-700 ease-out-expo ${
        open ? "translate-y-0" : "-translate-y-[105%]"
      }`}
    >
      <div className="mx-auto max-w-container px-gutter pb-[clamp(28px,4vw,48px)] pt-[clamp(16px,3vw,32px)]">
        <div className="flex items-center gap-3.5 border-b border-content pb-3">
          <PiMagnifyingGlassLight size={22} aria-hidden className="shrink-0 text-content" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder || "Buscar"}
            aria-label={placeholder || "Buscar"}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-[clamp(18px,2.2vw,28px)] tracking-[-.015em] text-content outline-none placeholder:text-content-subtle [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            className="grid h-11 w-11 shrink-0 place-items-center text-content"
          >
            <PiXLight size={22} aria-hidden />
          </button>
        </div>

        {popular.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-caption-xs uppercase tracking-[.16em] text-content-subtle">Populares</span>
            {popular.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setQuery(label);
                  inputRef.current?.focus();
                }}
                className="h-9 border border-line-strong bg-surface-raised px-3.5 text-caption-md text-content transition-colors duration-300 hover:border-content hover:bg-surface"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <p className="mb-3.5 mt-7 text-caption-xs uppercase tracking-[.16em] text-content-subtle" aria-live="polite">
          {entries ? resultsLabel(trimmedQuery, results.length) : "Cargando…"}
        </p>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {results.map((entry) => (
            <li key={entry.url}>
              <a href={entry.url} onClick={onClose} className="group flex items-center gap-3">
                {entry.image ? (
                  <img src={entry.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 bg-stone-100 object-cover" />
                ) : (
                  <span aria-hidden className="h-16 w-16 shrink-0 bg-stone-100" />
                )}
                <span className="flex min-w-0 flex-col gap-1">
                  {entry.meta && (
                    <span className="text-[10.5px] uppercase tracking-[.1em] text-content-subtle">{entry.meta}</span>
                  )}
                  <span className="text-body-xs font-medium leading-[1.3] text-content group-hover:underline">{entry.title}</span>
                  {entry.price && <span className="text-caption-md font-semibold text-content">{entry.price}</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

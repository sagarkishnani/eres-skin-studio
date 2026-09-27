import { useEffect, useMemo, useRef, useState } from "react";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import type { Locale } from "../../i18n/config";

interface Entry {
  type: string;
  locale: string;
  title: string;
  description: string;
  url: string;
}

export default function SearchOverlay({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || entries) return;
    const base = import.meta.env.BASE_URL || "/";
    fetch(`${base}search-index.json`.replace(/\/\//g, "/"))
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [open, entries]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !entries) return [];
    return entries
      .filter((e) => e.locale === locale)
      .filter((e) => `${e.title} ${e.description}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, entries, locale]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className="p-2 text-content-muted transition-colors hover:text-content"
      >
        <FaMagnifyingGlass size={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto mt-[12vh] max-w-xl overflow-hidden rounded-xl border border-line bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <FaMagnifyingGlass size={15} className="text-content-subtle" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="w-full bg-transparent py-4 text-body-md text-content outline-none placeholder:text-content-subtle"
              />
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
                <FaXmark size={17} className="text-content-subtle hover:text-content" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {query && results.length === 0 && (
                <p className="px-4 py-6 text-body-sm text-content-subtle">Sin resultados</p>
              )}
              {results.map((entry) => (
                <a
                  key={entry.url}
                  href={entry.url}
                  className="block border-b border-line px-4 py-3 hover:bg-surface-raised"
                >
                  <p className="text-body-md text-content">{entry.title}</p>
                  {entry.description && (
                    <p className="mt-1 line-clamp-2 text-body-sm text-content-subtle">
                      {entry.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

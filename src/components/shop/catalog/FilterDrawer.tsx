import { useEffect, useRef, type ReactNode } from "react";
import { PiXLight } from "react-icons/pi";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { lockScroll, unlockScroll } from "../../../utils/scrollLock";
import { SORT_OPTIONS, type SortKey } from "../../../utils/catalog/types";
import HeaderOverlay from "../../shared/HeaderOverlay";

interface Props {
  open: boolean;
  onClose: () => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  onClear: () => void;
  applyLabel: string;
  children: ReactNode;
}

const DESKTOP_QUERY = "(min-width: 1024px)";

export default function FilterDrawer({ open, onClose, sort, onSortChange, onClear, applyLabel, children }: Props) {
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(drawerRef, open);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    closeButtonRef.current?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeOnDesktop = (event: MediaQueryListEvent) => event.matches && onClose();
    window.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
      unlockScroll();
    };
  }, [open, onClose]);

  return (
    <>
      <div className="lg:hidden">
        <HeaderOverlay panelOpen={open} megaMenuOpen={false} onClose={onClose} />
      </div>
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[min(100vw,440px)] flex-col bg-surface transition-transform duration-700 ease-out-expo lg:hidden ${
          open ? "translate-x-0" : "translate-x-[102%]"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone-150 pl-5 pr-2">
          <span className="text-[22px] tracking-[-.02em] text-content">Filtros</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="grid h-11 w-11 place-items-center text-content"
          >
            <PiXLight size={22} aria-hidden />
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2">
          <div className="flex flex-col gap-3.5 border-b border-line pb-[22px] pt-4">
            <span className="text-body-md font-medium text-content">Ordenar por</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Ordenar por">
              {SORT_OPTIONS.map((option) => {
                const selected = option.key === sort;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => !selected && onSortChange(option.key)}
                    className={`h-[38px] border px-3.5 text-caption-md transition-colors duration-300 ${
                      selected ? "border-ink bg-ink text-content-inverse" : "border-line-strong bg-surface-raised text-content"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {children}
        </div>

        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-2.5 border-t border-stone-150 bg-surface px-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-3.5">
          <button
            type="button"
            onClick={onClear}
            className="h-[52px] border border-ink text-caption-sm font-medium uppercase tracking-[.14em] text-content active:bg-surface-sunken"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] bg-ink text-caption-sm font-medium uppercase tracking-[.14em] text-content-inverse active:bg-accent"
          >
            {applyLabel}
          </button>
        </div>
      </aside>
    </>
  );
}

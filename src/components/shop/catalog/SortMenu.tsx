import { useEffect, useId, useRef, useState } from "react";
import { PiCaretDownLight, PiCheckLight } from "react-icons/pi";
import { SORT_OPTIONS, type SortKey } from "../../../utils/catalog/types";

interface Props {
  value: SortKey;
  onChange: (value: SortKey) => void;
}

export default function SortMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = SORT_OPTIONS.find((option) => option.key === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const pick = (key: SortKey) => {
    setOpen(false);
    buttonRef.current?.focus();
    if (key !== value) onChange(key);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="flex h-11 items-center gap-2.5 text-body-sm text-content"
      >
        <span className="text-content-subtle">Ordenar por:</span>
        <span>{current.label}</span>
        <PiCaretDownLight
          size={14}
          aria-hidden
          className={`transition-transform duration-[400ms] ease-out-expo ${open ? "rotate-180" : ""}`}
        />
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-label="Ordenar por"
        inert={!open}
        className={`absolute right-0 top-full z-[25] min-w-[250px] border border-stone-150 bg-surface-raised py-2 shadow-lg transition-[opacity,transform] duration-[350ms,450ms] ease-out-expo ${
          open ? "translate-y-1 opacity-100" : "pointer-events-none -translate-y-1.5 opacity-0"
        }`}
      >
        {SORT_OPTIONS.map((option) => {
          const selected = option.key === value;
          return (
            <li key={option.key} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => pick(option.key)}
                className={`flex w-full items-center justify-between px-[18px] py-[11px] text-left text-body-xs text-content transition-colors duration-[250ms] hover:bg-surface ${
                  selected ? "font-semibold" : ""
                }`}
              >
                {option.label}
                <PiCheckLight size={14} aria-hidden className={selected ? "opacity-100" : "opacity-0"} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { PiXBold } from "react-icons/pi";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface Props {
  chips: FilterChip[];
  onClearAll: () => void;
}

export default function ActiveFilterChips({ chips, onClearAll }: Props) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Quitar filtro ${chip.label}`}
          className="flex h-[34px] items-center gap-2 border border-line-strong bg-surface-raised px-3 text-body-xs text-content transition-colors duration-300 hover:border-ink"
        >
          {chip.label}
          <PiXBold size={10} aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="px-1.5 py-1 text-body-xs text-content underline decoration-1 underline-offset-4"
      >
        Limpiar todo
      </button>
    </div>
  );
}

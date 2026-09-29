import { useId, type ReactNode } from "react";
import { PiCheckBold } from "react-icons/pi";

interface FilterGroupProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function FilterGroup({ title, open, onToggle, children }: FilterGroupProps) {
  const panelId = useId();
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between py-5 text-left text-body-md font-medium text-content"
      >
        {title}
        <span aria-hidden="true" className="relative block h-3.5 w-3.5 shrink-0">
          <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-ink" />
          <span
            className={`absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-ink transition-transform duration-[450ms] ease-out-expo ${
              open ? "scale-y-0" : "scale-y-100"
            }`}
          />
        </span>
      </button>
      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-[550ms] ease-out-expo ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3.5 pb-[22px] pt-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface FilterOptionProps {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}

export function FilterOption({ label, count, checked, onChange }: FilterOptionProps) {
  const dimmed = count === 0 && !checked;
  return (
    <label className={`flex min-h-6 cursor-pointer items-center gap-3 text-body-sm ${dimmed ? "text-stone-400" : "text-content"}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center border bg-surface-raised ${dimmed ? "border-line-strong" : "border-stone-400"} text-content-inverse transition-[background-color,border-color] duration-[250ms] peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100`}
      >
        <PiCheckBold size={12} className="transition-opacity duration-200" />
      </span>
      <span>
        {label} <span className={dimmed ? undefined : "text-content-subtle"}>({count})</span>
      </span>
    </label>
  );
}

interface Props {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  className?: string;
}

const stepButton =
  "h-full w-11 text-[18px] text-content transition-opacity duration-200 hover:opacity-50 disabled:pointer-events-none disabled:opacity-30";

export default function QuantityStepper({ value, max, disabled = false, onChange, className = "h-[54px]" }: Props) {
  return (
    <div
      role="group"
      aria-label="Cantidad"
      className={`flex items-center border border-line-strong bg-surface-raised ${disabled ? "opacity-40" : ""} ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Quitar una unidad"
        className={stepButton}
      >
        −
      </button>
      <span aria-live="polite" className="min-w-7 text-center text-body-sm tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Agregar una unidad"
        className={stepButton}
      >
        +
      </button>
    </div>
  );
}

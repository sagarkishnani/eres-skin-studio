import { PiCaretRightLight } from "react-icons/pi";

interface Props {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;
  const isLast = page >= pageCount;

  return (
    <nav aria-label="Paginación" className="mt-[clamp(40px,6vw,72px)] flex items-center justify-center gap-1.5">
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => {
        const current = number === page;
        return (
          <button
            key={number}
            type="button"
            onClick={() => !current && onChange(number)}
            aria-label={`Página ${number}`}
            aria-current={current ? "page" : undefined}
            className={`h-11 w-11 border text-body-xs tabular-nums transition-colors duration-[350ms] hover:border-ink ${
              current ? "border-ink bg-ink text-content-inverse" : "border-transparent text-content"
            }`}
          >
            {number}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => !isLast && onChange(page + 1)}
        disabled={isLast}
        className={`flex h-11 items-center gap-2 px-3.5 text-body-xs text-content ${isLast ? "opacity-35" : ""}`}
      >
        Siguiente
        <PiCaretRightLight size={14} aria-hidden />
      </button>
    </nav>
  );
}

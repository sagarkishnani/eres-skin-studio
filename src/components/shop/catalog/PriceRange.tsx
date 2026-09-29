import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { PRICE_STEP } from "../../../utils/catalog/types";
import { normalizePriceRange } from "../../../utils/catalog/urlState";

interface Props {
  priceMax: number;
  value: [number, number] | null;
  onCommit: (range: [number, number] | null) => void;
}

type Thumb = 0 | 1;

const THUMB_LABELS = ["Precio mínimo", "Precio máximo"];

function sameRange(a: [number, number] | null, b: [number, number] | null): boolean {
  return a?.[0] === b?.[0] && a?.[1] === b?.[1];
}

export default function PriceRange({ priceMax, value, onCommit }: Props) {
  const [draft, setDraft] = useState<[number, number]>(value ?? [0, priceMax]);
  const draftRef = useRef(draft);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingThumb = useRef<Thumb | null>(null);

  useEffect(() => {
    const next: [number, number] = value ?? [0, priceMax];
    draftRef.current = next;
    setDraft(next);
  }, [value, priceMax]);

  const moveThumb = (thumb: Thumb, target: number) => {
    const [min, max] = draftRef.current;
    const stepped = Math.round(target / PRICE_STEP) * PRICE_STEP;
    const next: [number, number] =
      thumb === 0
        ? [Math.max(0, Math.min(stepped, max - PRICE_STEP)), max]
        : [min, Math.min(priceMax, Math.max(stepped, min + PRICE_STEP))];
    draftRef.current = next;
    setDraft(next);
  };

  const commitDraft = () => {
    const range = normalizePriceRange(draftRef.current, priceMax);
    if (!sameRange(range, value)) onCommit(range);
  };

  const valueAtPointer = (event: PointerEvent) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return ratio * priceMax;
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const target = valueAtPointer(event);
    const [min, max] = draftRef.current;
    const thumb: Thumb = Math.abs(target - min) <= Math.abs(target - max) && target <= max ? 0 : 1;
    draggingThumb.current = thumb;
    moveThumb(thumb, target);
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (draggingThumb.current !== null) moveThumb(draggingThumb.current, valueAtPointer(event));
  };

  const endDrag = () => {
    if (draggingThumb.current === null) return;
    draggingThumb.current = null;
    commitDraft();
  };

  const moveWithKeyboard = (thumb: Thumb, event: KeyboardEvent) => {
    const current = draftRef.current[thumb];
    const targets: Record<string, number> = {
      ArrowRight: current + PRICE_STEP,
      ArrowUp: current + PRICE_STEP,
      ArrowLeft: current - PRICE_STEP,
      ArrowDown: current - PRICE_STEP,
      Home: 0,
      End: priceMax,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    moveThumb(thumb, targets[event.key]);
  };

  const percent = (amount: number) => `${(amount / priceMax) * 100}%`;

  return (
    <div className="flex flex-col gap-3.5">
      <div
        ref={trackRef}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative mx-[9px] h-7 cursor-pointer touch-none"
      >
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-line-strong" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink"
          style={{ left: percent(draft[0]), width: percent(draft[1] - draft[0]) }}
        />
        {([0, 1] as Thumb[]).map((thumb) => (
          <div
            key={thumb}
            role="slider"
            tabIndex={0}
            aria-label={THUMB_LABELS[thumb]}
            aria-valuemin={thumb === 0 ? 0 : draft[0] + PRICE_STEP}
            aria-valuemax={thumb === 0 ? draft[1] - PRICE_STEP : priceMax}
            aria-valuenow={draft[thumb]}
            aria-valuetext={`S/ ${draft[thumb]}`}
            onKeyDown={(event) => moveWithKeyboard(thumb, event)}
            onKeyUp={commitDraft}
            className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            style={{ left: percent(draft[thumb]) }}
          />
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5" aria-hidden="true">
        {[draft[0], draft[1]].map((amount, index) => (
          <div
            key={index}
            className={`flex h-11 items-center justify-between border border-line-strong bg-surface-raised px-3 text-body-xs ${index === 1 ? "col-start-3" : ""}`}
          >
            <span className="text-content-subtle">S/</span>
            <span className="tabular-nums">{amount}</span>
          </div>
        ))}
        <span className="col-start-2 row-start-1 text-caption-md text-content-subtle">a</span>
      </div>
    </div>
  );
}

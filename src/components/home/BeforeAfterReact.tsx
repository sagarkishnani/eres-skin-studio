import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const INITIAL_POSITION = 50;
const KEYBOARD_STEP = 5;

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

const labelClass =
  "absolute bottom-3.5 bg-surface-raised/85 px-2 py-[5px] text-caption-xs font-medium uppercase tracking-[.16em] text-ink";

export default function BeforeAfterReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const results = data?.home?.results;
  const frame = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [dragging, setDragging] = useState(false);

  if (!results?.beforeImage || !results?.afterImage) return <div hidden />;

  function moveTo(clientX: number) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect?.width) return;
    setPosition(clampPercent(((clientX - rect.left) / rect.width) * 100));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    moveTo(event.clientX);
  }

  function onKeyDown(event: KeyboardEvent) {
    const delta = { ArrowLeft: -KEYBOARD_STEP, ArrowRight: KEYBOARD_STEP }[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    setPosition((current) => clampPercent(current + delta));
  }

  const beforeLabel = results.beforeLabel || "Antes";
  const afterLabel = results.afterLabel || "Después";

  return (
    <div
      ref={frame}
      onPointerDown={onPointerDown}
      onPointerMove={(event) => dragging && moveTo(event.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      className="relative aspect-[4/3] cursor-ew-resize touch-pan-y select-none overflow-hidden"
    >
      <img
        src={mediaUrl(results.afterImage)}
        alt={afterLabel}
        loading="lazy"
        decoding="async"
        draggable={false}
        data-tina-field={tinaField(results, "afterImage")}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={mediaUrl(results.beforeImage)}
        alt={beforeLabel}
        loading="lazy"
        decoding="async"
        draggable={false}
        data-tina-field={tinaField(results, "beforeImage")}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-y-0 w-px -translate-x-1/2 bg-surface-raised" style={{ left: `${position}%` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Comparar ${beforeLabel.toLowerCase()} y ${afterLabel.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onKeyDown={onKeyDown}
        style={{ left: `${position}%` }}
        className={`absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full bg-surface-raised text-ink shadow-lg transition-transform duration-300 ease-spring ${
          dragging ? "scale-90" : "scale-100"
        }`}
      >
        <Chevron direction="left" />
        <Chevron direction="right" />
      </div>
      <span className={`${labelClass} left-4`} data-tina-field={tinaField(results, "beforeLabel")}>
        {beforeLabel}
      </span>
      <span className={`${labelClass} right-4`} data-tina-field={tinaField(results, "afterLabel")}>
        {afterLabel}
      </span>
    </div>
  );
}

import { useRef, useState, type PointerEvent } from "react";
import { PiCaretLeftLight, PiCaretRightLight } from "react-icons/pi";
import type { WooImage } from "../../../lib/woo/types";

interface Props {
  images: WooImage[];
  productName: string;
  discount: number | null;
}

const SWIPE_THRESHOLD_PX = 40;

const arrowButton =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center border border-stone-150 bg-surface-raised text-content opacity-0 transition-[opacity,transform] duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 motion-reduce:transition-none lg:grid";
const counterButton = "grid h-11 w-11 place-items-center text-content";

function slideClass(active: boolean): string {
  const state = active ? "opacity-100 scale-100 lg:group-hover:scale-[1.03]" : "opacity-0 scale-[1.04]";
  return `absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[700ms,1400ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1),cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${state}`;
}

export default function ProductGalleryReact({ images, productName, discount }: Props) {
  const [current, setCurrent] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const total = images.length;
  const hasMany = total > 1;

  const go = (delta: number) => setCurrent((index) => (index + delta + total) % total);

  const onPointerDown = (event: PointerEvent) => {
    swipeStartX.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStartX.current === null) return;
    const deltaX = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (hasMany && Math.abs(deltaX) > SWIPE_THRESHOLD_PX) go(deltaX < 0 ? 1 : -1);
  };

  return (
    <div
      className="relative grid gap-4 transition-[top] duration-[600ms] ease-out-expo motion-reduce:transition-none lg:sticky lg:top-[112px] lg:grid-cols-[72px_minmax(0,1fr)] lg:[html[data-header=hidden]_&]:top-6"
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Imágenes de ${productName}`}
    >
      {hasMany && (
        <div className="hidden flex-col gap-3 lg:flex">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Ver imagen ${index + 1} de ${total}`}
              aria-current={index === current}
              className={`h-[72px] w-[72px] border bg-stone-100 transition-[opacity,border-color] duration-300 hover:opacity-100 ${
                index === current ? "border-ink opacity-100" : "border-transparent opacity-60"
              }`}
            >
              <img src={image.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className={`group relative aspect-square touch-pan-y select-none overflow-hidden bg-stone-100 ${hasMany ? "" : "lg:col-span-2"}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStartX.current = null)}
      >
        {total > 0 ? (
          images.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt={index === current ? image.alt || productName : ""}
              aria-hidden={index !== current}
              width="900"
              height="900"
              draggable={false}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : undefined}
              decoding="async"
              className={slideClass(index === current)}
            />
          ))
        ) : (
          <div className="grid h-full place-items-center text-caption-sm text-content-subtle">Sin imagen</div>
        )}

        {discount !== null && (
          <span className="absolute left-3.5 top-3.5 bg-accent px-[9px] py-1.5 text-caption-sm font-semibold leading-none tracking-[.04em] text-content-inverse">
            -{discount}%
          </span>
        )}

        {hasMany && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Imagen anterior" className={`${arrowButton} left-3.5 -translate-x-2`}>
              <PiCaretLeftLight size={16} aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Imagen siguiente" className={`${arrowButton} right-3.5 translate-x-2`}>
              <PiCaretRightLight size={16} aria-hidden />
            </button>
          </>
        )}
      </div>

      {hasMany && (
        <div className="flex items-center justify-center gap-3.5 text-body-xs tabular-nums lg:hidden">
          <button type="button" onClick={() => go(-1)} aria-label="Imagen anterior" className={counterButton}>
            <PiCaretLeftLight size={16} aria-hidden />
          </button>
          <span aria-hidden="true">
            {current + 1} / {total}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Imagen siguiente" className={counterButton}>
            <PiCaretRightLight size={16} aria-hidden />
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        Imagen {current + 1} de {Math.max(total, 1)}
      </p>
    </div>
  );
}

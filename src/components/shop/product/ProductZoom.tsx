import { useEffect, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { PiCaretLeftLight, PiCaretRightLight, PiXLight } from "react-icons/pi";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { lockScroll, unlockScroll } from "../../../utils/scrollLock";
import type { WooImage } from "../../../lib/woo/types";

interface Props {
  open: boolean;
  images: WooImage[];
  current: number;
  productName: string;
  onClose: () => void;
  onStep: (delta: number) => void;
}

const navButton = "grid h-11 w-11 place-items-center border border-stone-150 bg-surface-raised text-content";

export default function ProductZoom({ open, images, current, productName, onClose, onStep }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const image = images[current];
  const hasMany = images.length > 1;

  useFocusTrap(dialogRef, open);

  const closeOnBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) onClose();
  };

  useEffect(() => {
    if (!open) return;
    lockScroll();
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onStep(-1);
      if (event.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockScroll();
    };
  }, [open, onClose, onStep]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen ampliada de ${productName}`}
      inert={!open}
      data-lenis-prevent
      onClick={closeOnBackdropClick}
      className={`fixed inset-0 z-[80] bg-surface-raised transition-opacity duration-[450ms] ease-out-soft motion-reduce:transition-none ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {image && (
        <div
          onClick={closeOnBackdropClick}
          className="absolute inset-x-[clamp(12px,6vw,96px)] inset-y-[clamp(64px,7vw,88px)] grid place-items-center"
        >
          <img
            src={image.src}
            alt={image.alt || productName}
            decoding="async"
            className={`max-h-full max-w-full object-contain transition-transform duration-700 ease-out-expo motion-reduce:transition-none ${
              open ? "scale-100" : "scale-[.96]"
            }`}
          />
        </div>
      )}

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Cerrar imagen ampliada"
        className="absolute right-4 top-4 grid h-12 w-12 place-items-center border border-stone-150 bg-surface-raised text-content"
      >
        <PiXLight size={22} aria-hidden />
      </button>

      {hasMany && (
        <div
          onClick={closeOnBackdropClick}
          className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-4 text-body-xs tabular-nums"
        >
          <button type="button" onClick={() => onStep(-1)} aria-label="Imagen anterior" className={navButton}>
            <PiCaretLeftLight size={16} aria-hidden />
          </button>
          <span>
            {current + 1} / {images.length}
          </span>
          <button type="button" onClick={() => onStep(1)} aria-label="Imagen siguiente" className={navButton}>
            <PiCaretRightLight size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}

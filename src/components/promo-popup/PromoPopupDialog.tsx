import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";
import { PROMO_POPUP_TITLE_ID } from "./PromoPopupPanel";

const LEAVE_MS = 300;

interface DialogControls {
  requestClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}

interface Props {
  onClosed: () => void;
  children: (controls: DialogControls) => ReactNode;
}

export default function PromoPopupDialog({ onClosed, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const leavingRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useFocusTrap(dialogRef, true);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
    lockScroll();
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      unlockScroll();
    };
  }, []);

  const requestClose = () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setVisible(false);
    window.setTimeout(onClosed, LEAVE_MS);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={PROMO_POPUP_TITLE_ID}
      className="fixed inset-0 z-[80] flex items-center justify-center px-gutter"
    >
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={`absolute inset-0 bg-ink/50 transition-opacity ease-out-expo ${
          visible ? "opacity-100 duration-400" : "opacity-0 duration-300"
        }`}
      />
      <div
        className={`pointer-events-none relative flex w-full justify-center transition-[opacity,transform] ease-out-expo motion-reduce:transform-none ${
          visible ? "translate-y-0 opacity-100 duration-[600ms]" : "translate-y-4 opacity-0 duration-300"
        }`}
      >
        {children({ requestClose, closeButtonRef })}
      </div>
    </div>
  );
}

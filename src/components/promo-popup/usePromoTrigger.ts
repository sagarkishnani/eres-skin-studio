import { useEffect, useRef } from "react";

export interface PromoTriggers {
  delaySeconds?: number | null;
  scrollPercent?: number | null;
  exitIntent?: boolean | null;
}

function scrolledPercent(): number {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
}

function supportsExitIntent(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

export function usePromoTrigger(
  triggers: PromoTriggers | null | undefined,
  armed: boolean,
  visitCount: number,
  onFire: () => void
) {
  const onFireRef = useRef(onFire);
  onFireRef.current = onFire;

  const delaySeconds = Math.max(0, triggers?.delaySeconds || 0);
  const scrollPercent = Math.min(100, Math.max(0, triggers?.scrollPercent || 0));
  const exitIntent = Boolean(triggers?.exitIntent);

  useEffect(() => {
    if (!armed) return;

    const cleanups: (() => void)[] = [];
    const disarm = () => cleanups.splice(0).forEach((cleanup) => cleanup());
    const fire = () => {
      disarm();
      onFireRef.current();
    };

    if (delaySeconds > 0) {
      const timer = window.setTimeout(fire, delaySeconds * 1000);
      cleanups.push(() => window.clearTimeout(timer));
    }

    if (scrollPercent > 0) {
      const onScroll = () => {
        if (scrolledPercent() >= scrollPercent) fire();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    if (exitIntent && supportsExitIntent()) {
      const onMouseOut = (event: MouseEvent) => {
        if (!event.relatedTarget && event.clientY <= 0) fire();
      };
      document.addEventListener("mouseout", onMouseOut);
      cleanups.push(() => document.removeEventListener("mouseout", onMouseOut));
    }

    return disarm;
  }, [armed, visitCount, delaySeconds, scrollPercent, exitIntent]);
}

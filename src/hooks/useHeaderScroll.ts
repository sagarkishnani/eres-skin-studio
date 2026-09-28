import { useEffect, useState } from "react";

const SHRINK_AFTER = 40;
const HIDE_AFTER = 120;
const MIN_DELTA = 6;

interface HeaderScroll {
  hidden: boolean;
  scrolled: boolean;
}

export function useHeaderScroll(): HeaderScroll {
  const [state, setState] = useState<HeaderScroll>({ hidden: false, scrolled: false });

  useEffect(() => {
    const canHide = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastY = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      const scrolled = y > SHRINK_AFTER;

      if (Math.abs(delta) < MIN_DELTA && y > HIDE_AFTER) {
        setState((prev) => (prev.scrolled === scrolled ? prev : { ...prev, scrolled }));
        return;
      }

      setState((prev) => {
        let hidden = prev.hidden;
        if (!canHide || y < HIDE_AFTER) hidden = false;
        else if (delta > 0) hidden = true;
        else if (delta < 0) hidden = false;
        return prev.hidden === hidden && prev.scrolled === scrolled ? prev : { hidden, scrolled };
      });
      lastY = y;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return state;
}

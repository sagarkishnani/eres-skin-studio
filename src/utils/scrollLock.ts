import type Lenis from "lenis";

declare global {
  interface Window {
    lenisInstance?: Lenis;
  }
}

export function lockScroll() {
  document.documentElement.dataset.scrollLocked = "";
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  window.lenisInstance?.stop();
}

export function unlockScroll() {
  delete document.documentElement.dataset.scrollLocked;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  window.lenisInstance?.start();
}

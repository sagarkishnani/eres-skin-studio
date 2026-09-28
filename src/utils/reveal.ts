import { resetCount, runCount } from "./countUp";

const READY_CLASS = "reveal-ready";
const SAFETY_DELAY_MS = 2500;
const SAFETY_VIEWPORT_FACTOR = 1.2;

let observer: IntersectionObserver | null = null;
let safetyTimer: ReturnType<typeof setTimeout> | undefined;

function insideTinaEditor(): boolean {
  try {
    return window.frameElement?.id === "tina-iframe";
  } catch {
    return false;
  }
}

export function revealEnabled(): boolean {
  return (
    document.documentElement.dataset.revealAnimations !== "false" &&
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !insideTinaEditor()
  );
}

function show(element: Element) {
  element.setAttribute("data-shown", "");
  observer?.unobserve(element);
  if (element.hasAttribute("data-count")) runCount(element);
}

function revealNearViewport(targets: HTMLElement[]) {
  const limit = window.innerHeight * SAFETY_VIEWPORT_FACTOR;
  targets.forEach((element) => {
    if (!element.hasAttribute("data-shown") && element.getBoundingClientRect().top < limit) show(element);
  });
}

export function startReveal() {
  observer?.disconnect();
  clearTimeout(safetyTimer);

  const root = document.documentElement;
  if (!revealEnabled()) {
    root.classList.remove(READY_CLASS);
    return;
  }

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown]), [data-count]:not([data-shown])"),
  );
  targets.forEach((element) => {
    if (element.hasAttribute("data-count")) resetCount(element);
    if (element.hasAttribute("data-reveal")) element.style.transitionDelay = `${Number(element.dataset.reveal) || 0}ms`;
  });
  root.classList.add(READY_CLASS);

  observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && show(entry.target)),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  targets.forEach((element) => observer?.observe(element));
  safetyTimer = setTimeout(() => revealNearViewport(targets), SAFETY_DELAY_MS);
}

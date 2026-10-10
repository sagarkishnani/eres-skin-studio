const COUNT_DURATION_MS = 1800;

export function formatCount(value: number, prefix = "", suffix = ""): string {
  return `${prefix}${Math.round(value).toLocaleString("en-US")}${suffix}`;
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function countValues(group: Element): HTMLElement[] {
  return Array.from(group.querySelectorAll<HTMLElement>("[data-count-to]"));
}

function render(element: HTMLElement, value: number) {
  element.textContent = formatCount(value, element.dataset.countPrefix, element.dataset.countSuffix);
}

export function resetCount(group: Element) {
  countValues(group).forEach((element) => render(element, 0));
}

export function runCount(group: Element) {
  const elements = countValues(group);
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
    elements.forEach((element) => render(element, Number(element.dataset.countTo) * easeOutCubic(progress)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

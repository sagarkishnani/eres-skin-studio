import { isOpenAt, studioClock, todayRowIndex, type OpeningHoursRow } from "../utils/openingHours";

function readRows(container: HTMLElement): OpeningHoursRow[] {
  try {
    return JSON.parse(container.dataset.openingHours || "[]");
  } catch {
    return [];
  }
}

function showStatus(status: HTMLElement, open: boolean) {
  const label = status.querySelector("[data-opening-label]");
  if (label) label.textContent = (open ? status.dataset.openLabel : status.dataset.closedLabel) || "";
  status.toggleAttribute("data-open", open);
  status.setAttribute("data-ready", "");
}

export function startOpeningHours() {
  const container = document.querySelector<HTMLElement>("[data-opening-hours]");
  const clock = studioClock();
  if (!container || !clock) return;

  const rows = readRows(container);
  const rowElements = container.querySelectorAll<HTMLElement>("[data-hours-row]");
  rowElements[todayRowIndex(rows, clock)]?.setAttribute("data-today", "");

  const status = document.querySelector<HTMLElement>("[data-opening-status]");
  if (status) showStatus(status, isOpenAt(rows, clock));
}

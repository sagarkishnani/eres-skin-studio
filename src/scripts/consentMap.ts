import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  FUNCTIONAL_CATEGORY,
  OPEN_CONSENT_EVENT,
  readConsent,
  type ConsentPrefs,
} from "../utils/cookieConsent";

let windowListenersBound = false;

function functionalAllowed(prefs: ConsentPrefs | null): boolean {
  return Boolean(prefs?.[FUNCTIONAL_CATEGORY]);
}

function embedMap(container: HTMLElement) {
  if (container.querySelector("iframe")) return;
  const iframe = document.createElement("iframe");
  iframe.src = container.dataset.embedUrl || "";
  iframe.title = container.dataset.mapTitle || "";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.className = "absolute inset-0 h-full w-full border-0 [filter:grayscale(.35)_contrast(1.02)]";
  container.querySelector("[data-map-placeholder]")?.remove();
  container.append(iframe);
}

function syncMaps(prefs: ConsentPrefs | null) {
  if (!functionalAllowed(prefs)) return;
  document.querySelectorAll<HTMLElement>("[data-consent-map]").forEach(embedMap);
}

function bindOpenConsentButtons() {
  document.querySelectorAll<HTMLElement>("[data-open-consent]:not([data-ready])").forEach((button) => {
    button.addEventListener("click", () => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT)));
    button.setAttribute("data-ready", "");
  });
}

function bindWindowListeners() {
  if (windowListenersBound) return;
  windowListenersBound = true;
  window.addEventListener(CONSENT_CHANGE_EVENT, (event) => syncMaps((event as CustomEvent<ConsentPrefs>).detail));
  window.addEventListener("storage", (event) => {
    if (event.key === CONSENT_STORAGE_KEY) syncMaps(readConsent());
  });
}

export function startConsentMap() {
  if (!document.querySelector("[data-consent-map]")) return;
  bindWindowListeners();
  bindOpenConsentButtons();
  syncMaps(readConsent());
}

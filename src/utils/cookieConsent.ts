export const CONSENT_STORAGE_KEY = "eres-skin-studio-cookie-consent:v1";
export const CONSENT_CHANGE_EVENT = "cookie-consent-change";
export const OPEN_CONSENT_EVENT = "open-cookie-consent";

export type ConsentPrefs = Record<string, boolean>;

export function readConsent(): ConsentPrefs | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const FUNCTIONAL_CATEGORY = "funcional";
export const ANALYTICS_CATEGORY = "analitica";

export function hasAnalyticsConsent(prefs: ConsentPrefs | null = readConsent()): boolean {
  return prefs?.[ANALYTICS_CATEGORY] === true;
}

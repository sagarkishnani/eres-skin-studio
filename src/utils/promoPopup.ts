export const PROMO_POPUP_STORAGE_KEY = "eres-skin-studio-promo-popup:v1";

const DAY_MS = 86_400_000;

export interface PromoCampaignWindow {
  id?: string | null;
  enabled?: boolean | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface PromoFrequency {
  daysAfterDismiss?: number | null;
  daysAfterConvert?: number | null;
}

interface CampaignHistory {
  dismissedAt?: number;
  convertedAt?: number;
}

export type PromoPopupHistory = Record<string, CampaignHistory>;

function parseTime(value?: string | null): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function isWithinWindow(campaign: PromoCampaignWindow, now: number): boolean {
  const startsAt = parseTime(campaign.startsAt);
  const endsAt = parseTime(campaign.endsAt);
  return (startsAt === null || now >= startsAt) && (endsAt === null || now <= endsAt);
}

export function pickActiveCampaign<T extends PromoCampaignWindow>(
  campaigns: (T | null)[] | null | undefined,
  now: number
): T | null {
  return (
    (campaigns || []).find(
      (campaign): campaign is T => Boolean(campaign?.enabled && campaign.id && isWithinWindow(campaign, now))
    ) || null
  );
}

export function pickPreviewCampaign<T extends PromoCampaignWindow>(
  campaigns: (T | null)[] | null | undefined
): T | null {
  const present = (campaigns || []).filter((campaign): campaign is T => Boolean(campaign));
  return present.find((campaign) => campaign.enabled) || present[0] || null;
}

function withoutTrailingSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function isPathExcluded(pathname: string, excludedPaths: (string | null)[] | null | undefined): boolean {
  const current = withoutTrailingSlash(pathname);
  return (excludedPaths || []).some((excluded) => {
    const prefix = withoutTrailingSlash(excluded?.trim() || "");
    if (!prefix) return false;
    if (prefix === "/") return true;
    return current === prefix || current.startsWith(`${prefix}/`);
  });
}

function isWaiting(since: number | undefined, days: number | null | undefined, now: number): boolean {
  return since !== undefined && now < since + (days || 0) * DAY_MS;
}

export function isCampaignSnoozed(
  history: PromoPopupHistory,
  campaignId: string,
  frequency: PromoFrequency | null | undefined,
  now: number
): boolean {
  const entry = history[campaignId];
  if (!entry) return false;
  return (
    isWaiting(entry.dismissedAt, frequency?.daysAfterDismiss, now) ||
    isWaiting(entry.convertedAt, frequency?.daysAfterConvert, now)
  );
}

export function readHistory(): PromoPopupHistory {
  try {
    const raw = localStorage.getItem(PROMO_POPUP_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function recordEvent(campaignId: string, event: keyof CampaignHistory) {
  try {
    const history = readHistory();
    history[campaignId] = { ...history[campaignId], [event]: Date.now() };
    localStorage.setItem(PROMO_POPUP_STORAGE_KEY, JSON.stringify(history));
  } catch {
    return;
  }
}

export function recordDismiss(campaignId: string) {
  recordEvent(campaignId, "dismissedAt");
}

export function recordConvert(campaignId: string) {
  recordEvent(campaignId, "convertedAt");
}

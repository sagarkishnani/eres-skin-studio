export const STUDIO_TIME_ZONE = "America/Lima";

export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface Shift {
  open?: string | null;
  close?: string | null;
}

export interface OpeningHoursRow {
  label?: string | null;
  days?: (string | null)[] | null;
  shifts?: (Shift | null)[] | null;
}

export interface StudioClock {
  weekday: Weekday;
  minutes: number;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isValidShift(shift: Shift | null | undefined): shift is { open: string; close: string } {
  return Boolean(
    shift?.open &&
      shift?.close &&
      TIME_PATTERN.test(shift.open) &&
      TIME_PATTERN.test(shift.close) &&
      toMinutes(shift.close) > toMinutes(shift.open),
  );
}

export function rowShifts(row: OpeningHoursRow): { open: string; close: string }[] {
  return (row.shifts || []).filter(isValidShift);
}

export function formatShift(shift: { open: string; close: string }): string {
  return `${shift.open} — ${shift.close}`;
}

export function presentRows(rows: (OpeningHoursRow | null)[] | null | undefined): OpeningHoursRow[] {
  return (rows || []).filter((row): row is OpeningHoursRow => Boolean(row?.label));
}

export function studioClock(now: Date = new Date()): StudioClock | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: STUDIO_TIME_ZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
    const weekday = part("weekday").toLowerCase() as Weekday;
    if (!WEEKDAYS.includes(weekday)) return null;
    return { weekday, minutes: Number(part("hour")) * 60 + Number(part("minute")) };
  } catch {
    return null;
  }
}

export function todayRowIndex(rows: OpeningHoursRow[], clock: StudioClock): number {
  return rows.findIndex((row) => (row.days || []).includes(clock.weekday));
}

export function isOpenAt(rows: OpeningHoursRow[], clock: StudioClock): boolean {
  const today = rows[todayRowIndex(rows, clock)];
  if (!today) return false;
  return rowShifts(today).some(
    (shift) => clock.minutes >= toMinutes(shift.open) && clock.minutes < toMinutes(shift.close),
  );
}

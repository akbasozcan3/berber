import { parseLocalIsoDate, toLocalIsoDate, addDaysToIso } from "@/lib/utils/format";

/** ISO weekday: 1=Mon … 6=Sat. Sunday (7) is never a working day. */
export const BARBER_WORKING_DAYS = "1,2,3,4,5,6";

export function isSunday(date: string | Date): boolean {
  const d = typeof date === "string" ? parseLocalIsoDate(date) : date;
  return d.getDay() === 0;
}

export function normalizeBarberWorkingDays(raw?: string | null): string {
  const days = (raw || BARBER_WORKING_DAYS)
    .split(",")
    .map((d) => Number(d.trim()))
    .filter((d) => d >= 1 && d <= 6);
  const unique = [...new Set(days)].sort((a, b) => a - b);
  return unique.length > 0 ? unique.join(",") : BARBER_WORKING_DAYS;
}

export function barberWorksOnDate(date: string, workingDays: string): boolean {
  if (isSunday(date)) return false;
  const dayOfWeek = parseLocalIsoDate(date).getDay();
  const isoWeekday = dayOfWeek === 0 ? 7 : dayOfWeek;
  return normalizeBarberWorkingDays(workingDays)
    .split(",")
    .map(Number)
    .includes(isoWeekday);
}

/** Next bookable day (skips Sundays) in salon timezone. */
export function nextBookableIsoDate(from = new Date()): string {
  let iso = toLocalIsoDate(from);
  if (!isSunday(iso)) return iso;
  while (isSunday(iso)) {
    iso = addDaysToIso(iso, 1);
  }
  return iso;
}

export function listBookableIsoDates(count: number, from = new Date()): string[] {
  const dates: string[] = [];
  let iso = toLocalIsoDate(from);
  while (dates.length < count) {
    if (!isSunday(iso)) {
      dates.push(iso);
    }
    iso = addDaysToIso(iso, 1);
  }
  return dates;
}

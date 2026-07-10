import { parseLocalIsoDate, toLocalIsoDate } from "@/lib/utils/format";

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

/** Next bookable day (skips Sundays). */
export function nextBookableIsoDate(from = new Date()): string {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  while (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return toLocalIsoDate(d);
}

export function listBookableIsoDates(count: number, from = new Date()): string[] {
  const dates: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);
  while (dates.length < count) {
    if (cursor.getDay() !== 0) {
      dates.push(toLocalIsoDate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

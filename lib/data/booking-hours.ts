import {
  alignMinutesUp,
  formatMinutes,
  normalizeAppointmentInterval,
  parseMinutes,
  slotFitsInterval,
} from "@/lib/utils/appointment-interval";

export const DEFAULT_BOOKING_START = "10:00";
export const DEFAULT_BOOKING_END = "21:00";

export function normalizeClock(value: unknown, fallback: string): string {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2])));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function salonCloseFromLastStart(lastStart: string): string {
  return formatMinutes(parseMinutes(lastStart) + 60);
}

export function listCustomerSlotStarts(
  start: string,
  lastStart: string,
  interval: unknown
): string[] {
  const step = normalizeAppointmentInterval(interval);
  const from = alignMinutesUp(
    parseMinutes(normalizeClock(start, DEFAULT_BOOKING_START)),
    step
  );
  const to = parseMinutes(normalizeClock(lastStart, DEFAULT_BOOKING_END));
  const slots: string[] = [];
  for (let time = from; time <= to; time += step) {
    slots.push(formatMinutes(time));
  }
  return slots.filter((slot) => slotFitsInterval(slot, step));
}

export function isWithinBookingWindow(
  time: string,
  start: string | null | undefined,
  lastStart: string | null | undefined,
  interval: unknown
): boolean {
  if (!slotFitsInterval(time, interval)) return false;
  const minutes = parseMinutes(time);
  if (start) {
    const from = parseMinutes(normalizeClock(start, DEFAULT_BOOKING_START));
    if (minutes < from) return false;
  }
  if (lastStart) {
    const to = parseMinutes(normalizeClock(lastStart, DEFAULT_BOOKING_END));
    if (minutes > to) return false;
  }
  return true;
}

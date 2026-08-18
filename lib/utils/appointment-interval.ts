export const APPOINTMENT_INTERVALS = [15, 30, 60] as const;
export type AppointmentInterval = (typeof APPOINTMENT_INTERVALS)[number];

export const APPOINTMENT_INTERVAL_OPTIONS: { value: string; label: string }[] = [
  { value: "60", label: "Sadece tam saatler (10:00, 11:00, 12:00)" },
  { value: "30", label: "Buçuklu saatler (10:00, 10:30, 11:00)" },
  { value: "15", label: "Çeyrek saat (10:00, 10:15, 10:30)" },
];

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseMinutes(time: string): number {
  const [h, m] = String(time || "0:0").split(":").map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export function normalizeAppointmentInterval(value: unknown): AppointmentInterval {
  const n = Number(value);
  if (n === 15 || n === 30 || n === 60) return n;
  if (n === 45) return 30;
  if (n >= 50) return 60;
  if (n >= 20) return 30;
  if (n > 0) return 15;
  return 60;
}

/** Round start time up so slots sit on the interval grid (09:30 + 60dk → 10:00). */
export function alignMinutesUp(minutes: number, interval: number): number {
  const step = normalizeAppointmentInterval(interval);
  const rem = minutes % step;
  return rem === 0 ? minutes : minutes + (step - rem);
}

export function buildTimeSlotValues(options?: {
  interval?: unknown;
  start?: string;
  end?: string;
  include?: string;
}): string[] {
  const step = normalizeAppointmentInterval(options?.interval);
  const start = options?.start || "08:00";
  const end = options?.end || "23:00";
  let current = alignMinutesUp(parseMinutes(start), step);
  const endMin = parseMinutes(end);
  const slots: string[] = [];

  while (current <= endMin) {
    slots.push(formatMinutes(current));
    current += step;
  }

  const include = options?.include?.trim();
  if (include && /^\d{1,2}:\d{2}$/.test(include) && !slots.includes(include)) {
    slots.push(include);
    slots.sort();
  }

  return slots;
}

export function buildTimeSlotOptions(options?: {
  interval?: unknown;
  start?: string;
  end?: string;
  include?: string;
}): { value: string; label: string }[] {
  return buildTimeSlotValues(options).map((time) => ({ value: time, label: time }));
}

export function generateAppointmentSlots(
  start: string,
  end: string,
  interval: unknown,
  serviceDuration: number
): string[] {
  const step = normalizeAppointmentInterval(interval);
  const slots: string[] = [];
  let current = alignMinutesUp(parseMinutes(start), step);
  const endMin = parseMinutes(end);
  const minSpan = Math.max(step, serviceDuration);

  while (current + minSpan <= endMin) {
    slots.push(formatMinutes(current));
    current += step;
  }

  return slots;
}

export function slotFitsInterval(time: string, interval: unknown): boolean {
  const step = normalizeAppointmentInterval(interval);
  if (step <= 0) return true;
  return parseMinutes(time) % step === 0;
}

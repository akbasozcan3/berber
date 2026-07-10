export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export function digitsOnly(phone?: string | null): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** YYYY-MM-DD in local timezone (avoids UTC midnight drift). */
export function toLocalIsoDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatIsoDateTr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPhoneDisplay(phone?: string | null): string {
  const safe = phone ?? "";
  const digits = digitsOnly(phone);
  if (digits.length === 12 && digits.startsWith("90")) {
    return `0${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  return safe;
}

export function toTelHref(phone?: string | null): string {
  const digits = digitsOnly(phone);
  if (!digits) return "tel:";
  return `tel:+${digits.startsWith("90") ? digits : `90${digits.replace(/^0/, "")}`}`;
}

/** Store phones as +90XXXXXXXXXX for consistent display across the site. */
export function normalizePhoneStorage(phone?: string | null): string {
  const digits = digitsOnly(phone);
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("90")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return phone?.trim() ?? "";
}

export function googleMapsEmbedUrl(mapsUrl?: string | null, address?: string | null): string {
  const query = mapsUrl?.trim() || address?.trim() || "Berber Salonu";
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function formatWorkingHoursSummary(hours: WorkingHour[]): string {
  const openDays = hours.filter((h) => !h.closed && h.open && h.close);
  if (openDays.length === 0) return "Kapalı";

  const displayClose = (close: string) => (close === "00:00" ? "24:00" : close);

  const sameHours = openDays.every(
    (h) =>
      h.open === openDays[0].open &&
      displayClose(h.close) === displayClose(openDays[0].close)
  );
  const closedSunday =
    hours.some((h) => h.day === "Pazar" && h.closed) && openDays.length === 6;

  if (sameHours && closedSunday) {
    return `Pzt–Cmt: ${openDays[0].open} – ${displayClose(openDays[0].close)}`;
  }

  return openDays.map((h) => `${h.day}: ${h.open}–${displayClose(h.close)}`).join(" · ");
}

/** Kısa özet — navbar üst şeridi gibi dar alanlar için */
export function formatWorkingHoursTopbar(hours: WorkingHour[]): string {
  const openDays = hours.filter((h) => !h.closed && h.open && h.close);
  if (openDays.length === 0) return "Kapalı";

  const displayClose = (close: string) => (close === "00:00" ? "24:00" : close);
  const slot = (h: WorkingHour) => `${h.open}–${displayClose(h.close)}`;

  const weekdays = openDays.filter((h) => h.day !== "Cumartesi" && h.day !== "Pazar");
  const saturday = openDays.find((h) => h.day === "Cumartesi");
  const weekdaySlot = weekdays[0] ? slot(weekdays[0]) : "";
  const weekdaysMatch =
    weekdays.length > 0 &&
    weekdays.every((h) => slot(h) === weekdaySlot);

  if (weekdaysMatch && saturday) {
    if (slot(saturday) === weekdaySlot) {
      return `Pzt–Cmt: ${weekdaySlot}`;
    }
    return `Pzt–Cum: ${weekdaySlot} · Cmt: ${slot(saturday)}`;
  }

  if (weekdaysMatch) {
    return `Pzt–Cum: ${weekdaySlot}`;
  }

  const summary = formatWorkingHoursSummary(hours);
  return summary.length > 42 ? `${openDays[0].day.slice(0, 3)}–${openDays[openDays.length - 1].day.slice(0, 3)}: ${slot(openDays[0])}` : summary;
}

export function instagramUrl(handle?: string | null): string {
  const safe = handle ?? "";
  if (!safe) return "https://instagram.com/";
  const clean = safe.replace(/^@/, "");
  return `https://instagram.com/${clean}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export function digitsOnly(phone?: string | null): string {
  return (phone ?? "").replace(/\D/g, "");
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

export function formatWorkingHoursSummary(hours: WorkingHour[]): string {
  const openDays = hours.filter((h) => !h.closed && h.open && h.close);
  if (openDays.length === 0) return "Kapalı";

  const sameHours = openDays.every(
    (h) => h.open === openDays[0].open && h.close === openDays[0].close
  );
  const closedSunday =
    hours.some((h) => h.day === "Pazar" && h.closed) && openDays.length === 6;

  if (sameHours && closedSunday) {
    return `Pzt–Cmt: ${openDays[0].open} – ${openDays[0].close}`;
  }

  return openDays.map((h) => `${h.day}: ${h.open}–${h.close}`).join(" · ");
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

import type { AvailabilityBlock, AdminBarber } from "@/lib/api/admin";

export type BarberDayStatus = "available" | "closed" | "partial" | "vacation" | "inactive" | "salon_closed";

export interface BarberDayInfo {
  status: BarberDayStatus;
  rules: AvailabilityBlock[];
  label: string;
  detail?: string;
}

export function blocksActiveOnDate(blocks: AvailabilityBlock[], date: string): AvailabilityBlock[] {
  return blocks.filter((b) => {
    const end = b.endDate || b.date;
    return date >= b.date && date <= end;
  });
}

export function getSalonStatusForDate(
  date: string,
  blocks: AvailabilityBlock[]
): { closed: boolean; rule: AvailabilityBlock | null } {
  const dayBlocks = blocksActiveOnDate(blocks, date);
  const rule = dayBlocks.find((r) => !r.barberId && r.ruleType === "close_day") || null;
  return { closed: Boolean(rule), rule };
}

export function getBarberDayInfo(
  barber: AdminBarber,
  date: string,
  blocks: AvailabilityBlock[]
): BarberDayInfo {
  const dayBlocks = blocksActiveOnDate(blocks, date);
  const salonClosed = dayBlocks.some((r) => !r.barberId && r.ruleType === "close_day");

  if (salonClosed) {
    return {
      status: "salon_closed",
      rules: dayBlocks.filter((r) => !r.barberId),
      label: "Salon kapalı",
      detail: "Tüm salon o gün kapalı",
    };
  }

  if (barber.onVacation) {
    return { status: "vacation", rules: [], label: "Tatilde", detail: "Berber tatil modunda" };
  }

  if (!barber.available) {
    return { status: "inactive", rules: [], label: "Pasif", detail: "Berber panelde pasif" };
  }

  const barberRules = dayBlocks.filter((r) => r.barberId === barber.id);
  const fullDay = barberRules.find((r) => r.ruleType === "close_day");
  if (fullDay) {
    return {
      status: "closed",
      rules: barberRules,
      label: "Müsait değil",
      detail: fullDay.reason || "Tüm gün kapalı",
    };
  }

  const partial = barberRules.filter((r) => r.ruleType === "block");
  if (partial.length > 0) {
    const times = partial.map((r) => `${r.startTime}–${r.endTime}`).join(", ");
    return {
      status: "partial",
      rules: barberRules,
      label: "Kısmi kapalı",
      detail: times,
    };
  }

  return { status: "available", rules: [], label: "Müsait", detail: "Randevu alınabilir" };
}

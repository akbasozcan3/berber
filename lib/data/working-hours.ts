import { publicSettingsDefaults } from "./public-settings-defaults";

export type WorkingHourRow = {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
};

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"] as const;

function defaultRows(): WorkingHourRow[] {
  return publicSettingsDefaults.workingHours.map((row) => ({ ...row }));
}

export function parseWorkingHoursJson(raw: string | null | undefined): WorkingHourRow[] {
  if (!raw?.trim()) return defaultRows();
  try {
    const parsed = JSON.parse(raw) as WorkingHourRow[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultRows();
    return DAYS.map((day) => {
      const row = parsed.find((r) => r.day === day);
      if (!row) {
        return { day, open: "09:00", close: "22:00", closed: day === "Pazar" };
      }
      return {
        day,
        open: row.closed ? "" : row.open || "09:00",
        close: row.closed ? "" : row.close || "22:00",
        closed: Boolean(row.closed),
      };
    });
  } catch {
    return defaultRows();
  }
}

export function serializeWorkingHours(rows: WorkingHourRow[]): string {
  return JSON.stringify(
    rows.map((row) => ({
      day: row.day,
      open: row.closed ? "" : row.open,
      close: row.closed ? "" : row.close,
      ...(row.closed ? { closed: true } : {}),
    }))
  );
}

export function getPrimaryWorkingHours(rows: WorkingHourRow[]): { open: string; close: string } | null {
  const openDay = rows.find((row) => !row.closed && row.open && row.close);
  if (!openDay) return null;
  return { open: openDay.open, close: openDay.close };
}

export interface BreakPeriod {
  start: string;
  end: string;
}

export function parseBreakTimes(raw?: string | null): BreakPeriod[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is BreakPeriod =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as BreakPeriod).start === "string" &&
          typeof (item as BreakPeriod).end === "string"
      )
      .filter((item) => item.start < item.end);
  } catch {
    return [];
  }
}

export function serializeBreakTimes(periods: BreakPeriod[]): string {
  return JSON.stringify(periods);
}

/** Seed/default lunch break — removed so 13:00 slots stay bookable unless admin opts in. */
export function isLegacyDefaultLunchBreak(raw?: string | null): boolean {
  const periods = parseBreakTimes(raw);
  return periods.length === 1 && periods[0].start === "13:00" && periods[0].end === "14:00";
}

export const RULE_TYPE_LABELS: Record<string, string> = {
  block: "Saat kapalı",
  close_day: "Gün kapalı",
  hours_override: "Özel çalışma saati",
  early_close: "Erken kapanış",
  late_open: "Geç açılış",
  permanent: "Kalıcı kapalı",
};

export function formatAvailabilityRule(block: {
  ruleType: string;
  date: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  reason: string;
  barberId?: number | null;
}): string {
  const type = RULE_TYPE_LABELS[block.ruleType] || block.ruleType;
  const range =
    block.endDate && block.endDate !== block.date ? `${block.date} → ${block.endDate}` : block.date;
  const time =
    block.ruleType === "block" || (block.startTime !== "00:00" && block.endTime !== "23:59")
      ? ` · ${block.startTime}–${block.endTime}`
      : "";
  return `${type} · ${range}${time} · ${block.reason}`;
}

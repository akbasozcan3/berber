"use client";

import Toggle from "@/components/admin/ui/Toggle";
import Input from "@/components/admin/ui/Input";
import Button from "@/components/admin/ui/Button";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"] as const;

export type WorkingHourRow = {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
};

function defaultRows(): WorkingHourRow[] {
  return DAYS.map((day) => ({
    day,
    open: "09:00",
    close: "22:00",
    closed: day === "Pazar",
  }));
}

export function parseWorkingHoursJson(raw: string): WorkingHourRow[] {
  try {
    const parsed = JSON.parse(raw || "[]") as WorkingHourRow[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultRows();
    return DAYS.map((day) => {
      const row = parsed.find((r) => r.day === day);
      if (!row) return { day, open: "09:00", close: "22:00", closed: day === "Pazar" };
      return {
        day,
        open: row.open || "09:00",
        close: row.close || "22:00",
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

export default function WorkingHoursEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (json: string) => void;
}) {
  const rows = parseWorkingHoursJson(value);

  const updateRow = (index: number, patch: Partial<WorkingHourRow>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(serializeWorkingHours(next));
  };

  const applyWeekdayHours = (open: string, close: string) => {
    const next = rows.map((row) =>
      row.day === "Pazar" ? row : { ...row, open, close, closed: false }
    );
    onChange(serializeWorkingHours(next));
  };

  const weekdayOpen = rows.find((r) => r.day === "Pazartesi")?.open || "09:00";
  const weekdayClose = rows.find((r) => r.day === "Pazartesi")?.close || "22:00";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#71717A]">
        Salonun genel açılış/kapanış saatleri. Navbar üst şeridinde ve sitede görünür.
        Randevu saatleri için <strong className="text-[#A1A1AA]">Berberler</strong> sayfasındaki çalışma saatleri de kullanılır.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-white/[0.06] bg-[#0A0A0A]">
        <Input
          label="Hafta içi açılış"
          type="time"
          value={weekdayOpen}
          onChange={(e) => applyWeekdayHours(e.target.value, weekdayClose)}
        />
        <Input
          label="Hafta içi kapanış"
          type="time"
          value={weekdayClose}
          onChange={(e) => applyWeekdayHours(weekdayOpen, e.target.value)}
        />
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => applyWeekdayHours(weekdayOpen, weekdayClose)}
          >
            Pzt–Cmt uygula
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={row.day}
            className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_auto] gap-3 items-center p-3 rounded-xl border border-white/[0.06] bg-[#0A0A0A]"
          >
            <span className="text-sm font-medium text-[#F8F8F8]">{row.day}</span>
            <Input
              label="Açılış"
              type="time"
              value={row.open}
              disabled={row.closed}
              onChange={(e) => updateRow(index, { open: e.target.value })}
            />
            <Input
              label="Kapanış"
              type="time"
              value={row.close}
              disabled={row.closed}
              onChange={(e) => updateRow(index, { close: e.target.value })}
            />
            <Toggle
              label="Kapalı"
              checked={Boolean(row.closed)}
              onChange={(closed) => updateRow(index, { closed })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import Toggle from "@/components/admin/ui/Toggle";
import Button from "@/components/admin/ui/Button";
import TimeSelect from "@/components/admin/ui/TimeSelect";
import {
  parseWorkingHoursJson,
  serializeWorkingHours,
  type WorkingHourRow,
} from "@/lib/data/working-hours";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"] as const;

export type { WorkingHourRow };

export { parseWorkingHoursJson, serializeWorkingHours };

export default function WorkingHoursEditor({
  value,
  onChange,
  onSyncBarbers,
  syncingBarbers = false,
  interval = 60,
}: {
  value: string;
  onChange: (json: string) => void;
  onSyncBarbers?: () => void | Promise<void>;
  syncingBarbers?: boolean;
  interval?: unknown;
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
        Üst şeritteki saatler ve iletişim bölümleri buradan güncellenir. <strong className="text-[#A1A1AA]">Pazar günleri her zaman kapalıdır.</strong> Randevu slotları için
        aşağıdaki butonla berber saatlerini de eşitleyebilirsiniz.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-white/[0.06] bg-[#0A0A0A]">
        <TimeSelect
          label="Hafta içi açılış"
          value={weekdayOpen}
          interval={interval}
          onChange={(open) => applyWeekdayHours(open, weekdayClose)}
        />
        <TimeSelect
          label="Hafta içi kapanış"
          value={weekdayClose}
          interval={interval}
          onChange={(close) => applyWeekdayHours(weekdayOpen, close)}
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
            <TimeSelect
              label="Açılış"
              value={row.open}
              interval={interval}
              disabled={row.day === "Pazar" || row.closed}
              onChange={(open) => updateRow(index, { open })}
            />
            <TimeSelect
              label="Kapanış"
              value={row.close}
              interval={interval}
              disabled={row.day === "Pazar" || row.closed}
              onChange={(close) => updateRow(index, { close })}
            />
            <Toggle
              label="Kapalı"
              checked={row.day === "Pazar" ? true : Boolean(row.closed)}
              disabled={row.day === "Pazar"}
              onChange={(closed) => {
                if (row.day === "Pazar") return;
                updateRow(index, { closed });
              }}
            />
          </div>
        ))}
      </div>

      {onSyncBarbers ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={syncingBarbers}
          onClick={() => void onSyncBarbers()}
        >
          {syncingBarbers ? "Uygulanıyor..." : "Bu saatleri tüm berberlere uygula (randevu)"}
        </Button>
      ) : null}
    </div>
  );
}

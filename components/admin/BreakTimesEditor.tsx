"use client";

import Toggle from "@/components/admin/ui/Toggle";
import TimeSelect from "@/components/admin/ui/TimeSelect";
import { parseBreakTimes, serializeBreakTimes } from "@/lib/utils/break-times";

interface Props {
  value: string;
  onChange: (json: string) => void;
  interval?: unknown;
}

export default function BreakTimesEditor({ value, onChange, interval = 60 }: Props) {
  const periods = parseBreakTimes(value);
  const enabled = periods.length > 0;
  const period = periods[0] || { start: "13:00", end: "14:00" };

  const update = (nextEnabled: boolean, start = period.start, end = period.end) => {
    if (!nextEnabled) {
      onChange(serializeBreakTimes([]));
      return;
    }
    if (start >= end) return;
    onChange(serializeBreakTimes([{ start, end }]));
  };

  return (
    <div className="space-y-3">
      <Toggle
        label="Öğle arası randevu kapalı"
        description="Açıksa seçilen saat aralığında online randevu alınamaz."
        checked={enabled}
        onChange={(checked) => update(checked)}
      />
      {enabled && (
        <div className="grid grid-cols-2 gap-3 pl-1">
          <TimeSelect
            label="Başlangıç"
            value={period.start}
            interval={interval}
            onChange={(start) => update(true, start, period.end)}
          />
          <TimeSelect
            label="Bitiş"
            value={period.end}
            interval={interval}
            onChange={(end) => update(true, period.start, end)}
          />
        </div>
      )}
      <p className="text-xs text-[#52525B]">
        Kapalı tutmak için bu seçeneği kapatın — tüm çalışma saatleri randevuya açık kalır.
      </p>
    </div>
  );
}

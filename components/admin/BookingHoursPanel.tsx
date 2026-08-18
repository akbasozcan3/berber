"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Save } from "lucide-react";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import TimeSelect from "@/components/admin/ui/TimeSelect";
import Toggle from "@/components/admin/ui/Toggle";
import { adminApi } from "@/lib/api/admin";
import { normalizeAppointmentInterval } from "@/lib/utils/appointment-interval";
import {
  DEFAULT_BOOKING_END,
  DEFAULT_BOOKING_START,
  listCustomerSlotStarts,
  normalizeClock,
  salonCloseFromLastStart,
} from "@/lib/data/booking-hours";
import {
  parseWorkingHoursJson,
  serializeWorkingHours,
} from "@/lib/data/working-hours";

export default function BookingHoursPanel({
  onSaved,
}: {
  onSaved?: (patch: Record<string, string>) => void;
}) {
  const [firstHour, setFirstHour] = useState(DEFAULT_BOOKING_START);
  const [lastHour, setLastHour] = useState(DEFAULT_BOOKING_END);
  const [halfHours, setHalfHours] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const interval = halfHours ? 30 : 60;

  useEffect(() => {
    let cancelled = false;
    void adminApi.getSettings().then((settings) => {
      if (cancelled) return;
      setFirstHour(normalizeClock(settings.booking_hours_start, DEFAULT_BOOKING_START));
      setLastHour(normalizeClock(settings.booking_hours_end, DEFAULT_BOOKING_END));
      setHalfHours(normalizeAppointmentInterval(settings.appointment_interval) < 60);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const preview = useMemo(
    () => listCustomerSlotStarts(firstHour, lastHour, interval),
    [firstHour, lastHour, interval]
  );

  const invalid = firstHour >= lastHour || preview.length === 0;

  const handleSave = async () => {
    setError("");
    const slots = listCustomerSlotStarts(firstHour, lastHour, interval);
    if (slots.length === 0) {
      setError("Son saat, ilk saatten sonra olmalı.");
      return;
    }

    const start = slots[0];
    const end = slots[slots.length - 1];
    setFirstHour(start);
    setLastHour(end);

    const close = salonCloseFromLastStart(end);
    setSaving(true);
    try {
      const settings = await adminApi.getSettings();
      const workingHours = serializeWorkingHours(
        parseWorkingHoursJson(settings.working_hours || "").map((row) =>
          row.day === "Pazar"
            ? row
            : { ...row, open: start, close, closed: false }
        )
      );

      const patch = {
        appointment_interval: String(interval),
        booking_hours_start: start,
        booking_hours_end: end,
        working_hours: workingHours,
      };

      await adminApi.saveSettings(patch);

      const barberList = await adminApi.getBarbers();
      await Promise.all(
        barberList.map((barber) =>
          adminApi.updateBarber(barber.id, {
            workingStart: start,
            workingEnd: close,
          })
        )
      );

      onSaved?.(patch);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 4000);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-[#D4AF37]" />
        <h3 className="text-base font-semibold text-[#F8F8F8]">Müşteri randevu saatleri</h3>
      </div>
      <p className="text-sm text-[#71717A] mb-6">
        Burada seçtiğin saatler randevu sayfasında görünür. Dışındaki saatler müşteriye açılmaz; eski randevular silinmez.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <TimeSelect
          label="İlk randevu saati"
          value={firstHour}
          interval={interval}
          onChange={setFirstHour}
        />
        <TimeSelect
          label="Son randevu saati"
          value={lastHour}
          interval={interval}
          onChange={setLastHour}
        />
      </div>

      <div className="mb-5 p-3 rounded-xl border border-white/[0.06] bg-[#0A0A0A]">
        <Toggle
          label="Buçuklu saatler (10:30, 11:30)"
          description={
            halfHours
              ? "Açık — müşteri 10:30 gibi saatleri de görür."
              : "Kapalı — müşteri sadece tam saat görür (10:00, 11:00, 12:00)."
          }
          checked={halfHours}
          onChange={setHalfHours}
        />
      </div>

      <div className="mb-5">
        <p className="text-xs font-medium text-[#A1A1AA] mb-2">
          Müşterinin göreceği saatler ({preview.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {preview.map((time) => (
            <span
              key={time}
              className="px-2.5 py-1 rounded-lg border border-white/[0.08] text-xs text-[#F8F8F8] bg-[#0A0A0A]"
            >
              {time}
            </span>
          ))}
          {preview.length === 0 ? (
            <span className="text-xs text-red-400">Saat aralığı geçersiz.</span>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-red-400 mb-3">{error}</p> : null}
      {status === "saved" ? (
        <p className="text-xs text-green-400 mb-3">
          Kaydedildi. Randevu sayfasını yenileyin — müşteri artık sadece bu saatleri görür.
        </p>
      ) : null}

      <Button onClick={() => void handleSave()} disabled={!loaded || saving || invalid} className="w-full">
        <Save className="w-4 h-4" />
        {saving ? "Yayınlanıyor..." : "Kaydet ve sitede yayınla"}
      </Button>
    </Card>
  );
}

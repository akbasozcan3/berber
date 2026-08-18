"use client";

import { useEffect, useRef, useState } from "react";
import Toggle from "@/components/admin/ui/Toggle";
import { adminApi } from "@/lib/api/admin";
import { normalizeAppointmentInterval } from "@/lib/utils/appointment-interval";

export default function AppointmentIntervalField({
  value,
  onChange,
}: {
  value: string | number | undefined;
  onChange: (next: string) => void;
}) {
  const interval = normalizeAppointmentInterval(value);
  const showHalfHours = interval < 60;

  return (
    <div className="space-y-2">
      <Toggle
        label="Buçuklu saatler (10:30, 11:30)"
        description={
          showHalfHours
            ? "Şu an açık — randevu sayfasında :30 saatleri görünür. Kapatınca sadece 10:00, 11:00, 12:00 kalır."
            : "Kapalı — müşteri sadece tam saat görür (10:00, 11:00, 12:00)."
        }
        checked={showHalfHours}
        onChange={(checked) => onChange(checked ? "30" : "60")}
      />
    </div>
  );
}

/** Loads and saves the live setting — used on Takvim / Müsaitlik pages. */
export function AppointmentIntervalSetting({
  onChange,
}: {
  onChange?: (interval: number) => void;
}) {
  const [value, setValue] = useState("60");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const userTouched = useRef(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    void adminApi.getSettings().then((settings) => {
      if (cancelled || userTouched.current) return;
      const next = String(normalizeAppointmentInterval(settings.appointment_interval));
      setValue(next);
      onChangeRef.current?.(Number(next));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = async (next: string) => {
    userTouched.current = true;
    const normalized = String(normalizeAppointmentInterval(next));
    setValue(normalized);
    onChangeRef.current?.(Number(normalized));
    setStatus("saving");
    try {
      await adminApi.saveSettings({ appointment_interval: normalized });
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-2">
      <AppointmentIntervalField value={value} onChange={(next) => void handleChange(next)} />
      {status === "saving" ? (
        <p className="text-xs text-[#A1A1AA]">Kaydediliyor...</p>
      ) : null}
      {status === "saved" ? (
        <p className="text-xs text-green-400">
          {Number(value) < 60
            ? "Buçuklu saatler açıldı. Randevu sayfasını yenileyin."
            : "Buçuklar kapatıldı. Randevu sayfasını yenileyin — sadece tam saat görünür."}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-xs text-red-400">Kaydedilemedi. Tekrar deneyin.</p>
      ) : null}
    </div>
  );
}

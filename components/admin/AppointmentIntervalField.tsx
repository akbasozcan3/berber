"use client";

import { useEffect, useRef, useState } from "react";
import Select from "@/components/admin/ui/Select";
import { adminApi } from "@/lib/api/admin";
import {
  APPOINTMENT_INTERVAL_OPTIONS,
  normalizeAppointmentInterval,
} from "@/lib/utils/appointment-interval";

export default function AppointmentIntervalField({
  value,
  onChange,
}: {
  value: string | number | undefined;
  onChange: (next: string) => void;
}) {
  const interval = normalizeAppointmentInterval(value);

  return (
    <div className="space-y-2">
      <Select
        label="Randevu saati aralığı"
        value={String(interval)}
        options={APPOINTMENT_INTERVAL_OPTIONS}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-[#71717A]">
        Buçukları kapatmak için <span className="text-[#A1A1AA] font-medium">Sadece tam saatler</span> seçin.
        Müşteri randevu sayfası ve admin saat listeleri aynı ayarı kullanır.
      </p>
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

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    void adminApi.getSettings().then((settings) => {
      const next = String(normalizeAppointmentInterval(settings.appointment_interval));
      setValue(next);
      onChangeRef.current?.(Number(next));
    });
  }, []);

  const handleChange = async (next: string) => {
    const normalized = String(normalizeAppointmentInterval(next));
    setValue(normalized);
    onChangeRef.current?.(Number(normalized));
    setStatus("saving");
    try {
      await adminApi.saveSettings({ appointment_interval: normalized });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
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
        <p className="text-xs text-green-400">Saat aralığı güncellendi. Randevu sayfası yeni slotları gösterir.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-xs text-red-400">Kaydedilemedi. Tekrar deneyin.</p>
      ) : null}
    </div>
  );
}

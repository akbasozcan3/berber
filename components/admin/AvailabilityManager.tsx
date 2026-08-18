"use client";

import { useEffect, useState } from "react";
import { Ban, Clock, User } from "lucide-react";
import Button from "@/components/admin/ui/Button";
import Select from "@/components/admin/ui/Select";
import Card from "@/components/admin/ui/Card";
import TimeSelect from "@/components/admin/ui/TimeSelect";
import { AppointmentIntervalSetting } from "@/components/admin/AppointmentIntervalField";
import { adminApi, type AvailabilityBlock, type AdminBarber } from "@/lib/api/admin";
import { RULE_TYPE_LABELS } from "@/lib/admin/availability-labels";

const REASONS = [
  { value: "Yoğunum", label: "Yoğunum" },
  { value: "Müsait değilim", label: "Müsait değilim" },
  { value: "Mola", label: "Mola" },
  { value: "Özel randevu", label: "Özel randevu" },
  { value: "Kişisel izin", label: "Kişisel izin" },
  { value: "Kapalıyız", label: "Kapalıyız" },
];

interface Props {
  date: string;
  blocks: AvailabilityBlock[];
  onUpdate: () => void;
}

export default function AvailabilityManager({ date, blocks, onUpdate }: Props) {
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [slotInterval, setSlotInterval] = useState(60);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  const [reason, setReason] = useState("Müsait değilim");
  const [barberId, setBarberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void adminApi.getBarbers().then(setBarbers);
  }, []);

  const dayName = new Date(date).toLocaleDateString("tr-TR", { weekday: "long" });
  const isSunday = new Date(date).getDay() === 0;

  const handleAdd = async () => {
    setError("");
    if (startTime >= endTime) {
      setError("Bitiş saati başlangıçtan sonra olmalı.");
      return;
    }

    setLoading(true);
    try {
      await adminApi.createAvailability({
        date,
        endDate: date,
        startTime,
        endTime,
        reason,
        ruleType: "block",
        barberId: barberId ? Number(barberId) : null,
      });
      onUpdate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await adminApi.deleteAvailability(id);
    onUpdate();
  };

  const barberName = (id: number | null) =>
    id ? barbers.find((b) => b.id === id)?.name || `Berber #${id}` : "Tüm salon";

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <Ban className="w-4 h-4 text-[#D4AF37]" />
        <h3 className="text-sm font-semibold text-[#F8F8F8]">Müsait Değilim — Saat Kapat</h3>
      </div>

      <p className="text-xs text-[#71717A] mb-4">
        {dayName}, {new Date(date).toLocaleDateString("tr-TR")} — Belirli saatleri kapatın. Müşteri randevu
        sayfasında bu saatler otomatik görünmez.
      </p>

      <div className="mb-4 p-3 rounded-xl border border-white/[0.06] bg-[#0A0A0A]">
        <AppointmentIntervalSetting onChange={setSlotInterval} />
      </div>

      {isSunday && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          Pazar günleri salon kapalıdır.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <TimeSelect
          label="Başlangıç"
          value={startTime}
          interval={slotInterval}
          onChange={setStartTime}
        />
        <TimeSelect
          label="Bitiş"
          value={endTime}
          interval={slotInterval}
          onChange={setEndTime}
        />
        <Select
          label="Sebep"
          options={REASONS}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Select
          label="Kapsam"
          options={[
            { value: "", label: "Tüm salon" },
            ...barbers.map((b) => ({ value: String(b.id), label: b.name })),
          ]}
          value={barberId}
          onChange={(e) => setBarberId(e.target.value)}
        />
      </div>

      {error ? <p className="text-xs text-red-400 mb-3">{error}</p> : null}

      <Button onClick={handleAdd} disabled={loading || isSunday} className="w-full mb-5">
        {loading ? "Kaydediliyor..." : "Bu Saatleri Kapat"}
      </Button>

      <div className="space-y-2">
        {blocks.length === 0 ? (
          <p className="text-xs text-[#52525B]">Bu gün için kural yok — tüm saatler açık.</p>
        ) : (
          blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.06]"
            >
              <div className="flex items-start gap-3 min-w-0">
                <Clock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-[#F8F8F8] truncate">
                    {RULE_TYPE_LABELS[block.ruleType] || block.ruleType}
                    {block.ruleType === "block" || block.startTime !== "00:00"
                      ? ` · ${block.startTime}–${block.endTime}`
                      : ""}
                  </p>
                  <p className="text-xs text-[#71717A] truncate">{block.reason}</p>
                  <p className="text-[10px] text-[#52525B] flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3" />
                    {barberName(block.barberId)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => handleDelete(block.id)}>
                Kaldır
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

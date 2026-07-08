"use client";

import { useState } from "react";
import { Ban, Clock } from "lucide-react";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Select from "@/components/admin/ui/Select";
import Card from "@/components/admin/ui/Card";
import { adminApi, type AvailabilityBlock } from "@/lib/api/admin";

const REASONS = [
  { value: "Yoğunum", label: "Yoğunum" },
  { value: "Müsait değilim", label: "Müsait değilim" },
  { value: "Mola", label: "Mola" },
  { value: "Özel randevu", label: "Özel randevu" },
  { value: "Kapalıyız", label: "Kapalıyız" },
];

interface Props {
  date: string;
  blocks: AvailabilityBlock[];
  onUpdate: () => void;
}

export default function AvailabilityManager({ date, blocks, onUpdate }: Props) {
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  const [reason, setReason] = useState("Yoğunum");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await adminApi.createAvailability({ date, startTime, endTime, reason, barberId: null });
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await adminApi.deleteAvailability(id);
    onUpdate();
  };

  const dayName = new Date(date).toLocaleDateString("tr-TR", { weekday: "long" });
  const isSunday = new Date(date).getDay() === 0;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Ban className="w-4 h-4 text-[#D4AF37]" />
        <h3 className="text-sm font-semibold text-[#F8F8F8]">Müsaitlik Yönetimi</h3>
      </div>

      {isSunday && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          Pazar günleri salon kapalıdır. Randevu alınamaz.
        </div>
      )}

      <p className="text-xs text-[#71717A] mb-4">
        {dayName}, {new Date(date).toLocaleDateString("tr-TR")} — Bu saatleri müsait değil olarak işaretleyin.
        Müşteri randevu sayfasında otomatik kapanır.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Input label="Başlangıç" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <Input label="Bitiş" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <Select label="Sebep" options={REASONS} value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex items-end">
          <Button onClick={handleAdd} disabled={loading || isSunday} className="w-full">
            {loading ? "..." : "Ekle"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {blocks.length === 0 ? (
          <p className="text-xs text-[#52525B]">Bu gün için blok yok — tüm saatler açık.</p>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-sm text-[#F8F8F8]">{block.startTime} — {block.endTime}</p>
                  <p className="text-xs text-[#71717A]">{block.reason}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(block.id)}>Kaldır</Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

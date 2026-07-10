"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Save, Star, Trash2 } from "lucide-react";
import Input from "@/components/admin/ui/Input";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Avatar from "@/components/admin/ui/Avatar";
import Toggle from "@/components/admin/ui/Toggle";
import Badge from "@/components/admin/ui/Badge";
import Button from "@/components/admin/ui/Button";
import ImageUpload from "@/components/admin/ui/ImageUpload";
import { adminApi, type AdminBarber } from "@/lib/api/admin";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [edits, setEdits] = useState<Record<number, Partial<AdminBarber>>>({});
  const [newBarber, setNewBarber] = useState({
    name: "",
    slug: "",
    position: "Berber",
    specialty: "",
    workingStart: "09:00",
    workingEnd: "22:00",
    performance: "95",
  });

  useEffect(() => {
    adminApi.getBarbers().then((list) => {
      setBarbers(list);
      setEdits(
        Object.fromEntries(
          list.map((b) => [
            b.id,
            {
              name: b.name,
              position: b.position,
              specialty: b.specialty || "",
              workingStart: b.workingStart,
              workingEnd: b.workingEnd,
              performance: b.performance,
            },
          ])
        )
      );
    });
  }, []);

  const toggle = async (id: number, field: "available" | "onVacation", value: boolean) => {
    await adminApi.updateBarber(id, { [field]: value });
    adminApi.getBarbers().then(setBarbers);
  };

  const addBarber = async () => {
    const name = newBarber.name.trim();
    const slug = (newBarber.slug.trim() || slugifyName(name)).toLowerCase();
    if (!name) {
      window.alert("Berber adı gerekli.");
      return;
    }
    if (!slug) {
      window.alert("Geçerli bir berber adı girin.");
      return;
    }
    await adminApi.createBarber({
      name,
      slug,
      position: newBarber.position,
      specialty: newBarber.specialty,
      workingStart: newBarber.workingStart,
      workingEnd: newBarber.workingEnd,
      performance: Number(newBarber.performance || 95),
      workingDays: "1,2,3,4,5,6",
      available: true,
      onVacation: false,
    });
    setNewBarber({
      name: "",
      slug: "",
      position: "Berber",
      specialty: "",
      workingStart: "09:00",
      workingEnd: "22:00",
      performance: "95",
    });
    adminApi.getBarbers().then(setBarbers);
  };

  const saveBarber = async (id: number) => {
    const draft = edits[id];
    if (!draft?.name?.trim()) return;
    setSavingId(id);
    try {
      await adminApi.updateBarber(id, {
        name: draft.name.trim(),
        position: draft.position,
        specialty: draft.specialty || null,
        workingStart: draft.workingStart,
        workingEnd: draft.workingEnd,
        performance: Number(draft.performance || 95),
      });
      const list = await adminApi.getBarbers();
      setBarbers(list);
    } finally {
      setSavingId(null);
    }
  };

  const removeBarber = async (id: number) => {
    const ok = window.confirm("Bu berberi silmek istediğinizden emin misiniz?");
    if (!ok) return;
    try {
      await adminApi.deleteBarber(id);
      const list = await adminApi.getBarbers();
      setBarbers(list);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Berber silinemedi.");
    }
  };

  return (
    <div>
      <PageHeader title="Berberler" description="Ekibinizi yönetin" />
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="h-11 bg-[#0A0A0A] border border-white/[0.06] rounded-2xl px-4 text-sm md:col-span-2"
            placeholder="Berber Adı (ör. Mehmet Abi)"
            value={newBarber.name}
            onChange={(e) => setNewBarber((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="h-11 bg-[#0A0A0A] border border-white/[0.06] rounded-2xl px-4 text-sm"
            placeholder="Pozisyon"
            value={newBarber.position}
            onChange={(e) => setNewBarber((p) => ({ ...p, position: e.target.value }))}
          />
          <input
            className="h-11 bg-[#0A0A0A] border border-white/[0.06] rounded-2xl px-4 text-sm"
            placeholder="Uzmanlık"
            value={newBarber.specialty}
            onChange={(e) => setNewBarber((p) => ({ ...p, specialty: e.target.value }))}
          />
          <input
            className="h-11 bg-[#0A0A0A] border border-white/[0.06] rounded-2xl px-4 text-sm"
            placeholder="Başlangıç"
            value={newBarber.workingStart}
            onChange={(e) => setNewBarber((p) => ({ ...p, workingStart: e.target.value }))}
          />
          <input
            className="h-11 bg-[#0A0A0A] border border-white/[0.06] rounded-2xl px-4 text-sm"
            placeholder="Bitiş"
            value={newBarber.workingEnd}
            onChange={(e) => setNewBarber((p) => ({ ...p, workingEnd: e.target.value }))}
          />
          <input
            className="h-11 bg-[#0A0A0A] border border-white/[0.06] rounded-2xl px-4 text-sm"
            placeholder="Performans"
            value={newBarber.performance}
            onChange={(e) => setNewBarber((p) => ({ ...p, performance: e.target.value }))}
          />
          <Button onClick={addBarber}>
            <Plus className="w-4 h-4" />
            Berber Ekle
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {barbers.map((barber, i) => (
          <motion.div key={barber.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card hover>
              <div className="flex items-start gap-5">
                <Avatar name={barber.name} src={barber.avatar || undefined} size="xl" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F8F8F8]">{barber.name}</h3>
                  <p className="text-sm text-[#D4AF37]">{barber.position}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                    <span className="text-sm font-medium">{barber.performance}%</span>
                  </div>
                </div>
                {barber.onVacation && <Badge label="Tatilde" variant="outline" />}
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-[#71717A]">
                <Clock className="w-4 h-4" />
                {barber.workingStart} — {barber.workingEnd}
              </div>
              {barber.specialty && <p className="text-xs text-[#71717A] mt-2">{barber.specialty}</p>}
              <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Input
                    label="Ad"
                    value={edits[barber.id]?.name ?? barber.name}
                    onChange={(e) =>
                      setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], name: e.target.value } }))
                    }
                  />
                  <Input
                    label="Pozisyon"
                    value={edits[barber.id]?.position ?? barber.position}
                    onChange={(e) =>
                      setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], position: e.target.value } }))
                    }
                  />
                  <Input
                    label="Uzmanlık"
                    value={edits[barber.id]?.specialty ?? barber.specialty ?? ""}
                    onChange={(e) =>
                      setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], specialty: e.target.value } }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Başlangıç"
                      value={edits[barber.id]?.workingStart ?? barber.workingStart}
                      onChange={(e) =>
                        setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], workingStart: e.target.value } }))
                      }
                    />
                    <Input
                      label="Bitiş"
                      value={edits[barber.id]?.workingEnd ?? barber.workingEnd}
                      onChange={(e) =>
                        setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], workingEnd: e.target.value } }))
                      }
                    />
                  </div>
                  <Input
                    label="Performans (%)"
                    type="number"
                    value={String(edits[barber.id]?.performance ?? barber.performance)}
                    onChange={(e) =>
                      setEdits((p) => ({
                        ...p,
                        [barber.id]: { ...p[barber.id], performance: Number(e.target.value) },
                      }))
                    }
                  />
                  <Button onClick={() => saveBarber(barber.id)} disabled={savingId === barber.id}>
                    <Save className="w-4 h-4" />
                    {savingId === barber.id ? "Kaydediliyor..." : "Bilgileri Kaydet"}
                  </Button>
                </div>
                <Toggle label="Müsait" checked={barber.available} onChange={(v) => toggle(barber.id, "available", v)} disabled={barber.onVacation} />
                <Toggle label="Tatil Modu" checked={barber.onVacation} onChange={(v) => toggle(barber.id, "onVacation", v)} />
                <ImageUpload
                  label="Berber Görseli"
                  folder="barbers"
                  value={barber.avatar || ""}
                  onChange={async (url) => {
                    setSavingId(barber.id);
                    await adminApi.updateBarber(barber.id, { avatar: url });
                    const list = await adminApi.getBarbers();
                    setBarbers(list);
                    setSavingId(null);
                  }}
                  previewHeightClass="h-36"
                />
                <Button variant="danger" onClick={() => removeBarber(barber.id)}>
                  <Trash2 className="w-4 h-4" />
                  Berberi Sil
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

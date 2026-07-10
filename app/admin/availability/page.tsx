"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Ban, Calendar, Clock, RotateCcw, CheckCircle } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Select from "@/components/admin/ui/Select";
import { adminApi, type AvailabilityBlock, type AdminBarber } from "@/lib/api/admin";
import { formatDate } from "@/lib/admin/utils";
import { cn } from "@/lib/admin/cn";
import { formatAvailabilityRule, RULE_TYPE_LABELS } from "@/lib/admin/availability-labels";
import { toLocalIsoDate, formatIsoDateTr } from "@/lib/utils/format";

const REASONS = [
  { value: "Tatil", label: "Tatil" },
  { value: "Bayram", label: "Bayram" },
  { value: "Renovasyon", label: "Renovasyon" },
  { value: "Özel Etkinlik", label: "Özel Etkinlik" },
  { value: "Acil Durum", label: "Acil Durum" },
  { value: "Kişisel İzin", label: "Kişisel İzin" },
  { value: "Diğer", label: "Diğer" },
];

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/20 border-green-500/30 text-green-400",
  closed: "bg-red-500/20 border-red-500/30 text-red-400",
  limited: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
  holiday: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  past: "bg-zinc-500/20 border-zinc-500/30 text-zinc-500",
};

export default function AvailabilityPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [audit, setAudit] = useState<{ id: number; adminName: string; action: string; reason: string | null; createdAt: string }[]>([]);
  const [monthStatuses, setMonthStatuses] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(() => {
    const today = toLocalIsoDate();
    return {
    startDate: today,
    endDate: today,
    reason: "Tatil",
    barberId: "",
    ruleType: "close_day",
    customOpen: "09:00",
    customClose: "20:00",
    earlyClose: "16:00",
    lateOpen: "13:00",
    blockStart: "15:00",
    blockEnd: "16:00",
  };
  });

  const load = useCallback(async () => {
    const [b, bar, a, m] = await Promise.all([
      adminApi.getAvailability(),
      adminApi.getBarbers(),
      fetch("/api/v1/admin/availability?audit=true", { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/v1/admin/availability?month=${currentMonth}`, { credentials: "include" }).then((r) => r.json()),
    ]);
    setBlocks(b);
    setBarbers(bar);
    setAudit(a);
    setMonthStatuses(m);
  }, [currentMonth]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const confirmAction = (message: string, body: Record<string, unknown>) => {
    if (!window.confirm(message)) return;
    void postAction(body);
  };

  const postAction = async (body: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/availability", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || "Müsaitlik güncellendi.", true);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Hata oluştu", false);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "Bugünü Kapat", scope: "today" as const, description: "Bugün randevu alınamaz" },
    { label: "Yarını Kapat", scope: "tomorrow" as const, description: "Yarın randevu alınamaz" },
    { label: "Bu Haftayı Kapat", scope: "this_week" as const, description: "Bu hafta sonuna kadar" },
    { label: "Bu Ayı Kapat", scope: "this_month" as const, description: "Ay sonuna kadar" },
  ];

  const tomorrowIso = toLocalIsoDate(new Date(Date.now() + 86400000));
  const tomorrowLabel = formatIsoDateTr(tomorrowIso);

  const barberName = (id: number | null) =>
    id ? barbers.find((b) => b.id === id)?.name || `Berber #${id}` : "Tüm salon";

  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <div>
      <PageHeader
        title="Müsaitlik Yönetimi"
        description="Hangi gün veya saatte müsait olmadığınızı buradan ayarlayın — randevu sayfası anında güncellenir"
      />

      <Card className="mb-6 border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/[0.08] to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-1">En sık kullanılan</p>
            <h3 className="text-lg font-semibold text-[#F8F8F8]">Yarın müsait değil misiniz?</h3>
            <p className="text-sm text-[#71717A] mt-1">
              <span className="text-[#A1A1AA]">{tomorrowLabel}</span> — tek tıkla tüm günü kapatın. Müşteriler o gün randevu alamaz.
            </p>
          </div>
          <Button
            size="lg"
            disabled={loading}
            className="shrink-0 w-full md:w-auto"
            onClick={() =>
              confirmAction(
                `${tomorrowLabel} tamamen kapatılacak. Müşteriler yarın randevu alamaz. Emin misiniz?`,
                { scope: "tomorrow", ruleType: "close_day", reason: "Müsait değilim" }
              )
            }
          >
            Yarını Kapat
          </Button>
        </div>
      </Card>

      <Card className="mb-6 border-[#D4AF37]/20 bg-[#D4AF37]/[0.04]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-[#F8F8F8] mb-1">Tüm gün kapalı (tatil, izin)</p>
            <p className="text-xs text-[#71717A]">
              Yukarıdaki <strong className="text-[#A1A1AA]">Yarını Kapat</strong> veya sağdaki hızlı işlemler.
              Belirli bir gün için takvimden gün seç → <strong className="text-[#A1A1AA]">Gün(ler)i Tamamen Kapat</strong>.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#F8F8F8] mb-1">Sadece birkaç saat kapalı</p>
            <p className="text-xs text-[#71717A]">
              Örn. 14:00–16:00 müsait değilim → takvimden gün seç → <strong className="text-[#A1A1AA]">Saat Aralığı Kapat</strong>
            </p>
          </div>
        </div>
      </Card>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border",
            toast.ok
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
          <CheckCircle size={18} /> {toast.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2">
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#D4AF37]" /> Takvim</h3>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => {
              const d = new Date(year, month - 2, 1);
              setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
            }}>←</Button>
            <span className="text-sm font-medium text-[#F8F8F8]">{new Date(year, month - 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}</span>
            <Button variant="ghost" size="sm" onClick={() => {
              const d = new Date(year, month, 1);
              setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
            }}>→</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
              <div key={d} className="text-center text-[10px] text-[#71717A] font-bold py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const status = monthStatuses[dateStr] || "available";
              return (
                <button key={day} onClick={() => setForm((f) => ({ ...f, startDate: dateStr, endDate: dateStr }))}
                  className={cn("aspect-square rounded-lg border text-xs font-medium transition-all hover:scale-105", STATUS_COLORS[status] || STATUS_COLORS.available)}>
                  {day}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-[10px]">
            {Object.entries({ "Müsait": "available", "Kapalı": "closed", "Kısıtlı": "limited", "Tatil": "holiday", "Geçmiş": "past" }).map(([label, key]) => (
              <span key={key} className={cn("px-2 py-1 rounded border", STATUS_COLORS[key])}>{label}</span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-2 flex items-center gap-2"><Ban className="w-4 h-4 text-[#D4AF37]" /> Hızlı İşlemler</h3>
          <p className="text-xs text-[#71717A] mb-4">Tek tıkla gün veya dönem kapatın</p>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Button key={a.scope} variant="outline" className="w-full justify-start h-auto py-3 flex-col items-start gap-0.5" disabled={loading}
                onClick={() => confirmAction(`${a.label} — ${a.description}. Emin misiniz?`, { scope: a.scope, ruleType: "close_day", reason: "Kapalı" })}>
                <span>{a.label}</span>
                <span className="text-[10px] font-normal text-[#71717A]">{a.description}</span>
              </Button>
            ))}
            <Button variant="outline" className="w-full justify-start text-green-400 border-green-500/20" disabled={loading}
              onClick={() => confirmAction("Tüm kapalı gün ve saat kuralları kaldırılacak. Emin misiniz?", { action: "open_all" })}>
              <RotateCcw className="w-4 h-4 mr-2" /> Her Şeyi Aç
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" /> Saat Aralığı Kapat
          </h3>
          <p className="text-xs text-[#71717A] mb-4">
            Sadece belirli saatleri kapatır (ör. öğle molası, özel iş). Takvimden gün seçin.
            {form.startDate ? (
              <span className="block mt-1 text-[#D4AF37]">Seçili gün: {formatDate(form.startDate)}</span>
            ) : null}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Başlangıç" type="time" value={form.blockStart} onChange={(e) => setForm({ ...form, blockStart: e.target.value })} />
            <Input label="Bitiş" type="time" value={form.blockEnd} onChange={(e) => setForm({ ...form, blockEnd: e.target.value })} />
          </div>
          <Select label="Sebep" options={REASONS} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mb-3" />
          <Select label="Kapsam" options={[{ value: "", label: "Tüm Salon" }, ...barbers.map((b) => ({ value: String(b.id), label: b.name }))]} value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value })} className="mb-4" />
          <Button
            disabled={loading || !form.startDate || form.blockStart >= form.blockEnd}
            onClick={() =>
              postAction({
                ruleType: "block",
                date: form.startDate,
                endDate: form.startDate,
                startTime: form.blockStart,
                endTime: form.blockEnd,
                reason: form.reason,
                barberId: form.barberId ? Number(form.barberId) : null,
              })
            }
            className="w-full"
          >
            Bu Saatleri Kapat
          </Button>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Tüm Gün / Tarih Aralığı Kapat</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Başlangıç" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="Bitiş" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <Select label="Sebep" options={REASONS} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mb-3" />
          <Select label="Kapsam" options={[{ value: "", label: "Tüm Salon" }, ...barbers.map((b) => ({ value: String(b.id), label: b.name }))]} value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value })} className="mb-4" />
          <Button disabled={loading || !form.startDate} onClick={() => postAction({
            ruleType: "close_day", date: form.startDate, endDate: form.endDate || form.startDate,
            reason: form.reason, barberId: form.barberId ? Number(form.barberId) : null,
          })} className="w-full">Gün(ler)i Tamamen Kapat</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-[#D4AF37]" /> Saat Ayarları</h3>
          <p className="text-xs text-[#71717A] mb-4">
            Önce takvimden bir gün seçin (varsayılan: bugün). Genel salon saatleri için{" "}
            <strong className="text-[#A1A1AA]">Ayarlar → Salon Çalışma Saatleri</strong> kullanın.
            {form.startDate ? (
              <span className="block mt-1 text-[#D4AF37]">Seçili gün: {formatDate(form.startDate)}</span>
            ) : (
              <span className="block mt-1 text-red-400">Saat uygulamak için takvimden gün seçin.</span>
            )}
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#71717A] mb-2">Çalışma Saati Değişikliği (seçili gün)</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Açılış" type="time" value={form.customOpen} onChange={(e) => setForm({ ...form, customOpen: e.target.value })} />
                <Input label="Kapanış" type="time" value={form.customClose} onChange={(e) => setForm({ ...form, customClose: e.target.value })} />
              </div>
              <Button variant="outline" className="w-full mt-2" disabled={loading || !form.startDate}
                onClick={() => postAction({ ruleType: "hours_override", date: form.startDate, endDate: form.startDate, customOpen: form.customOpen, customClose: form.customClose, reason: "Özel Saatler" })}>
                Saatleri Uygula
              </Button>
            </div>
            <div>
              <p className="text-xs text-[#71717A] mb-2">Erken Kapanış</p>
              <Input label="Kapanış Saati" type="time" value={form.earlyClose} onChange={(e) => setForm({ ...form, earlyClose: e.target.value })} />
              <Button variant="outline" className="w-full mt-2" disabled={loading || !form.startDate}
                onClick={() => postAction({ ruleType: "early_close", date: form.startDate, endTime: form.earlyClose, reason: "Erken Kapanış" })}>
                Erken Kapanış Uygula
              </Button>
            </div>
            <div>
              <p className="text-xs text-[#71717A] mb-2">Geç Açılış</p>
              <Input label="Açılış Saati" type="time" value={form.lateOpen} onChange={(e) => setForm({ ...form, lateOpen: e.target.value })} />
              <Button variant="outline" className="w-full mt-2" disabled={loading || !form.startDate}
                onClick={() => postAction({ ruleType: "late_open", date: form.startDate, startTime: form.lateOpen, reason: "Geç Açılış" })}>
                Geç Açılış Uygula
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Aktif Kurallar ({blocks.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.06]">
                <div className="min-w-0">
                  <p className="text-sm text-[#F8F8F8] truncate">{formatAvailabilityRule(b)}</p>
                  <p className="text-xs text-[#71717A]">
                    {RULE_TYPE_LABELS[b.ruleType] || b.ruleType}
                    {b.barberId ? ` · ${barberName(b.barberId)}` : " · Tüm salon"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={async () => { await adminApi.deleteAvailability(b.id); load(); }}>Kaldır</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Denetim Günlüğü</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {audit.map((a) => (
              <div key={a.id} className="p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.06]">
                <p className="text-sm text-[#F8F8F8]">{a.action}</p>
                <p className="text-xs text-[#71717A]">{a.adminName} · {formatDate(a.createdAt)} {a.reason ? `· ${a.reason}` : ""}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

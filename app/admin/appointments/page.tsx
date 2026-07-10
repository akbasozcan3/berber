"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, Trash2, X } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import Card from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";
import SearchInput from "@/components/admin/ui/SearchInput";
import Tabs from "@/components/admin/ui/Tabs";
import Pagination from "@/components/admin/ui/Pagination";
import Avatar from "@/components/admin/ui/Avatar";
import { adminApi, type AdminAppointment } from "@/lib/api/admin";
import { formatCurrency, formatDate } from "@/lib/admin/utils";
import { toLocalIsoDate } from "@/lib/utils/format";
import { cn } from "@/lib/admin/cn";

const filterTabs = [
  { id: "all", label: "Tümü" },
  { id: "today", label: "Bugün" },
  { id: "tomorrow", label: "Yarın" },
  { id: "pending", label: "Bekleyen" },
  { id: "completed", label: "Tamamlanan" },
  { id: "cancelled", label: "İptal" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const load = useCallback(() => {
    adminApi.getAppointments().then(setAppointments);
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const today = toLocalIsoDate();
  const tomorrow = toLocalIsoDate(new Date(Date.now() + 86400000));

  useEffect(() => {
    setPage(1);
  }, [activeFilter, search]);

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.customerName.toLowerCase().includes(search.toLowerCase()) ||
      apt.phone.includes(search) ||
      apt.serviceName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    switch (activeFilter) {
      case "today": return apt.date === today;
      case "tomorrow": return apt.date === tomorrow;
      case "pending": return apt.status === "pending";
      case "completed": return apt.status === "completed";
      case "cancelled": return apt.status === "cancelled";
      default: return true;
    }
  });

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (id: number, status: string, customerName?: string) => {
    if (status === "cancelled") {
      const ok = window.confirm(
        `${customerName || "Bu müşteri"} randevusunu iptal etmek istiyor musunuz?`
      );
      if (!ok) return;
    }
    try {
      await adminApi.updateAppointment(id, status);
      showToast(status === "cancelled" ? "Randevu iptal edildi." : "Randevu güncellendi.", true);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Güncellenemedi.", false);
    }
  };

  const clearAllAppointments = async () => {
    const confirmed = window.confirm(
      "Tüm randevu kayıtları kalıcı olarak silinecek. Müşteri ve bildirim kayıtları korunur. Emin misiniz?"
    );
    if (!confirmed) return;
    await adminApi.clearAppointments();
    load();
  };

  const buildWhatsappLink = (apt: AdminAppointment) => {
    const firstName = apt.customerName.trim().split(" ")[0] || apt.customerName;
    const normalizedPhone = apt.phone.replace(/\D/g, "").replace(/^0/, "90");
    const text =
      `Merhaba ${firstName},\n` +
      `${formatDate(apt.date)} ${apt.time} randevunuz iptal edilmiştir.\n` +
      "Yeni randevu için bizimle iletişime geçebilirsiniz.";
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div>
      <PageHeader
        title="Randevular"
        description={`${appointments.length} toplam randevu`}
        actions={
          <Button variant="danger" onClick={clearAllAppointments}>
            <Trash2 className="w-4 h-4" />
            Tüm Randevuları Sil
          </Button>
        }
      />

      {toast && (
        <div
          className={cn(
            "mb-4 p-3 rounded-xl text-sm border",
            toast.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          {toast.text}
        </div>
      )}

      <Card padding="sm" className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2">
          <Tabs tabs={filterTabs} activeTab={activeFilter} onChange={setActiveFilter} />
          <SearchInput value={search} onChange={setSearch} placeholder="Ara..." className="w-full lg:w-72" />
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Müşteri", "Telefon", "Hizmet", "Berber", "Tarih", "Saat", "Durum", "Fiyat", "İşlem"].map((col) => (
                  <th key={col} className="text-left text-xs font-medium text-[#71717A] uppercase px-6 py-4">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-[#71717A]">
                    Bu filtrede randevu bulunamadı.
                  </td>
                </tr>
              ) : (
                paginated.map((apt, i) => (
                <motion.tr key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={apt.customerName} size="sm" />
                      <span className="text-sm font-medium text-[#F8F8F8]">{apt.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#A1A1AA]">{apt.phone}</td>
                  <td className="px-6 py-4 text-sm text-[#F8F8F8]">{apt.serviceName}</td>
                  <td className="px-6 py-4 text-sm text-[#A1A1AA]">{apt.barberName}</td>
                  <td className="px-6 py-4 text-sm text-[#A1A1AA]">{formatDate(apt.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#D4AF37]">{apt.time}</td>
                  <td className="px-6 py-4"><Badge status={apt.status as "confirmed" | "pending" | "completed" | "cancelled"} /></td>
                  <td className="px-6 py-4 text-sm font-medium text-[#F8F8F8]">{formatCurrency(apt.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {apt.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => updateStatus(apt.id, "confirmed")} title="Onayla"><Check className="w-4 h-4 text-green-400" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => updateStatus(apt.id, "cancelled", apt.customerName)} title="İptal"><X className="w-4 h-4 text-red-400" /></Button>
                        </>
                      )}
                      {apt.status === "confirmed" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => updateStatus(apt.id, "completed")} title="Tamamla"><Check className="w-4 h-4 text-blue-400" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => updateStatus(apt.id, "cancelled", apt.customerName)} title="İptal"><X className="w-4 h-4 text-red-400" /></Button>
                        </>
                      )}
                      {apt.status === "cancelled" && (
                        <a
                          href={buildWhatsappLink(apt)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/[0.06]"
                          title="WhatsApp'tan Bildir"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/[0.06]">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}

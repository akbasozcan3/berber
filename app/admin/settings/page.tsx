"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Send, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Toggle from "@/components/admin/ui/Toggle";
import ImageUpload from "@/components/admin/ui/ImageUpload";
import WorkingHoursEditor from "@/components/admin/WorkingHoursEditor";
import { adminApi } from "@/lib/api/admin";
import { getPrimaryWorkingHours, parseWorkingHoursJson, serializeWorkingHours } from "@/lib/data/working-hours";
import { normalizePhoneStorage } from "@/lib/utils/format";
import { cn } from "@/lib/admin/cn";

interface TelegramLog {
  id: number;
  status: string;
  chatId: string;
  retryCount: number;
  createdAt: string;
  response?: string;
}

interface TelegramStatus {
  enabled: boolean;
  connected: boolean;
  ready: boolean;
  recipientName: string;
  lastTestAt: string | null;
  botUsername: string | null;
}

function formatTestDate(iso: string | null): string {
  if (!iso) return "Henüz test edilmedi";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<TelegramLog[]>([]);
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [syncingBarbers, setSyncingBarbers] = useState(false);

  const loadTelegram = useCallback(() => {
    fetch("/api/v1/admin/telegram", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setStatus(data.status || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    adminApi.getSettings().then(setSettings);
    loadTelegram();
  }, [loadTelegram]);

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    const payload = { ...settings };
    if (payload.phone) payload.phone = normalizePhoneStorage(payload.phone);
    if (!payload.working_hours?.trim()) {
      payload.working_hours = serializeWorkingHours(parseWorkingHoursJson(""));
    }
    await adminApi.saveSettings(payload);
    setSettings(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadTelegram();
  };

  const syncBarberHours = async () => {
    const hours = getPrimaryWorkingHours(parseWorkingHoursJson(settings.working_hours || ""));
    if (!hours) {
      showToast(false, "Önce geçerli çalışma saatleri girin.");
      return;
    }
    setSyncingBarbers(true);
    try {
      const barberList = await adminApi.getBarbers();
      await Promise.all(
        barberList.map((barber) =>
          adminApi.updateBarber(barber.id, {
            workingStart: hours.open,
            workingEnd: hours.close,
          })
        )
      );
      showToast(true, "Berber randevu saatleri güncellendi.");
    } catch {
      showToast(false, "Berber saatleri güncellenemedi.");
    } finally {
      setSyncingBarbers(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/v1/admin/telegram", { method: "POST", credentials: "include" });
      const data = await res.json();
      showToast(
        res.ok,
        res.ok ? "Test bildirimi gönderildi!" : data.error || "Test başarısız"
      );
      if (data.status) setStatus(data.status);
      loadTelegram();
    } catch {
      showToast(false, "Bağlantı hatası");
    } finally {
      setTesting(false);
    }
  };

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const telegramEnabled = settings.notifications_telegram !== "false";
  const recipientName = settings.telegram_recipient_name || status?.recipientName || "Mehmet Abi";
  const botConnected = status?.connected ?? false;

  return (
    <div>
      {toast && (
        <div
          className={cn(
            "fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg",
            toast.ok
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      <PageHeader
        title="Ayarlar"
        description="İşletme ve bildirim ayarları"
        actions={
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            {saved ? "Kaydedildi!" : "Kaydet"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Üst Şerit & İletişim</h3>
          <p className="text-xs text-[#71717A] mb-4">
            Telefon, kısa konum ve çalışma saatleri sitenin üst şeridinde, footer&apos;da ve iletişim sayfasında görünür.
          </p>
          <div className="space-y-4">
            <Input label="Telefon" value={settings.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="0532 710 43 55" />
            <Input label="Kısa Konum (üst şerit)" value={settings.location_short || ""} onChange={(e) => set("location_short", e.target.value)} placeholder="Taşdelen, Çekmeköy / İstanbul" />
            <Input label="Tam Adres (iletişim / harita)" value={settings.address || ""} onChange={(e) => set("address", e.target.value)} />
            <Input label="Google Maps Linki" value={settings.google_maps || ""} onChange={(e) => set("google_maps", e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">İşletme Bilgileri</h3>
          <div className="space-y-4">
            <Input label="İşletme Adı" value={settings.business_name || ""} onChange={(e) => set("business_name", e.target.value)} />
            <Input label="E-posta" value={settings.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} />
            <Input label="Instagram" value={settings.instagram || ""} onChange={(e) => set("instagram", e.target.value)} />
            <Input label="İletişim Metni" value={settings.contact_intro || ""} onChange={(e) => set("contact_intro", e.target.value)} placeholder="Bize Ulaşın açıklaması" />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Marka Görselleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ImageUpload
              label="Logo"
              folder="branding"
              value={settings.logo_url || ""}
              onChange={(url) => set("logo_url", url)}
              previewHeightClass="h-28"
            />
            <ImageUpload
              label="Favicon"
              folder="branding"
              value={settings.favicon_url || ""}
              onChange={(url) => set("favicon_url", url)}
              previewHeightClass="h-28"
            />
          </div>
          <p className="text-xs text-[#52525B] mt-4">
            Yükleme sonrası site otomatik güncellenir.
          </p>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Bildirimler</h3>

          <div className="space-y-6">
            <Toggle
              label="Telegram Bildirimleri"
              checked={telegramEnabled}
              onChange={(v) => set("notifications_telegram", String(v))}
            />

            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] divide-y divide-white/[0.06]">
              <InfoRow label="Bot Durumu">
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className={cn("w-2 h-2 rounded-full", botConnected ? "bg-green-400" : "bg-red-400")} />
                  <span className={botConnected ? "text-green-400" : "text-red-400"}>
                    {botConnected ? "Bağlı" : "Bağlı Değil"}
                  </span>
                  {status?.botUsername && (
                    <span className="text-[#52525B] text-xs">@{status.botUsername}</span>
                  )}
                </span>
              </InfoRow>

              <InfoRow label="Alıcı">
                <Input
                  value={settings.telegram_recipient_name ?? recipientName}
                  onChange={(e) => set("telegram_recipient_name", e.target.value)}
                  placeholder="Mehmet Abi"
                  className="!py-2 !text-sm"
                />
              </InfoRow>

              <InfoRow label="Son Test">
                <span className="text-sm text-[#A1A1AA]">
                  {formatTestDate(status?.lastTestAt ?? settings.telegram_last_test_at ?? null)}
                </span>
              </InfoRow>
            </div>

            <Button
              variant="primary"
              onClick={sendTest}
              disabled={testing || !telegramEnabled}
              className="w-full"
            >
              <Send className="w-4 h-4" />
              {testing ? "Gönderiliyor..." : "Test Bildirimi Gönder"}
            </Button>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              {showAdvanced ? "▲ Gelişmiş ayarları gizle" : "▼ Gelişmiş ayarlar (Chat ID, grup)"}
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                <Input
                  label="Telegram Chat ID"
                  value={settings.telegram_chat_id || ""}
                  onChange={(e) => set("telegram_chat_id", e.target.value)}
                  placeholder="Kişisel: 7766835593 · Grup: -100..."
                />
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Grup bildirimi için botu gruba ekleyin, gruba bir mesaj yazın ve Chat ID&apos;yi buraya girin.
                </p>
                <Input
                  label="Admin Panel URL"
                  value={settings.admin_url || ""}
                  onChange={(e) => set("admin_url", e.target.value)}
                  placeholder="https://siteniz.com/admin/appointments"
                />
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Google Değerlendirme</h3>
          <div className="space-y-4">
            <Input label="Google Puanı" value={settings.google_rating || ""} onChange={(e) => set("google_rating", e.target.value)} placeholder="4.87" />
            <Input label="Google Yorum Sayısı" value={settings.google_review_count || ""} onChange={(e) => set("google_review_count", e.target.value)} placeholder="30" />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Footer ve CTA</h3>
          <div className="space-y-4">
            <Input label="Footer Açıklama" value={settings.footer_intro || ""} onChange={(e) => set("footer_intro", e.target.value)} />
            <Input label="Footer Telif (boş = otomatik)" value={settings.footer_copyright || ""} onChange={(e) => set("footer_copyright", e.target.value)} />
            <Input label="Randevu Butonu Metni" value={settings.nav_cta_label || ""} onChange={(e) => set("nav_cta_label", e.target.value)} placeholder="Randevu Al" />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Salon Çalışma Saatleri</h3>
          <WorkingHoursEditor
            value={settings.working_hours || ""}
            onChange={(json) => set("working_hours", json)}
            onSyncBarbers={syncBarberHours}
            syncingBarbers={syncingBarbers}
          />
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Randevu Ayarları</h3>
          <div className="space-y-4">
            <Input label="Randevu Aralığı (dk)" type="number" value={settings.appointment_interval || "30"} onChange={(e) => set("appointment_interval", e.target.value)} />
            <Input label="Max İleri Tarih (gün)" type="number" value={settings.max_future_booking || "30"} onChange={(e) => set("max_future_booking", e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Site Metin Yönetimi</h3>
          <div className="space-y-4">
            <Input label="Menü - Hizmetler" value={settings.nav_services_label || ""} onChange={(e) => set("nav_services_label", e.target.value)} />
            <Input label="Menü - Galeri" value={settings.nav_gallery_label || ""} onChange={(e) => set("nav_gallery_label", e.target.value)} />
            <Input label="Menü - Yorumlar" value={settings.nav_reviews_label || ""} onChange={(e) => set("nav_reviews_label", e.target.value)} />
            <Input label="Menü - Hakkımızda" value={settings.nav_about_label || ""} onChange={(e) => set("nav_about_label", e.target.value)} />
            <Input label="Menü - İletişim" value={settings.nav_contact_label || ""} onChange={(e) => set("nav_contact_label", e.target.value)} />
            <Input label="Hizmetler Sayfası Başlık" value={settings.services_page_title || ""} onChange={(e) => set("services_page_title", e.target.value)} />
            <Input label="Hizmetler Sayfası Alt Başlık" value={settings.services_page_subtitle || ""} onChange={(e) => set("services_page_subtitle", e.target.value)} />
            <Input label="Hizmetler Bölümü Üst Metin" value={settings.services_section_eyebrow || ""} onChange={(e) => set("services_section_eyebrow", e.target.value)} />
            <Input label="Hizmetler Bölümü Başlık (Satır için \\n kullanın)" value={settings.services_section_title || ""} onChange={(e) => set("services_section_title", e.target.value)} />
            <Input label="Hizmetler Bölümü Açıklama" value={settings.services_section_subtitle || ""} onChange={(e) => set("services_section_subtitle", e.target.value)} />
            <Input label="Galeri Sayfası Başlık" value={settings.gallery_page_title || ""} onChange={(e) => set("gallery_page_title", e.target.value)} />
            <Input label="Galeri Sayfası Alt Başlık" value={settings.gallery_page_subtitle || ""} onChange={(e) => set("gallery_page_subtitle", e.target.value)} />
            <Input label="Yorumlar Sayfası Başlık" value={settings.reviews_page_title || ""} onChange={(e) => set("reviews_page_title", e.target.value)} />
            <Input label="Yorumlar Sayfası Alt Başlık" value={settings.reviews_page_subtitle || ""} onChange={(e) => set("reviews_page_subtitle", e.target.value)} />
            <Input label="Hakkımızda Sayfası Başlık" value={settings.about_page_title || ""} onChange={(e) => set("about_page_title", e.target.value)} />
            <Input label="Hakkımızda Sayfası Alt Başlık" value={settings.about_page_subtitle || ""} onChange={(e) => set("about_page_subtitle", e.target.value)} />
            <Input label="İletişim Sayfası Başlık" value={settings.contact_page_title || ""} onChange={(e) => set("contact_page_title", e.target.value)} />
            <Input label="İletişim Sayfası Alt Başlık" value={settings.contact_page_subtitle || ""} onChange={(e) => set("contact_page_subtitle", e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Sayfa Banner Görselleri</h3>
          <p className="text-sm text-[#71717A] mb-6">Sayfa üst banner görsellerini dosyadan yükleyin.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ImageUpload
              label="Hizmetler Sayfası Banner"
              folder="banners"
              value={settings.services_page_banner || ""}
              onChange={(url) => set("services_page_banner", url)}
            />
            <ImageUpload
              label="Galeri Sayfası Banner"
              folder="banners"
              value={settings.gallery_page_banner || ""}
              onChange={(url) => set("gallery_page_banner", url)}
            />
            <ImageUpload
              label="Yorumlar Sayfası Banner"
              folder="banners"
              value={settings.reviews_page_banner || ""}
              onChange={(url) => set("reviews_page_banner", url)}
            />
            <ImageUpload
              label="Hakkımızda Sayfası Banner"
              folder="banners"
              value={settings.about_page_banner || ""}
              onChange={(url) => set("about_page_banner", url)}
            />
            <ImageUpload
              label="İletişim Sayfası Banner"
              folder="banners"
              value={settings.contact_page_banner || ""}
              onChange={(url) => set("contact_page_banner", url)}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Telegram Gönderim Logları</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {logs.length === 0 && <p className="text-xs text-[#52525B]">Henüz log yok.</p>}
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 mb-1">
                  {log.status === "sent" ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className="text-[#F8F8F8] font-medium capitalize">{log.status}</span>
                  <span className="text-[#52525B]">·</span>
                  <span className="text-[#71717A]">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                </div>
                {log.status === "failed" && log.response && (
                  <p className="text-red-400/80 mt-1 pl-5">{log.response}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4">
      <span className="text-sm text-[#71717A] shrink-0">{label}</span>
      <div className="sm:text-right sm:max-w-[60%] w-full sm:w-auto">{children}</div>
    </div>
  );
}

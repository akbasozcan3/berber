"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Sparkles, Crown, ChevronRight, ChevronLeft,
  User, Phone, Check, MessageSquare, Users, Loader2,
} from "lucide-react";
import { api, type Service, type Barber, type TimeSlot } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { toLocalIsoDate, formatIsoDateTr } from "@/lib/utils/format";

const SERVICE_ICONS: Record<string, typeof Scissors> = {
  "sac-kesimi": Scissors,
  sakal: Sparkles,
  "sac-sakal": Scissors,
  cocuk: Users,
  "sac-bakimi": Sparkles,
  vip: Crown,
};

export default function Booking({
  initialServices = [],
  initialBarbers = [],
}: {
  initialServices?: Service[];
  initialBarbers?: Barber[];
}) {
  const settings = usePublicSettings();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [loadingCatalog, setLoadingCatalog] = useState(
    initialServices.length === 0 || initialBarbers.length === 0
  );
  const [catalogError, setCatalogError] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [formData, setFormData] = useState({
    serviceId: 0,
    barberId: 0,
    noPreference: false,
    date: "",
    time: "",
    name: "",
    phone: "",
    notes: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentResult, setAppointmentResult] = useState<{
    id: number;
    service: string;
    barber: string;
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    if (initialServices.length > 0 && initialBarbers.length > 0) {
      setLoadingCatalog(false);
      return;
    }

    setLoadingCatalog(true);
    Promise.all([api.getServices(), api.getBarbers()])
      .then(([s, b]) => {
        setServices(s);
        setBarbers(b);
        setCatalogError("");
      })
      .catch((err) => {
        setCatalogError(err instanceof Error ? err.message : "Hizmetler yüklenemedi.");
      })
      .finally(() => setLoadingCatalog(false));
  }, [initialServices.length, initialBarbers.length]);

  const getNextDays = useCallback((count: number) => {
    const days = [];
    const locale = "tr-TR";
    for (let i = 0; i < count; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isoDate = toLocalIsoDate(d);
      days.push({
        dayNum: d.getDate(),
        month: d.toLocaleDateString(locale, { month: "short" }),
        dayName: d.toLocaleDateString(locale, { weekday: "short" }),
        isoDate,
      });
    }
    return days;
  }, []);

  const bookingHorizon = Math.min(Math.max(settings.maxFutureBooking || 30, 7), 60);
  const nextDays = getNextDays(bookingHorizon);

  useEffect(() => {
    if (!formData.date || !formData.serviceId) return;

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) {
        setLoadingSlots(true);
        setSlotsError("");
      }
    });

    api
      .getSlots(
        formData.date,
        formData.serviceId,
        formData.noPreference ? undefined : formData.barberId || undefined
      )
      .then((data) => {
        if (cancelled) return;
        setSlots(data);
        setFormData((prev) => {
          if (!prev.time) return prev;
          const stillValid = data.some((s) => s.time === prev.time && s.available);
          return stillValid ? prev : { ...prev, time: "" };
        });
      })
      .catch(() => {
        if (cancelled) return;
        setSlots([]);
        setSlotsError("Müsait saatler yüklenemedi. Lütfen tekrar deneyin.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formData.date, formData.serviceId, formData.barberId, formData.noPreference]);

  const validateStep = () => {
    const tempErrors: Record<string, string> = {};
    if (step === 1 && !formData.serviceId) tempErrors.service = "Lütfen bir hizmet seçin.";
    if (step === 2 && !formData.noPreference && !formData.barberId) tempErrors.barber = "Lütfen bir stilist seçin veya tercih yok seçin.";
    if (step === 3) {
      if (!formData.date) tempErrors.date = "Lütfen bir gün seçin.";
      if (!formData.time) tempErrors.time = "Lütfen bir saat seçin.";
      else if (!availableSlots.some((s) => s.time === formData.time)) {
        tempErrors.time = "Seçilen saat artık müsait değil. Lütfen başka saat seçin.";
      }
    }
    if (step === 4) {
      if (!formData.name.trim()) tempErrors.name = "Ad Soyad zorunludur.";
      if (!formData.phone.trim() || formData.phone.length < 10) tempErrors.phone = "Geçerli telefon girin.";
      if (!formData.agreed) tempErrors.agreed = "Devam etmek için onay vermelisiniz.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((p) => p + 1); };
  const handlePrev = () => setStep((p) => p - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      const selectedService = services.find((s) => s.id === formData.serviceId);
      const selectedBarber = barbers.find((b) => b.id === formData.barberId);
      const result = await api.createBooking({
        customerName: formData.name,
        phone: formData.phone,
        serviceId: formData.serviceId,
        barberId: formData.noPreference ? null : formData.barberId,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        agreed: formData.agreed,
      });
      setAppointmentResult({
        id: result.appointment.id,
        service: result.appointment.service || selectedService?.name || "",
        barber: result.appointment.barber || selectedBarber?.name || "Atandı",
        date: formData.date,
        time: formData.time,
      });
      setIsSuccess(true);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Randevu oluşturulamadı." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === formData.serviceId);
  const selectedBarber = barbers.find((b) => b.id === formData.barberId);
  const availableSlots = slots.filter((s) => s.available);

  const getFormattedDate = (iso: string) => (iso ? formatIsoDateTr(iso) : "");

  return (
    <section id="booking" className="py-16 md:py-32 bg-[#0A0A0A] relative min-h-screen text-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="container mx-auto px-4 sm:px-6 md:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="lg:col-span-4 space-y-10">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-8 h-[1px] bg-white" />
                <p className="text-[10px] font-bold tracking-[0.35em] text-white/60 uppercase">Premium Rezervasyon</p>
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-white mb-6 leading-none">
                Koltuk <br /><span className="italic text-white/35 font-light">Rezervasyonu</span>
              </h2>
              <p className="text-white/50 text-base font-light leading-relaxed">
                Online randevu alın. Müsait saatler anlık olarak güncellenir.
              </p>
            </div>
            <div className="relative border-l border-white/10 pl-4 sm:pl-6 space-y-5 sm:space-y-8 py-2">
              {["Hizmet Seçimi", "Stilist Tercihi", "Tarih & Saat", "Kişisel Bilgiler"].map((label, i) => (
                <div key={label} className="relative flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold transition-all ${step > i + 1 ? "bg-white text-black border-white" : step === i + 1 ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.18)]" : "bg-[#0A0A0A] text-white/30 border-white/15"}`}>
                    {step > i + 1 ? <Check size={12} strokeWidth={3} /> : `0${i + 1}`}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider ${step >= i + 1 ? "text-white" : "text-white/30"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#121212]/40 border border-white/[0.06] rounded-md p-5 sm:p-8 md:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <form key="booking" onSubmit={handleSubmit} className="space-y-10">
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <h3 className="text-xl font-serif font-light text-white">Hizmet Seçin</h3>
                      {loadingCatalog ? (
                        <div className="flex items-center gap-2 text-white/50 py-8">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Hizmetler yükleniyor...
                        </div>
                      ) : catalogError ? (
                        <p className="text-sm text-red-400 py-4">{catalogError}</p>
                      ) : services.length === 0 ? (
                        <p className="text-sm text-white/50 py-4">Şu an listelenecek hizmet bulunamadı.</p>
                      ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((s) => {
                          const Icon = SERVICE_ICONS[s.slug] || Scissors;
                          const sel = formData.serviceId === s.id;
                          return (
                            <div key={s.id} onClick={() => { setFormData({ ...formData, serviceId: s.id }); setErrors({}); }}
                              className={`p-5 sm:p-6 border rounded-sm cursor-pointer transition-all h-44 relative flex flex-col justify-between ${sel ? "border-white bg-white/[0.03]" : "border-white/[0.06] hover:border-white/20"}`}>
                              <div className="flex justify-between">
                                <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${sel ? "border-white text-white/60" : "border-white/10 text-white/50"}`}><Icon size={16} /></div>
                                <span className="text-xs font-mono text-white/30">{s.duration} dk</span>
                              </div>
                              <div>
                                <h4 className={`text-base font-serif ${sel ? "text-white/60" : "text-white"}`}>{s.name}</h4>
                                <p className="text-white/40 text-xs mt-1 line-clamp-1">{s.description}</p>
                              </div>
                              <span className="absolute bottom-6 right-6 font-serif text-lg text-white/60">₺{s.price}</span>
                            </div>
                          );
                        })}
                      </div>
                      )}
                      {errors.service && <p className="text-xs text-red-400">{errors.service}</p>}
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <h3 className="text-xl font-serif font-light text-white">Stilist Seçin</h3>
                      <div
                        onClick={() => setFormData({ ...formData, noPreference: true, barberId: 0, time: "" })}
                        className={`p-5 border rounded-sm cursor-pointer mb-4 ${formData.noPreference ? "border-white bg-white/[0.03]" : "border-white/[0.06] hover:border-white/20"}`}>
                        <p className={`font-medium ${formData.noPreference ? "text-white/60" : "text-white"}`}>Tercihim Yok</p>
                        <p className="text-white/40 text-xs mt-1">Müsait berbere otomatik atanır</p>
                      </div>
                      {barbers.length === 0 ? (
                        <p className="text-sm text-white/50 py-2">Şu an müsait stilist bulunmuyor. &quot;Tercihim Yok&quot; ile devam edebilirsiniz.</p>
                      ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {barbers.map((b) => {
                          const sel = formData.barberId === b.id && !formData.noPreference;
                          return (
                            <div key={b.id} onClick={() => setFormData({ ...formData, barberId: b.id, noPreference: false, time: "" })}
                              className={`p-5 sm:p-6 border rounded-sm cursor-pointer text-center h-52 flex flex-col items-center justify-between ${sel ? "border-white bg-white/[0.03]" : "border-white/[0.06] hover:border-white/20"}`}>
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center border font-bold text-sm ${sel ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/70"}`}>
                                {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <h4 className={`font-semibold ${sel ? "text-white/60" : "text-white"}`}>{b.name}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-white/60 mt-1">{b.position}</p>
                                <p className="text-white/40 text-[11px] mt-2">{b.specialty}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      )}
                      {errors.barber && <p className="text-xs text-red-400">{errors.barber}</p>}
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <h3 className="text-xl font-serif font-light text-white">Tarih & Saat</h3>
                      <div className="flex gap-2.5 overflow-x-auto pb-3">
                        {nextDays.map((day) => {
                          const sel = formData.date === day.isoDate;
                          return (
                            <button type="button" key={day.isoDate} onClick={() => setFormData({ ...formData, date: day.isoDate, time: "" })}
                              className={`flex flex-col items-center py-4 px-5 rounded-sm border min-w-[76px] transition-all ${sel ? "bg-white border-white text-black" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                              <span className="text-[10px] uppercase font-bold">{day.dayName}</span>
                              <span className="text-lg font-serif font-bold">{day.dayNum}</span>
                              <span className="text-[8px] uppercase opacity-70">{day.month}</span>
                            </button>
                          );
                        })}
                      </div>
                      {formData.date && (
                        <div className="pt-4 border-t border-white/[0.06]">
                          {loadingSlots ? (
                            <div className="flex items-center gap-2 text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Müsait saatler yükleniyor...</div>
                          ) : slotsError ? (
                            <p className="text-red-400 text-sm">{slotsError}</p>
                          ) : availableSlots.length === 0 ? (
                            <p className="text-white/50 text-sm">Bu tarihte müsait saat bulunmuyor.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2.5">
                              {slots.map((slot) => (
                                <button type="button" key={slot.time} disabled={!slot.available}
                                  title={slot.reason || ""}
                                  onClick={() => setFormData({ ...formData, time: slot.time })}
                                  className={`py-3 px-6 text-xs font-semibold rounded-sm border transition-all ${!slot.available ? "opacity-30 cursor-not-allowed border-white/5 text-white/20 line-through" : formData.time === slot.time ? "bg-white border-white text-black" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
                      {errors.time && <p className="text-xs text-red-400">{errors.time}</p>}
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <h3 className="text-xl font-serif font-light text-white">Bilgileriniz</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1.5"><User size={10} className="text-white/60" /> Ad Soyad</label>
                          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-transparent border-b border-white/15 py-3 text-white focus:outline-none focus:border-white text-sm" placeholder="Adınız Soyadınız" />
                          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1.5"><Phone size={10} className="text-white/60" /> Telefon</label>
                          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-transparent border-b border-white/15 py-3 text-white focus:outline-none focus:border-white text-sm" placeholder="05XX XXX XX XX" />
                          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Notlar (Opsiyonel)</label>
                        <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full bg-transparent border-b border-white/15 py-3 text-white focus:outline-none text-sm" placeholder="Ek istekleriniz..." />
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.agreed} onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                          className="mt-1 accent-white" />
                        <span className="text-xs text-white/50">Randevu bilgilerimin doğruluğunu onaylıyorum ve iletişim bilgilerime bilgilendirme yapılmasını kabul ediyorum.</span>
                      </label>
                      {errors.agreed && <p className="text-xs text-red-400">{errors.agreed}</p>}
                      <div className="p-5 sm:p-6 bg-white/[0.02] border border-white/[0.06] rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div><span className="text-white/40 block">Hizmet:</span><span className="text-white font-semibold">{selectedService?.name} (₺{selectedService?.price})</span></div>
                        <div><span className="text-white/40 block">Berber:</span><span className="text-white font-semibold">{formData.noPreference ? "Otomatik" : selectedBarber?.name}</span></div>
                        <div><span className="text-white/40 block">Tarih:</span><span className="text-white font-semibold">{getFormattedDate(formData.date)}</span></div>
                        <div><span className="text-white/40 block">Saat:</span><span className="text-white/60 font-semibold">{formData.time}</span></div>
                      </div>
                      {errors.submit && <p className="text-sm text-red-400">{errors.submit}</p>}
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center gap-3 pt-8 border-t border-white/[0.06]">
                    {step > 1 ? (
                      <button type="button" onClick={handlePrev} className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-bold tracking-wide sm:tracking-widest uppercase"><ChevronLeft size={14} /> Geri</button>
                    ) : <div />}
                    {step < 4 ? (
                      <button type="button" onClick={handleNext} className="bg-white text-black hover:bg-white px-6 sm:px-10 py-4 rounded-full text-[10px] font-bold tracking-wide sm:tracking-widest uppercase flex items-center gap-2">İleri <ChevronRight size={14} /></button>
                    ) : (
                      <button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-white px-8 sm:px-12 py-4 rounded-full text-[10px] font-bold tracking-wide sm:tracking-widest uppercase disabled:opacity-50">
                        {isSubmitting ? "Gönderiliyor..." : "Randevuyu Onayla"}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-white/15 text-white/60 bg-white/[0.03]"><Check size={36} strokeWidth={2.5} /></div>
                  <div>
                    <h3 className="text-3xl font-serif font-light text-white">Randevunuz Alındı!</h3>
                    <p className="text-white/50 text-sm max-w-md mx-auto mt-3">Sayın <span className="text-white font-semibold">{formData.name}</span>, randevunuz başarıyla oluşturuldu.</p>
                    {appointmentResult && (
                      <div className="mt-6 p-5 bg-white/[0.03] border border-white/[0.08] rounded-sm text-left max-w-md mx-auto space-y-2 text-sm">
                        <p><span className="text-white/40">Randevu No:</span> <span className="text-white font-semibold">#{appointmentResult.id}</span></p>
                        <p><span className="text-white/40">Hizmet:</span> <span className="text-white">{appointmentResult.service}</span></p>
                        <p><span className="text-white/40">Berber:</span> <span className="text-white">{appointmentResult.barber}</span></p>
                        <p><span className="text-white/40">Tarih:</span> <span className="text-white">{getFormattedDate(appointmentResult.date)}</span></p>
                        <p><span className="text-white/40">Saat:</span> <span className="text-[#D4AF37] font-semibold">{appointmentResult.time}</span></p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button type="button" onClick={() => { setIsSuccess(false); setStep(1); setFormData({ serviceId: 0, barberId: 0, noPreference: false, date: "", time: "", name: "", phone: "", notes: "", agreed: false }); }}
                      className="border border-white/10 text-white/70 px-8 sm:px-10 py-4 rounded-full text-[10px] font-bold tracking-wide sm:tracking-widest uppercase">Yeni Randevu</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
}

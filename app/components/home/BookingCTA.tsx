"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Phone, Scissors } from "lucide-react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { formatPhoneDisplay, toTelHref } from "@/lib/utils/format";
import { api, type Service } from "@/lib/api/client";

interface BookingCTAProps {
  initialServices?: Service[];
}

export default function BookingCTA({ initialServices = [] }: BookingCTAProps) {
  const { phone } = usePublicSettings();
  const [services, setServices] = useState<Service[]>(initialServices);

  useEffect(() => {
    if (initialServices.length > 0) return;
    api
      .getServices()
      .then((list) => setServices(list.slice(0, 4)))
      .catch(() => setServices([]));
  }, [initialServices]);

  return (
    <section className="relative py-0 bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2560&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />

      <div className="relative z-10 container mx-auto px-6 lg:px-14 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-white" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/60">
                Online Rezervasyon
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-light text-white tracking-tight leading-[1.05] mb-8">
              Randevunuzu <br />
              <span className="italic text-white/25">Hemen Oluşturun</span>
            </h2>
            <p className="text-white/40 text-lg font-light leading-relaxed max-w-md">
              Sıra beklemeden, size uygun tarih ve saati seçin. Güncel hizmet ve fiyat listesini
              aşağıdan inceleyip randevunuzu oluşturun.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-2 gap-4">
              {services.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-colors duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Scissors size={20} className="text-white/70" strokeWidth={1.5} />
                      <span className="text-white/60 font-serif text-lg">₺{item.price}</span>
                    </div>
                    <p className="text-white/80 text-xs font-semibold tracking-wide">{item.name}</p>
                    <p className="text-white/45 text-[11px] mt-1">{item.duration} dk</p>
                  </div>
                );
              })}
            </div>
            {services.length === 0 && (
              <p className="text-white/45 text-sm">
                Hizmet fiyatları yüklenemedi. Lütfen Admin &gt; Hizmetler bölümünden hizmetleri
                kontrol edin.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/randevu"
                className="group flex-1 flex items-center justify-center gap-3 bg-white text-black hover:bg-white/90 px-8 py-5 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300"
              >
                Online Randevu Al
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={toTelHref(phone)}
                className="flex items-center justify-center gap-2 border border-white/15 text-white hover:border-white/40 px-8 py-5 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300"
              >
                <Phone size={13} />
                {formatPhoneDisplay(phone)}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { formatPhoneDisplay, formatWorkingHoursSummary, instagramUrl, toTelHref } from "@/lib/utils/format";

export default function ContactStrip() {
  const { phone, address, workingHours, instagram } = usePublicSettings();
  const hoursSummary = formatWorkingHoursSummary(workingHours);

  return (
    <section className="py-20 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-black/8" />

      <div className="container mx-auto px-6 lg:px-14">
        <div className="flex items-center gap-3 mb-14">
          <span className="w-8 h-px bg-white" />
          <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/60">
            Bize Ulaşın
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-black/8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white group p-8 hover:bg-black transition-all duration-500 flex flex-col gap-5"
          >
            <div className="w-10 h-10 rounded-full border border-black/10 group-hover:border-white/15 flex items-center justify-center transition-colors duration-500">
              <Phone size={15} className="text-black/50 group-hover:text-white transition-colors duration-500" />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-black/30 group-hover:text-white/30 mb-2 transition-colors duration-500">Telefon</p>
              <a href={toTelHref(phone)} className="text-lg font-serif font-light text-black group-hover:text-white transition-colors duration-500 hover:text-white block">
                {formatPhoneDisplay(phone)}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white group p-8 hover:bg-black transition-all duration-500 flex flex-col gap-5"
          >
            <div className="w-10 h-10 rounded-full border border-black/10 group-hover:border-white/15 flex items-center justify-center transition-colors duration-500">
              <MapPin size={15} className="text-black/50 group-hover:text-white transition-colors duration-500" />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-black/30 group-hover:text-white/30 mb-2 transition-colors duration-500">Adres</p>
              <p className="text-sm font-light text-black group-hover:text-white/70 transition-colors duration-500 leading-relaxed">
                {address}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white group p-8 hover:bg-black transition-all duration-500 flex flex-col gap-5"
          >
            <div className="w-10 h-10 rounded-full border border-black/10 group-hover:border-white/15 flex items-center justify-center transition-colors duration-500">
              <Clock size={15} className="text-black/50 group-hover:text-white transition-colors duration-500" />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-black/30 group-hover:text-white/30 mb-2 transition-colors duration-500">Çalışma Saatleri</p>
              <p className="text-base font-light text-black group-hover:text-white/70 transition-colors duration-500 leading-relaxed">
                {hoursSummary}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-black p-8 flex flex-col gap-5 justify-between"
          >
            <div>
              <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 mb-4">Sosyal Medya</p>
              <div className="flex gap-3">
                <a
                  href={instagramUrl(instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-white/50 hover:text-white transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
            <Link
              href="/iletisim"
              className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
            >
              Detaylı İletişim
              <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none stroke-2 group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

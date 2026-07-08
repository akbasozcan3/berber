"use client";

import { motion } from "framer-motion";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { MapPin, Navigation } from "lucide-react";
import { googleMapsEmbedUrl } from "@/lib/utils/format";

export default function LocationSection() {
  const { address, googleMaps, businessName, locationShort } = usePublicSettings();
  const mapEmbed = googleMapsEmbedUrl(googleMaps, address);

  return (
    <section className="relative py-0 bg-black overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="flex flex-col justify-center px-6 lg:px-14 py-20 lg:py-28"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-white" />
            <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/60">
              Konum
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tight leading-tight mb-6">
            Bizi Ziyaret Edin
          </h2>
          <p className="text-white/45 font-light leading-relaxed mb-8 max-w-md">
            {businessName}
            {locationShort ? `, ${locationShort}` : ""} bölgesinde modern berberlik deneyimi sunuyor. Kolay ulaşım, ücretsiz danışmanlık.
          </p>

          <div className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] mb-8">
            <MapPin className="w-5 h-5 text-white/60 shrink-0 mt-0.5" />
            <p className="text-white/70 text-sm font-light leading-relaxed">{address}</p>
          </div>

          <a
            href={googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] uppercase text-white/60 hover:text-white transition-colors"
          >
            <Navigation size={14} />
            Google Maps&apos;te Aç
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15 }}
          className="relative min-h-[320px] lg:min-h-full"
        >
          <iframe
            title="New Life Erkek Kuaförü Konum"
            src={mapEmbed}
            className="absolute inset-0 w-full h-full border-0 grayscale contrast-[1.1] opacity-80 hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/40 to-transparent lg:from-black/60" />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";

export default function ExperienceHighlights() {
  const { googleRating, googleReviewCount } = usePublicSettings();

  const highlights = [
    { value: `${googleRating}`, label: "Google Puanı", suffix: "/ 5" },
    { value: googleReviewCount, label: "Mutlu Müşteri", suffix: "+" },
    { value: "10+", label: "Yıllık Deneyim", suffix: "" },
    { value: "100%", label: "Hijyen Standardı", suffix: "" },
  ];

  return (
    <section className="section-light py-24 border-y border-black/[0.06]">
      <div className="container mx-auto px-6 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-black/25" />
            <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-black/45">
              Rakamlarla New Life
            </span>
            <span className="w-8 h-px bg-black/25" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-black tracking-tight">
            Güvenin <span className="italic text-black/40">Sayılarla Kanıtı</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 rounded-2xl overflow-hidden border border-black/10">
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#F5F5F5] p-8 lg:p-10 text-center group hover:bg-white transition-colors duration-500"
            >
              <p className="text-4xl md:text-5xl font-serif font-light text-black">
                {item.value}
                <span className="text-lg text-black/30">{item.suffix}</span>
              </p>
              <p className="mt-3 text-[10px] font-bold tracking-[0.25em] uppercase text-black/40">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

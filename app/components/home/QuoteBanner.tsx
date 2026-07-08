"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, type PageContent } from "@/lib/api/client";

export default function QuoteBanner() {
  const [page, setPage] = useState<PageContent | null>(null);

  useEffect(() => {
    api.getPageContent("home_quote").then(setPage).catch(() => {});
  }, []);

  const meta = page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
    ? page.sections as { description?: string }
    : { description: "" };

  return (
    <section className="relative py-24 bg-[#0A0A0A] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-serif font-bold text-white/[0.012] tracking-tight leading-none">LIFE</span>
      </div>
      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className="w-12 h-px bg-white" />
              <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-white/60">{page?.title || "Felsefemiz"}</span>
              <span className="w-12 h-px bg-white" />
            </div>
            <blockquote className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-white leading-[1.2] tracking-tight mb-10">
              &ldquo;{page?.content || "Her kesim ve sakal tasarımı, tarzınızı yansıtan benzersiz bir imzadır."}&rdquo;
            </blockquote>
            <p className="text-white/50 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
              {meta.description || "New Life Erkek Kuaförü olarak, modern tasarım tekniklerini geleneksel berberlik titizliğiyle harmanlıyoruz."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

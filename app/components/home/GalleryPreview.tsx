"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api, type GalleryImage } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { splitTitleLines } from "@/lib/data/home-content";

interface GalleryPreviewProps {
  initialImages?: GalleryImage[];
}

export default function GalleryPreview({ initialImages = [] }: GalleryPreviewProps) {
  const settings = usePublicSettings();
  const [images, setImages] = useState<GalleryImage[]>(initialImages.slice(0, 6));
  const [titleLine1, titleLine2] = splitTitleLines(
    settings.homeGalleryTitle,
    settings.businessName,
    "Koleksiyonu"
  );

  useEffect(() => {
    if (initialImages.length > 0) return;
    api.getGallery().then((data) => setImages(data.slice(0, 6))).catch(() => {});
  }, [initialImages]);

  return (
    <section className="py-28 bg-black relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="container mx-auto px-6 lg:px-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-white" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/60">
                {settings.homeGalleryEyebrow || settings.navGalleryLabel}
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white leading-[1.05]">
              {titleLine1} <br />
              <span className="italic text-white/25">{titleLine2}</span>
            </h2>
          </div>
          <Link
            href="/galeri"
            className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-white/35 hover:text-white transition-colors shrink-0"
          >
            Tüm Galeri
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden group bg-[#121212]/40 backdrop-blur-sm border border-white/[0.06] rounded-md cursor-pointer aspect-square md:aspect-[4/3]"
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                style={{ backgroundImage: `url('${item.url}')` }}
              />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-2">
                <span className="text-[9px] tracking-[0.35em] uppercase text-white/60 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  {item.title}
                </span>
                <span className="text-white font-serif italic text-sm transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-[60ms]">
                  Görüntüle
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

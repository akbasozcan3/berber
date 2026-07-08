"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { api, type GalleryImage } from "@/lib/api/client";

interface GalleryProps {
  initialImages?: GalleryImage[];
}

export default function Gallery({ initialImages = [] }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialImages.length > 0) return;
    api.getGallery().then(setImages).catch(() => setImages([]));
  }, [initialImages]);

  const categories = ["Tümü", ...Array.from(new Set(images.map((img) => img.title)))];

  const filteredImages = images.filter(
    (img) => activeCategory === "Tümü" || img.title === activeCategory
  );

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex !== null) {
      setPhotoIndex((photoIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex !== null) {
      setPhotoIndex((photoIndex + 1) % filteredImages.length);
    }
  };

  return (
    <section id="gallery" className="py-32 bg-[#0A0A0A] relative min-h-screen">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="container mx-auto px-6 md:px-16">
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-[1px] bg-white" />
            <p className="text-[10px] font-bold tracking-[0.35em] text-white/60 uppercase">
              Görsel Kataloğumuz
            </p>
            <span className="w-8 h-[1px] bg-white" />
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white mb-6 leading-[1.05]">
            New Life{" "}
            <span className="italic text-white/40 font-light">Koleksiyonu</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Salonumuzun atmosferini, zanaatımızın detaylarını ve imza saç-sakal
            tasarımlarımızı keşfedin.
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setPhotoIndex(null);
                }}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 border ${
                  activeCategory === cat
                    ? "bg-white text-black border-white shadow-[0_4px_16px_rgba(255,255,255,0.1)]"
                    : "bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-40px" }}
              onClick={() => setPhotoIndex(index)}
              className="relative overflow-hidden group bg-black border border-white/5 rounded-md cursor-pointer"
            >
              <div
                className="w-full aspect-square md:aspect-[4/3] bg-center bg-cover bg-no-repeat transition-all duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                style={{ backgroundImage: `url('${item.url}')` }}
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/25 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  <Maximize2 size={16} className="text-white/60" />
                </div>
                <span className="text-[9px] tracking-[0.35em] uppercase text-white/60 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  {item.title}
                </span>
                <span className="text-white font-serif italic text-base transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  Görüntüle
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {photoIndex !== null && filteredImages[photoIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhotoIndex(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 select-none"
          >
            <button
              onClick={() => setPhotoIndex(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>

            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
              aria-label="Önceki Görsel"
            >
              <ChevronLeft size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[80vh] aspect-auto flex flex-col items-center"
            >
              <img
                src={filteredImages[photoIndex].url}
                alt={filteredImages[photoIndex].title}
                className="max-w-full max-h-[70vh] rounded-md object-contain border border-white/10 shadow-2xl"
              />
              <div className="mt-6 flex flex-col items-center text-center">
                <span className="text-[9px] tracking-[0.35em] text-white/60 uppercase font-bold">
                  {filteredImages[photoIndex].title}
                </span>
                <span className="text-white/40 text-xs mt-1">
                  Görsel {photoIndex + 1} / {filteredImages.length}
                </span>
              </div>
            </motion.div>

            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
              aria-label="Sonraki Görsel"
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

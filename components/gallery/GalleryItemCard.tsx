"use client";

import { motion } from "framer-motion";
import { CirclePlay } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import type { GalleryImage } from "@/lib/api/client";
import {
  getGalleryDisplayUrl,
  getGalleryItemLink,
  isInstagramGalleryItem,
} from "@/lib/utils/gallery";

interface GalleryItemCardProps {
  item: GalleryImage;
  index?: number;
  onClick?: () => void;
  className?: string;
  aspectClassName?: string;
}

export default function GalleryItemCard({
  item,
  index = 0,
  onClick,
  className = "",
  aspectClassName = "aspect-square md:aspect-[4/3]",
}: GalleryItemCardProps) {
  const displayUrl = getGalleryDisplayUrl(item);
  const externalLink = getGalleryItemLink(item);
  const isInstagram = isInstagramGalleryItem(item);
  const showVideoBadge = isInstagram && item.isVideo;

  const inner = (
    <>
      <div
        className={`w-full ${aspectClassName} bg-cover bg-center bg-no-repeat transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105`}
        style={{ backgroundImage: displayUrl ? `url('${displayUrl}')` : undefined }}
      />
      {!displayUrl && (
        <div className={`w-full ${aspectClassName} bg-[#1a1a1a] flex items-center justify-center`}>
          <InstagramIcon size={28} className="text-white/20" />
        </div>
      )}

      {showVideoBadge && (
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center pointer-events-none">
          <CirclePlay size={16} className="text-white" />
        </div>
      )}

      {isInstagram && (
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 flex items-center gap-1.5 pointer-events-none">
          <InstagramIcon size={12} className="text-white/80" />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/70">
            {item.isVideo ? "Reel" : "Post"}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-2">
        <span className="text-[9px] tracking-[0.35em] uppercase text-white/60 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
          {item.title}
        </span>
        <span className="text-white font-serif italic text-sm transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-[60ms]">
          {isInstagram ? "Instagram'da Aç" : "Görüntüle"}
        </span>
      </div>
    </>
  );

  const motionProps = {
    initial: { opacity: 0, scale: 0.97 } as const,
    animate: { opacity: 1, scale: 1 } as const,
    transition: { delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    className: `relative overflow-hidden group bg-[#121212]/40 backdrop-blur-sm border border-white/[0.06] rounded-md cursor-pointer ${className}`,
  };

  if (externalLink) {
    return (
      <motion.a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div {...motionProps} onClick={onClick} role={onClick ? "button" : undefined}>
      {inner}
    </motion.div>
  );
}

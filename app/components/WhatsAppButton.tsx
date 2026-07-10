"use client";

import { MessageCircle } from "lucide-react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { toWhatsAppHref } from "@/lib/utils/format";

export default function WhatsAppButton() {
  const settings = usePublicSettings();
  const phone = settings.phone?.trim();

  if (!phone) return null;

  const href = toWhatsAppHref(
    phone,
    `Merhaba ${settings.businessName || "salon"}, bilgi almak istiyorum.`
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
    >
      <span className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-full bg-[#111111]/90 border border-white/10 text-white text-xs font-semibold tracking-wide shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        WhatsApp ile yazın
      </span>
      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.35)] hover:bg-[#20BD5A] hover:scale-105 active:scale-95 transition-all duration-300">
        <MessageCircle className="w-7 h-7" strokeWidth={2} />
      </span>
    </a>
  );
}

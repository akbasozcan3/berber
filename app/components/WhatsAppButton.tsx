"use client";

import WhatsAppIcon from "@/app/components/icons/WhatsAppIcon";
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
      className="fixed z-[9999] flex items-center gap-2.5 bg-[#25D366] text-white rounded-full shadow-[0_8px_32px_rgba(37,211,102,0.45)] hover:bg-[#20BD5A] hover:shadow-[0_10px_36px_rgba(37,211,102,0.55)] active:scale-[0.97] transition-all duration-300 bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] px-4 py-3 sm:px-5 sm:py-3.5"
    >
      <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
      <span className="text-sm sm:text-[15px] font-semibold tracking-wide pr-0.5">
        WhatsApp
      </span>
    </a>
  );
}

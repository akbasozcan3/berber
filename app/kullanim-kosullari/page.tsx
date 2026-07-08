import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
};

export default function TermsPage() {
  return (
    <main className="pt-32 pb-24 bg-black min-h-screen">
      <div className="container mx-auto px-6 md:px-16 max-w-3xl">
        <Link href="/" className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D4AF37] hover:text-white transition-colors">
          ← Ana Sayfa
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-white mt-8 mb-8">Kullanım Koşulları</h1>
        <div className="space-y-6 text-white/60 font-light leading-relaxed">
          <p>
            Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
            Site üzerinden alınan randevular, salonumuzun çalışma saatleri ve müsaitlik durumuna tabidir.
          </p>
          <p>
            Randevu iptali veya değişikliği için lütfen en az 2 saat öncesinden telefon ile bilgi veriniz. Geç kalma durumunda randevunuz iptal edilebilir.
          </p>
          <p>
            Sitedeki içerik, fiyat ve hizmet bilgileri önceden haber verilmeksizin güncellenebilir.
          </p>
        </div>
      </div>
    </main>
  );
}

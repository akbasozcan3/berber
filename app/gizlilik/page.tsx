import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
};

export default function PrivacyPage() {
  return (
    <main className="pt-32 pb-24 bg-black min-h-screen">
      <div className="container mx-auto px-6 md:px-16 max-w-3xl">
        <Link href="/" className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D4AF37] hover:text-white transition-colors">
          ← Ana Sayfa
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-white mt-8 mb-8">Gizlilik Politikası</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/60 font-light leading-relaxed">
          <p>
            New Life Erkek Kuaförü olarak kişisel verilerinizin güvenliğine önem veriyoruz.
            Randevu ve iletişim formları aracılığıyla paylaştığınız ad, telefon, e-posta ve mesaj
            bilgileri yalnızca hizmet sunumu ve iletişim amacıyla kullanılır.
          </p>
          <p>
            Verileriniz üçüncü taraflarla paylaşılmaz; yasal zorunluluklar dışında ifşa edilmez.
            Verilerinize erişim, düzeltme veya silme talepleriniz için bizimle iletişime geçebilirsiniz.
          </p>
          <p>Son güncelleme: {new Date().getFullYear()}</p>
        </div>
      </div>
    </main>
  );
}

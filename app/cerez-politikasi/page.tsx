import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Çerez Politikası",
};

export default function CookiePage() {
  return (
    <main className="pt-32 pb-24 bg-black min-h-screen">
      <div className="container mx-auto px-6 md:px-16 max-w-3xl">
        <Link href="/" className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D4AF37] hover:text-white transition-colors">
          ← Ana Sayfa
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-white mt-8 mb-8">Çerez Politikası</h1>
        <div className="space-y-6 text-white/60 font-light leading-relaxed">
          <p>
            Web sitemiz, oturum yönetimi ve site performansı için gerekli teknik çerezler kullanabilir.
            Admin paneli girişi için güvenli oturum çerezi (HTTP-only) kullanılmaktadır.
          </p>
          <p>
            Pazarlama veya analitik amaçlı üçüncü taraf çerezleri kullanılmamaktadır.
            Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz; ancak bazı özellikler çalışmayabilir.
          </p>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
};

export default function KvkkPage() {
  return (
    <main className="pt-32 pb-24 bg-black min-h-screen">
      <div className="container mx-auto px-6 md:px-16 max-w-3xl">
        <Link href="/" className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D4AF37] hover:text-white transition-colors">
          ← Ana Sayfa
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-white mt-8 mb-8">KVKK Aydınlatma Metni</h1>
        <div className="space-y-6 text-white/60 font-light leading-relaxed">
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla
            New Life Erkek Kuaförü, müşteri ve ziyaretçilerden toplanan kişisel verileri meşru
            amaçlarla ve kanuna uygun şekilde işlemektedir.
          </p>
          <p>
            <strong className="text-white/80">İşlenen veriler:</strong> Ad soyad, telefon, e-posta,
            randevu bilgileri ve iletişim mesajları.
          </p>
          <p>
            <strong className="text-white/80">İşleme amaçları:</strong> Randevu yönetimi, müşteri
            hizmetleri, bilgilendirme ve yasal yükümlülüklerin yerine getirilmesi.
          </p>
          <p>
            KVKK kapsamındaki haklarınız için <Link href="/iletisim" className="text-[#D4AF37] hover:underline">iletişim</Link> sayfamızdan bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </main>
  );
}

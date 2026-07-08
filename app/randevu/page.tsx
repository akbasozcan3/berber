import type { Metadata } from "next";
import PageHeader from "../components/ui/PageHeader";
import Booking from "../components/booking/Booking";

export const metadata: Metadata = {
  title: "Randevu Al",
  description:
    "New Life Erkek Kuaförü'nde kolayca online randevu alın. Tercih ettiğiniz stilist, hizmet ve saati seçerek sıra beklemeden gelin.",
};

export default function RandevuPage() {
  return (
    <main>
      <PageHeader
        title="Online Randevu"
        subtitle="Zamanınız değerlidir. Sıra beklemeden, dilediğiniz gün ve saatte yerinizi rezerve edin."
        bg="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop"
      />
      <Booking />
    </main>
  );
}

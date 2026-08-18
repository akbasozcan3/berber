"use client";

import PageHeader from "@/components/admin/ui/PageHeader";
import BookingHoursPanel from "@/components/admin/BookingHoursPanel";

export default function BookingHoursPage() {
  return (
    <div>
      <PageHeader
        title="Randevu Saatleri"
        description="Müşterinin sitede göreceği ilk saat, son saat ve buçukları buradan ayarlayın."
      />
      <BookingHoursPanel />
    </div>
  );
}

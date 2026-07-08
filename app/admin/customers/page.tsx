"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Avatar from "@/components/admin/ui/Avatar";
import SearchInput from "@/components/admin/ui/SearchInput";
import { adminApi, type AdminCustomer } from "@/lib/api/admin";
import { formatCurrency, formatDate } from "@/lib/admin/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { adminApi.getCustomers().then(setCustomers); }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div>
      <PageHeader title="Müşteriler" description={`${customers.length} kayıtlı müşteri`}
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Ara..." className="w-64" />} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover>
              <div className="flex items-center gap-4">
                <Avatar name={c.name} size="lg" />
                <div>
                  <h3 className="font-semibold text-[#F8F8F8]">{c.name}</h3>
                  <p className="text-sm text-[#71717A]">{c.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="p-3 bg-[#0A0A0A] rounded-2xl border border-white/[0.06]">
                  <p className="text-xs text-[#71717A]">Ziyaret</p>
                  <p className="text-lg font-semibold text-[#F8F8F8]">{c.visitCount}</p>
                </div>
                <div className="p-3 bg-[#0A0A0A] rounded-2xl border border-white/[0.06]">
                  <p className="text-xs text-[#71717A]">Harcama</p>
                  <p className="text-lg font-semibold text-[#D4AF37]">{formatCurrency(c.totalSpent)}</p>
                </div>
              </div>
              {c.lastVisit && <p className="text-xs text-[#71717A] mt-3">Son ziyaret: {formatDate(c.lastVisit)}</p>}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

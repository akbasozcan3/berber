"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { api } from "@/lib/api/client";
import Input from "@/components/admin/ui/Input";
import Button from "@/components/admin/ui/Button";
import { businessInitials } from "@/lib/utils/brand";

export default function AdminLoginPage({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.login(email, password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] flex items-center justify-center mx-auto mb-4 overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={businessName} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-[#090909] font-bold text-xl">{businessInitials(businessName)}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-[#F8F8F8]">Admin Girişi</h1>
          <p className="text-sm text-[#71717A] mt-2">{businessName} Yönetim Paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/[0.06] rounded-[20px] p-8 space-y-5">
          <Input
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

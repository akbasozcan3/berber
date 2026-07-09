"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Sparkles,
  Image,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ClipboardList,
  MessageSquare,
  Ban,
  FileText,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/admin/cn";
import Avatar from "../ui/Avatar";
import { api } from "@/lib/api/client";
import { adminApi } from "@/lib/api/admin";
import { businessInitials } from "@/lib/utils/brand";
import { useAdminSession } from "@/lib/context/AdminSessionContext";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Randevular", icon: ClipboardList },
  { href: "/admin/calendar", label: "Takvim", icon: Calendar },
  { href: "/admin/availability", label: "Müsaitlik", icon: Ban },
  { href: "/admin/customers", label: "Müşteriler", icon: Users },
  { href: "/admin/barbers", label: "Berberler", icon: Scissors },
  { href: "/admin/services", label: "Hizmetler", icon: Sparkles },
  { href: "/admin/hero", label: "Banner / Slider", icon: Layout },
  { href: "/admin/content", label: "İçerik / Makale", icon: FileText },
  { href: "/admin/gallery", label: "Galeri & Instagram", icon: Image },
  { href: "/admin/reviews", label: "Yorumlar", icon: Star },
  { href: "/admin/messages", label: "Mesajlar", icon: MessageSquare },
  { href: "/admin/reports", label: "Raporlar", icon: BarChart3 },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAdminSession();
  const displayName = user?.name ?? "Admin";
  const [businessName, setBusinessName] = useState("Salon");

  useEffect(() => {
    adminApi.getSettings().then((s) => {
      if (s.business_name) setBusinessName(s.business_name);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={cn("p-5 border-b border-white/[0.06]", collapsed && "px-3")}>
        <Link href="/admin" className="flex items-center gap-3" onClick={onMobileClose}>
          <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <span className="text-[#090909] font-bold text-sm">
              {businessInitials(businessName)}
            </span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-[#F8F8F8] font-semibold text-sm tracking-wide line-clamp-1">{businessName}</p>
              <p className="text-[#71717A] text-[10px] tracking-widest uppercase">Yönetim Paneli</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                  : "text-[#71717A] hover:text-[#F8F8F8] hover:bg-white/[0.04]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-3 border-t border-white/[0.06] space-y-1", collapsed && "px-2")}>
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-2xl",
            collapsed && "justify-center px-2"
          )}
        >
          <Avatar name={displayName} size="sm" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#F8F8F8] truncate">{displayName}</p>
              <p className="text-xs text-[#71717A]">Admin</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-sm font-medium text-[#71717A] hover:text-red-400 hover:bg-red-500/5 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#0D0D0D] border-r border-white/[0.06] z-30"
      >
        {sidebarContent}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1A1A1A] border border-white/[0.06] rounded-full flex items-center justify-center text-[#71717A] hover:text-[#F8F8F8] transition-colors"
        >
          <ChevronLeft
            className={cn("w-3.5 h-3.5 transition-transform duration-300", collapsed && "rotate-180")}
          />
        </button>
      </motion.aside>

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[260px] bg-[#0D0D0D] border-r border-white/[0.06] z-50 lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

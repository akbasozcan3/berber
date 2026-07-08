"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/layout/Sidebar";
import Header from "@/components/admin/layout/Header";
import { cn } from "@/lib/admin/cn";
import { AdminSessionProvider } from "@/lib/context/AdminSessionContext";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminSessionProvider>
    <div className="min-h-screen bg-[#090909] text-[#F8F8F8]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        <Header
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
        />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
    </AdminSessionProvider>
  );
}

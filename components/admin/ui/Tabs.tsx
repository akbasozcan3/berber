"use client";

import { cn } from "@/lib/admin/cn";

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-[#0A0A0A] rounded-2xl border border-white/[0.06]", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
            activeTab === tab.id
              ? "bg-[#1A1A1A] text-[#F8F8F8] shadow-sm"
              : "text-[#71717A] hover:text-[#A1A1AA]"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                activeTab === tab.id ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-white/[0.04] text-[#71717A]"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

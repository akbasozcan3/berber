"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/admin/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[#A1A1AA]">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-11 bg-[#0A0A0A] border border-white/[0.06] rounded-2xl text-[#F8F8F8] text-sm placeholder:text-[#52525B] transition-all duration-200",
              "focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20",
              icon ? "pl-10 pr-4" : "px-4",
              error && "border-red-500/40",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

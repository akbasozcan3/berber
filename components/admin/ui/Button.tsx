"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/admin/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-2xl disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-[#D4AF37] text-[#090909] hover:bg-[#C4A030] active:scale-[0.98]": variant === "primary",
            "bg-[#1A1A1A] text-[#F8F8F8] border border-white/[0.06] hover:bg-[#222] hover:border-white/10": variant === "secondary",
            "text-[#A1A1AA] hover:text-[#F8F8F8] hover:bg-white/[0.04]": variant === "ghost",
            "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20": variant === "danger",
            "border border-white/[0.06] text-[#F8F8F8] hover:bg-white/[0.04] hover:border-white/10": variant === "outline",
            "h-8 px-3 text-xs rounded-xl": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10 p-0 rounded-xl": size === "icon",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

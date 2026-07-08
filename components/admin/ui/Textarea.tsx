"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/admin/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[#A1A1AA]">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] bg-[#0A0A0A] border border-white/[0.06] rounded-2xl text-[#F8F8F8] text-sm px-4 py-3 placeholder:text-[#52525B] resize-none transition-all duration-200",
            "focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;

"use client";

import { cn } from "@/lib/admin/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={cn("flex items-center justify-between gap-4", disabled && "opacity-50 cursor-not-allowed")}>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-[#F8F8F8]">{label}</p>}
          {description && <p className="text-xs text-[#71717A] mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
          checked ? "bg-[#D4AF37]" : "bg-[#27272A]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm",
            checked && "translate-x-5"
          )}
        />
      </button>
    </label>
  );
}

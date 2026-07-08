"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { uploadImage } from "@/lib/admin/upload";
import { cn } from "@/lib/admin/cn";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  previewHeightClass?: string;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  folder = "general",
  className,
  previewHeightClass = "h-40",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="text-xs text-[#71717A] mb-2 block">{label}</label>
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-4">
        {value ? (
          <div
            className={cn(
              "relative w-full mb-3 rounded-lg overflow-hidden border border-white/[0.06] bg-black",
              previewHeightClass
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className={cn(
              "mb-3 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-[#52525B]",
              previewHeightClass
            )}
          >
            <ImageIcon size={28} strokeWidth={1.5} />
            <span className="text-[11px]">Henüz görsel yok</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#1A1A1A] border border-white/[0.08] text-sm text-[#F8F8F8] hover:border-[#D4AF37]/30 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Yükleniyor..." : value ? "Görseli Değiştir" : "Görsel Yükle"}
        </button>

        <p className="text-[10px] text-[#52525B] mt-2 text-center">
          Telefon veya bilgisayardan seçin · Maks. 5MB
        </p>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Textarea from "@/components/admin/ui/Textarea";
import Toggle from "@/components/admin/ui/Toggle";
import ImageUpload from "@/components/admin/ui/ImageUpload";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string | null;
  ctaText: string;
  ctaLink: string;
  sortOrder: number;
  enabled: boolean;
}

export default function HeroAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [saved, setSaved] = useState(false);

  const load = () =>
    fetch("/api/v1/admin/hero", { credentials: "include" })
      .then((r) => r.json())
      .then(setSlides);

  useEffect(() => {
    load();
  }, []);

  const update = (id: number, field: string, value: string | boolean | number) => {
    setSlides((s) => s.map((sl) => (sl.id === id ? { ...sl, [field]: value } : sl)));
  };

  const saveAll = async () => {
    for (const slide of slides) {
      await fetch("/api/v1/admin/hero", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slide),
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const addSlide = async () => {
    await fetch("/api/v1/admin/hero", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Yeni Slayt",
        subtitle: "",
        description: "",
        image: "",
        sortOrder: slides.length + 1,
      }),
    });
    load();
  };

  const deleteSlide = async (id: number) => {
    await fetch(`/api/v1/admin/hero?id=${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Banner / Slider Yönetimi"
        description="Ana sayfa hero slider · görsel yükleme"
        actions={
          <>
            <Button variant="outline" onClick={addSlide}>
              <Plus className="w-4 h-4" /> Slayt Ekle
            </Button>
            <Button onClick={saveAll}>
              <Save className="w-4 h-4" />
              {saved ? "Kaydedildi!" : "Kaydet"}
            </Button>
          </>
        }
      />
      <div className="space-y-6">
        {slides.map((slide) => (
          <Card key={slide.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#F8F8F8]">Slayt #{slide.sortOrder}</h3>
              <div className="flex items-center gap-3">
                <Toggle
                  label="Aktif"
                  checked={slide.enabled}
                  onChange={(v) => update(slide.id, "enabled", v)}
                />
                <Button variant="ghost" size="sm" onClick={() => deleteSlide(slide.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Başlık"
                value={slide.title}
                onChange={(e) => update(slide.id, "title", e.target.value)}
              />
              <Input
                label="Alt Başlık"
                value={slide.subtitle}
                onChange={(e) => update(slide.id, "subtitle", e.target.value)}
              />
              <Textarea
                label="Açıklama"
                value={slide.description}
                onChange={(e) => update(slide.id, "description", e.target.value)}
                className="md:col-span-2"
              />
              <div className="md:col-span-2">
                <ImageUpload
                  label="Slayt Görseli"
                  folder="hero"
                  value={slide.image}
                  onChange={(url) => update(slide.id, "image", url)}
                  previewHeightClass="h-48"
                />
              </div>
              <Input
                label="Rozet"
                value={slide.badge || ""}
                onChange={(e) => update(slide.id, "badge", e.target.value)}
              />
              <Input
                label="Sıra"
                type="number"
                value={String(slide.sortOrder)}
                onChange={(e) => update(slide.id, "sortOrder", Number(e.target.value))}
              />
              <Input
                label="CTA Metni"
                value={slide.ctaText}
                onChange={(e) => update(slide.id, "ctaText", e.target.value)}
              />
              <Input
                label="CTA Link"
                value={slide.ctaLink}
                onChange={(e) => update(slide.id, "ctaLink", e.target.value)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Save, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import ImageUpload from "@/components/admin/ui/ImageUpload";
import { adminApi, type AdminGallery } from "@/lib/api/admin";

export default function GalleryPage() {
  const [images, setImages] = useState<AdminGallery[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { title: string; url: string }>>({});
  const [newItem, setNewItem] = useState({ title: "", url: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = () => {
    adminApi.getGallery().then((list) => {
      setImages(list);
      setDrafts(Object.fromEntries(list.map((i) => [i.id, { title: i.title, url: i.url }])));
    });
  };

  useEffect(() => {
    load();
  }, []);

  const saveImage = async (id: number) => {
    const d = drafts[id];
    if (!d?.url) {
      showToast("Önce görsel yükleyin.");
      return;
    }
    await adminApi.updateGallery(id, { title: d.title, url: d.url });
    showToast("Galeri görseli kaydedildi.");
    load();
  };

  const addImage = async () => {
    if (!newItem.title.trim() || !newItem.url.trim()) {
      showToast("Başlık ve görsel gerekli.");
      return;
    }
    await adminApi.createGallery({
      title: newItem.title,
      url: newItem.url,
      sortOrder: images.length + 1,
    });
    setNewItem({ title: "", url: "" });
    showToast("Yeni görsel eklendi.");
    load();
  };

  const removeImage = async (id: number) => {
    await adminApi.deleteGallery(id);
    showToast("Görsel silindi.");
    load();
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">
          {toast}
        </div>
      )}

      <PageHeader title="Galeri" description={`${images.length} fotoğraf · dosyadan yükle`} />

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Yeni Görsel Başlık"
            value={newItem.title}
            onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
          />
          <ImageUpload
            label="Yeni Görsel"
            folder="gallery"
            value={newItem.url}
            onChange={(url) => setNewItem((p) => ({ ...p, url }))}
          />
        </div>
        <Button onClick={addImage} className="mt-4">
          <Plus className="w-4 h-4" />
          Görsel Ekle
        </Button>
      </Card>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {images.map((img) => (
          <Card key={img.id} padding="none" className="mb-4 break-inside-avoid overflow-hidden">
            <div className="relative h-56">
              <Image
                src={drafts[img.id]?.url || img.url}
                alt={img.title}
                fill
                className="object-cover"
                unoptimized={(drafts[img.id]?.url || img.url).startsWith("/uploads")}
              />
            </div>
            <div className="p-4 space-y-3">
              <Input
                label="Başlık"
                value={drafts[img.id]?.title || ""}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [img.id]: { ...(prev[img.id] ?? { title: "", url: "" }), title: e.target.value },
                  }))
                }
              />
              <ImageUpload
                label="Görsel"
                folder="gallery"
                value={drafts[img.id]?.url || ""}
                onChange={(url) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [img.id]: { ...(prev[img.id] ?? { title: img.title, url: "" }), url },
                  }))
                }
                previewHeightClass="h-32"
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => saveImage(img.id)} className="flex-1">
                  <Save className="w-4 h-4" />
                  Kaydet
                </Button>
                <Button variant="danger" onClick={() => removeImage(img.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Award, Check } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import Avatar from "@/components/admin/ui/Avatar";
import { adminApi, type AdminReview } from "@/lib/api/admin";
import { formatDate } from "@/lib/admin/utils";
import { cn } from "@/lib/admin/cn";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);

  useEffect(() => { adminApi.getReviews().then(setReviews); }, []);

  const update = async (id: number, data: Partial<AdminReview>) => {
    await adminApi.updateReview(id, data);
    adminApi.getReviews().then(setReviews);
  };

  const pending = reviews.filter((r) => !r.approved);

  return (
    <div>
      <PageHeader title="Yorumlar" description={`${reviews.length} yorum · ${pending.length} onay bekliyor`} />
      <div className="space-y-4">
        {reviews.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn(!review.approved && "border-yellow-500/20")}>
              <div className="flex items-start gap-4">
                <Avatar name={review.customerName} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[#F8F8F8]">{review.customerName}</h3>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      ))}
                    </div>
                    {!review.approved && <Badge label="Onay Bekliyor" variant="gold" />}
                    {review.featured && <Badge label="Öne Çıkan" variant="gold" />}
                    <Badge label={review.source === "google" ? "Google" : "Website"} variant="outline" />
                  </div>
                  <p className="text-xs text-[#71717A] mt-1">{formatDate(review.createdAt)}</p>
                  {review.customerEmail && (
                    <p className="text-xs text-[#D4AF37] mt-1">{review.customerEmail}</p>
                  )}
                  <p className="text-sm text-[#A1A1AA] mt-3">{review.review}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
                {!review.approved && (
                  <Button size="sm" onClick={() => update(review.id, { approved: true })}>
                    <Check className="w-3.5 h-3.5" /> Onayla
                  </Button>
                )}
                <Button variant={review.featured ? "primary" : "outline"} size="sm" onClick={() => update(review.id, { featured: !review.featured })}>
                  <Award className="w-3.5 h-3.5" /> {review.featured ? "Öne Çıkarıldı" : "Öne Çıkar"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

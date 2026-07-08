import type { Metadata } from "next";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";
import { getLegalContent } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "Çerez Politikası",
};

export default async function CookiePage() {
  const page = await getLegalContent("legal_cookies");
  return <LegalPageLayout title={page.title} content={page.content} />;
}

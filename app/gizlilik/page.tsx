import type { Metadata } from "next";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";
import { getLegalContent } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
};

export default async function PrivacyPage() {
  const page = await getLegalContent("legal_privacy");
  return <LegalPageLayout title={page.title} content={page.content} />;
}

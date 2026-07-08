import type { Metadata } from "next";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";
import { getLegalContent } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
};

export default async function TermsPage() {
  const page = await getLegalContent("legal_terms");
  return <LegalPageLayout title={page.title} content={page.content} />;
}

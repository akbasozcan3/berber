import type { Metadata } from "next";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";
import { getLegalContent } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
};

export default async function KvkkPage() {
  const page = await getLegalContent("legal_kvkk");
  return <LegalPageLayout title={page.title} content={page.content} />;
}

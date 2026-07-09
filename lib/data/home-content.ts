export type HomeStatItem = { title: string; desc: string };

const DEFAULT_STATS: HomeStatItem[] = [
  { title: "Randevulu Hizmet", desc: "Beklemeden tam saatinde hizmet." },
  { title: "Uzman Berberler", desc: "Kişiye özel modern kesimler." },
  { title: "Premium Bakım", desc: "Profesyonel saç ve sakal bakımı." },
  { title: "Konforlu Salon", desc: "Rahat ve modern atmosfer." },
  { title: "Kaliteli Ürünler", desc: "Dünya markalarıyla bakım." },
];

export function parseHomeStatsJson(raw: string | null | undefined): HomeStatItem[] {
  if (!raw?.trim()) return DEFAULT_STATS;
  try {
    const parsed = JSON.parse(raw) as HomeStatItem[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fall through
  }
  return DEFAULT_STATS;
}

export function normalizeMultilineText(text: string): string {
  if (!text) return "";

  let result = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/&#10;|&#x0a;/gi, "\n");

  for (let i = 0; i < 5; i++) {
    const next = result.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    if (next === result) break;
    result = next;
  }

  return result.trim();
}

export function splitTitleLines(title: string, fallbackLine1: string, fallbackLine2 = ""): [string, string] {
  const normalized = normalizeMultilineText(title);
  const parts = normalized.split("\n").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return [fallbackLine1, fallbackLine2];
  if (parts.length === 1) {
    const single = parts[0];
    if (single.includes("\\n")) {
      return splitTitleLines(single.replace(/\\n/g, "\n"), fallbackLine1, fallbackLine2);
    }
    return [single, fallbackLine2];
  }
  return [parts[0], parts.slice(1).join(" ")];
}

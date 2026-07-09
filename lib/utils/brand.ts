export function businessInitials(name?: string | null, fallback = "SA"): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function splitBusinessNameForLogo(name?: string | null): { primary: string; secondary: string } {
  const safe = (name || "").trim();
  if (!safe) return { primary: "SALON", secondary: "KUAFÖR" };
  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { primary: parts[0].toUpperCase(), secondary: "" };
  return {
    primary: parts[0].toUpperCase(),
    secondary: parts.slice(1).join(" "),
  };
}

export function brandWordmark(name?: string | null): string {
  const first = (name || "").trim().split(/\s+/)[0];
  return (first || "SALON").toUpperCase().slice(0, 12);
}

export function withBusinessName(template: string, businessName: string): string {
  return template.replace(/\{business\}/g, businessName || "Salon");
}

export const siteLogoImageClass =
  "h-24 sm:h-28 md:h-32 lg:h-36 w-auto max-w-[min(520px,64vw)] object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]";

export const navbarLogoImageClass =
  "h-14 sm:h-16 md:h-[4.25rem] w-auto max-w-[min(400px,48vw)] object-contain object-left drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]";

export function businessInitials(name?: string | null, fallback = "TB"): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

const LEGACY_DEFAULT_NAME = /^new\s*life/i;

/** Seed leftover. Live site is The Barber — never show New Life in the chrome. */
export function resolvePublicBusinessName(name?: string | null): string {
  const safe = (name || "").trim();
  if (!safe || LEGACY_DEFAULT_NAME.test(safe)) return "The Barber";
  return safe;
}

export function splitBusinessNameForLogo(name?: string | null): { primary: string; secondary: string } {
  const safe = resolvePublicBusinessName(name);
  if (/^the\s+barber$/i.test(safe)) {
    return { primary: "THE BARBER", secondary: "" };
  }
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
  "absolute left-0 top-[calc(50%+6px)] -translate-y-1/2 h-24 sm:h-28 md:h-32 lg:h-36 w-auto max-w-[min(520px,64vw)] object-contain object-left drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]";

export const mobileLogoImageClass =
  "h-16 w-auto max-w-[220px] object-contain object-left";

import { normalizeMultilineText } from "./home-content";

export const MULTILINE_SETTING_KEYS = [
  "home_gallery_title",
  "home_testimonials_title",
  "home_booking_cta_title",
  "services_section_title",
  "experience_title",
] as const;

export type MultilineSettingKey = (typeof MULTILINE_SETTING_KEYS)[number];

export function isMultilineSettingKey(key: string): key is MultilineSettingKey {
  return (MULTILINE_SETTING_KEYS as readonly string[]).includes(key);
}

export function normalizeMultilineSettingValue(value: string | null | undefined): string {
  if (!value) return "";
  return normalizeMultilineText(value);
}

export function normalizeSettingsRecord(all: Record<string, string>): Record<string, string> {
  const out = { ...all };
  for (const key of MULTILINE_SETTING_KEYS) {
    if (out[key]) out[key] = normalizeMultilineSettingValue(out[key]);
  }
  return out;
}

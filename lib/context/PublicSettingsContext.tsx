"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import type { PublicSettings } from "@/lib/api/client";
import { publicSettingsDefaults } from "@/lib/data/public-settings-defaults";
import { resolvePublicBusinessName } from "@/lib/utils/brand";

type PublicSettingsContextValue = PublicSettings & {
  brandLogoUrl: string;
};

const PublicSettingsContext = createContext<PublicSettingsContextValue>({
  ...publicSettingsDefaults,
  brandLogoUrl: "",
});

function mergePublicSettings(prev: PublicSettings, next: PublicSettings): PublicSettings {
  const nextName = resolvePublicBusinessName(next.businessName);
  const prevName = resolvePublicBusinessName(prev.businessName);
  return {
    ...next,
    businessName: nextName || prevName,
    logoUrl: next.logoUrl || prev.logoUrl,
    faviconUrl: next.faviconUrl || prev.faviconUrl,
  };
}

export function PublicSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: PublicSettings;
}) {
  const seed = initialSettings ?? publicSettingsDefaults;
  const [settings, setSettings] = useState<PublicSettings>({
    ...seed,
    businessName: resolvePublicBusinessName(seed.businessName),
  });
  const stickyLogo = useRef(seed.logoUrl);
  const stickyName = useRef(resolvePublicBusinessName(seed.businessName));

  useEffect(() => {
    api
      .getPublicSettings()
      .then((next) => {
        setSettings((prev) => mergePublicSettings(prev, next));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (settings.logoUrl) stickyLogo.current = settings.logoUrl;
  }, [settings.logoUrl]);

  useEffect(() => {
    const name = resolvePublicBusinessName(settings.businessName);
    if (name) stickyName.current = name;
  }, [settings.businessName]);

  const value = useMemo<PublicSettingsContextValue>(
    () => ({
      ...settings,
      businessName: resolvePublicBusinessName(settings.businessName || stickyName.current),
      brandLogoUrl: settings.logoUrl || stickyLogo.current,
    }),
    [settings]
  );

  return <PublicSettingsContext.Provider value={value}>{children}</PublicSettingsContext.Provider>;
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}

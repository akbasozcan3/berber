"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import type { PublicSettings } from "@/lib/api/client";
import { publicSettingsDefaults } from "@/lib/data/public-settings-defaults";

type PublicSettingsContextValue = PublicSettings & {
  brandLogoUrl: string;
};

const PublicSettingsContext = createContext<PublicSettingsContextValue>({
  ...publicSettingsDefaults,
  brandLogoUrl: "",
});

function mergePublicSettings(prev: PublicSettings, next: PublicSettings): PublicSettings {
  return {
    ...next,
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
  const [settings, setSettings] = useState<PublicSettings>(seed);
  const stickyLogo = useRef(seed.logoUrl);

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

  const value = useMemo<PublicSettingsContextValue>(
    () => ({
      ...settings,
      brandLogoUrl: settings.logoUrl || stickyLogo.current,
    }),
    [settings]
  );

  return <PublicSettingsContext.Provider value={value}>{children}</PublicSettingsContext.Provider>;
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}

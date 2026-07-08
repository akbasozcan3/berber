"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { PublicSettings } from "@/lib/api/client";
import { publicSettingsDefaults } from "@/lib/data/public-settings-defaults";

const PublicSettingsContext = createContext<PublicSettings>(publicSettingsDefaults);

export function PublicSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: PublicSettings;
}) {
  const [settings, setSettings] = useState<PublicSettings>(initialSettings ?? publicSettingsDefaults);

  useEffect(() => {
    api.getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <PublicSettingsContext.Provider value={settings}>{children}</PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/client";

interface AdminUser {
  name: string;
  email: string;
}

const AdminSessionContext = createContext<AdminUser | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    api
      .getSession()
      .then((session) => {
        if (session.authenticated && session.user) setUser(session.user);
      })
      .catch(() => {});
  }, []);

  return <AdminSessionContext.Provider value={user}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

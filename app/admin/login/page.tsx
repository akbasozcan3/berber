import type { Metadata } from "next";
import AdminLoginPage from "./login-client";

export const metadata: Metadata = {
  title: "Admin Giriş",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminLoginPage />;
}

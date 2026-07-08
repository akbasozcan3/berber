import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "newlife-super-secret-key-change-in-production"
);

const COOKIE_NAME = "newlife_admin_token";
const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ozcanakbas38@gmail.com";

export async function login(email: string, password: string) {
  if (email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Bu panele erişim yetkiniz yok.");
  }

  const user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  if (!user) throw new Error("Geçersiz e-posta veya şifre.");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Geçersiz e-posta veya şifre.");

  const token = await new SignJWT({ sub: String(user.id), email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const email = payload.email as string;
    if (email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) return null;
    return {
      id: Number(payload.sub),
      email,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

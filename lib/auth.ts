import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "newlife-super-secret-key-change-in-production"
);

const COOKIE_NAME = "newlife_admin_token";
const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ozcanakbas38@gmail.com";
const ALLOWED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export async function login(email: string, password: string) {
  if (email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Bu panele erişim yetkiniz yok.");
  }

  if (!ALLOWED_ADMIN_PASSWORD || password !== ALLOWED_ADMIN_PASSWORD) {
    throw new Error("Geçersiz e-posta veya şifre.");
  }

  const token = await new SignJWT({ sub: "1", email: ALLOWED_ADMIN_EMAIL, name: "Admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return { token, user: { id: 1, name: "Admin", email: ALLOWED_ADMIN_EMAIL } };
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

import { login, setAuthCookie } from "@/lib/auth";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";

export async function POST(request: Request) {
  try {
    const { email, password } = await parseBody<{ email: string; password: string }>(request);
    const result = await login(email, password);
    await setAuthCookie(result.token);
    return jsonResponse({ success: true, user: result.user });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Giriş başarısız.", 401);
  }
}

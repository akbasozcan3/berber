import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { getEmailStatus, sendTestEmail } from "@/lib/services/email";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
    const status = await getEmailStatus();
    return jsonResponse({ status });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    let to: string | undefined;
    try {
      const body = await parseBody<{ to?: string }>(request);
      to = body.to;
    } catch {
      to = undefined;
    }
    const result = await sendTestEmail(to);
    if (!result.sent) {
      return jsonResponse(
        {
          success: false,
          error: result.error || result.reason || "Test e-postası gönderilemedi",
          result,
        },
        400
      );
    }
    return jsonResponse({ success: true, result });
  } catch (error) {
    console.error("[Email Test]", error);
    return errorResponse(error instanceof Error ? error.message : "Unauthorized", 401);
  }
}

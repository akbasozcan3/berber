import { ensureDb } from "@/lib/db/ensure";
import { getAvailableSlots } from "@/lib/services/booking";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await ensureDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const barberId = searchParams.get("barberId");

    if (!date || !serviceId) {
      return errorResponse("date ve serviceId gereklidir.");
    }

    const slots = await getAvailableSlots(
      date,
      Number(serviceId),
      barberId ? Number(barberId) : null
    );

    const response = jsonResponse(slots);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch {
    return errorResponse("Müsait saatler yüklenemedi.", 500);
  }
}

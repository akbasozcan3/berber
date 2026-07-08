import { ensureDb } from "@/lib/db/ensure";
import { getAvailableSlots } from "@/lib/services/booking";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function GET(request: Request) {
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

  return jsonResponse(slots);
}

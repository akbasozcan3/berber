import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";
import { deleteCustomerWithAppointments } from "@/lib/services/customers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { id } = await params;
    const customerId = Number(id);
    if (!customerId) return errorResponse("Geçersiz müşteri ID", 400);

    const result = await deleteCustomerWithAppointments(customerId);
    return jsonResponse({ success: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "Müşteri bulunamadı") {
      return errorResponse(error.message, 404);
    }
    return errorResponse("Unauthorized", 401);
  }
}

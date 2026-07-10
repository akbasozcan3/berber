import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";
import { getAdminCustomers } from "@/lib/services/customers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
    const customers = await getAdminCustomers();
    return jsonResponse(customers);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

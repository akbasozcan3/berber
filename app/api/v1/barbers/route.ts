import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { barbers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse } from "@/lib/api/helpers";

export async function GET() {
  await ensureDb();
  const data = await db
    .select()
    .from(barbers)
    .where(eq(barbers.available, true))
    .orderBy(barbers.sortOrder);
  return jsonResponse(data);
}

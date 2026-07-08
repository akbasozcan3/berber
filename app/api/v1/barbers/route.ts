import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { barbers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { jsonResponse } from "@/lib/api/helpers";

export async function GET() {
  await ensureDb();
  const data = await db
    .select()
    .from(barbers)
    .where(and(eq(barbers.available, true), eq(barbers.onVacation, false)))
    .orderBy(barbers.sortOrder);
  return jsonResponse(data);
}

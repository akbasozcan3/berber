import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse } from "@/lib/api/helpers";

export async function GET() {
  await ensureDb();
  const data = await db.select().from(services).where(eq(services.enabled, true)).orderBy(services.sortOrder);
  return jsonResponse(data);
}

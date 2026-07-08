import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { heroSlides } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse } from "@/lib/api/helpers";

export async function GET() {
  await ensureDb();
  const slides = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.enabled, true))
    .orderBy(heroSlides.sortOrder);
  return jsonResponse(slides);
}

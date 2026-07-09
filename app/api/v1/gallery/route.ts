import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/db/schema";
import { jsonResponse } from "@/lib/api/helpers";
import { mapGalleryRow } from "@/lib/utils/gallery";

export async function GET() {
  await ensureDb();
  const data = await db.select().from(galleryImages).orderBy(galleryImages.sortOrder);
  return jsonResponse(data.map(mapGalleryRow));
}

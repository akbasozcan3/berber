import { ensureDb } from "@/lib/db/ensure";
import { getSettings } from "@/lib/services/booking";
import { jsonResponse } from "@/lib/api/helpers";
import { mapSettingsToPublic } from "@/lib/data/public-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const all = await getSettings();
  const response = jsonResponse(mapSettingsToPublic(all));
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

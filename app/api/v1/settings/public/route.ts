import { ensureDb } from "@/lib/db/ensure";
import { getSettings } from "@/lib/services/booking";
import { jsonResponse } from "@/lib/api/helpers";
import { mapSettingsToPublic } from "@/lib/data/public-settings";

export async function GET() {
  await ensureDb();
  const all = await getSettings();
  return jsonResponse(mapSettingsToPublic(all));
}

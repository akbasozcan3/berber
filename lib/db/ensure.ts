import { seedDatabase } from "@/lib/db/seed";
import { initDatabase } from "@/lib/db";
import { runSettingsMigrations } from "@/lib/db/settings-migrations";

let seeding: Promise<void> | null = null;

/** Verifies DB connectivity. Full seed runs at build (db:setup), not on every request. */
export async function ensureDb() {
  await initDatabase();
  await runSettingsMigrations();
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  // Serverless: never seed per request — exhausts Postgres connection limits.
  if (process.env.VERCEL && process.env.RUN_DB_SEED !== "true") return;

  if (!seeding) {
    seeding = seedDatabase();
  }
  await seeding;
}

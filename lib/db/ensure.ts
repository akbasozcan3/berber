import { seedDatabase } from "@/lib/db/seed";
import { initDatabase } from "@/lib/db";

let seeding: Promise<void> | null = null;

/** Ensures SQLite is initialized and seeded once per process. */
export async function ensureDb() {
  initDatabase();
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (!seeding) {
    seeding = seedDatabase();
  }
  await seeding;
}

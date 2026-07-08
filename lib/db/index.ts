import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (!process.env[key]) process.env[key] = value;
  }
}

const globalForDb = globalThis as typeof globalThis & {
  __pgPool?: Pool;
  __drizzleDb?: NodePgDatabase<typeof schema>;
};

let initialized = false;
let initPromise: Promise<void> | null = null;

function resolveConnectionString(): string {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) loadLocalEnv();

  // Prefer pooled URL on Vercel/serverless (avoids prisma_migration connection limits).
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error(
      "PostgreSQL bağlantısı bulunamadı. Ortama `POSTGRES_URL` veya `DATABASE_URL` ekleyin."
    );
  }

  return connectionString;
}

function getPool() {
  if (!globalForDb.__pgPool) {
    const isServerless = Boolean(process.env.VERCEL);
    globalForDb.__pgPool = new Pool({
      connectionString: resolveConnectionString(),
      max: isServerless ? 1 : 5,
      idleTimeoutMillis: isServerless ? 5000 : 30000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: isServerless,
    });
  }
  return globalForDb.__pgPool;
}

export function getDb() {
  if (!globalForDb.__drizzleDb) {
    globalForDb.__drizzleDb = drizzle(getPool(), { schema });
  }
  return globalForDb.__drizzleDb;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export async function initDatabase() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const database = getPool();
    await database.query("select 1");
    initialized = true;
  })();

  return initPromise;
}

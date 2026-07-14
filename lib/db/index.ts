import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgresJs from "postgres";
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

function resolveConnectionString(): string {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) loadLocalEnv();

  // Supabase: POSTGRES_URL = Transaction Pooler (port 6543, IPv4 compatible)
  // DATABASE_URL = Direct connection (IPv6 only — sadece local/migration için)
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error(
      "PostgreSQL bağlantısı bulunamadı. Vercel'e `POSTGRES_URL` ekleyin."
    );
  }

  return connectionString;
}

const globalForDb = globalThis as typeof globalThis & {
  __postgresClient?: ReturnType<typeof postgresJs>;
  __drizzleDb?: PostgresJsDatabase<typeof schema>;
};

let initialized = false;
let initPromise: Promise<void> | null = null;

function getClient() {
  if (!globalForDb.__postgresClient) {
    const isServerless = Boolean(process.env.VERCEL);
    globalForDb.__postgresClient = postgresJs(resolveConnectionString(), {
      max: isServerless ? 1 : 5,
      idle_timeout: isServerless ? 10 : 30,
      connect_timeout: 15,
      ssl: { rejectUnauthorized: false },
      prepare: false, // Transaction pooler uyumluluğu için
    });
  }
  return globalForDb.__postgresClient;
}

export function getDb() {
  if (!globalForDb.__drizzleDb) {
    globalForDb.__drizzleDb = drizzle(getClient(), { schema });
  }
  return globalForDb.__drizzleDb;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export async function initDatabase() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const client = getClient();
    await client`select 1`;
    initialized = true;
  })();

  return initPromise;
}

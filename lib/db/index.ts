import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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

    value = value
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();


function resolveConnectionString() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL bulunamadı. .env.local dosyanı kontrol et."
    );
  }

  return url;
}


const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: PostgresJsDatabase<typeof schema>;
};


function getClient() {

  if (!globalForDb.postgresClient) {

    const isServerless = Boolean(process.env.VERCEL);

    globalForDb.postgresClient = postgres(
      resolveConnectionString(),
      {
        max: isServerless ? 1 : 5,

        idle_timeout: isServerless
          ? 10
          : 30,

        connect_timeout: 15,

        prepare: false,

        ssl: "require",
      }
    );
  }

  return globalForDb.postgresClient;
}



export function getDb() {

  if (!globalForDb.drizzleDb) {

    globalForDb.drizzleDb = drizzle(
      getClient(),
      {
        schema,
      }
    );

  }

  return globalForDb.drizzleDb;
}



export const db = new Proxy(
  {} as PostgresJsDatabase<typeof schema>,
  {
    get(_target, prop) {

      return Reflect.get(
        getDb(),
        prop
      );

    },
  }
);



let initialized = false;

let initPromise: Promise<void> | null = null;



export async function initDatabase() {

  if (initialized)
    return;


  if (initPromise)
    return initPromise;


  initPromise = (async () => {

    const client = getClient();


    await client`
      SELECT 1
    `;


    initialized = true;

  })();


  return initPromise;
}
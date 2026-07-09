import type { Config } from "drizzle-kit";
import fs from "fs";
import path from "path";

// drizzle-kit CLI çalıştırılırken `.env.local` otomatik yüklenmeyebiliyor.
// Bu küçük yükleyici ile localde `DATABASE_URL`'ı alıyoruz.
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    // Strip surrounding quotes if present
    value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (!process.env[key]) process.env[key] = value;
  }
}

// Migrate needs a direct (non-pooled) connection. Runtime app uses POSTGRES_URL (pooled).
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  "";

const drizzleConfig: Config = {
  schema: ["./lib/db/schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl || "",
  },
  // When the connection string is missing, drizzle-kit commands will fail with a clear error.
};

export default drizzleConfig;


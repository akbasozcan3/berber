import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

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


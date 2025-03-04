import type { Config } from "drizzle-kit"

export default {
  schema: "./src/lib/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config



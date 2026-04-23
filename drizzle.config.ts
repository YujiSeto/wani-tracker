import { defineConfig } from 'drizzle-kit';

// drizzle-kit reads .env natively (via dotenv).
// For runtime, src/db/index.ts uses DATABASE_URL from .env.local.
// For migrations, set DATABASE_URL_DIRECT in .env pointing to port 5432
// (Session Mode pooler or direct connection — both support prepared statements).
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL!,
  },
});

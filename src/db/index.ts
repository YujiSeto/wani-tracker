import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// { prepare: false } is required when connecting through Supabase's pgBouncer
// connection pooler (port 6543). Prepared statements are not supported there.
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });

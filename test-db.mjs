// Quick connection test — node test-db.mjs
import postgres from 'postgres';
import { readFileSync } from 'fs';

const envRaw = readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n').filter(l => l.includes('=')).map(l => {
    const [k, ...v] = l.split('=');
    return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')];
  })
);

const base = env.DATABASE_URL_DIRECT ?? env.DATABASE_URL;

// Build 3 candidate URLs to test
const candidates = [
  { label: 'As-is (brackets literal)', url: base },
  { label: 'URL-encoded brackets',     url: base.replace('[', '%5B').replace(']', '%5D') },
  { label: 'No brackets (stripped)',   url: base.replace('[', '').replace(']', '') },
];

for (const { label, url } of candidates) {
  const masked = url.replace(/:[^@]+@/, ':***@');
  console.log(`\n▶ Testing: ${label}`);
  console.log(`  URL: ${masked}`);
  const sql = postgres(url, { prepare: false, connect_timeout: 10 });
  try {
    const r = await sql`SELECT current_user, version()`;
    console.log(`  ✅ OK — user: ${r[0].current_user}`);
    await sql.end();
    break;
  } catch (e) {
    console.log(`  ❌ ${e.message} (${e.code ?? ''})`);
    try { await sql.end(); } catch {}
  }
}

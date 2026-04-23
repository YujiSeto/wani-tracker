<div align="center">
  <img src="src/app/icon.png" alt="WaniTracker Icon" width="120" />
  <h1>WaniTracker</h1>
  <p>A beautiful, real-time dashboard built to track your <a href="https://www.wanikani.com">WaniKani</a> Japanese study journey. It consumes the WaniKani V2 API and provides detailed insights into your kanji, radicals, and vocabulary progression using a secure server-side architecture.</p>
</div>
## ✨ Features

- **Real-Time Dashboard**: See your current level, pending reviews, available lessons, and overall library stats at a glance.
- **Detailed Level Progression**: Track your SRS stages (Initiate to Burned) for every subject across all 60 WaniKani levels.
- **Subject Search Engine**: Instantly search your entire WaniKani database by English meaning, Romaji reading, or Japanese characters.
- **AI-Optimized Export**: A dedicated, semantic `/data/ia` endpoint that outputs raw JSON and HTML containing your fully "Burned" library—perfect for AI agents and LLMs to understand exactly what you've mastered.
- **Internationalization (i18n)**: Full support for English, Portuguese, and Japanese natively built into the UI.
- **Dark & Light Mode**: A sleek interface that respects your system theme preferences.
- **100% Server-Side Secure**: Your WaniKani API key never leaves the server. All external fetches and database syncs happen securely via React Server Components.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **API**: WaniKani V2 REST API

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A PostgreSQL database (e.g., Supabase)
- A WaniKani Personal Access Token (V2)

### 2. Environment Variables
Create a `.env.local` (or `.env`) file in the root of your project:

```env
WANIKANI_API_TOKEN=your-wanikani-v2-token
DATABASE_URL="postgresql://user:password@host:6543/postgres"
DATABASE_URL_DIRECT="postgresql://user:password@host:5432/postgres"
CRON_SECRET=your-secure-random-string
```

### 3. Installation
Install the required dependencies:
```bash
npm install
```

### 4. Database Setup
Push the schema to your PostgreSQL database using Drizzle:
```bash
npx drizzle-kit migrate
```

### 5. Running the App
Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Initial Data Sync
WaniTracker relies on a local cached copy of your WaniKani data. To perform the initial synchronization, trigger the sync endpoint manually:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/sync/full
```
*(Depending on the size of your library, the initial sync may take a few moments).*

## 🔒 Security Note (Supabase)
If you are hosting your database on Supabase, remember to enable **Row Level Security (RLS)** on all tables created by Drizzle to prevent unauthorized public REST access:
```sql
ALTER TABLE public.global_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
-- (Repeat for all WaniTracker tables)
```
WaniTracker accesses the database securely via a direct server-side connection (`DATABASE_URL`), which safely bypasses RLS policies.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
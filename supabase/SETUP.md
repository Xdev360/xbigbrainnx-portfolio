# Supabase setup — xbigbrainnx portfolio

Your site now supports **Supabase** as the cloud database. Until you configure it, everything still works with **localStorage** (browser-only).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Pick a name, password, region → **Create**

## 2. Run the database schema

1. In Supabase: **SQL Editor** → **New query**
2. Open `supabase/schema.sql` from this repo
3. **Important:** replace every `xbigx244340` (admin key placeholder) with your own long random secret
4. Click **Run**

If admin shows **Cloud connected** but saves fail, run the **entire** `supabase/fix-writes.sql` in the SQL Editor again (includes table RPCs + storage upload policies).

## 3. Environment variables (.env / Vercel)

Copy `.env.example` to `.env` in the project root and fill in:

```bash
cp .env.example .env
npm install
npm run build
```

| Variable | Value |
|----------|--------|
| `PUBLIC_SUPABASE_URL` | Supabase → Settings → API → **Project URL** |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** |
| `SUPABASE_ADMIN_WRITE_KEY` | Same string as in `schema.sql` / `fix-writes.sql` |
| `PUBLIC_SUPABASE_STORAGE_BUCKET` | `portfolio-media` |

**Vercel:** paste the same four names in **Project Settings → Environment Variables** (Production + Preview). Vercel runs `npm run build` which writes `js/config/supabase-config.js` at deploy time.

Do **not** commit `.env` or `js/config/supabase-config.js` — both are gitignored.

## 4. Test locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/admin.html` → log in → edit something.

- Status shows **Cloud connected** when Supabase is linked
- Saves show **Saved to cloud**
- Images upload to the `portfolio-media` storage bucket

## 5. Migrate existing browser data (optional)

If you already edited content in the admin before Supabase:

1. Configure Supabase (steps 2–3)
2. Open admin once while still logged in on the same browser
3. On first load, local data auto-uploads to Supabase if the cloud is empty

## Tables

| Table | Purpose |
|-------|---------|
| `cms_content` | All field values (text, URLs, categories, image URLs) |
| `cms_lists` | Dynamic lists (case studies, wallpapers, etc.) |
| `portfolio-media` (storage) | Uploaded images and audio |

## Security note

- **anon key** is public (safe in frontend) — read-only via RLS
- **adminWriteKey** must match the key in `schema.sql` / `fix-writes.sql` — passed to secure RPC functions when saving
- Never put the **service_role** key in this static site

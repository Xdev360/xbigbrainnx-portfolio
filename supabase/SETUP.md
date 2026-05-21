# Supabase setup — xbigbrainnx portfolio

Your site now supports **Supabase** as the cloud database. Until you configure it, everything still works with **localStorage** (browser-only).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Pick a name, password, region → **Create**

## 2. Run the database schema

1. In Supabase: **SQL Editor** → **New query**
2. Open `supabase/schema.sql` from this repo
3. **Important:** replace every `REPLACE_WITH_YOUR_ADMIN_WRITE_KEY` with a long random secret (e.g. `xbb_cms_k9f2m7p4q1w8z3n6`)
4. Click **Run**

## 3. Copy your API keys

**Project Settings → API**

| Field | Goes in `supabase-config.js` |
|-------|------------------------------|
| Project URL | `url` |
| anon public | `anonKey` |
| (your random secret from step 2) | `adminWriteKey` |

Edit `supabase-config.js`:

```javascript
window.SUPABASE_CONFIG = {
  url: 'https://abcdefgh.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  adminWriteKey: 'xbb_cms_k9f2m7p4q1w8z3n6',
  storageBucket: 'portfolio-media'
};
```

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
- **adminWriteKey** must match the SQL policy — only used when saving from admin
- Never put the **service_role** key in this static site

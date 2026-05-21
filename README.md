# xbigbrainnx — Portfolio

Personal portfolio for **Oladele Ibraheem (xbigbrainnx)** — designer, developer & brand strategist based in Lagos.

Static site with a tiny build step for Supabase env vars. Deploy on Vercel, Netlify, etc.

## Run locally

```bash
cp .env.example .env   # first time only — then edit .env
npm install
npm run build
python3 -m http.server 8080
```

Or: `npm run dev` (build + server in one command).

## Structure

```
.
├── index.html              # Home
├── contact.html
├── case-study.html
├── life.html
├── admin.html              # CMS admin portal
├── css/
│   ├── styles.css          # Site styling
│   └── admin.css           # Admin portal styling
├── js/
│   ├── script.js
│   ├── cms.js
│   ├── admin.js
│   ├── content-schema.js
│   ├── supabase-sync.js
│   └── config/
│       └── supabase-config.js   # auto-generated — do not edit
├── .env.example                 # template — copy to .env
├── .env                         # your keys locally (gitignored)
├── scripts/
│   └── generate-config.js       # builds supabase-config.js from env
├── package.json
├── vercel.json
├── supabase/
│   ├── schema.sql          # Database setup
│   ├── fix-writes.sql      # One-time save fix (if needed)
│   └── SETUP.md
└── README.md
```

## Supabase (optional cloud CMS)

See `supabase/SETUP.md`.

**Local:** copy `.env.example` → `.env`, fill in keys, then run `npm run build`.

**Vercel:** add the same env var names in Project Settings → Environment Variables (see below).

## Vercel environment variables

In **Vercel → your project → Settings → Environment Variables**, add these for **Production**, **Preview**, and **Development**:

| Name | Where to get it |
|------|-----------------|
| `PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → **anon public** |
| `SUPABASE_ADMIN_WRITE_KEY` | Same secret you put in `supabase/schema.sql` (e.g. `xbigx244340`) |
| `PUBLIC_SUPABASE_STORAGE_BUCKET` | `portfolio-media` (unless you renamed the bucket) |

Deploy settings (auto via `vercel.json`):

- **Build command:** `npm run build`
- **Output directory:** `.` (root)

After adding env vars, redeploy. The build generates `js/config/supabase-config.js` on Vercel — you never commit secrets.

## GitHub Pages (github.io) instead of Vercel

Yes — you can use **https://xdev360.github.io/xbigbrainnx-portfolio/**

GitHub Pages does not read `.env`. Add the **same four variable names** as **Repository Secrets** (Settings → Secrets and variables → Actions), enable Pages source **GitHub Actions**, then push to `main`.

See `docs/GITHUB-PAGES.md` for step-by-step setup.

## Notes

- Fonts: Google Fonts (Bricolage Grotesque, DM Sans, Instrument Serif, JetBrains Mono).
- Color tokens live in `:root` inside `css/styles.css`.

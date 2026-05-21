# GitHub Pages deploy

Site URL: **https://xdev360.github.io/xbigbrainnx-portfolio/**

## 1. Add repository secrets

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add the same four names as `.env`:

| Secret name | Value |
|-------------|--------|
| `PUBLIC_SUPABASE_URL` | `https://soakeuzidzgdntvhtldz.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_ADMIN_WRITE_KEY` | `xbigx244340` |
| `PUBLIC_SUPABASE_STORAGE_BUCKET` | `portfolio-media` |

## 2. Enable GitHub Pages

Repo → **Settings → Pages**

- **Source:** GitHub Actions

## 3. Deploy

Push to `main`. The workflow `.github/workflows/deploy-pages.yml` builds and publishes automatically.

## Local vs GitHub

| | Local | GitHub Pages |
|---|--------|----------------|
| Secrets | `.env` file | Repository **Secrets** |
| Build | `npm run build` | GitHub Actions (automatic) |
| URL | localhost | `xdev360.github.io/xbigbrainnx-portfolio` |

Do **not** commit `.env` — use GitHub Secrets instead.

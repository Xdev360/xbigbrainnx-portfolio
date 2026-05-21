# xbigbrainnx — Portfolio

Personal portfolio for **Oladele Ibraheem (xbigbrainnx)** — designer, developer & brand strategist based in Lagos.

A single-page static site, no build step, no framework. Drop it on any static host (GitHub Pages, Vercel, Netlify, Cloudflare Pages, S3, etc.) and it ships.

## Structure

```
.
├── index.html    # markup
├── styles.css    # all styling (CSS variables, responsive, motion-safe)
├── script.js     # carousel, tabs, clock, scroll-spy
└── README.md
```

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
# Python
python3 -m http.server 5173

# Node (no install)
npx --yes serve .
```

Then visit <http://localhost:5173>.

## What works

- Hero carousel — tab buttons, arrow keys, prev/next arrows and dots all switch between the two card views (Design Projects / Case Studies).
- Sticky nav with live local clock and section scroll-spy.
- Marquee, sticky about photo, services grid, writings grid — all responsive down to mobile.
- Footer year auto-updates.
- Respects `prefers-reduced-motion`.

## Things to fill in next

- Replace `[ HEADSHOT ]`, `[ Dashboard preview ]`, and the projects-section placeholder with real assets.
- Add real project entries — the carousel was designed for up to 5 slides per tab; just duplicate the `.card-view` blocks and update the dots count.
- Wire the Substack / Medium tabs in the Writings section to real feeds.
- Point the `Start a project` / `See availability` CTAs at the right URLs (mailto is set up by default).

## Notes

- Fonts are loaded from Google Fonts: Bricolage Grotesque, DM Sans, Instrument Serif, JetBrains Mono.
- Color tokens live in `:root` inside `styles.css` — change them in one place to retheme.

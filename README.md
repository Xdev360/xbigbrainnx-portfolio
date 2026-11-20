# xbigbrainnx.xyz

Ibraheem Oladele's portfolio. Astro, static output, deployed on Vercel.

    npm install
    npm run dev      # http://localhost:4321
    npm run build    # outputs to dist/

## Where things go
- `src/data/projects.ts`: one entry per project (name, line, role, use case, media paths).
- `public/work/<slug>/`: covers (16:10, webp), hero reels (mp4, muted, 6 to 8s), case study images.
- `public/rive/`: .riv files for the playground and section visuals.
- `public/sound/`: UI sound sprite (sound is off by default).
- `public/cv/Ibraheem-Oladele-CV.pdf`: the CV the site links to.
- `src/styles/global.css`: tokens copied from the Figma "Site" variables. Change them in Figma first, then here.

The previous plain-HTML site is kept in `_old/` for reference.

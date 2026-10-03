# AVENGERS-QUANTUM-DOOM

Interactive Three.js game: quantum search, multiverse heroes, and GLB character models.

## Run locally

```bash
npm ci
npm start
```

Open [http://localhost:3000](http://localhost:3000). Do not open `index.html` directly from the filesystem — ES modules and the import map need an HTTP server.

## Deploy

The site is static: root `index.html`, `src/`, `images/`, `3d models/`, plus `node_modules/three` after `npm ci`.

Before every deploy, run:

```bash
npm run verify:deploy
```

### GitHub Pages (recommended)

1. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. The workflow in `.github/workflows/deploy-pages.yml` installs deps, verifies assets, and publishes.
3. Live URL: `https://<user>.github.io/AVENGERS-QUANTUM-DOOM/`

### Vercel

1. Import this repo at [vercel.com](https://vercel.com).
2. Settings are in `vercel.json` (`npm ci`, verify step, publish project root).
3. Deploy.

### Netlify

1. Import this repo at [netlify.com](https://netlify.com).
2. `netlify.toml` sets build command and publish directory.
3. Deploy.

## Project layout

| Path | Purpose |
|------|---------|
| `index.html` | Entry + Three.js import map |
| `src/` | Game logic, cinematics, quantum UI |
| `images/` | Cinematic PNG assets |
| `3d models/` | Hero GLB models |

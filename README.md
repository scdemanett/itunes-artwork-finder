iTunes Artwork Finder
=====================

Find and download full-resolution artwork for albums, movies, TV shows, apps, books and podcasts from Apple's stores.

Originally based on Ben Dodson's [iTunes Artwork Finder](https://bendodson.com/projects/itunes-artwork-finder). Rebuilt as a Vite + React front end with a Cloudflare Worker API.

## How it works

- **Front end** (`src/`): React app served as Workers static assets under `/itunes-artwork-finder/`. It calls the iTunes Search / Lookup API directly from the browser (`shared/itunes.ts`), because Apple rate-limits requests from Cloudflare's shared Worker IPs.
- **Worker** (`worker/`):
  - `GET /itunes-artwork-finder/api/meta?b=<artBase>&b=…` returns native dimensions and PNG/JPG file sizes (up to 10 per request) using Range requests.
  - `GET /itunes-artwork-finder/api/download?url=&name=` streams the image from Apple with `Content-Disposition: attachment`, so the browser's own download manager handles progress and the filename. Only `*.mzstatic.com` URLs are accepted.
- Hi-res images use Apple's largest accepted size, `10000x10000-999`, which is capped at the source's native resolution. PNG is lossless; JPG is smaller.

The base path `/itunes-artwork-finder` is set in three places: `vite.config.ts`, `worker/index.ts` and the route in `wrangler.jsonc`.

## Development

```sh
npm install
npm run preview      # build, then serve front end + Worker at http://localhost:8787
```

For front-end hot reload, run `npm run dev:worker` and `npm run dev` in two terminals (Vite proxies `/api` to the Worker).

## Deployment

```sh
npx wrangler login
npm run deploy
```

This deploys to `itunes-artwork-finder.<subdomain>.workers.dev`. To serve it at `stevendemanett.com/itunes-artwork-finder`, uncomment the `routes` entry in `wrangler.jsonc` (the `stevendemanett.com` DNS record must be proxied) and deploy again. Removing the route sends traffic back to the origin server.

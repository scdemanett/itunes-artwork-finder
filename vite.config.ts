import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Must match BASE in worker/index.ts and the route in wrangler.jsonc. */
const base = '/itunes-artwork-finder/';

export default defineConfig({
    base,
    plugins: [react()],
    build: {
        // Nest the output so Workers static asset paths match the public URL path.
        outDir: `dist${base}`,
        emptyOutDir: true,
    },
    server: {
        // `npm run dev` serves the front end; `npm run dev:worker` (wrangler dev) serves the API.
        proxy: {
            [`${base}api`]: 'http://localhost:8787',
        },
    },
});

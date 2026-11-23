import { handleDownload } from './download';
import { handleMeta } from './meta';
import { json } from './util';

interface Env {
    ASSETS: Fetcher;
}

/** Must match `base` in vite.config.ts and the route in wrangler.jsonc. */
const BASE = '/itunes-artwork-finder';

export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);

        // On workers.dev the app also lives under BASE; send the bare origin there.
        if (url.pathname === '/') {
            return Response.redirect(`${url.origin}${BASE}/`, 302);
        }

        if (url.pathname.startsWith(`${BASE}/api/`)) {
            if (request.method !== 'GET') {
                return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
            }
            try {
                switch (url.pathname.slice(BASE.length)) {
                    case '/api/meta':
                        return await handleMeta(url);
                    case '/api/download':
                        return await handleDownload(url);
                }
                return json({ error: 'Not found' }, { status: 404 });
            } catch (error) {
                console.error(error);
                return json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
            }
        }

        return env.ASSETS.fetch(request);
    },
} satisfies ExportedHandler<Env>;

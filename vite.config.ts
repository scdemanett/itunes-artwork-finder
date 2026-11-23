import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';

/** Must match BASE in worker/index.ts. */
const base = '/itunes-artwork-finder/';

/** Adds the canonical link and URL-based social-preview tags when VITE_SITE_URL is set (see .env.example). */
function siteUrlTags(siteUrl: string | undefined): Plugin {
    return {
        name: 'site-url-tags',
        transformIndexHtml(): HtmlTagDescriptor[] {
            if (!siteUrl) {
                return [];
            }
            const url = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
            const meta = (property: string, content: string): HtmlTagDescriptor => ({ tag: 'meta', attrs: { property, content }, injectTo: 'head' });
            return [
                { tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' },
                meta('og:url', url),
                meta('og:image', `${url}og-image.jpg`),
                meta('og:image:width', '800'),
                meta('og:image:height', '420'),
                meta('og:image:alt', 'iTunes Artwork Finder search results showing full-resolution album covers'),
            ];
        },
    };
}

/** Adds the WebMCP origin trial token when VITE_WEBMCP_ORIGIN_TRIAL_TOKEN is set (see .env.example). */
function originTrialTag(token: string | undefined): Plugin {
    return {
        name: 'origin-trial-tag',
        transformIndexHtml(): HtmlTagDescriptor[] {
            return token ? [{ tag: 'meta', attrs: { 'http-equiv': 'origin-trial', content: token }, injectTo: 'head-prepend' }] : [];
        },
    };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    return {
        base,
        plugins: [react(), siteUrlTags(env.VITE_SITE_URL), originTrialTag(env.VITE_WEBMCP_ORIGIN_TRIAL_TOKEN)],
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
    };
});

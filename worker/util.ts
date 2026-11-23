export function json(data: unknown, init: ResponseInit = {}): Response {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify(data), { ...init, headers });
}

/** Only proxy Apple's artwork CDN so the Worker can't be used as an open proxy. */
export function parseArtworkUrl(value: string | null): URL | null {
    if (!value) {
        return null;
    }
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || !url.hostname.endsWith('.mzstatic.com')) {
            return null;
        }
        return url;
    } catch {
        return null;
    }
}

export const UPSTREAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; iTunesArtworkFinder/2.0)',
    Accept: '*/*',
};

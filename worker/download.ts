import { sanitizeFilename } from '../shared/filename';
import { parseArtworkUrl, UPSTREAM_HEADERS } from './util';

const EXTENSIONS: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
};

function contentDisposition(filename: string): string {
    const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '_');
    return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/** GET /api/download?url=<mzstatic url>&name=<filename without extension> streams the file as an attachment. */
export async function handleDownload(url: URL): Promise<Response> {
    const target = parseArtworkUrl(url.searchParams.get('url'));
    if (!target) {
        return new Response('Invalid artwork URL.', { status: 400 });
    }

    const upstream = await fetch(target.toString(), { headers: UPSTREAM_HEADERS });
    if (!upstream.ok || !upstream.body) {
        return new Response(`Apple's image server returned an error (${upstream.status}). Please try again.`, {
            status: 502,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }

    const contentType = (upstream.headers.get('Content-Type') || 'image/jpeg').split(';')[0].trim();
    const extension = EXTENSIONS[contentType] ?? '.jpg';
    const filename = sanitizeFilename(url.searchParams.get('name') || 'artwork') + extension;

    const headers = new Headers({
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition(filename),
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
    });
    const length = upstream.headers.get('Content-Length');
    if (length) {
        headers.set('Content-Length', length);
    }
    return new Response(upstream.body, { headers });
}

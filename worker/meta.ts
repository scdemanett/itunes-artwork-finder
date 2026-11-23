import { artUrl, HIRES_SIZE, type ArtworkMeta } from '../shared/types';
import { json, parseArtworkUrl, UPSTREAM_HEADERS } from './util';

/** Two subrequests per item; keeps each call well under the free plan's 50-subrequest limit. */
const MAX_PER_REQUEST = 10;

interface Probe {
    total?: number;
    prefix: Uint8Array;
}

/** Reads up to `length` bytes, then cancels the rest of the body. */
async function readPrefix(response: Response, length: number): Promise<Uint8Array> {
    const out = new Uint8Array(length);
    let filled = 0;
    const reader = response.body?.getReader();
    if (!reader) {
        return out.subarray(0, 0);
    }
    while (filled < length) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        const take = Math.min(value.length, length - filled);
        out.set(value.subarray(0, take), filled);
        filled += take;
    }
    await reader.cancel();
    return out.subarray(0, filled);
}

/**
 * Fetches the first bytes of a file and its total size. Cached files answer with 206 + Content-Range;
 * files Apple hasn't rendered at this size yet ignore Range and send 200 with the whole body after
 * rendering it (which also warms Apple's CDN for the real download).
 */
async function probe(url: string, length: number): Promise<Probe | null> {
    try {
        const response = await fetch(url, { headers: { ...UPSTREAM_HEADERS, Range: `bytes=0-${length - 1}` } });
        let total: number | undefined;
        if (response.status === 206) {
            const match = /\/(\d+)$/.exec(response.headers.get('Content-Range') || '');
            total = match ? Number(match[1]) : undefined;
        } else if (response.status === 200) {
            total = Number(response.headers.get('Content-Length')) || undefined;
        } else {
            await response.body?.cancel();
            return null;
        }
        return { total, prefix: await readPrefix(response, length) };
    } catch {
        return null;
    }
}

async function getMeta(artBase: string): Promise<ArtworkMeta> {
    const [png, jpg] = await Promise.all([probe(artUrl(artBase, HIRES_SIZE, 'png'), 24), probe(artUrl(artBase, HIRES_SIZE, 'jpg'), 1)]);
    const meta: ArtworkMeta = { pngBytes: png?.total, jpgBytes: jpg?.total };
    const bytes = png?.prefix;
    // PNG signature, then the IHDR chunk holds width/height as big-endian uint32s at offsets 16 and 20.
    if (bytes && bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        meta.width = view.getUint32(16);
        meta.height = view.getUint32(20);
    }
    return meta;
}

/** GET /api/meta?b=<artBase>&b=<artBase>… → { [artBase]: ArtworkMeta } */
export async function handleMeta(url: URL): Promise<Response> {
    const bases = url.searchParams
        .getAll('b')
        .filter((b) => parseArtworkUrl(b))
        .slice(0, MAX_PER_REQUEST);
    const entries = await Promise.all(bases.map(async (b) => [b, await getMeta(b)] as const));
    const complete = entries.every(([, m]) => m.width && m.pngBytes && m.jpgBytes);
    return json(Object.fromEntries(entries), {
        headers: { 'Cache-Control': complete ? 'public, max-age=86400' : 'no-store' },
    });
}

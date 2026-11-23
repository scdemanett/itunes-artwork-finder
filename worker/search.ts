import { isEntity, type ArtworkResult, type Entity, type SearchResponse } from '../shared/types';
import { json, UPSTREAM_HEADERS } from './util';

interface ITunesItem {
    kind?: string;
    wrapperType?: string;
    collectionType?: string;
    collectionId?: number;
    trackId?: number;
    collectionName?: string;
    trackName?: string;
    artistName?: string;
    artworkUrl100?: string;
    collectionViewUrl?: string;
    trackViewUrl?: string;
}

function buildUpstreamUrl(entity: Entity, query: string, country: string): string {
    const params = new URLSearchParams({ country, limit: '25' });
    if (entity === 'id' || entity === 'idAlbum') {
        params.set('id', query);
        return `https://itunes.apple.com/lookup?${params}`;
    }
    params.set('term', query);
    if (entity === 'shortFilm') {
        params.set('entity', 'movie');
        params.set('attribute', 'shortFilmTerm');
    } else {
        params.set('entity', entity);
    }
    return `https://itunes.apple.com/search?${params}`;
}

function toResult(entity: Entity, item: ITunesItem): ArtworkResult | null {
    if (entity === 'id' && item.kind !== 'feature-movie' && item.wrapperType !== 'collection') {
        return null;
    }
    if (entity === 'idAlbum' && item.collectionType !== 'Album') {
        return null;
    }
    const art = item.artworkUrl100;
    if (!art || !art.includes('/image/thumb/')) {
        return null;
    }

    let title: string | undefined;
    let artist: string | undefined;
    switch (entity) {
        case 'album':
        case 'idAlbum':
        case 'audiobook':
        case 'podcast':
            title = item.collectionName;
            artist = item.artistName;
            break;
        case 'ebook':
        case 'musicVideo':
            title = item.trackName;
            artist = item.artistName;
            break;
        case 'movie':
        case 'id':
        case 'shortFilm':
            title = item.trackName || item.collectionName;
            break;
        case 'tvSeason':
            title = item.collectionName;
            break;
        case 'software':
        case 'iPadSoftware':
        case 'macSoftware':
            title = item.trackName;
            break;
    }
    if (!title) {
        return null;
    }

    return {
        id: String(item.collectionId ?? item.trackId ?? art),
        title,
        artist,
        artBase: art.slice(0, art.lastIndexOf('/')),
        storeUrl: item.collectionViewUrl || item.trackViewUrl,
    };
}

export async function handleSearch(url: URL): Promise<Response> {
    const entityParam = url.searchParams.get('entity') || 'album';
    const query = (url.searchParams.get('query') || '').trim();
    const country = (url.searchParams.get('country') || 'us').toLowerCase();

    const fail = (error: string, status: number) => json({ results: [], error } satisfies SearchResponse, { status });

    if (!isEntity(entityParam)) {
        return fail('Unknown search type.', 400);
    }
    if (!query) {
        return fail('Please enter a search query.', 400);
    }
    if (!/^[a-z]{2}$/.test(country)) {
        return fail('Unknown country.', 400);
    }

    const upstream = await fetch(buildUpstreamUrl(entityParam, query, country), {
        headers: UPSTREAM_HEADERS,
        cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!upstream.ok) {
        return fail(`Apple's search service returned an error (${upstream.status}). Please try again.`, 502);
    }

    const data = (await upstream.json()) as { results?: ITunesItem[] };
    const seen = new Set<string>();
    const results: ArtworkResult[] = [];
    for (const item of data.results ?? []) {
        const result = toResult(entityParam, item);
        if (result && !seen.has(result.artBase)) {
            seen.add(result.artBase);
            results.push(result);
        }
    }

    return json({ results } satisfies SearchResponse, {
        headers: { 'Cache-Control': 'public, max-age=300' },
    });
}

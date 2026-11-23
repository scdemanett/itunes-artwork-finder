import type { ArtworkResult, Entity } from './types';

// Searches run in the visitor's browser: Apple rate-limits (HTTP 429) requests from Cloudflare's
// shared Worker IPs, and the iTunes Search API allows cross-origin requests.

export interface ITunesItem {
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

export function buildSearchUrl(entity: Entity, query: string, country: string): string {
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

export function toResults(entity: Entity, items: ITunesItem[]): ArtworkResult[] {
    const seen = new Set<string>();
    const results: ArtworkResult[] = [];
    for (const item of items) {
        const result = toResult(entity, item);
        if (result && !seen.has(result.artBase)) {
            seen.add(result.artBase);
            results.push(result);
        }
    }
    return results;
}

import { sanitizeFilename } from '../../shared/filename';
import { buildSearchUrl, toResults, type ITunesItem } from '../../shared/itunes';
import { artUrl, HIRES_SIZE, type ArtworkMeta, type ArtworkResult, type Entity } from '../../shared/types';

const API = `${import.meta.env.BASE_URL}api`;

export interface SearchParams {
    entity: Entity;
    query: string;
    country: string;
}

export async function search(params: SearchParams, signal?: AbortSignal): Promise<ArtworkResult[]> {
    let response: Response;
    try {
        response = await fetch(buildSearchUrl(params.entity, params.query, params.country), { signal });
    } catch (error) {
        if (signal?.aborted) {
            throw error;
        }
        throw new Error("Couldn't reach Apple's search service. Check your connection and try again.");
    }
    if (response.status === 429) {
        throw new Error("Apple's search service is limiting requests. Wait a minute and try again.");
    }
    if (!response.ok) {
        throw new Error(`Apple's search service returned an error (${response.status}). Please try again.`);
    }
    const data = (await response.json()) as { results?: ITunesItem[] };
    return toResults(params.entity, data.results ?? []);
}

export async function fetchMeta(artBases: string[], signal?: AbortSignal): Promise<Record<string, ArtworkMeta>> {
    const params = new URLSearchParams();
    artBases.forEach((b) => params.append('b', b));
    const response = await fetch(`${API}/meta?${params}`, { signal });
    if (!response.ok) {
        throw new Error(`Meta lookup failed (${response.status})`);
    }
    return (await response.json()) as Record<string, ArtworkMeta>;
}

export type Format = 'png' | 'jpg';

export function hiresUrl(result: ArtworkResult, format: Format): string {
    return artUrl(result.artBase, HIRES_SIZE, format);
}

export function previewUrl(result: ArtworkResult, size: number): string {
    return artUrl(result.artBase, `${size}x${size}bb`, 'jpg');
}

/** Filename without extension; the Worker adds the extension from the real content type. */
export function filenameFor(result: ArtworkResult, entity: Entity): string {
    if ((entity === 'album' || entity === 'idAlbum') && result.artist) {
        return sanitizeFilename(`${result.artist} - ${result.title} - Front (Hi-Res)`);
    }
    return sanitizeFilename(result.artist ? `${result.title} (by ${result.artist})` : result.title);
}

export function downloadUrl(result: ArtworkResult, entity: Entity, format: Format): string {
    const params = new URLSearchParams({ url: hiresUrl(result, format), name: filenameFor(result, entity) });
    return `${API}/download?${params}`;
}

export function formatBytes(bytes: number | undefined): string | undefined {
    if (!bytes) {
        return undefined;
    }
    return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export const ENTITIES = [
    { value: 'album', label: 'Artist and/or album' },
    { value: 'idAlbum', label: 'Apple ID (album)' },
    { value: 'software', label: 'App (iPhone / Universal)' },
    { value: 'iPadSoftware', label: 'App (iPad)' },
    { value: 'macSoftware', label: 'App (macOS)' },
    { value: 'id', label: 'Apple ID (movie)' },
    { value: 'audiobook', label: 'Audiobook' },
    { value: 'ebook', label: 'Book' },
    { value: 'musicVideo', label: 'Music video' },
    { value: 'movie', label: 'Movie' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'shortFilm', label: 'Short film' },
    { value: 'tvSeason', label: 'TV show' },
] as const;

export type Entity = (typeof ENTITIES)[number]['value'];

export function isEntity(value: string): value is Entity {
    return ENTITIES.some((e) => e.value === value);
}

export interface ArtworkResult {
    id: string;
    title: string;
    artist?: string;
    /** Artwork path without the size suffix, e.g. https://is1-ssl.mzstatic.com/image/thumb/.../634904078263.png */
    artBase: string;
    storeUrl?: string;
}

export interface ArtworkMeta {
    width?: number;
    height?: number;
    pngBytes?: number;
    jpgBytes?: number;
}

/** Largest size Apple accepts; output is capped at the source's native resolution. */
export const HIRES_SIZE = '10000x10000-999';

export function artUrl(artBase: string, size: string, ext: 'png' | 'jpg'): string {
    return `${artBase}/${size}.${ext}`;
}

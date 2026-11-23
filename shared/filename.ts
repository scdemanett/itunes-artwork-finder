/**
 * House naming rules for cover downloads, ported from the audio-archive skill's aalib.py
 * (sanitize, title_case, cover_filename) and references/naming-rules.md + covers.md.
 * Keep this in step with aalib.py; scratch tests compare the two on the same inputs.
 */

/** Characters that never appear in tags or names: curly quotes, Unicode dashes, the one-character ellipsis, zero-width. */
const CHARACTER_FIXES: [RegExp, string][] = [
    [/[‘’‚‛′]/g, "'"],
    [/[“”„‟″]/g, '"'],
    [/[‐‑‒–—―−]/g, '-'],
    [/…/g, '...'],
    [/[​-‍⁠﻿]/g, ''],
    [/ /g, ' '],
];

export function normalizeCharacters(text: string): string {
    let out = text.normalize('NFC');
    for (const [pattern, replacement] of CHARACTER_FIXES) {
        out = out.replace(pattern, replacement);
    }
    return out.replace(/ {2,}/g, ' ').trim();
}

/** Port of aalib.sanitize() for file names (not folders): the settled Sept 2026 character table. */
export function sanitizeFilename(name: string): string {
    let out = name;
    out = out.replace(/"/g, '');
    out = out.replace(/\?/g, '');
    if (out.includes(':')) {
        out = out.replace(/\s*:\s*(?=$|[)\]])/g, ''); // "Dialogue Preceding:" -> "Dialogue Preceding"
    }
    if (out.includes(':')) {
        out = out.replace(/\s*:\s+/g, ' - '); // "GTA: San Andreas" -> "GTA - San Andreas"
        out = out.replace(/:/g, '-'); // "9:40" -> "9-40"
    }
    if (out.includes('/') || out.includes('\\')) {
        out = out.replace(/\s+[/\\]\s+/g, ' - '); // "One / Take Five" -> "One - Take Five"
        out = out.replace(/[/\\]/g, '-');
    }
    out = out.replace(/[*<>]/g, '').replace(/\|/g, '-');
    // eslint-disable-next-line no-control-regex
    out = out.replace(/[\x00-\x1f]/g, '');
    out = out.replace(/ {2,}/g, ' ').trim();
    return out.slice(0, 200) || 'artwork';
}

/** Tokens the library deliberately leaves lowercase ("9-40 p.m.", "Rock n' Roll"). */
const KEEP_LOWER = new Set(['a.m.', 'p.m.', "n'", "'n'", "'n"]);
const WORD_START = /(^|[\s\-([{/"])([a-zà-öø-ÿ])/g;

/** Port of aalib.title_case(): every word capitalised, only ever raising letters (MX, BAND-MAID, II survive). */
export function titleCase(text: string): string {
    return text
        .split(' ')
        .map((word) => {
            if (KEEP_LOWER.has(word.toLowerCase().replace(/^[()[\]]+|[()[\]]+$/g, ''))) {
                return word;
            }
            return word.replace(WORD_START, (_, before: string, letter: string) => before + letter.toUpperCase());
        })
        .join(' ');
}

/** Apple's edition wording -> the wording already used in the library (naming-rules.md section 4). */
function houseEdition(inner: string): string {
    const s = inner.trim();
    let m: RegExpMatchArray | null;
    if ((m = s.match(/^(?:Remastered|Remaster)(?: Version)? (\d{4})$/i)) || (m = s.match(/^(\d{4}) (?:Remastered|Remaster)(?: Version)?$/i))) {
        return `${m[1]} Remastered`;
    }
    if (/^(?:Remastered|Remaster)(?: Version)?$/i.test(s)) {
        return 'Remastered';
    }
    if (/^Bonus Tracks? (?:Version|Edition)$/i.test(s)) {
        return 'Bonus Tracks Edition';
    }
    if (/^(?:The )?Original (?:Motion Picture |Game |Video Game |Television |TV |Series |Film |Broadway Cast )?(?:Soundtrack|Score)(?: Album)?$/i.test(s)) {
        return 'Original Soundtrack';
    }
    // "Deluxe Version", "20th Anniversary Deluxe Version", "Expanded Version" -> "... Edition"
    if (/\b(?:Deluxe|Expanded|Special|Anniversary|Collector's|Limited|Tour|Platinum|Legacy)\b.*\bVersion$/i.test(s)) {
        return s.replace(/Version$/i, 'Edition');
    }
    return s;
}

const EDITION_WORDS = /\b(?:Edition|Remastered|Reissue|Soundtrack|Anniversary)\b/i;

/**
 * Album title as it should appear in the ALBUM tag: house wording, release type before edition,
 * feat. -> (Featuring X), Title Case. Real characters are kept here; sanitizeFilename() handles names.
 */
export function houseAlbumTitle(raw: string): string {
    let t = normalizeCharacters(raw);

    let releaseType: string | null = null;
    const typeMatch = t.match(/\s+-\s+(EP|Single)$/i);
    if (typeMatch) {
        releaseType = typeMatch[1].toUpperCase() === 'EP' ? 'EP' : 'Single';
        t = t.slice(0, typeMatch.index).trim();
    }

    t = t.replace(/\[([^[\]]*)\]/g, '($1)');
    t = t.replace(/\((?:feat\.?|ft\.?|featuring)\s+/gi, '(Featuring ');
    t = t.replace(/\s+(?:feat\.?|ft\.?)\s+([^()]+?)(?=\s*\(|$)/gi, ' (Featuring $1)');

    // Peel recognised edition parentheses off the end so the release type can go in front of them.
    const editions: string[] = [];
    for (;;) {
        const m = t.match(/\s*\(([^()]*)\)\s*$/);
        if (!m) {
            break;
        }
        const edition = houseEdition(m[1]);
        if (!EDITION_WORDS.test(edition)) {
            break;
        }
        editions.unshift(edition);
        t = t.slice(0, m.index).trim();
    }

    const parts = [t, ...(releaseType ? [`(${releaseType})`] : []), ...editions.map((e) => `(${e})`)];
    return titleCase(parts.join(' '));
}

export interface CoverDimensions {
    width?: number;
    height?: number;
}

/** "(Hi-Res)" means 1000 px and up on the short side; non-square art is the uncropped "(Original)". */
export function coverLabels(dimensions: CoverDimensions | undefined): string {
    const { width, height } = dimensions ?? {};
    if (!width || !height) {
        return 'Front (Hi-Res)';
    }
    const hires = Math.min(width, height) >= 1000;
    const square = width === height;
    return ['Front', hires ? '(Hi-Res)' : null, square ? null : '(Original)'].filter(Boolean).join(' ');
}

/** Port of aalib.cover_filename(): "Artist - Album (Edition) - Front (Hi-Res)" without the extension. */
export function houseCoverFilename(artist: string, album: string, dimensions?: CoverDimensions): string {
    const artistName = sanitizeFilename(titleCase(normalizeCharacters(artist)));
    const albumName = sanitizeFilename(houseAlbumTitle(album));
    return `${artistName} - ${albumName} - ${coverLabels(dimensions)}`;
}

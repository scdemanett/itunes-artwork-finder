/**
 * WebMCP tools: let an AI agent in the visitor's browser search, inspect, preview and download artwork
 * through this page instead of clicking around it. Progressive enhancement: does nothing unless the
 * browser exposes document.modelContext (Chrome's WebMCP origin trial or chrome://flags/#enable-webmcp-testing).
 * Spec: https://github.com/webmachinelearning/webmcp  Chrome docs: https://developer.chrome.com/docs/ai/webmcp
 */
import { useEffect, useRef } from 'react';
import { ENTITIES, type ArtworkMeta, type ArtworkResult, type Entity } from '../../shared/types';
import { downloadUrl, fetchMeta, filenameFor, formatBytes, hiresUrl, previewUrl, type Format, type SearchParams } from './api';
import { COUNTRIES } from './countries';

// Minimal types for the parts of the WebMCP API used here (not yet in TypeScript's DOM lib).
interface ModelContextTool {
    name: string;
    title?: string;
    description: string;
    inputSchema: object;
    annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean; untrustedContentHint?: boolean };
    execute: (input: Record<string, unknown>, client: { signal?: AbortSignal }) => Promise<string> | string;
}

interface ModelContext {
    registerTool(tool: ModelContextTool, options?: { signal?: AbortSignal }): Promise<void> | void;
}

function getModelContext(): ModelContext | undefined {
    return (document as Document & { modelContext?: ModelContext }).modelContext;
}

export type SearchOutcome = { results: ArtworkResult[] } | { error: string };

/** What the tools need from the app. Read through a ref so tools always see the latest state. */
export interface WebMcpActions {
    search: (params: SearchParams) => Promise<SearchOutcome>;
    current: () => { results: ArtworkResult[]; entity: Entity };
    openPreview: (index: number) => void;
}

const json = (value: unknown) => JSON.stringify(value, null, 2);

function findResult(actions: WebMcpActions, id: unknown): { result: ArtworkResult; index: number; entity: Entity } | string {
    const { results, entity } = actions.current();
    const index = results.findIndex((r) => r.id === String(id));
    if (index === -1) {
        return results.length
            ? `No result with id "${String(id)}" in the current results. Use an id returned by search_artwork.`
            : 'There are no results on the page yet. Call search_artwork first.';
    }
    return { result: results[index], index, entity };
}

async function lookupMeta(result: ArtworkResult, signal?: AbortSignal): Promise<ArtworkMeta | undefined> {
    try {
        return (await fetchMeta([result.artBase], signal))[result.artBase];
    } catch {
        return undefined;
    }
}

function buildTools(actions: WebMcpActions): ModelContextTool[] {
    return [
        {
            name: 'search_artwork',
            title: 'Search artwork',
            description:
                "Search Apple's stores (Apple Music/iTunes, App Store, Apple Books, Apple TV, Podcasts) for artwork and show the results on the page. " +
                'Returns up to 25 results, each with an id to pass to the other tools. For an album, include the artist and album name in the query.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Search terms, e.g. "Deftones White Pony". For Apple ID types, the numeric Apple ID.' },
                    type: {
                        type: 'string',
                        description: 'What to search for. Defaults to "album".',
                        oneOf: ENTITIES.map((e) => ({ const: e.value, title: e.label })),
                    },
                    country: {
                        type: 'string',
                        description: 'Two-letter store country code, e.g. "us", "gb", "jp". Defaults to "us". Availability and artwork can differ by country.',
                    },
                },
                required: ['query'],
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            async execute(input) {
                const query = String(input.query ?? '').trim();
                const type = String(input.type ?? 'album');
                const country = String(input.country ?? 'us').toLowerCase();
                if (!query) {
                    return 'Please provide a search query.';
                }
                if (!ENTITIES.some((e) => e.value === type)) {
                    return `Unknown type "${type}". Use one of: ${ENTITIES.map((e) => e.value).join(', ')}.`;
                }
                if (!(country in COUNTRIES)) {
                    return `Unknown country "${country}". Use a two-letter store code such as "us", "gb" or "jp".`;
                }
                const outcome = await actions.search({ entity: type as Entity, query, country });
                if ('error' in outcome) {
                    return outcome.error;
                }
                if (!outcome.results.length) {
                    return 'No results found. Try different search terms, another type or another country.';
                }
                return json({
                    count: outcome.results.length,
                    results: outcome.results.map((r) => ({ id: r.id, title: r.title, artist: r.artist, previewUrl: previewUrl(r, 600) })),
                    next: 'Use get_artwork_details to check native size before downloading.',
                });
            },
        },
        {
            name: 'get_artwork_details',
            title: 'Get artwork details',
            description:
                'Get the native pixel dimensions, PNG and JPG file sizes, download filename and full-size image URLs for one search result. ' +
                'Artwork under 1000 px on its short side is not high resolution; non-square artwork is labelled "(Original)" in the filename.',
            inputSchema: {
                type: 'object',
                properties: { id: { type: 'string', description: 'Result id from search_artwork.' } },
                required: ['id'],
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            async execute(input, client) {
                const found = findResult(actions, input.id);
                if (typeof found === 'string') {
                    return found;
                }
                const { result, entity } = found;
                const meta = await lookupMeta(result, client?.signal);
                const square = meta?.width && meta.height ? meta.width === meta.height : undefined;
                return json({
                    id: result.id,
                    title: result.title,
                    artist: result.artist,
                    width: meta?.width ?? null,
                    height: meta?.height ?? null,
                    square: square ?? null,
                    highResolution: meta?.width && meta.height ? Math.min(meta.width, meta.height) >= 1000 : null,
                    png: { size: formatBytes(meta?.pngBytes) ?? null, filename: `${filenameFor(result, entity, meta)}.png`, url: hiresUrl(result, 'png') },
                    jpg: { size: formatBytes(meta?.jpgBytes) ?? null, filename: `${filenameFor(result, entity, meta)}.jpg`, url: hiresUrl(result, 'jpg') },
                    storeUrl: result.storeUrl ?? null,
                });
            },
        },
        {
            name: 'preview_artwork',
            title: 'Preview artwork',
            description: 'Open the large on-screen preview of one search result so the user can see it.',
            inputSchema: {
                type: 'object',
                properties: { id: { type: 'string', description: 'Result id from search_artwork.' } },
                required: ['id'],
            },
            annotations: { readOnlyHint: true },
            execute(input) {
                const found = findResult(actions, input.id);
                if (typeof found === 'string') {
                    return found;
                }
                actions.openPreview(found.index);
                return `Showing the preview of "${found.result.title}".`;
            },
        },
        {
            name: 'download_artwork',
            title: 'Download artwork',
            description:
                "Download one search result at full native resolution to the user's computer through the browser's download manager. " +
                'PNG is lossless; JPG is smaller. The file is named "Artist - Album (Edition) - Front (Hi-Res)" for albums.',
            inputSchema: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Result id from search_artwork.' },
                    format: { type: 'string', enum: ['png', 'jpg'], description: 'File format. Defaults to "png".' },
                },
                required: ['id'],
            },
            annotations: { readOnlyHint: false, consequentialHint: false },
            async execute(input, client) {
                const found = findResult(actions, input.id);
                if (typeof found === 'string') {
                    return found;
                }
                const format: Format = input.format === 'jpg' ? 'jpg' : 'png';
                const { result, entity } = found;
                const meta = await lookupMeta(result, client?.signal);
                const link = document.createElement('a');
                link.href = downloadUrl(result, entity, format, meta);
                link.download = '';
                document.body.appendChild(link);
                link.click();
                link.remove();
                const size = formatBytes(format === 'png' ? meta?.pngBytes : meta?.jpgBytes);
                return `Started downloading "${filenameFor(result, entity, meta)}.${format}"${size ? ` (${size})` : ''}. The browser shows its progress.`;
            },
        },
    ];
}

/** Registers the tools while the app is mounted (re-registering is avoided; tools read the latest state). */
export function useWebMcpTools(actions: WebMcpActions): void {
    const latest = useRef(actions);
    useEffect(() => {
        latest.current = actions;
    });

    useEffect(() => {
        const modelContext = getModelContext();
        if (!modelContext) {
            return;
        }
        const controller = new AbortController();
        const proxy: WebMcpActions = {
            search: (params) => latest.current.search(params),
            current: () => latest.current.current(),
            openPreview: (index) => latest.current.openPreview(index),
        };
        for (const tool of buildTools(proxy)) {
            try {
                void Promise.resolve(modelContext.registerTool(tool, { signal: controller.signal })).catch((error: unknown) =>
                    console.warn(`WebMCP: could not register ${tool.name}`, error),
                );
            } catch (error) {
                console.warn(`WebMCP: could not register ${tool.name}`, error);
            }
        }
        return () => controller.abort();
    }, []);
}

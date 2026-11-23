import { useCallback, useEffect, useRef, useState } from 'react';
import { isEntity, type ArtworkResult } from '../shared/types';
import { GridLargeIcon, GridSmallIcon } from './components/Icons';
import { PreviewDialog } from './components/PreviewDialog';
import { ResultCard } from './components/ResultCard';
import { SearchForm } from './components/SearchForm';
import { search, type SearchParams } from './lib/api';
import { COUNTRIES } from './lib/countries';
import { useArtworkMeta } from './lib/useArtworkMeta';

const CARD_SIZE_KEY = 'artworkFinder.cardSize';
const CARD_SIZE_MIN = 220;
const CARD_SIZE_MAX = 600;
const CARD_SIZE_DEFAULT = 300;

function paramsFromUrl(): SearchParams {
    const params = new URLSearchParams(window.location.search);
    const entity = params.get('entity') ?? '';
    const country = (params.get('country') ?? '').toLowerCase();
    return {
        entity: isEntity(entity) ? entity : 'album',
        query: params.get('query') ?? '',
        country: country in COUNTRIES ? country : 'us',
    };
}

function readCardSize(): number {
    try {
        const value = Number(localStorage.getItem(CARD_SIZE_KEY));
        return value >= CARD_SIZE_MIN && value <= CARD_SIZE_MAX ? value : CARD_SIZE_DEFAULT;
    } catch {
        return CARD_SIZE_DEFAULT;
    }
}

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'done' } | { kind: 'error'; message: string };

export function App() {
    const [initial] = useState(paramsFromUrl);
    const [params, setParams] = useState<SearchParams>(initial);
    const [formKey, setFormKey] = useState(0);
    const [results, setResults] = useState<ArtworkResult[]>([]);
    const [status, setStatus] = useState<Status>({ kind: 'idle' });
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [cardSize, setCardSize] = useState(readCardSize);
    const meta = useArtworkMeta(results);
    const controller = useRef<AbortController | null>(null);

    const runSearch = useCallback(async (next: SearchParams) => {
        controller.current?.abort();
        const current = new AbortController();
        controller.current = current;
        setParams(next);
        setPreviewIndex(null);
        setStatus({ kind: 'loading' });
        try {
            const found = await search(next, current.signal);
            setResults(found);
            setStatus({ kind: 'done' });
        } catch (error) {
            if (current.signal.aborted) {
                return;
            }
            setResults([]);
            setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Search failed. Please try again.' });
        }
    }, []);

    const onSearch = (next: SearchParams) => {
        const url = `${window.location.pathname}?${new URLSearchParams({ ...next })}`;
        window.history.pushState(null, '', url);
        void runSearch(next);
    };

    useEffect(() => {
        if (initial.query) {
            void runSearch(initial);
        }
        const onPopState = () => {
            const next = paramsFromUrl();
            setFormKey((k) => k + 1);
            if (next.query) {
                void runSearch(next);
            } else {
                setParams(next);
                setResults([]);
                setStatus({ kind: 'idle' });
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [initial, runSearch]);

    useEffect(() => {
        try {
            localStorage.setItem(CARD_SIZE_KEY, String(cardSize));
        } catch {
            // Storage unavailable (private mode etc.); the size just won't persist.
        }
    }, [cardSize]);

    const preview = previewIndex !== null ? results[previewIndex] ?? null : null;

    return (
        <>
            <header className="site-header">
                <div className="site-header-inner">
                    <a className="brand" href={import.meta.env.BASE_URL}>
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={32} height={32} />
                        <span>iTunes Artwork Finder</span>
                    </a>
                    <SearchForm key={formKey} initial={params} busy={status.kind === 'loading'} onSearch={onSearch} />
                    <label className="size-control" title="Artwork size">
                        <GridSmallIcon />
                        <span className="sr-only">Artwork size</span>
                        <input type="range" min={CARD_SIZE_MIN} max={CARD_SIZE_MAX} step={10} value={cardSize} onChange={(e) => setCardSize(Number(e.target.value))} />
                        <GridLargeIcon />
                    </label>
                </div>
            </header>

            <main className="content" style={{ '--card-size': `${cardSize}px` } as React.CSSProperties}>
                {status.kind === 'idle' && (
                    <section className="notice">
                        <h1>Full-resolution artwork from Apple's stores</h1>
                        <p>
                            Search for an album, movie, TV show, app, book or podcast. Click any artwork to preview it, then download a lossless{' '}
                            <strong>PNG</strong> or a smaller <strong>JPG</strong> at its full native size.
                        </p>
                    </section>
                )}

                {status.kind === 'loading' && (
                    <div className="grid" aria-busy="true" aria-label="Loading results">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="card card-skeleton" />
                        ))}
                    </div>
                )}

                {status.kind === 'error' && (
                    <section className="notice notice-error" role="alert">
                        <p>{status.message}</p>
                    </section>
                )}

                {status.kind === 'done' && results.length === 0 && (
                    <section className="notice">
                        <p>No results found. Try different search terms, another category or another country's store.</p>
                    </section>
                )}

                {status.kind === 'done' && results.length > 0 && (
                    <>
                        <p className="result-count" aria-live="polite">
                            {results.length} result{results.length === 1 ? '' : 's'}
                        </p>
                        <div className="grid">
                            {results.map((result, index) => (
                                <ResultCard key={result.artBase} result={result} entity={params.entity} meta={meta[result.artBase]} onPreview={() => setPreviewIndex(index)} />
                            ))}
                        </div>
                    </>
                )}
            </main>

            <footer className="site-footer">
                <p>
                    Only items available on Apple's stores can be found. For anything else, try{' '}
                    <a href="https://sourceforge.net/projects/album-art" target="_blank" rel="noopener noreferrer">
                        Album Art Downloader
                    </a>{' '}
                    or{' '}
                    <a href="https://images.google.com" target="_blank" rel="noopener noreferrer">
                        Google Images
                    </a>
                    .
                </p>
            </footer>

            <PreviewDialog
                result={preview}
                entity={params.entity}
                meta={preview ? meta[preview.artBase] : undefined}
                onClose={() => setPreviewIndex(null)}
                onPrev={previewIndex !== null && previewIndex > 0 ? () => setPreviewIndex(previewIndex - 1) : undefined}
                onNext={previewIndex !== null && previewIndex < results.length - 1 ? () => setPreviewIndex(previewIndex + 1) : undefined}
            />
        </>
    );
}

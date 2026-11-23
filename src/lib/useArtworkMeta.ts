import { useEffect, useState } from 'react';
import type { ArtworkMeta, ArtworkResult } from '../../shared/types';
import { fetchMeta } from './api';

const CHUNK_SIZE = 10;

export type MetaState = ArtworkMeta | 'loading' | 'error';

/** Looks up native dimensions and file sizes for each result, ten at a time. */
export function useArtworkMeta(results: ArtworkResult[]): Record<string, MetaState> {
    const [meta, setMeta] = useState<Record<string, MetaState>>({});

    useEffect(() => {
        const controller = new AbortController();
        const bases = results.map((r) => r.artBase);
        setMeta(Object.fromEntries(bases.map((b) => [b, 'loading' as const])));

        for (let i = 0; i < bases.length; i += CHUNK_SIZE) {
            const chunk = bases.slice(i, i + CHUNK_SIZE);
            fetchMeta(chunk, controller.signal)
                .then((data) => {
                    setMeta((prev) => {
                        const next = { ...prev };
                        chunk.forEach((b) => {
                            next[b] = data[b] ?? 'error';
                        });
                        return next;
                    });
                })
                .catch((error: unknown) => {
                    if (controller.signal.aborted) {
                        return;
                    }
                    console.warn(error);
                    setMeta((prev) => {
                        const next = { ...prev };
                        chunk.forEach((b) => {
                            next[b] = 'error';
                        });
                        return next;
                    });
                });
        }

        return () => controller.abort();
    }, [results]);

    return meta;
}

import { useEffect, useRef } from 'react';
import type { ArtworkResult, Entity } from '../../shared/types';
import { filenameFor, previewUrl } from '../lib/api';
import type { MetaState } from '../lib/useArtworkMeta';
import { ArtworkActions, metaLabel } from './ArtworkActions';
import { ChevronIcon, CloseIcon } from './Icons';

interface Props {
    result: ArtworkResult | null;
    entity: Entity;
    meta: MetaState | undefined;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
}

export function PreviewDialog({ result, entity, meta, onClose, onPrev, onNext }: Props) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) {
            return;
        }
        if (result && !dialog.open) {
            dialog.showModal();
        } else if (!result && dialog.open) {
            dialog.close();
        }
    }, [result]);

    useEffect(() => {
        if (!result) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' && onPrev) {
                onPrev();
            } else if (event.key === 'ArrowRight' && onNext) {
                onNext();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [result, onPrev, onNext]);

    return (
        <dialog
            ref={ref}
            className="preview"
            aria-label={result ? `Artwork preview: ${result.title}` : 'Artwork preview'}
            onClose={onClose}
            onClick={(event) => {
                // Clicks on the backdrop land on the dialog element itself.
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            {result && (
                <div className="preview-inner">
                    <div className="preview-art">
                        <img
                            key={result.artBase}
                            src={previewUrl(result, 1200)}
                            alt={`Artwork for ${result.title}`}
                            style={{ backgroundImage: `url("${previewUrl(result, 600)}")` }}
                        />
                    </div>
                    <div className="preview-info">
                        <div className="preview-text">
                            <h2>{result.title}</h2>
                            {result.artist && <p className="card-artist">{result.artist}</p>}
                            <p className="card-meta">{metaLabel(meta)}</p>
                            <p className="preview-filename" title="Downloads are saved with this name">
                                {filenameFor(result, entity, typeof meta === 'object' ? meta : undefined)}
                            </p>
                        </div>
                        <ArtworkActions result={result} entity={entity} meta={meta} />
                    </div>
                    <button type="button" className="icon-button preview-close" onClick={onClose} aria-label="Close preview">
                        <CloseIcon size={20} />
                    </button>
                    {onPrev && (
                        <button type="button" className="icon-button preview-nav preview-prev" onClick={onPrev} aria-label="Previous artwork">
                            <ChevronIcon dir="left" size={24} />
                        </button>
                    )}
                    {onNext && (
                        <button type="button" className="icon-button preview-nav preview-next" onClick={onNext} aria-label="Next artwork">
                            <ChevronIcon dir="right" size={24} />
                        </button>
                    )}
                </div>
            )}
        </dialog>
    );
}

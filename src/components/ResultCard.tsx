import type { ArtworkResult, Entity } from '../../shared/types';
import { previewUrl } from '../lib/api';
import type { MetaState } from '../lib/useArtworkMeta';
import { ArtworkActions, metaLabel } from './ArtworkActions';
import { ExpandIcon } from './Icons';

interface Props {
    result: ArtworkResult;
    entity: Entity;
    meta: MetaState | undefined;
    onPreview: () => void;
}

export function ResultCard({ result, entity, meta, onPreview }: Props) {
    return (
        <article className="card">
            <button type="button" className="card-art" onClick={onPreview} aria-label={`Preview artwork for ${result.title}`}>
                <img src={previewUrl(result, 600)} alt="" loading="lazy" decoding="async" />
                <span className="card-art-hint">
                    <ExpandIcon size={14} /> Preview
                </span>
            </button>
            <div className="card-body">
                <h2 className="card-title" title={result.title}>
                    {result.title}
                </h2>
                {result.artist && <p className="card-artist">{result.artist}</p>}
                <p className={`card-meta${meta === 'loading' || meta === undefined ? ' is-loading' : ''}`}>{metaLabel(meta)}</p>
                <ArtworkActions result={result} entity={entity} meta={meta} />
            </div>
        </article>
    );
}

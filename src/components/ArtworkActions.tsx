import { useEffect, useRef, useState } from 'react';
import type { ArtworkResult, Entity } from '../../shared/types';
import { downloadUrl, filenameFor, formatBytes, hiresUrl, type Format } from '../lib/api';
import type { MetaState } from '../lib/useArtworkMeta';
import { CheckIcon, CopyIcon, DownloadIcon, ExternalIcon } from './Icons';

interface Props {
    result: ArtworkResult;
    entity: Entity;
    meta: MetaState | undefined;
}

export function ArtworkActions({ result, entity, meta }: Props) {
    const [starting, setStarting] = useState<Format | null>(null);
    const [copied, setCopied] = useState(false);
    const timers = useRef<number[]>([]);

    useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

    const later = (fn: () => void, ms: number) => {
        timers.current.push(window.setTimeout(fn, ms));
    };

    const sizes = typeof meta === 'object' ? meta : undefined;
    const filename = filenameFor(result, entity);

    const onDownload = (format: Format) => {
        setStarting(format);
        later(() => setStarting(null), 4000);
    };

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(hiresUrl(result, 'png'));
            setCopied(true);
            later(() => setCopied(false), 2000);
        } catch {
            window.prompt('Copy the image link:', hiresUrl(result, 'png'));
        }
    };

    const downloadButton = (format: Format, label: string, hint: string, bytes: number | undefined, primary: boolean) => (
        <a
            className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`}
            href={downloadUrl(result, entity, format)}
            download
            onClick={() => onDownload(format)}
            title={`${hint}\nSaves as: ${filename}.${format}`}
            aria-busy={starting === format}
        >
            <DownloadIcon />
            <span className="btn-label">{starting === format ? 'Starting…' : label}</span>
            {starting !== format && formatBytes(bytes) && <span className="btn-meta">{formatBytes(bytes)}</span>}
        </a>
    );

    return (
        <div className="actions">
            <div className="actions-downloads">
                {downloadButton('png', 'PNG', 'Lossless: no extra compression', sizes?.pngBytes, true)}
                {downloadButton('jpg', 'JPG', 'Smaller file, highest JPEG quality', sizes?.jpgBytes, false)}
            </div>
            <div className="actions-links">
                <a href={hiresUrl(result, 'png')} target="_blank" rel="noopener noreferrer" title="Open the full-size image in a new tab">
                    Open <ExternalIcon size={13} />
                </a>
                <button type="button" className="link-button" onClick={onCopy} title="Copy the full-size image link">
                    {copied ? (
                        <>
                            Copied <CheckIcon size={13} />
                        </>
                    ) : (
                        <>
                            Copy link <CopyIcon size={13} />
                        </>
                    )}
                </button>
                {result.storeUrl && (
                    <a href={result.storeUrl} target="_blank" rel="noopener noreferrer" title="View this item on Apple's store">
                        Store <ExternalIcon size={13} />
                    </a>
                )}
            </div>
        </div>
    );
}

export function metaLabel(meta: MetaState | undefined): string {
    if (meta === undefined || meta === 'loading') {
        return 'Checking size…';
    }
    if (meta === 'error' || !meta.width || !meta.height) {
        return 'Size unavailable';
    }
    return `${meta.width} × ${meta.height}`;
}

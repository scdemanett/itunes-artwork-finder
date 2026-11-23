interface IconProps {
    size?: number;
}

function Svg({ size = 16, children }: IconProps & { children: React.ReactNode }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            {children}
        </svg>
    );
}

export const DownloadIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
    </Svg>
);

export const ExternalIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M14 4h6v6" />
        <path d="M20 4 10 14" />
        <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </Svg>
);

export const CopyIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </Svg>
);

export const CheckIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="m5 12 5 5 9-10" />
    </Svg>
);

export const ExpandIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="m21 3-7 7" />
        <path d="m3 21 7-7" />
    </Svg>
);

export const CloseIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
    </Svg>
);

export const ChevronIcon = ({ dir, ...p }: IconProps & { dir: 'left' | 'right' }) => (
    <Svg {...p}>{dir === 'left' ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}</Svg>
);

export const GridSmallIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="3" y="3" width="5" height="5" />
        <rect x="10" y="3" width="5" height="5" />
        <rect x="17" y="3" width="4" height="5" />
        <rect x="3" y="10" width="5" height="5" />
        <rect x="10" y="10" width="5" height="5" />
        <rect x="17" y="10" width="4" height="5" />
    </Svg>
);

export const GridLargeIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="3" y="3" width="8" height="8" />
        <rect x="13" y="3" width="8" height="8" />
        <rect x="3" y="13" width="8" height="8" />
        <rect x="13" y="13" width="8" height="8" />
    </Svg>
);

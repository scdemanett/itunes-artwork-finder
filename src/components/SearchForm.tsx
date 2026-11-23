import { useState } from 'react';
import { ENTITIES, isEntity } from '../../shared/types';
import type { SearchParams } from '../lib/api';
import { COUNTRIES } from '../lib/countries';

const SORTED_COUNTRIES = Object.entries(COUNTRIES).sort((a, b) => a[1].localeCompare(b[1]));

interface Props {
    initial: SearchParams;
    busy: boolean;
    onSearch: (params: SearchParams) => void;
}

export function SearchForm({ initial, busy, onSearch }: Props) {
    const [entity, setEntity] = useState(initial.entity);
    const [query, setQuery] = useState(initial.query);
    const [country, setCountry] = useState(initial.country);

    const isId = entity === 'id' || entity === 'idAlbum';

    return (
        <form
            className="search"
            role="search"
            onSubmit={(event) => {
                event.preventDefault();
                if (query.trim()) {
                    onSearch({ entity, query: query.trim(), country });
                }
            }}
        >
            <label className="field field-entity">
                <span className="sr-only">Search for</span>
                <select value={entity} onChange={(e) => isEntity(e.target.value) && setEntity(e.target.value)}>
                    {ENTITIES.map((e) => (
                        <option key={e.value} value={e.value}>
                            {e.label}
                        </option>
                    ))}
                </select>
            </label>
            <label className="field field-query">
                <span className="sr-only">Search terms</span>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isId ? 'Apple ID, e.g. 1097862870' : 'e.g. Radiohead Kid A'}
                    inputMode={isId ? 'numeric' : undefined}
                    autoFocus={!initial.query}
                    required
                />
            </label>
            <label className="field field-country">
                <span className="sr-only">Store country</span>
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                    {SORTED_COUNTRIES.map(([code, name]) => (
                        <option key={code} value={code}>
                            {name}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit" className="btn btn-primary search-submit" disabled={busy}>
                {busy ? 'Searching…' : 'Find artwork'}
            </button>
        </form>
    );
}

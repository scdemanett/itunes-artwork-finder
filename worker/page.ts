/**
 * The app page, for agents as well as browsers: answers Accept: text/markdown with a Markdown description
 * (Markdown for Agents content negotiation) and adds Link headers pointing at the Markdown and llms.txt.
 * Wired up through `run_worker_first` in wrangler.jsonc.
 */

/** Quality value of a media type in an Accept header (0 when absent). Wildcards count only for type/*, not *\/*. */
function quality(accept: string, type: string): number {
    let best = 0;
    for (const part of accept.split(',')) {
        const [range, ...params] = part.trim().toLowerCase().split(';');
        const q = Number(params.map((p) => p.trim()).find((p) => p.startsWith('q='))?.slice(2) ?? '1');
        if (range === type || range === `${type.split('/')[0]}/*`) {
            best = Math.max(best, Number.isFinite(q) ? q : 1);
        }
    }
    return best;
}

export function prefersMarkdown(accept: string | null): boolean {
    if (!accept) {
        return false;
    }
    const markdown = quality(accept, 'text/markdown');
    return markdown > 0 && markdown >= quality(accept, 'text/html');
}

function discoveryLinks(base: string): string {
    return [
        `<${base}/index.md>; rel="alternate"; type="text/markdown"`,
        `<${base}/llms.txt>; rel="describedby"; type="text/plain"`,
    ].join(', ');
}

/** Link header for the Markdown version: the HTML page is canonical. */
function markdownLinks(base: string): string {
    return `<${base}/>; rel="canonical", <${base}/>; rel="alternate"; type="text/html", <${base}/llms.txt>; rel="describedby"; type="text/plain"`;
}

/** /index.md requested directly: add the same Link header the negotiated Markdown gets. */
export async function handleMarkdownFile(request: Request, assets: Fetcher, base: string): Promise<Response> {
    const file = await assets.fetch(request);
    const headers = new Headers(file.headers);
    if (file.ok) {
        headers.set('Link', markdownLinks(base));
    }
    return new Response(file.body, { status: file.status, statusText: file.statusText, headers });
}

export async function handlePage(request: Request, assets: Fetcher, base: string): Promise<Response> {
    const url = new URL(request.url);

    if (prefersMarkdown(request.headers.get('Accept'))) {
        const markdown = await assets.fetch(new Request(new URL(`${base}/index.md`, url), { method: request.method }));
        if (markdown.ok) {
            const headers = new Headers(markdown.headers);
            headers.set('Content-Type', 'text/markdown; charset=utf-8');
            headers.set('Vary', 'Accept');
            headers.set('Link', markdownLinks(base));
            headers.delete('ETag');
            return new Response(markdown.body, { status: 200, headers });
        }
    }

    const page = await assets.fetch(request);
    const headers = new Headers(page.headers);
    headers.append('Vary', 'Accept');
    if (page.ok) {
        headers.set('Link', discoveryLinks(base));
    }
    return new Response(page.body, { status: page.status, statusText: page.statusText, headers });
}

---
title: iTunes Artwork Finder
description: Find and download full-resolution album covers and artwork from Apple Music, iTunes, the App Store and Apple Books, as lossless PNG or JPG.
doc_version: 2.0
last_updated: 2026-11-23
---

# iTunes Artwork Finder

Find and download **full-resolution artwork from Apple's stores**: album covers (Apple Music / iTunes), movie and TV posters, app icons, book and audiobook covers, and podcast artwork. Free, no account needed.

## What it does

- **Full native resolution.** Requests Apple's largest accepted size, which is capped at the original upload, so you get the real image, never an upscale (often 3000 × 3000 or 4000 × 4000).
- **Size before download.** Every result shows its native dimensions and the PNG and JPG file sizes.
- **Lossless PNG or smaller JPG**, saved through the browser's download manager.
- **Tidy filenames.** Album covers are saved as `Artist - Album (Edition) - Front (Hi-Res).png`. "(Hi-Res)" means at least 1000 px on the short side; non-square artwork is labelled "(Original)".
- **Every store and country**: albums, apps (iPhone, iPad, Mac), audiobooks, books, music videos, movies, podcasts, short films and TV shows in 150+ country storefronts.

## How to search

Open the page and use the search form, or link to results directly:

`?entity=<type>&query=<search terms>&country=<store>`

Example: `?entity=album&query=Radiohead%20Kid%20A&country=us`

| Type | Searches |
|---|---|
| `album` | Artist and/or album |
| `idAlbum` | Apple album ID |
| `software` | iPhone and universal apps |
| `iPadSoftware` | iPad apps |
| `macSoftware` | Mac apps |
| `id` | Apple movie ID |
| `audiobook` | Audiobooks |
| `ebook` | Books |
| `musicVideo` | Music videos |
| `movie` | Movies |
| `podcast` | Podcasts |
| `shortFilm` | Short films |
| `tvSeason` | TV shows |

`country` is a two-letter store code such as `us`, `gb` or `jp`. Availability and artwork can differ between countries.

## For AI agents

In browsers that support [WebMCP](https://github.com/webmachinelearning/webmcp), the page registers four tools with `document.modelContext`:

- `search_artwork(query, type?, country?)`: search and show results; returns result ids
- `get_artwork_details(id)`: dimensions, file sizes, download filenames and full-size URLs
- `preview_artwork(id)`: open the large preview
- `download_artwork(id, format?)`: download the PNG (default) or JPG

More detail: [llms.txt](/itunes-artwork-finder/llms.txt). Source code: [GitHub](https://github.com/scdemanett/itunes-artwork-finder).

Artwork belongs to its respective owners and is provided by Apple. This site is not affiliated with Apple.

## Sitemap

See the full [sitemap](/sitemap.md) for all pages.

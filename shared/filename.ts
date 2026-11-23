/** Replace characters Windows/macOS can't store in filenames, the same way browsers do. */
export function sanitizeFilename(name: string): string {
    // eslint-disable-next-line no-control-regex
    const cleaned = name.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').trim().slice(0, 200);
    return cleaned || 'artwork';
}

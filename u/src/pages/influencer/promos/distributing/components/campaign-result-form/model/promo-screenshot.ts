export const PROMO_SCREENSHOT_MAX_BYTES = 10 * 1024 * 1024; // documented server DEFAULT, not a measured deployment limit
export function validatePromoScreenshot(file: { type: string; size: number }) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Use a JPEG, PNG or WebP screenshot.');
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > PROMO_SCREENSHOT_MAX_BYTES) throw new Error('Screenshot must be non-empty and at most 10 MiB (default limit).');
}
export function retryAfterUntil(headers: any, now = Date.now()): number {
  const raw = typeof headers?.get === 'function' ? headers.get('retry-after') : headers?.['retry-after'] ?? headers?.['Retry-After'];
  if (typeof raw !== 'string' && typeof raw !== 'number') return 0;
  const value = String(raw).trim();
  if (/^\d+(\.\d+)?$/.test(value)) { const until = now + Number(value) * 1000; return Number.isFinite(until) && Number.isFinite(new Date(until).getTime()) ? until : 0; }
  if (!/[a-z]/i.test(value)) return 0;
  const date = Date.parse(value); return Number.isFinite(date) && date > now ? date : 0;
}
export function screenshotError(error: any) {
  const messages: Record<number, string> = { 400: 'The image is empty, damaged or invalid.', 413: 'The screenshot exceeds server size or pixel limits.', 415: 'The server rejected the image format or MIME type.', 429: 'Upload limit reached. Please wait before retrying.', 503: 'Upload service is temporarily unavailable.', 504: 'Upload timed out; the file may have reached the server.', 502: 'Image storage is temporarily unavailable.' };
  return messages[error?.response?.status] ?? 'Screenshot upload failed. Your previous screenshot and form have been kept.';
}
// One consumer/controller per form session. Replacing/removing a file invalidates
// the old continuation even if an API ignores AbortSignal.
export function createPromoScreenshot(deps: { upload: (file: File, signal: AbortSignal, isCurrent?: () => boolean) => Promise<string>; live: () => boolean; apply: (url: string | null) => void; changed: () => void; now?: () => number }) {
  let generation = 0, controller: AbortController | undefined, last: File | undefined, retryAt = 0;
  let state = { pending: false, error: '', retryAt: 0 };
  const now = deps.now ?? Date.now;
  const cancel = () => { generation++; controller?.abort(); controller = undefined; state = { ...state, pending: false }; };
  async function select(file: File) {
    if (!deps.live()) return;
    if (state.pending && last === file) return;
    cancel(); last = file;
    const attempt = generation;
    try { validatePromoScreenshot(file); }
    catch (error) { state = { pending: false, error: (error as Error).message, retryAt }; deps.changed(); return; }
    if (retryAt > now()) { state = { ...state, retryAt, error: 'Wait until the upload retry delay expires.' }; deps.changed(); return; }
    controller = new AbortController(); state = { pending: true, error: '', retryAt: 0 }; deps.changed();
    try {
      const url = await deps.upload(file, controller.signal, () => deps.live() && attempt === generation);
      if (!deps.live() || attempt !== generation) return;
      let parsed: URL; try { parsed = new URL(url); } catch { throw new Error('Invalid upload URL.'); }
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid upload URL.');
      deps.apply(url); retryAt = 0; state = { pending: false, error: '', retryAt: 0 };
    } catch (error: any) {
      if (!deps.live() || attempt !== generation) return;
      retryAt = retryAfterUntil(error?.response?.headers, now());
      state = { pending: false, error: screenshotError(error), retryAt };
    } finally { if (deps.live() && attempt === generation) { state = { ...state, pending: false }; deps.changed(); } }
  }
  return { state: () => state, select, retry: () => last ? select(last) : Promise.resolve(), remove: () => { cancel(); last = undefined; state = { pending: false, error: '', retryAt }; if (deps.live()) { deps.apply(null); deps.changed(); } }, dispose: cancel };
}

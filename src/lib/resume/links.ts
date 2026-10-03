/**
 * URL helpers shared by validation and rendering. Users often type
 * "linkedin.com/in/name" without a protocol, so bare domains are accepted and
 * upgraded to https. Any explicit scheme other than http(s) is rejected,
 * which blocks `javascript:` and `data:` links.
 */

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export function toHref(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const candidate = SCHEME.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isSafeUrl(value: string): boolean {
  return toHref(value) !== null;
}

/** Compact display form: drops protocol, "www." and trailing slash. */
export function displayUrl(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: "invalid" | "not_found" | "unauthorized" | "stale" | "limit" | "rate_limited" | "server" };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string, code?: Extract<ActionResult, { ok: false }>["code"]): ActionResult<never> {
  return { ok: false, error, code };
}

/** Allows only same-origin relative paths for post-login redirects. */
export function safeRedirectPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

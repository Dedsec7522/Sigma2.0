// Minimal fixed-window limiter for API routes. Per server instance; put a shared
// store (e.g. Redis) behind this if the site runs on several instances. Keys come
// from lib/client-ip.ts, which avoids the client-controlled X-Forwarded-For entry.
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

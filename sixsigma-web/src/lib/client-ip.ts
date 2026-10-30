// Client IP for rate limiting. The left-most X-Forwarded-For entry is whatever the
// client sent, so it can't be trusted. Prefer the header your host sets itself
// (TRUSTED_IP_HEADER, e.g. "x-vercel-forwarded-for", "cf-connecting-ip" or
// "x-real-ip"); otherwise use the right-most entry, which your own proxy appends.
export function clientIp(req: Request): string {
  const trusted = process.env.TRUSTED_IP_HEADER;
  if (trusted) {
    const value = req.headers.get(trusted)?.split(",")[0]?.trim();
    if (value) return value;
  }
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

const intFromEnv = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

/** Site-wide hourly caps, independent of client IP, so spoofing can't exceed them. */
export const GLOBAL_LIMITS = {
  advisorPerHour: intFromEnv("ADVISOR_MAX_PER_HOUR", 300),
  enquiriesPerHour: intFromEnv("ENQUIRY_MAX_PER_HOUR", 100),
};

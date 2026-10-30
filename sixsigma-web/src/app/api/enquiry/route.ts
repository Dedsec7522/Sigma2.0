import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, GLOBAL_LIMITS } from "@/lib/client-ip";

// Enquiries are validated here, then forwarded to the CRM/backend configured in
// ENQUIRY_WEBHOOK_URL (JSON POST). Without one, development stores them locally.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS = { name: 120, email: 160, phone: 40, company: 160, jobTitle: 120, course: 200, funding: 40, type: 20, message: 2000, page: 300 } as const;
type Field = keyof typeof FIELDS;

export async function POST(req: Request) {
  // Per-visitor limit plus a site-wide cap so a spoofed-IP flood can't swamp the CRM.
  if (!rateLimit(`enquiry:${clientIp(req)}`, 6, 10 * 60_000) || !rateLimit("enquiry:all", GLOBAL_LIMITS.enquiriesPerHour, 3_600_000)) {
    return Response.json({ ok: false, error: "Too many enquiries. Please call us instead." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.website === "string" && body.website.length > 0) return Response.json({ ok: true });

  const data = {} as Record<Field, string>;
  for (const [k, max] of Object.entries(FIELDS) as [Field, number][]) {
    const v = body[k];
    data[k] = typeof v === "string" ? v.trim().slice(0, max) : "";
  }

  const errors: Partial<Record<Field | "consent", string>> = {};
  if (data.name.length < 2) errors.name = "Enter your full name";
  if (!EMAIL.test(data.email)) errors.email = "Enter a valid email address, like name@company.co.uk";
  if (data.phone && !/^[+\d][\d\s()-]{6,}$/.test(data.phone)) errors.phone = "Enter a valid phone number";
  if (body.consent !== true) errors.consent = "Please confirm we can contact you about your enquiry";
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  const record = {
    ...data,
    marketingConsent: body.marketing === true,
    receivedAt: new Date().toISOString(),
    source: "sixsigma-web",
  };

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(process.env.ENQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` } : {}) },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } else if (process.env.NODE_ENV !== "production") {
      const dir = path.join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, "enquiries.jsonl"), `${JSON.stringify(record)}\n`);
    } else {
      throw new Error("ENQUIRY_WEBHOOK_URL is not set");
    }
  } catch (err) {
    console.error("enquiry: delivery failed", err);
    return Response.json({ ok: false, error: "We couldn't send your enquiry just now. Please call us or email info@sixsigma.co.uk." }, { status: 502 });
  }
  return Response.json({ ok: true });
}

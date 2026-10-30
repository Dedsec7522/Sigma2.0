import Anthropic from "@anthropic-ai/sdk";
import { getCourseIndex } from "@/lib/course-index";
import { describeAnswers, nextUpcomingDate, type Answers } from "@/lib/advisor";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, GLOBAL_LIMITS } from "@/lib/client-ip";

const MODEL = process.env.ADVISOR_MODEL ?? "claude-opus-5-5";

const SYSTEM = `You are the Course Advisor for SixSigma.co.uk, a UK training provider. A visitor has answered a short questionnaire and our catalogue search has produced a shortlist of real courses.

Your job:
- Choose the single best course for the visitor from the shortlist, and up to two alternatives that are genuinely useful for a different reason (e.g. a different level, a shorter option, a self-paced version).
- For each course you choose, write one or two sentences (max 45 words) in British English, addressed to the visitor as "you", explaining why it fits their answers.

Rules:
- Only choose paths that appear in the shortlist. Never invent courses, dates, prices, accreditations or outcomes.
- Base every claim on the course facts provided. If a fact isn't provided, don't mention it.
- Prefer the course whose level matches the visitor's experience and goal; don't push a longer or more advanced course than they need.
- Plain, professional tone. No exclamation marks, no superlatives.`;

const ANSWER_KEYS = new Set(["topic", "tool", "goal", "experience", "audience", "format", "commitment", "timing", "freeText"]);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json({ error: "AI refinement is not configured" }, { status: 501 });
  }
  // Per-visitor limit plus a site-wide cap that bounds paid model usage even if IPs are spoofed.
  if (!rateLimit(`advisor:${clientIp(req)}`, 12, 60_000) || !rateLimit("advisor:all", GLOBAL_LIMITS.advisorPerHour, 3_600_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { answers?: Record<string, unknown>; candidates?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const index = getCourseIndex();
  const byPath = new Map(index.map((c) => [c.path, c]));
  const candidates = Array.isArray(body.candidates)
    ? [...new Set(body.candidates.filter((p): p is string => typeof p === "string" && byPath.has(p)))].slice(0, 6)
    : [];
  if (candidates.length < 2) return Response.json({ error: "Not enough candidates" }, { status: 400 });

  const answers: Answers = {};
  for (const [k, v] of Object.entries(body.answers ?? {})) {
    if (ANSWER_KEYS.has(k) && typeof v === "string") (answers as Record<string, string>)[k] = v.slice(0, k === "freeText" ? 300 : 40);
  }

  const shortlist = candidates.map((p) => {
    const c = byPath.get(p)!;
    return {
      path: c.path,
      name: c.name,
      category: c.categoryName,
      level: c.level,
      duration: c.duration,
      deliveryMethods: c.methods,
      selfPacedOnlineAvailable: Boolean(c.onlinePath),
      examIncluded: c.examIncluded,
      nextScheduledDate: nextUpcomingDate(c),
      summary: c.summary,
      whoItIsFor: c.audience,
      prerequisites: c.prerequisites,
    };
  });

  const visitor = describeAnswers(answers).map((a) => a.label);
  const userPrompt = `Visitor's answers: ${visitor.join("; ") || "none"}.
${answers.freeText ? `In their own words: """${answers.freeText}"""\n` : ""}
Shortlist (JSON):
${JSON.stringify(shortlist, null, 1)}`;

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["primary", "alternatives", "reasons"],
    properties: {
      primary: { type: "string", enum: candidates },
      alternatives: { type: "array", items: { type: "string", enum: candidates }, maxItems: 2 },
      reasons: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["path", "reason"],
          properties: { path: { type: "string", enum: candidates }, reason: { type: "string" } },
        },
      },
    },
  };

  const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      return Response.json({ error: "No recommendation" }, { status: 502 });
    }
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const parsed = JSON.parse(text) as { primary: string; alternatives: string[]; reasons: { path: string; reason: string }[] };

    // Never trust the model's output blindly: re-check every path against the shortlist.
    const allowed = new Set(candidates);
    if (!allowed.has(parsed.primary)) return Response.json({ error: "Invalid recommendation" }, { status: 502 });
    const alternatives = parsed.alternatives.filter((p) => allowed.has(p) && p !== parsed.primary).slice(0, 2);
    const reasons: Record<string, string> = {};
    for (const r of parsed.reasons) if (allowed.has(r.path)) reasons[r.path] = r.reason.slice(0, 400);
    return Response.json({ primary: parsed.primary, alternatives, reasons });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return Response.json({ error: "Busy" }, { status: 503 });
    if (err instanceof Anthropic.APIError) {
      console.error("advisor: API error", err.status, err.message);
      return Response.json({ error: "Upstream error" }, { status: 502 });
    }
    console.error("advisor: failed", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

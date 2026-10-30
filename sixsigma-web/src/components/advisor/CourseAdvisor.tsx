"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  Certificate,
  CheckCircle,
  Clock,
  Lightbulb,
  PencilSimple,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass } from "@/components/ui/button";
import { useCourseIndex } from "./useCourseIndex";
import {
  ANSWER_ORDER,
  describeAnswers,
  experienceFromText,
  nextQuestion,
  recommend,
  topicFromText,
  type Answers,
  type Recommendation,
} from "@/lib/advisor";
import { LEVEL_LABEL, METHOD_LABEL, type CourseIndexEntry } from "@/lib/types";
import { IS_STATIC_PREVIEW, withBase } from "@/lib/site";

type AiResult = { primary: string; alternatives: string[]; reasons: Record<string, string> } | null;

const priceFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

export function CourseAdvisor({ open, prefill, onClose }: { open: boolean; prefill?: Answers; onClose: () => void }) {
  const titleId = useId();
  const { data, error, retry } = useCourseIndex();
  const [answers, setAnswers] = useState<Answers>(() => applyFreeText(prefill ?? {}));
  const [direction, setDirection] = useState(1);
  const [freeText, setFreeText] = useState(prefill?.freeText ?? "");

  const question = useMemo(() => (data ? nextQuestion(answers, data) : null), [answers, data]);
  const totalSteps = useMemo(() => estimateSteps(answers), [answers]);
  const answered = describeAnswers(answers).length;
  const done = Boolean(data && !question);

  const choose = (id: keyof Answers, value: string) => {
    setDirection(1);
    setAnswers((a) => ({ ...a, [id]: value }));
  };

  const back = () => {
    setDirection(-1);
    setAnswers((a) => {
      const keys = ANSWER_ORDER.filter((k) => a[k] !== undefined);
      const last = keys[keys.length - 1];
      if (!last) return a;
      const next = { ...a };
      delete next[last];
      return next;
    });
  };

  const editFrom = (key: keyof Answers) => {
    setDirection(-1);
    setAnswers((a) => {
      const idx = ANSWER_ORDER.indexOf(key);
      const next: Answers = { freeText: a.freeText };
      for (const k of ANSWER_ORDER.slice(0, idx)) if (a[k] !== undefined) (next as Record<string, unknown>)[k] = a[k];
      return next;
    });
  };

  const restart = () => {
    setDirection(-1);
    setFreeText("");
    setAnswers({});
  };

  const submitFreeText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeText.trim()) return;
    setDirection(1);
    setAnswers((a) => applyFreeText({ ...a, freeText: freeText.trim() }));
  };

  const stepKey = done ? "results" : question?.id ?? "loading";

  return (
    <Dialog open={open} onClose={onClose} labelledBy={titleId} className="flex max-h-[min(92dvh,52rem)] max-w-3xl flex-col">
      {/* Header */}
      <div className="on-dark relative shrink-0 bg-navy-900 px-6 pb-5 pt-6 text-white sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-gold-400">
              <Sparkle aria-hidden size={16} weight="fill" /> Course Advisor
            </p>
            <h2 id={titleId} className="mt-1.5 font-display text-xl font-semibold !text-white sm:text-2xl">
              {done ? "Your recommended training" : "Let's find the right course for you"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close Course Advisor">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="mt-5" aria-hidden>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full origin-left rounded-full bg-gold-500"
              initial={false}
              animate={{ scaleX: done ? 1 : Math.min(0.92, Math.max(0.06, answered / totalSteps)) }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {done ? "Recommendations ready" : question ? `Question ${answered + 1}: ${question.title}` : ""}
        </p>
        {answered > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Your answers. Select one to change it.">
            {describeAnswers(answers).map((a) => (
              <li key={a.key}>
                <button
                  type="button"
                  onClick={() => editFrom(a.key)}
                  className="group flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/20"
                >
                  {a.label}
                  <PencilSimple aria-hidden size={12} className="opacity-60 group-hover:opacity-100" />
                  <span className="sr-only">(change)</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Body */}
      <div className="relative min-h-[22rem] flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-8">
        {error && (
          <div role="alert" className="rounded-2xl border border-line p-6 text-center">
            <p className="font-semibold text-navy-900">We couldn&rsquo;t load the course catalogue.</p>
            <p className="mt-1 text-sm text-ink-muted">Please check your connection and try again.</p>
            <button type="button" onClick={retry} className={buttonClass("primary", "sm", "mt-4")}>Try again</button>
          </div>
        )}
        {!data && !error && (
          <div className="space-y-3" aria-hidden>
            <div className="skeleton h-7 w-2/3" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {data && question && (
            <motion.div
              key={stepKey}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
            >
              <fieldset>
                <legend className="font-display text-lg font-semibold text-navy-900 sm:text-xl">{question.title}</legend>
                {question.help && <p className="mt-1 text-[0.95rem] text-ink-muted">{question.help}</p>}
                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {question.options.map((o, i) => (
                    <motion.button
                      key={o.value}
                      type="button"
                      data-autofocus={i === 0 ? true : undefined}
                      onClick={() => choose(question.id, o.value)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i, type: "spring", stiffness: 400, damping: 32 }}
                      whileTap={{ scale: 0.985 }}
                      className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left transition-[border-color,background-color,box-shadow] hover:border-navy-600 hover:bg-navy-50/60 hover:shadow-card"
                    >
                      <span>
                        <span className="block font-semibold text-navy-900">{o.label}</span>
                        {o.hint && <span className="mt-0.5 block text-sm text-ink-muted">{o.hint}</span>}
                      </span>
                      <ArrowRight aria-hidden size={18} className="shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-navy-900" />
                    </motion.button>
                  ))}
                </div>
              </fieldset>

              {question.id === "topic" && (
                <form onSubmit={submitFreeText} className="mt-6 rounded-2xl bg-canvas p-4">
                  <label htmlFor="advisor-free-text" className="text-sm font-semibold text-navy-900">
                    Or describe what you need in your own words
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="advisor-free-text"
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      maxLength={300}
                      placeholder="e.g. I manage a warehouse team and want to cut waste"
                      className="h-12 flex-1 rounded-xl border border-line-strong bg-white px-4 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-navy-600"
                    />
                    <button type="submit" className={buttonClass("primary", "md")} disabled={!freeText.trim()}>
                      Continue
                    </button>
                  </div>
                  {answers.freeText && !answers.topic && (
                    <p role="status" className="mt-2 text-sm text-ink-muted">
                      Thanks. Which of the areas above is the closest fit?
                    </p>
                  )}
                </form>
              )}
            </motion.div>
          )}

          {done && data && (
            <motion.div key="results" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 380, damping: 36 }}>
              <Results answers={answers} catalogue={data} onClose={onClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-canvas px-6 py-3.5 sm:px-8">
        {answered > 0 ? (
          <div className="flex gap-1">
            {!done && (
              <button type="button" onClick={back} className={buttonClass("ghost", "sm")}>
                <ArrowLeft aria-hidden size={16} /> Back
              </button>
            )}
            <button type="button" onClick={restart} className={buttonClass("ghost", "sm")}>
              <ArrowCounterClockwise aria-hidden size={16} /> Start again
            </button>
          </div>
        ) : (
          <span />
        )}
        <p className="text-right text-xs text-ink-subtle">We don&rsquo;t ask for personal details or store your answers.</p>
      </div>
    </Dialog>
  );
}

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -24, transition: { duration: 0.14 } }),
};

function applyFreeText(a: Answers): Answers {
  if (!a.freeText || a.topic) return a;
  const { topic, tool } = topicFromText(a.freeText);
  const experience = experienceFromText(a.freeText);
  return { ...a, ...(topic ? { topic } : {}), ...(tool ? { tool } : {}), ...(experience && !a.experience ? { experience } : {}) };
}

function estimateSteps(a: Answers) {
  let n = 6;
  if (a.topic === "data-tools") n += 1;
  if (a.topic === "lean-six-sigma") n += 1;
  if (a.format === "online" || a.format === "onsite") n -= 1;
  return n;
}

// ---------------------------------------------------------------- results
function Results({ answers, catalogue, onClose }: { answers: Answers; catalogue: CourseIndexEntry[]; onClose: () => void }) {
  const base = useMemo(() => recommend(answers, catalogue), [answers, catalogue]);
  // The AI step needs the server route, so the static preview uses the deterministic ranking only.
  const [ai, setAi] = useState<AiResult | "loading">(base.candidates.length > 1 && !IS_STATIC_PREVIEW ? "loading" : null);
  const asked = useRef(false);

  // Optional AI refinement: re-ranks the shortlist and explains the choice in plain
  // English. It can only choose from the shortlist; anything else is ignored.
  useEffect(() => {
    if (asked.current || base.candidates.length < 2 || IS_STATIC_PREVIEW) return;
    asked.current = true;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 12000);
    fetch(withBase("/api/advisor"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, candidates: base.candidates.map((c) => c.course.path) }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<AiResult>) : null))
      .catch(() => null)
      .then((res) => setAi(res && base.candidates.some((c) => c.course.path === res.primary) ? res : null))
      .finally(() => window.clearTimeout(timer));
    return () => ctrl.abort();
  }, [answers, base.candidates]);

  if (ai === "loading") {
    return (
      <div role="status" aria-label="Preparing your recommendations">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }} className="inline-flex">
            <Sparkle aria-hidden size={16} weight="fill" className="text-brand-600" />
          </motion.span>
          Matching your answers against {catalogue.length} courses…
        </p>
        <div className="mt-5 space-y-3" aria-hidden>
          <div className="skeleton h-44" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="skeleton h-28" />
            <div className="skeleton h-28" />
          </div>
        </div>
      </div>
    );
  }

  const byPath = new Map(base.candidates.map((c) => [c.course.path, c]));
  let primary: Recommendation | null = base.primary;
  let alternatives = base.alternatives;
  if (ai) {
    primary = byPath.get(ai.primary) ?? primary;
    const alts = ai.alternatives.map((p) => byPath.get(p)).filter((r): r is Recommendation => Boolean(r) && r!.course.path !== primary?.course.path);
    if (alts.length) alternatives = alts.slice(0, 2);
  }

  if (!primary) {
    return (
      <div className="rounded-2xl border border-line p-6">
        <Lightbulb aria-hidden size={28} className="text-gold-500" />
        <h3 className="mt-3 text-lg font-semibold">We don&rsquo;t have a scheduled course that fits all of that</h3>
        <p className="mt-2 text-ink-muted">
          Rather than suggest something unsuitable, we&rsquo;d recommend a quick conversation. Our advisors can tailor any course and deliver it onsite or online for your team.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/contact" onClick={onClose} className={buttonClass("primary", "md")}>Talk to an advisor</Link>
          <Link href="/courses" onClick={onClose} className={buttonClass("secondary", "md")}>Browse all courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RecommendationCard rec={primary} reason={ai?.reasons[primary.course.path]} onClose={onClose} primary />
      {alternatives.length > 0 && (
        <>
          <h3 className="mt-8 text-base font-semibold">Also worth considering</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {alternatives.map((r, i) => (
              <motion.div key={r.course.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06, type: "spring", stiffness: 300, damping: 30 }}>
                <RecommendationCard rec={r} reason={ai?.reasons[r.course.path]} onClose={onClose} />
              </motion.div>
            ))}
          </div>
        </>
      )}
      <p className="mt-6 text-xs leading-relaxed text-ink-subtle">
        Recommendations come from our live course catalogue, schedule and course content{ai ? ", with AI used to weigh them against your answers" : ""}. Dates and prices are confirmed when you book.
      </p>
    </div>
  );
}

function RecommendationCard({ rec, reason, onClose, primary = false }: { rec: Recommendation; reason?: string; onClose: () => void; primary?: boolean }) {
  const c = rec.course;
  const onlinePrice = rec.format === "online" ? c.onlinePrice : null;
  const price = onlinePrice ?? c.fromPrice;
  const enquiry = `/contact?course=${encodeURIComponent(c.name)}`;
  return (
    <article className={`flex h-full flex-col rounded-2xl border p-5 ${primary ? "border-navy-100 bg-gradient-to-b from-navy-50/70 to-white p-6 shadow-card" : "border-line bg-white"}`}>
      {primary && (
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
          <CheckCircle aria-hidden size={16} weight="fill" /> Best match
        </p>
      )}
      <h3 className={`${primary ? "mt-2 text-xl sm:text-2xl" : "text-base"} font-semibold`}>{c.name}</h3>
      <p className="mt-1 text-sm text-ink-muted">
        {c.categoryName} · {LEVEL_LABEL[c.level]} level
      </p>
      {primary && <p className="mt-3 text-[0.95rem] leading-relaxed text-ink">{reason ?? c.summary}</p>}
      {!primary && reason && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{reason}</p>}

      {primary && rec.reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {rec.reasons.map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm text-ink">
              <CheckCircle aria-hidden size={16} weight="fill" className="mt-0.5 shrink-0 text-brand-600" />
              {r}
            </li>
          ))}
        </ul>
      )}

      <dl className={`flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted ${primary ? "mt-5" : "mt-3"}`}>
        {c.duration && rec.format !== "online" && (
          <div className="flex items-center gap-1.5">
            <dt><Clock aria-label="Duration" size={15} className="text-brand-600" /></dt>
            <dd>{c.duration}</dd>
          </div>
        )}
        {c.examIncluded && (
          <div className="flex items-center gap-1.5">
            <dt><Certificate aria-label="Certification" size={15} className="text-brand-600" /></dt>
            <dd>Exam included</dd>
          </div>
        )}
        {c.nextDate && rec.format !== "online" && rec.format !== "onsite" && (
          <div className="flex items-center gap-1.5">
            <dt><CalendarBlank aria-label="Next date" size={15} className="text-brand-600" /></dt>
            <dd>Next {dateFmt.format(new Date(`${c.nextDate}T12:00:00Z`))}</dd>
          </div>
        )}
        {primary && (
          <div className="flex w-full flex-wrap items-center gap-1.5">
            <dt className="sr-only">Delivery</dt>
            <dd>{(rec.format === "online" ? ["online" as const] : c.methods).map((m) => METHOD_LABEL[m]).join(" · ")}</dd>
          </div>
        )}
      </dl>

      <div className={`mt-auto flex flex-wrap items-center gap-2 ${primary ? "pt-6" : "pt-4"}`}>
        <Link href={rec.href} onClick={onClose} className={buttonClass(primary ? "gold" : "secondary", primary ? "md" : "sm")}>
          View course <ArrowRight aria-hidden size={16} />
        </Link>
        {primary && (
          <Link href={enquiry} onClick={onClose} className={buttonClass("secondary", "md")}>
            {rec.format === "onsite" || c.methods.length === 0 ? "Request a quote" : "Ask a question"}
          </Link>
        )}
        {price ? (
          <p className={`text-sm text-ink-muted ${primary ? "sm:ml-auto" : "ml-auto"}`}>
            From <span className="font-semibold tabular-nums text-navy-900">{priceFmt.format(price)}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

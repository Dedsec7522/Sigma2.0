"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { buttonClass } from "@/components/ui/button";
import { useUrlParam } from "@/lib/use-url-param";
import { IS_STATIC_PREVIEW, SITE, withBase } from "@/lib/site";

type Errors = Partial<Record<string, string>>;
type Variant = "course" | "general" | "team";

const VALIDATED = ["name", "email", "phone", "consent"] as const;

function validateField(name: string, value: string | boolean): string | undefined {
  if (name === "name" && String(value).trim().length < 2) return "Enter your full name";
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())) return "Enter a valid email address, like name@company.co.uk";
  if (name === "phone" && String(value).trim() && !/^[+\d][\d\s()-]{6,}$/.test(String(value).trim())) return "Enter a valid phone number";
  if (name === "consent" && value !== true) return "Please confirm we can contact you about your enquiry";
  return undefined;
}

export function EnquiryForm({ course = "", variant = "general", heading, compact = false }: { course?: string; variant?: Variant; heading?: string; compact?: boolean }) {
  const uid = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [failure, setFailure] = useState("");
  const [funding, setFunding] = useState(variant === "team" ? "employer" : "");
  // Links such as /contact?course=… pre-fill the course until the visitor edits it.
  const urlCourse = useUrlParam("course").slice(0, 200);
  const [editedCourse, setCourseValue] = useState<string | null>(null);
  const courseValue = editedCourse ?? (course || urlCourse);
  const summaryRef = useRef<HTMLDivElement>(null);
  const id = (n: string) => `${uid}-${n}`;

  const check = (name: string, value: string | boolean) => {
    if ((VALIDATED as readonly string[]).includes(name)) setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      company: String(form.get("company") ?? ""),
      jobTitle: String(form.get("jobTitle") ?? ""),
      course: String(form.get("course") ?? ""),
      message: String(form.get("message") ?? ""),
      funding,
      type: variant,
      page: window.location.pathname,
      consent: form.get("consent") === "on",
      marketing: form.get("marketing") === "on",
      website: String(form.get("website") ?? ""),
    };
    const next: Errors = {};
    for (const k of VALIDATED) {
      const msg = validateField(k, payload[k]);
      if (msg) next[k] = msg;
    }
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (IS_STATIC_PREVIEW) {
      // The static preview has no server to receive enquiries.
      setFailure(`This is a preview of the new website, so enquiries can't be sent from here. Please call ${SITE.phoneDisplay} or email ${SITE.email}.`);
      setStatus("failed");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(withBase("/api/enquiry"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors; error?: string };
      if (res.ok && json.ok) {
        setStatus("sent");
        return;
      }
      if (json.errors) {
        setErrors(json.errors);
        setStatus("idle");
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      setFailure(json.error ?? "Something went wrong. Please try again.");
      setStatus("failed");
    } catch {
      setFailure("We couldn't reach our server. Check your connection and try again, or call us.");
      setStatus("failed");
    }
  };

  const errorList = Object.entries(errors).filter(([, v]) => v) as [string, string][];
  const field =
    "mt-1.5 block h-12 w-full rounded-xl border bg-white px-4 text-[0.98rem] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-navy-600 focus:ring-4 focus:ring-navy-100";
  const border = (n: string) => (errors[n] ? "border-danger" : "border-line-strong");
  const described = (n: string) => (errors[n] ? `${id(n)}-err` : undefined);

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex flex-col items-center rounded-2xl bg-brand-50 px-6 py-12 text-center"
          >
            <motion.span initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.05 }}>
              <CheckCircle aria-hidden size={52} weight="fill" className="text-brand-600" />
            </motion.span>
            <h3 className="mt-4 text-xl font-semibold">Thank you, we&rsquo;ve received your enquiry</h3>
            <p className="mt-2 max-w-md text-ink-muted">One of our training advisors will be in touch shortly, usually within one working day.</p>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={onSubmit} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
            {heading && <h3 className="mb-5 text-xl font-semibold">{heading}</h3>}

            {errorList.length > 0 && (
              <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-6 rounded-xl border border-danger/30 bg-[#fef3f2] p-4 outline-none">
                <p className="flex items-center gap-2 font-semibold text-danger">
                  <WarningCircle aria-hidden size={20} weight="fill" /> Please check the following
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-7 text-sm text-danger">
                  {errorList.map(([k, msg]) => (
                    <li key={k}>
                      <a href={`#${id(k)}`} className="underline underline-offset-2">
                        {msg}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {variant !== "general" && (
              <fieldset className="mb-5">
                <legend className="text-sm font-semibold text-navy-900">Who will fund the training?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    ["employer", "My employer"],
                    ["self", "I will"],
                    ["unsure", "Not sure yet"],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy-600 ${
                        funding === value ? "bg-navy-900 text-white ring-navy-900" : "bg-white text-navy-900 ring-line-strong hover:ring-navy-600"
                      }`}
                    >
                      <input type="radio" name="funding" value={value} checked={funding === value} onChange={() => setFunding(value)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
              <Field id={id("name")} label="Full name" required error={errors.name}>
                <input id={id("name")} name="name" autoComplete="name" required onBlur={(e) => check("name", e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={described("name")} className={`${field} ${border("name")}`} />
              </Field>
              <Field id={id("email")} label={variant === "general" ? "Email" : "Work email"} required error={errors.email}>
                <input id={id("email")} name="email" type="email" autoComplete="email" required onBlur={(e) => check("email", e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={described("email")} className={`${field} ${border("email")}`} />
              </Field>
              <Field id={id("phone")} label="Phone" hint="Optional" error={errors.phone}>
                <input id={id("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" onBlur={(e) => check("phone", e.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={described("phone")} className={`${field} ${border("phone")}`} />
              </Field>
              {variant !== "general" ? (
                <Field id={id("company")} label="Company" hint="Optional">
                  <input id={id("company")} name="company" autoComplete="organization" className={`${field} border-line-strong`} />
                </Field>
              ) : (
                <Field id={id("course")} label="Course of interest" hint="Optional">
                  <input id={id("course")} name="course" value={courseValue} onChange={(e) => setCourseValue(e.target.value)} className={`${field} border-line-strong`} />
                </Field>
              )}
              {variant !== "general" && !compact && (
                <Field id={id("jobTitle")} label="Job title" hint="Optional">
                  <input id={id("jobTitle")} name="jobTitle" autoComplete="organization-title" className={`${field} border-line-strong`} />
                </Field>
              )}
              {variant !== "general" && (
                <Field id={id("course")} label="Course" hint="Optional">
                  <input id={id("course")} name="course" value={courseValue} onChange={(e) => setCourseValue(e.target.value)} className={`${field} border-line-strong`} />
                </Field>
              )}
              <div className={compact ? "" : "sm:col-span-2"}>
                <Field id={id("message")} label={variant === "team" ? "Tell us about your team" : "Message"} hint="Optional">
                  <textarea
                    id={id("message")}
                    name="message"
                    rows={compact ? 3 : 4}
                    placeholder={variant === "team" ? "Number of delegates, preferred dates and location" : "How can we help?"}
                    className={`${field} h-auto border-line-strong py-3`}
                  />
                </Field>
              </div>
            </div>

            {/* Honeypot for bots; hidden from people and assistive technology. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={id("website")}>Website</label>
              <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex items-start gap-3 text-sm text-ink">
                <input
                  id={id("consent")}
                  type="checkbox"
                  name="consent"
                  onChange={(e) => errors.consent && check("consent", e.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={described("consent")}
                  className="mt-0.5 size-5 shrink-0 accent-navy-900"
                />
                <span>
                  I agree to be contacted by phone or email about this enquiry. <span className="text-danger" aria-hidden>*</span>
                  {errors.consent && (
                    <span id={`${id("consent")}-err`} className="mt-1 block font-medium text-danger">
                      {errors.consent}
                    </span>
                  )}
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-ink-muted">
                <input type="checkbox" name="marketing" className="mt-0.5 size-5 shrink-0 accent-navy-900" />
                <span>Send me occasional offers and course news. You can unsubscribe at any time.</span>
              </label>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
              Your details are processed by Pentagon Training Ltd only to respond to your enquiry. See our{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2">
                privacy policy
              </Link>
              .
            </p>

            {status === "failed" && (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-[#fef3f2] p-3 text-sm text-danger">
                <WarningCircle aria-hidden size={18} weight="fill" className="mt-0.5 shrink-0" /> {failure}
              </p>
            )}

            <button type="submit" disabled={status === "sending"} className={buttonClass(variant === "general" ? "primary" : "gold", "lg", "mt-6 w-full sm:w-auto")}>
              {status === "sending" ? (
                <>
                  <CircleNotch aria-hidden size={18} className="animate-spin" /> Sending…
                </>
              ) : variant === "team" ? (
                "Request a team quote"
              ) : variant === "course" ? (
                "Send my enquiry"
              ) : (
                "Send message"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ id, label, hint, required, error, children }: { id: string; label: string; hint?: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-semibold text-navy-900">
        <span>
          {label} {required && <span className="text-danger" aria-hidden>*</span>}
        </span>
        {hint && <span className="text-xs font-normal text-ink-subtle">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FunnelSimple, MagnifyingGlass, X } from "@phosphor-icons/react";
import { CourseCard, type CardData } from "@/components/CourseCard";
import { useAdvisor } from "@/components/advisor/AdvisorProvider";
import { useUrlParam } from "@/lib/use-url-param";
import { LEVEL_LABEL, METHOD_LABEL, type DeliveryMethod, type Level } from "@/lib/types";

export type FinderCourse = CardData & { category: string; categoryName: string; methods: DeliveryMethod[]; durationDays: number | null; keywords: string };

type Sort = "relevance" | "soonest" | "shortest" | "price";

export function CourseFinder({ courses, categories, lockedCategory }: { courses: FinderCourse[]; categories: { slug: string; name: string }[]; lockedCategory?: string }) {
  // ?q= from the URL applies until the visitor types; the full list stays in the static HTML.
  const urlQ = useUrlParam("q");
  const [typed, setQ] = useState<string | null>(null);
  const q = typed ?? urlQ;
  const [category, setCategory] = useState(lockedCategory ?? "all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [method, setMethod] = useState<DeliveryMethod | "all">("all");
  const [sort, setSort] = useState<Sort>("relevance");
  const advisor = useAdvisor();
  const uid = useId();


  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = courses.filter(
      (c) =>
        (category === "all" || c.category === category) &&
        (level === "all" || c.level === level) &&
        (method === "all" || c.methods.includes(method)) &&
        words.every((w) => c.keywords.includes(w) || c.categoryName.toLowerCase().includes(w)),
    );
    const byDate = (x: FinderCourse) => x.nextDate ?? "9999";
    if (sort === "soonest") list.sort((a, b) => byDate(a).localeCompare(byDate(b)));
    if (sort === "shortest") list.sort((a, b) => (a.durationDays ?? 99) - (b.durationDays ?? 99));
    if (sort === "price") list.sort((a, b) => (a.fromPrice ?? 1e9) - (b.fromPrice ?? 1e9));
    return list;
  }, [courses, q, category, level, method, sort]);

  const active = (category !== "all" && !lockedCategory) || level !== "all" || method !== "all" || q;
  const reset = () => {
    setQ("");
    if (!lockedCategory) setCategory("all");
    setLevel("all");
    setMethod("all");
  };
  const select = "h-11 w-full rounded-xl border border-line-strong bg-white px-3 text-[0.95rem] text-ink focus:border-navy-600 focus:outline-none focus:ring-4 focus:ring-navy-100";
  const showPrice = courses.some((c) => c.fromPrice);

  return (
    <div>
      <div role="search" className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <label htmlFor={`${uid}-q`} className="sr-only">
              Search courses
            </label>
            <MagnifyingGlass aria-hidden size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input id={`${uid}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or topic" className={`${select} pl-10`} />
          </div>
          {!lockedCategory && (
            <div>
              <label htmlFor={`${uid}-cat`} className="sr-only">
                Category
              </label>
              <select id={`${uid}-cat`} value={category} onChange={(e) => setCategory(e.target.value)} className={select}>
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor={`${uid}-lvl`} className="sr-only">
              Level
            </label>
            <select id={`${uid}-lvl`} value={level} onChange={(e) => setLevel(e.target.value as Level | "all")} className={select}>
              <option value="all">All levels</option>
              {(Object.keys(LEVEL_LABEL) as Level[]).map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABEL[l]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-m`} className="sr-only">
              Delivery
            </label>
            <select id={`${uid}-m`} value={method} onChange={(e) => setMethod(e.target.value as DeliveryMethod | "all")} className={select}>
              <option value="all">Any delivery</option>
              {(Object.keys(METHOD_LABEL) as DeliveryMethod[]).map((m) => (
                <option key={m} value={m}>
                  {METHOD_LABEL[m]}
                </option>
              ))}
            </select>
          </div>
          {lockedCategory && (
            <div>
              <label htmlFor={`${uid}-s2`} className="sr-only">
                Sort by
              </label>
              <select id={`${uid}-s2`} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={select}>
                <option value="relevance">Recommended order</option>
                <option value="soonest">Soonest date</option>
                <option value="shortest">Shortest first</option>
                {showPrice && <option value="price">Lowest price</option>}
              </select>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted" aria-live="polite">
            <FunnelSimple aria-hidden size={16} className="mr-1.5 inline -translate-y-px" />
            Showing <span className="font-semibold text-navy-900">{results.length}</span> of {courses.length} courses
            {active && (
              <button type="button" onClick={reset} className="ml-3 inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline">
                <X aria-hidden size={14} /> Clear filters
              </button>
            )}
          </p>
          {!lockedCategory && (
            <div className="flex items-center gap-2">
              <label htmlFor={`${uid}-s`} className="text-sm text-ink-muted">
                Sort
              </label>
              <select id={`${uid}-s`} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 rounded-xl border border-line-strong bg-white px-3 text-sm text-ink focus:border-navy-600 focus:outline-none">
                <option value="relevance">Recommended</option>
                <option value="soonest">Soonest date</option>
                <option value="shortest">Shortest first</option>
                {showPrice && <option value="price">Lowest price</option>}
              </select>
            </div>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <motion.ul layout className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {results.map((c) => (
              <motion.li
                layout
                key={c.path}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              >
                <CourseCard course={c} categoryName={lockedCategory ? undefined : c.categoryName} headingLevel="h2" />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-white px-6 py-14 text-center">
          <p className="font-display text-lg font-semibold text-navy-900">No courses match those filters</p>
          <p className="mx-auto mt-2 max-w-md text-ink-muted">Try removing a filter, or tell our Course Advisor what you need and it will suggest the closest match.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={reset} className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-navy-50">
              Clear filters
            </button>
            <button type="button" onClick={() => advisor.open(q ? { freeText: q } : undefined)} className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-700">
              Ask the Course Advisor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

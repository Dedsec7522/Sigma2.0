import Link from "next/link";
import { ArrowRight, CalendarBlank, Certificate, Clock } from "@phosphor-icons/react/dist/ssr";
import { formatDate, formatPrice, SITE } from "@/lib/site";
import { LEVEL_LABEL, type Course, type Level } from "@/lib/types";
import { FutureOnly } from "./FutureOnly";

export type CardData = { path: string; name: string; level: Level; summary: string; duration: string | null; examIncluded: boolean; fromPrice: number | null; nextDate: string | null };

export const toCard = (c: Course): CardData => ({
  path: c.path,
  name: c.name,
  level: c.level,
  summary: c.summary,
  duration: c.duration,
  examIncluded: c.examIncluded,
  fromPrice: SITE.showPrices ? c.fromPrice : null,
  nextDate: [...c.classroom, ...c.virtual].map((s) => s.date).sort()[0] ?? null,
});

export const LEVEL_STYLE = {
  foundation: "bg-brand-50 text-brand-700 ring-brand-100",
  intermediate: "bg-navy-50 text-navy-700 ring-navy-100",
  advanced: "bg-gold-100 text-[#6b4f00] ring-[#f3df9a]",
  expert: "bg-navy-900 text-white ring-navy-900",
} as const;

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${LEVEL_STYLE[level]}`}>
      {LEVEL_LABEL[level]}
    </span>
  );
}

/** Whole card is one link target; supporting facts sit below the title for quick scanning. */
export function CourseCard({ course: input, categoryName, headingLevel = "h3" }: { course: Course | CardData; categoryName?: string; headingLevel?: "h2" | "h3" }) {
  const course = "classroom" in input ? toCard(input) : input;
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-navy-100 hover:shadow-lift">
      <div className="flex items-center justify-between gap-3">
        {categoryName && <p className="truncate text-xs font-semibold uppercase tracking-wider text-ink-subtle">{categoryName}</p>}
        <LevelBadge level={course.level} />
      </div>
      <Heading className="mt-3 text-xl font-semibold !leading-snug">
        <Link href={course.path} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {course.name}
        </Link>
      </Heading>
      {course.summary && <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-muted">{course.summary}</p>}
      <ul className="mb-6 mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-muted">
        {course.duration && (
          <li className="flex items-center gap-1.5">
            <Clock aria-hidden size={16} className="text-brand-600" />
            {course.duration}
          </li>
        )}
        {course.examIncluded && (
          <li className="flex items-center gap-1.5">
            <Certificate aria-hidden size={16} className="text-brand-600" />
            Exam included
          </li>
        )}
        {course.nextDate && (
          <FutureOnly date={course.nextDate}>
            <li className="flex items-center gap-1.5">
              <CalendarBlank aria-hidden size={16} className="text-brand-600" />
              Next: {formatDate(course.nextDate, { day: "numeric", month: "short" })}
            </li>
          </FutureOnly>
        )}
      </ul>
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-5">
        {course.fromPrice ? (
          <p className="text-sm text-ink-muted">
            From <span className="font-display text-lg font-semibold tabular-nums text-navy-900">{formatPrice(course.fromPrice)}</span>
          </p>
        ) : (
          <p className="text-sm text-ink-muted">Enquire for dates and prices</p>
        )}
        <span aria-hidden className="flex items-center gap-1 text-sm font-semibold text-navy-900">
          View course
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

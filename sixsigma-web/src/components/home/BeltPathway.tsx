import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { formatPrice, SITE } from "@/lib/site";
import type { Course } from "@/lib/types";

const BELT_COLOURS = ["#f2c230", "#12945a", "#0f172a", "#0f172a"];
const BELT_LABEL = ["Yellow Belt", "Green Belt", "Black Belt", "Master Black Belt"];

/** The Lean Six Sigma certification path, built from the live catalogue. */
export function BeltPathway({ belts }: { belts: Course[] }) {
  return (
    <div className="rise relative w-full max-w-md rounded-3xl bg-white/[0.06] p-2 ring-1 ring-white/15 backdrop-blur-sm">
      <div className="rounded-[1.25rem] bg-white p-5 text-ink shadow-pop sm:p-6">
        <p className="eyebrow">Lean Six Sigma pathway</p>
        <p className="mt-1 font-display text-lg font-semibold text-navy-900">From first principles to Master Black Belt</p>
        <div className="relative mt-5">
        <span aria-hidden className="absolute bottom-6 left-[1.15rem] top-6 w-px bg-gradient-to-b from-gold-500 via-brand-500 to-navy-900" />
        <ol className="relative space-y-2.5">
          {belts.map((b, i) => (
            <li key={b.path} className="rise relative" style={{ "--d": `${200 + i * 70}ms` } as React.CSSProperties}>
              <Link href={b.path} className="group flex items-center gap-4 rounded-2xl p-2 pr-3 transition-colors hover:bg-navy-50">
                <span aria-hidden className="relative z-10 grid size-[2.3rem] shrink-0 place-items-center rounded-full bg-white ring-4 ring-white">
                  <span className="size-full rounded-full" style={{ background: BELT_COLOURS[i], boxShadow: i === 3 ? "inset 0 0 0 3px #f2c230" : undefined }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-navy-900">{BELT_LABEL[i]}</span>
                  <span className="block text-sm text-ink-muted">
                    {b.duration}
                    {SITE.showPrices && b.fromPrice ? ` · from ${formatPrice(b.fromPrice)}` : ""}
                  </span>
                </span>
                <ArrowRight aria-hidden size={16} className="shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-navy-900" />
              </Link>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </div>
  );
}

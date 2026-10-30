import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { Faq as FaqItem } from "@/lib/types";

/**
 * FAQs use native <details>, so every answer is in the server HTML (crawlable and
 * readable without JavaScript) and keyboard support comes from the browser.
 */
export function Faq({ items, idPrefix = "faq" }: { items: FaqItem[]; idPrefix?: string }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {items.map((f, i) => (
        <details key={f.q} id={`${idPrefix}-${i + 1}`} className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-5 py-5 transition-colors hover:bg-navy-50/60 sm:px-6">
            <h3 className="font-display text-[1.0625rem] font-semibold !leading-snug text-navy-900">{f.q}</h3>
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-700 transition-transform duration-300 ease-out group-open:rotate-45">
              <Plus size={14} weight="bold" aria-hidden />
            </span>
          </summary>
          <div className="prose-content px-5 pb-6 text-ink-muted sm:px-6" dangerouslySetInnerHTML={{ __html: f.a }} />
        </details>
      ))}
    </div>
  );
}

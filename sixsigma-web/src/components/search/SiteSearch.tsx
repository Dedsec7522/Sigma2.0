"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { ArrowRight, MagnifyingGlass, Sparkle, X } from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/Dialog";
import { useAdvisor } from "@/components/advisor/AdvisorProvider";
import { useCourseIndex } from "@/components/advisor/useCourseIndex";
import { LEVEL_LABEL, type CourseIndexEntry } from "@/lib/types";

const SHORTCUTS = [
  { label: "All courses", path: "/courses" },
  { label: "Self-paced online training", path: "/online-training/six-sigma" },
  { label: "Training locations", path: "/locations" },
  { label: "Onsite training for teams", path: "/onsite" },
];

function rank(q: string, c: CourseIndexEntry) {
  const name = c.name.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  if (!words.every((w) => c.keywords.includes(w) || c.categoryName.toLowerCase().includes(w))) return 0;
  let score = 1;
  if (name.startsWith(q)) score += 6;
  if (name.includes(q)) score += 4;
  score += words.filter((w) => name.includes(w)).length * 2;
  return score;
}

export function SiteSearch({ open, initialQuery, onClose }: { open: boolean; initialQuery: string; onClose: () => void }) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const { data, error, retry } = useCourseIndex();
  const router = useRouter();
  const advisor = useAdvisor();
  const titleId = useId();
  const listId = useId();

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!data) return [];
    if (!q) return [];
    return data
      .map((c) => ({ c, s: rank(q, c) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((x) => x.c);
  }, [data, q]);

  const items = q ? results.map((r) => ({ key: r.path, path: r.path })) : SHORTCUTS.map((s) => ({ key: s.path, path: s.path }));
  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Dialog open={open} onClose={onClose} labelledBy={titleId} placement="top" className="max-w-2xl">
      <h2 id={titleId} className="sr-only">Search courses</h2>
      <div className="flex items-center gap-3 border-b border-line px-5">
        <MagnifyingGlass aria-hidden size={22} className="shrink-0 text-ink-subtle" />
        <input
          data-autofocus
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls={listId}
          aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          aria-label="Search courses"
          value={query}
          placeholder="Search courses, e.g. Green Belt, Kaizen, Power BI"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && items[active]) {
              e.preventDefault();
              go(items[active].path);
            }
          }}
          className="h-16 w-full bg-transparent text-lg text-navy-900 outline-none placeholder:text-ink-subtle"
        />
        <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-navy-50" aria-label="Close search">
          <X size={18} aria-hidden />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2">
        {error && (
          <p role="alert" className="p-4 text-sm text-danger">
            Search couldn&rsquo;t load. <button type="button" className="font-semibold underline" onClick={retry}>Try again</button>
          </p>
        )}
        {!data && !error && (
          <div className="space-y-2 p-2" aria-hidden>
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-14" />)}
          </div>
        )}
        {data && (
          <ul id={listId} role="listbox" aria-label={q ? "Matching courses" : "Quick links"}>
            {!q &&
              SHORTCUTS.map((s, i) => (
                <li key={s.path} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(s.path)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left ${active === i ? "bg-navy-50" : ""}`}
                  >
                    <span className="font-medium text-navy-900">{s.label}</span>
                    <ArrowRight aria-hidden size={16} className="text-ink-subtle" />
                  </button>
                </li>
              ))}
            {q &&
              results.map((c, i) => (
                <li key={c.path} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(c.path)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left ${active === i ? "bg-navy-50" : ""}`}
                  >
                    <span>
                      <span className="block font-semibold text-navy-900">{c.name}</span>
                      <span className="block text-sm text-ink-muted">
                        {c.categoryName} · {LEVEL_LABEL[c.level]}
                        {c.duration ? ` · ${c.duration}` : ""}
                      </span>
                    </span>
                    <ArrowRight aria-hidden size={16} className="shrink-0 text-ink-subtle" />
                  </button>
                </li>
              ))}
          </ul>
        )}
        {data && q && results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="font-semibold text-navy-900">No courses match &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-sm text-ink-muted">Try a broader term, or let our Course Advisor suggest the right course.</p>
          </div>
        )}
        <p aria-live="polite" className="sr-only">
          {q && data ? `${results.length} course${results.length === 1 ? "" : "s"} found` : ""}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line bg-canvas px-5 py-3.5">
        <p className="hidden text-xs text-ink-subtle sm:block">Use ↑ ↓ to move, Enter to open, Esc to close</p>
        <button
          type="button"
          onClick={() => {
            onClose();
            advisor.open(q ? { freeText: query } : undefined);
          }}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-navy-900"
        >
          <Sparkle aria-hidden size={16} weight="fill" /> Not sure? Ask the Course Advisor
        </button>
      </div>
    </Dialog>
  );
}

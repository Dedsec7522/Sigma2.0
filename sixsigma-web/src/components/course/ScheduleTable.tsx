"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Buildings, CalendarBlank, Desktop, Laptop, MapPin } from "@phosphor-icons/react";
import { buttonClass } from "@/components/ui/button";
import type { Session } from "@/lib/types";
import { isPast, useToday } from "@/lib/use-today";

type Tab = "classroom" | "virtual" | "online" | "onsite";

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });
const priceFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export function ScheduleTable({
  courseName,
  classroom: allClassroom,
  virtual: allVirtual,
  online,
  showPrices,
  initialLocation,
}: {
  courseName: string;
  classroom: Session[];
  virtual: Session[];
  online: { path: string; price: number | null; access: string | null } | null;
  showPrices: boolean;
  initialLocation?: string;
}) {
  // Pages are pre-built; drop any session that has passed since the build.
  const today = useToday();
  const classroom = useMemo(() => allClassroom.filter((s) => !isPast(s.date, today)), [allClassroom, today]);
  const virtual = useMemo(() => allVirtual.filter((s) => !isPast(s.date, today)), [allVirtual, today]);

  const tabs = useMemo(() => {
    const t: { key: Tab; label: string; icon: typeof Desktop; count?: number }[] = [];
    if (classroom.length) t.push({ key: "classroom", label: "Classroom", icon: MapPin, count: classroom.length });
    if (virtual.length) t.push({ key: "virtual", label: "Live online", icon: Desktop, count: virtual.length });
    if (online) t.push({ key: "online", label: "Self-paced", icon: Laptop });
    t.push({ key: "onsite", label: "Onsite", icon: Buildings });
    return t;
  }, [classroom.length, virtual.length, online]);

  const [tab, setTab] = useState<Tab>(tabs[0].key);
  const [location, setLocation] = useState(initialLocation && classroom.some((s) => s.location === initialLocation) ? initialLocation : "all");
  const [showAll, setShowAll] = useState(false);
  const uid = useId();

  const locations = useMemo(() => [...new Set(classroom.map((s) => s.location))].sort(), [classroom]);
  const rows = tab === "classroom" ? classroom.filter((s) => location === "all" || s.location === location) : tab === "virtual" ? virtual : [];
  const visible = showAll ? rows : rows.slice(0, 8);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    setTab(next.key);
    document.getElementById(`${uid}-tab-${next.key}`)?.focus();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div role="tablist" aria-label="Ways to attend" className="flex gap-1 overflow-x-auto border-b border-line bg-canvas p-1.5">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            id={`${uid}-tab-${t.key}`}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            aria-controls={`${uid}-panel`}
            tabIndex={tab === t.key ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => {
              setTab(t.key);
              setShowAll(false);
            }}
            className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${tab === t.key ? "text-navy-900" : "text-ink-muted hover:text-navy-900"}`}
          >
            {tab === t.key && <motion.span layoutId={`${uid}-pill`} className="absolute inset-0 rounded-xl bg-white shadow-card ring-1 ring-line" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <t.icon aria-hidden size={17} className="relative" />
            <span className="relative">{t.label}</span>
            {t.count ? <span className="relative rounded-full bg-navy-50 px-1.5 text-xs tabular-nums text-navy-700">{t.count}</span> : null}
          </button>
        ))}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${tab}`} className="p-4 sm:p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.2 }}>
            {tab === "classroom" && locations.length > 1 && (
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <label htmlFor={`${uid}-loc`} className="text-sm font-semibold text-navy-900">
                  Location
                </label>
                <select
                  id={`${uid}-loc`}
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowAll(false);
                  }}
                  className="h-11 rounded-xl border border-line-strong bg-white px-3 pr-8 text-[0.95rem] text-ink focus:border-navy-600 focus:outline-none focus:ring-4 focus:ring-navy-100"
                >
                  <option value="all">All locations ({classroom.length} dates)</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(tab === "classroom" || tab === "virtual") && (
              <>
                {rows.length === 0 ? (
                  <p className="rounded-xl bg-canvas p-5 text-ink-muted">No scheduled dates here at the moment. Enquire and we&rsquo;ll find a date that works, or arrange a private session.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {visible.map((s) => (
                      <li key={`${s.date}-${s.location}-${s.bookingUrl}`} className="grid items-center gap-x-6 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="flex items-start gap-3">
                          <CalendarBlank aria-hidden size={20} className="mt-0.5 shrink-0 text-brand-600" />
                          <div>
                            <p className="font-semibold tabular-nums text-navy-900">{dateFmt.format(new Date(`${s.date}T12:00:00Z`))}</p>
                            <p className="text-sm text-ink-muted">
                              {s.method === "virtual" ? "Live online, instructor-led" : s.location}
                              {s.duration ? ` · ${s.duration}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pl-8 sm:pl-0">
                          {showPrices && s.price ? <span className="mr-1 font-display text-lg font-semibold tabular-nums text-navy-900">{priceFmt.format(s.price)}</span> : null}
                          <Link href={`/contact?course=${encodeURIComponent(`${courseName} – ${s.method === "virtual" ? "Live online" : s.location} – ${s.date}`)}`} className={buttonClass("secondary", "sm")}>
                            Enquire
                          </Link>
                          {s.bookingUrl && (
                            <a href={s.bookingUrl} className={buttonClass("primary", "sm")}>
                              Book now
                              <span className="sr-only">
                                : {courseName}, {s.method === "virtual" ? "live online" : s.location}, {dateFmt.format(new Date(`${s.date}T12:00:00Z`))}
                              </span>
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {rows.length > 8 && (
                  <button type="button" onClick={() => setShowAll((v) => !v)} className={buttonClass("ghost", "sm", "mt-3")} aria-expanded={showAll}>
                    {showAll ? "Show fewer dates" : `Show all ${rows.length} dates`}
                  </button>
                )}
              </>
            )}

            {tab === "online" && online && (
              <div className="flex flex-col gap-4 rounded-xl bg-canvas p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-navy-900">Study {courseName} online, at your own pace</p>
                  <p className="mt-1 text-sm text-ink-muted">Start any time{online.access ? ` · ${online.access} access` : ""}. Exams and optional extras are listed on the online course page.</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {showPrices && online.price ? <span className="font-display text-lg font-semibold tabular-nums text-navy-900">{priceFmt.format(online.price)}</span> : null}
                  <Link href={online.path} className={buttonClass("primary", "sm")}>
                    View online course
                  </Link>
                </div>
              </div>
            )}

            {tab === "onsite" && (
              <div className="flex flex-col gap-4 rounded-xl bg-canvas p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-navy-900">Train your team at your own premises</p>
                  <p className="mt-1 text-sm text-ink-muted">We can deliver {courseName} at your offices or a venue of your choice, on dates that suit you, and tailor the content to your business.</p>
                </div>
                <Link href={`/onsite?course=${encodeURIComponent(courseName)}#enquire`} className={buttonClass("primary", "sm", "shrink-0")}>
                  Request a team quote
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

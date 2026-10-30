"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";

/**
 * Shows the first part of long content with a toggle. The full content is always
 * in the server HTML, so crawlers and screen readers get everything.
 */
export function Expandable({ children, collapsedHeight = 420, label = "syllabus" }: { children: ReactNode; collapsedHeight?: number; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <motion.div
        id={id}
        initial={false}
        animate={{ height: open ? "auto" : collapsedHeight }}
        transition={{ type: "spring", stiffness: 260, damping: 34 }}
        className="relative overflow-hidden"
      >
        {children}
        {!open && <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />}
      </motion.div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-600 hover:bg-navy-50"
      >
        {open ? `Show less` : `Show full ${label}`}
        <CaretDown aria-hidden size={14} weight="bold" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

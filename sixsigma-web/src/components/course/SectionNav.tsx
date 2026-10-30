"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/** Sticky in-page navigation that highlights the section currently being read. */
export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-[var(--header-h)] z-30 border-b border-line bg-white/95 backdrop-blur">
      <ul className="container-page flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
        {items.map((it) => (
          <li key={it.id} className="shrink-0">
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "location" : undefined}
              className={`relative block rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active === it.id ? "text-navy-900" : "text-ink-muted hover:text-navy-900"}`}
            >
              {active === it.id && <motion.span layoutId="section-nav-pill" className="absolute inset-0 rounded-full bg-navy-50" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <span className="relative">{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

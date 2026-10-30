import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({ children, className = "", tone = "plain", id, labelledBy }: { children: ReactNode; className?: string; tone?: "plain" | "white" | "navy" | "tint"; id?: string; labelledBy?: string }) {
  const tones = {
    plain: "",
    white: "bg-white",
    tint: "bg-navy-50/70",
    navy: "on-dark bg-navy-900 text-white",
  };
  return (
    <section id={id} aria-labelledby={labelledBy} className={`py-16 md:py-24 ${tones[tone]} ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeader({ id, eyebrow, title, lead, action, align = "left", tone = "light" }: { id?: string; eyebrow?: string; title: string; lead?: ReactNode; action?: ReactNode; align?: "left" | "center"; tone?: "light" | "dark" }) {
  return (
    <Reveal className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${align === "center" ? "md:flex-col md:items-center md:text-center" : ""}`}>
      <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
        {eyebrow && <p className={`eyebrow ${tone === "dark" ? "!text-gold-400" : ""}`}>{eyebrow}</p>}
        <h2 id={id} className={`mt-2 text-[1.75rem] font-semibold sm:text-[2.15rem] ${tone === "dark" ? "!text-white" : ""}`}>
          {title}
        </h2>
        {lead && <p className={`mt-4 text-lg leading-relaxed ${tone === "dark" ? "text-white/75" : "text-ink-muted"}`}>{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}

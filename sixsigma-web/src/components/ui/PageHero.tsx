import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import type { Crumb } from "@/lib/schema";

/** Navy page header used on every inner page: breadcrumbs, H1, lead and actions. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-navy-900 text-white">
      <HeroBackdrop />
      <div className="container-page relative grid grid-cols-[minmax(0,1fr)] gap-10 pb-14 pt-8 md:pb-16 md:pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <Breadcrumbs items={crumbs} tone="dark" />
          {eyebrow && <p className="eyebrow mt-8 !text-gold-400">{eyebrow}</p>}
          <h1 className={`${eyebrow ? "mt-3" : "mt-8"} text-[2rem] font-semibold !text-white sm:text-[2.5rem] lg:text-[2.85rem]`}>{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{lead}</p>}
          {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(42_79_138/0.55),transparent)]" />
      <div className="absolute -bottom-48 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(10_122_71/0.28),transparent)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0V44" fill="none" stroke="white" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

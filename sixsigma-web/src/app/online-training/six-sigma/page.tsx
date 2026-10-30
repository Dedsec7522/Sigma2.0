import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Laptop, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { LevelBadge } from "@/components/CourseCard";
import { getOnlineCourses, onlineHub } from "@/lib/catalog";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { formatPrice, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: onlineHub.meta.title || "Six Sigma Online Training" },
  description: onlineHub.meta.description,
  alternates: { canonical: "/online-training/six-sigma" },
};

const ORDER = ["yellow", "green", "black", "master"];

export default function OnlineTrainingPage() {
  const courses = [...getOnlineCourses()].sort((a, b) => {
    const rank = (n: string) => ORDER.findIndex((k) => n.toLowerCase().includes(k)) + 1 || 9;
    return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
  });
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Online training", path: "/online-training/six-sigma" },
  ];
  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), itemListSchema(courses.map((c) => ({ name: c.name, path: c.path })), "Six Sigma online courses")]} />
      <PageHero crumbs={crumbs} eyebrow="Self-paced eLearning" title={onlineHub.h1 || "Six Sigma training online"} lead={onlineHub.intro} />
      <section aria-label="Online courses" className="container-page py-14 md:py-20">
        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((o) => (
            <RevealItem as="li" key={o.path}>
              <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <Laptop aria-hidden size={26} weight="duotone" className="text-brand-600" />
                  <LevelBadge level={o.level} />
                </div>
                <h2 className="mt-4 text-xl font-semibold">
                  <Link href={o.path} className="after:absolute after:inset-0 after:rounded-2xl">
                    {o.name}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-[0.95rem] text-ink-muted">{o.intro}</p>
                <ul className="mb-6 mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted">
                  {o.access && (
                    <li className="flex items-center gap-1.5">
                      <Clock aria-hidden size={16} className="text-brand-600" /> {o.access}
                    </li>
                  )}
                  {o.learners && (
                    <li className="flex items-center gap-1.5">
                      <UsersThree aria-hidden size={16} className="text-brand-600" /> {o.learners} learners
                    </li>
                  )}
                </ul>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
                  {SITE.showPrices && o.price ? <span className="font-display text-lg font-semibold tabular-nums text-navy-900">{formatPrice(o.price)}</span> : <span className="text-sm text-ink-muted">Start any time</span>}
                  <span aria-hidden className="flex items-center gap-1 text-sm font-semibold text-navy-900">
                    View course <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { buttonClass } from "@/components/ui/button";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getCourseByPath, getCourseLocations, getCourses, getLocation, getLocations } from "@/lib/catalog";
import { breadcrumbSchema } from "@/lib/schema";
import { formatDate, formatPrice, SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocations().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locations/view/[slug]">): Promise<Metadata> {
  const l = getLocation((await params).slug);
  if (!l) return {};
  return {
    title: { absolute: l.meta.title || `Six Sigma Training in ${l.name}` },
    description: l.meta.description || l.intro,
    alternates: { canonical: l.path },
  };
}

export default async function LocationPage({ params }: PageProps<"/locations/view/[slug]">) {
  const l = getLocation((await params).slug);
  if (!l) notFound();
  const pages = getCourseLocations().filter((cl) => cl.locationSlug === l.slug);
  const courses = pages.map((p) => ({ page: p, course: getCourseByPath(p.coursePath)! })).filter((x) => x.course);
  const dates = getCourses()
    .flatMap((c) => c.classroom.filter((s) => s.locationSlug === l.slug).map((s) => ({ ...s, course: c, href: pages.find((p) => p.coursePath === c.path)?.path ?? c.path })))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
    { name: l.name, path: l.path },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="Training location" title={`Six Sigma training in ${l.name}`} lead={l.intro}>
        <a href="#courses" className={buttonClass("gold", "md")}>
          Courses in {l.name}
        </a>
        <a href="#enquire" className={buttonClass("outline-light", "md")}>
          Enquire
        </a>
      </PageHero>

      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-16">
        <div className="min-w-0 space-y-14">
          {dates.length > 0 && (
            <section aria-labelledby="dates-h">
              <h2 id="dates-h" className="text-[1.6rem] font-semibold">
                Upcoming dates in {l.name}
              </h2>
              <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                {dates.map((s) => (
                  <li key={`${s.course.path}-${s.date}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <CalendarBlank aria-hidden size={20} className="mt-0.5 text-brand-600" />
                      <div>
                        <Link href={s.href} className="font-semibold text-navy-900 hover:underline">
                          {s.course.name}
                        </Link>
                        <p className="text-sm text-ink-muted">
                          {formatDate(s.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {s.duration ?? s.course.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {SITE.showPrices && s.price ? <span className="font-semibold tabular-nums text-navy-900">{formatPrice(s.price)}</span> : null}
                      {s.bookingUrl && (
                        <a href={s.bookingUrl} className={buttonClass("primary", "sm")}>
                          Book<span className="sr-only"> {s.course.name} on {formatDate(s.date)}</span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="courses" aria-labelledby="courses-h" className="scroll-mt-28">
            <h2 id="courses-h" className="text-[1.6rem] font-semibold">
              Courses available in {l.name}
            </h2>
            {courses.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {courses.map(({ page, course }) => (
                  <li key={page.path}>
                    <Link href={page.path} className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 transition-[border-color,box-shadow] hover:border-navy-100 hover:shadow-card">
                      <span>
                        <span className="block font-semibold text-navy-900">{course.name}</span>
                        <span className="text-sm text-ink-muted">{course.duration}</span>
                      </span>
                      <ArrowRight aria-hidden size={16} className="shrink-0 text-ink-subtle transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink-muted">
                Every course can be delivered onsite in {l.name}.{" "}
                <Link href="/courses" className="font-semibold text-navy-900 underline">
                  Browse all courses
                </Link>
                .
              </p>
            )}
          </section>

          {l.detailHtml && (
            <section aria-labelledby="about-h">
              <h2 id="about-h" className="text-[1.6rem] font-semibold">
                About {l.name}
              </h2>
              <div className="prose-content mt-5 text-[1.0625rem]" dangerouslySetInnerHTML={{ __html: l.detailHtml }} />
            </section>
          )}
        </div>

        <aside id="enquire" aria-labelledby="enq-h" className="scroll-mt-28">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)] rounded-2xl border border-line bg-white p-6">
            <h2 id="enq-h" className="text-xl font-semibold">
              Training in {l.name}?
            </h2>
            <p className="mt-1.5 text-[0.95rem] text-ink-muted">Ask about dates, venues or a private session for your team.</p>
            <div className="mt-5">
              <EnquiryForm compact course={`Training in ${l.name}`} />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

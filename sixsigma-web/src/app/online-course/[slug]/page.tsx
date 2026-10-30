import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChalkboardTeacher, Laptop } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Faq } from "@/components/ui/Faq";
import { JsonLd } from "@/components/ui/JsonLd";
import { LevelBadge } from "@/components/CourseCard";
import { Expandable } from "@/components/course/Expandable";
import { OnlineBooking } from "@/components/course/OnlineBooking";
import { getCourses, getOnlineCourse, getOnlineCourses } from "@/lib/catalog";
import { breadcrumbSchema, faqSchema, onlineCourseSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getOnlineCourses().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/online-course/[slug]">): Promise<Metadata> {
  const o = getOnlineCourse((await params).slug);
  if (!o) return {};
  return {
    title: { absolute: o.meta.title || `${o.name} Online Course` },
    description: o.meta.description || o.intro,
    alternates: { canonical: o.path },
  };
}

export default async function OnlineCoursePage({ params }: PageProps<"/online-course/[slug]">) {
  const o = getOnlineCourse((await params).slug);
  if (!o) notFound();
  const classroomVersion = getCourses().find((c) => c.onlineCourseSlug === o.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Online training", path: "/online-training/six-sigma" },
    { name: o.name, path: o.path },
  ];

  return (
    <>
      <JsonLd data={[onlineCourseSchema(o), breadcrumbSchema(crumbs), faqSchema(o.faqs)]} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Self-paced online course"
        title={`${o.name} online`}
        lead={o.intro}
        aside={
          <div className="w-full lg:w-[22rem]">
            {o.bookingUrl ? (
              <OnlineBooking action={o.bookingUrl} price={o.price} addons={o.addons} showPrices={SITE.showPrices} />
            ) : (
              <div className="rounded-2xl bg-white p-6 text-ink shadow-pop">
                <Link href={`/contact?course=${encodeURIComponent(o.name)}`} className="font-semibold text-navy-900 underline">
                  Enquire about this course
                </Link>
              </div>
            )}
          </div>
        }
      >
        <span className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <LevelBadge level={o.level} />
          <span className="flex items-center gap-1.5">
            <Laptop aria-hidden size={16} /> Study at your own pace
          </span>
          {o.learners && <span>{o.learners} learners</span>}
        </span>
      </PageHero>

      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <div className="min-w-0 space-y-14">
          {o.overviewHtml && (
            <section aria-labelledby="ov-h">
              <h2 id="ov-h" className="text-[1.75rem] font-semibold">
                Course overview
              </h2>
              <div className="prose-content mt-6 text-[1.0625rem]" dangerouslySetInnerHTML={{ __html: o.overviewHtml }} />
            </section>
          )}
          {o.outlineHtml && (
            <section aria-labelledby="syl-h">
              <h2 id="syl-h" className="text-[1.75rem] font-semibold">
                Course syllabus
              </h2>
              <div className="mt-6 rounded-2xl border border-line bg-white p-6">
                <Expandable>
                  <div className="prose-content syllabus" dangerouslySetInnerHTML={{ __html: o.outlineHtml }} />
                </Expandable>
              </div>
            </section>
          )}
          {o.faqs.length > 0 && (
            <section aria-labelledby="faq-h">
              <h2 id="faq-h" className="text-[1.75rem] font-semibold">
                Frequently asked questions
              </h2>
              <div className="mt-6">
                <Faq items={o.faqs} />
              </div>
            </section>
          )}
        </div>
        {classroomVersion && (
          <aside aria-label="Other ways to attend">
            <div className="sticky top-[calc(var(--header-h)+1.5rem)] rounded-2xl border border-line bg-white p-6">
              <ChalkboardTeacher aria-hidden size={28} weight="duotone" className="text-brand-600" />
              <p className="mt-3 font-display text-lg font-semibold text-navy-900">Prefer a trainer?</p>
              <p className="mt-1.5 text-[0.95rem] text-ink-muted">{classroomVersion.name} also runs in classrooms across the UK and live online.</p>
              <Link href={classroomVersion.path} className="mt-4 inline-flex items-center gap-1 font-semibold text-navy-900 hover:underline">
                See dates <ArrowRight aria-hidden size={16} />
              </Link>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}

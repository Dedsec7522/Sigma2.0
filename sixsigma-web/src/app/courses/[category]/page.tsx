import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { CourseFinder } from "@/components/course/CourseFinder";
import { AdvisorButton } from "@/components/advisor/AdvisorButton";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getCategories, getCategory, getCategoryCourses } from "@/lib/catalog";
import { toFinder } from "@/lib/finder";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { TOPICS } from "@/lib/advisor";
import type { CourseIndexEntry } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[category]">): Promise<Metadata> {
  const cat = getCategory((await params).category);
  if (!cat) return {};
  return {
    title: { absolute: cat.meta.title || cat.name },
    description: cat.meta.description || cat.intro,
    alternates: { canonical: cat.path },
  };
}

export default async function CategoryPage({ params }: PageProps<"/courses/[category]">) {
  const cat = getCategory((await params).category);
  if (!cat) notFound();
  const courses = getCategoryCourses(cat);
  const others = getCategories().filter((c) => c.slug !== cat.slug);
  const topic = courses.length ? TOPICS.find((t) => t.match(courses[0] as unknown as CourseIndexEntry))?.value : undefined;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: cat.name, path: cat.path },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), itemListSchema(courses.map((c) => ({ name: c.name, path: c.path })), cat.h1)]} />
      <PageHero crumbs={crumbs} eyebrow={`${courses.length} courses`} title={cat.h1} lead={cat.intro}>
        <AdvisorButton className={buttonClass("gold", "md")} prefill={topic ? { topic } : undefined}>
          Which course is right for me?
        </AdvisorButton>
      </PageHero>

      <div className="container-page -mt-8 pb-16">
        <CourseFinder courses={toFinder(courses)} categories={[]} lockedCategory={cat.slug} />
      </div>

      {cat.sections.length > 0 && (
        <section aria-label={`About ${cat.name}`} className="border-t border-line bg-white py-16 md:py-20">
          <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-12">
              {cat.sections.map((s) => {
                const short = s.paragraphs.filter((p) => p.length < 40);
                const long = s.paragraphs.filter((p) => p.length >= 40);
                return (
                  <Reveal key={s.heading}>
                    <h2 className="text-[1.6rem] font-semibold">{s.heading}</h2>
                    <div className="prose-content mt-4 text-[1.0625rem]">
                      {long.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                      {short.length > 2 && (
                        <ul className="grid !list-none gap-2 !pl-0 sm:grid-cols-2">
                          {short.map((p) => (
                            <li key={p} className="!mt-0 rounded-xl bg-navy-50/70 px-4 py-2.5 font-medium text-navy-900">
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <aside aria-label="Other course categories">
              <div className="sticky top-[calc(var(--header-h)+1.5rem)] rounded-2xl border border-line p-5">
                <p className="font-display font-semibold text-navy-900">Other disciplines</p>
                <ul className="mt-3 space-y-1">
                  {others.map((o) => (
                    <li key={o.path}>
                      <Link href={o.path} className="flex items-center gap-3 rounded-xl px-2 py-2 text-[0.95rem] text-ink-muted transition-colors hover:bg-navy-50 hover:text-navy-900">
                        <CategoryIcon slug={o.slug} size={20} className="text-brand-600" /> {o.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      )}
    </>
  );
}

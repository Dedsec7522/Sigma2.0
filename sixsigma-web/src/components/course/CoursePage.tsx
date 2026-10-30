import Link from "next/link";
import { ArrowRight, Certificate, CheckCircle, Clock, Headset, MapPin, Phone, SealCheck, Student, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Faq } from "@/components/ui/Faq";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { CourseCard, LevelBadge } from "@/components/CourseCard";
import { AdvisorButton } from "@/components/advisor/AdvisorButton";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Expandable } from "./Expandable";
import { FutureOnly } from "@/components/FutureOnly";
import { ScheduleTable } from "./ScheduleTable";
import { SectionNav } from "./SectionNav";
import { getCategory, getCourseLocationsFor, getOnlineCourse, getRelatedCourses } from "@/lib/catalog";
import { breadcrumbSchema, courseSchema, faqSchema, type Crumb } from "@/lib/schema";
import { formatDate, formatPrice, SITE } from "@/lib/site";
import { TOPICS } from "@/lib/advisor";
import { METHOD_LABEL, type Course, type CourseIndexEntry, type CourseLocation } from "@/lib/types";

export function CoursePage({ course, location }: { course: Course; location?: CourseLocation }) {
  const category = getCategory(course.category)!;
  const online = course.onlineCourseSlug ? getOnlineCourse(course.onlineCourseSlug) ?? null : null;
  const related = getRelatedCourses(course, 3);
  const venues = getCourseLocationsFor(course);
  const path = location?.path ?? course.path;
  const classroom = location ? (location.classroom.length ? location.classroom : course.classroom) : course.classroom;
  const allSessions = [...classroom, ...course.virtual].sort((a, b) => a.date.localeCompare(b.date));
  const next = allSessions[0];
  const fromPrice = SITE.showPrices ? course.fromPrice : null;
  const trainingHours = course.hours?.match(/training hours are ([^.]+)/i)?.[1]?.trim() ?? null;
  const topic = TOPICS.find((t) => t.match(course as unknown as CourseIndexEntry))?.value;

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: category.name, path: category.path },
    { name: course.name, path: course.path },
    ...(location ? [{ name: location.locationName, path: location.path }] : []),
  ];
  const title = location ? `${course.name} training in ${location.locationName}` : course.name;

  const sections = [
    { id: "overview", label: "Overview" },
    ...(course.bullets.length ? [{ id: "outcomes", label: "What you'll learn" }] : []),
    ...(course.outlineHtml ? [{ id: "syllabus", label: "Syllabus" }] : []),
    { id: "dates", label: "Dates & prices" },
    ...(course.faqs.length ? [{ id: "faqs", label: "FAQs" }] : []),
    { id: "enquire", label: "Enquire" },
  ];

  return (
    <>
      <JsonLd data={[courseSchema(course, { path, sessions: allSessions, online }), breadcrumbSchema(crumbs), faqSchema(course.faqs)]} />

      <PageHero
        crumbs={crumbs}
        eyebrow={category.name}
        title={title}
        lead={course.summary}
        aside={
          <div className="w-full rounded-2xl bg-white p-6 text-ink shadow-pop lg:w-[22rem]">
            <div className="flex items-center justify-between">
              <LevelBadge level={course.level} />
              {course.examIncluded && (
                <span className="flex items-center gap-1 text-sm font-semibold text-brand-700">
                  <SealCheck aria-hidden size={18} weight="fill" /> Exam included
                </span>
              )}
            </div>
            {fromPrice ? (
              <p className="mt-4 text-sm text-ink-muted">
                From <span className="block font-display text-3xl font-semibold tabular-nums text-navy-900">{formatPrice(fromPrice)}</span>
              </p>
            ) : (
              <p className="mt-4 font-display text-xl font-semibold text-navy-900">{course.deliveryMethods.map((m) => METHOD_LABEL[m]).join(" · ")}</p>
            )}
            {next && (
              <FutureOnly date={next.date}>
              <p className="mt-2 text-sm text-ink-muted">
                Next date: <span className="font-semibold text-navy-900">{formatDate(next.date)}</span>
                {next.method === "virtual" ? " (live online)" : ` in ${next.location}`}
              </p>
              </FutureOnly>
            )}
            <div className="mt-5 grid gap-2">
              <a href="#dates" className={buttonClass("gold", "md")}>
                View dates &amp; book
              </a>
              <a href="#enquire" className={buttonClass("secondary", "md")}>
                Enquire about this course
              </a>
            </div>
            <a href={`tel:${SITE.phone}`} className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-navy-900 hover:underline">
              <Phone aria-hidden size={16} /> {SITE.phoneDisplay}
            </a>
          </div>
        }
      />

      {/* Key facts */}
      <section aria-label="Course facts" className="border-b border-line bg-white">
        <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-5 py-6 md:grid-cols-4">
          <Fact icon={Clock} term="Duration" value={course.duration ?? "Contact us"} />
          <Fact icon={Certificate} term="Certification" value={course.certificateIncluded ? "Exam & certificate included" : "Certificate of attendance"} />
          <Fact icon={UsersThree} term="Delivery" value={course.deliveryMethods.length === 1 ? METHOD_LABEL[course.deliveryMethods[0]] : `${course.deliveryMethods.length} ways to attend`} />
          <Fact icon={Headset} term="Support" value={course.support ? `${course.support} support` : "Full support"} />
        </dl>
      </section>

      <SectionNav items={sections} />

      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <div className="min-w-0 space-y-16">
          {/* Overview + at a glance */}
          <section id="overview" aria-labelledby="overview-h" className="scroll-mt-36">
            <h2 id="overview-h" className="text-[1.75rem] font-semibold">
              {location ? `${course.name} in ${location.locationName}` : "Course overview"}
            </h2>
            {location && (
              <p className="mt-4 text-lg text-ink-muted">
                Attend {course.name} at one of our classroom venues in and around {location.locationName}, or join live online from anywhere in the UK. The course content, materials and exams are the same wherever you train.
              </p>
            )}
            <div className="mt-6 rounded-2xl border border-line bg-white p-6">
              <h3 className="text-lg font-semibold">At a glance</h3>
              <dl className="mt-4 grid gap-x-8 gap-y-4 text-[0.95rem] sm:grid-cols-2">
                <Glance term="Course" value={course.name} />
                <Glance term="Level" value={<LevelBadge level={course.level} />} />
                {course.audience && <Glance term="Who should attend" value={course.audience} wide />}
                {course.prerequisites && <Glance term="Prerequisites" value={course.prerequisites} wide />}
                {course.duration && <Glance term="Duration" value={course.duration} />}
                {trainingHours && <Glance term="Training hours" value={trainingHours} />}
                <Glance term="Ways to attend" value={course.deliveryMethods.map((m) => METHOD_LABEL[m]).join(", ")} />
                <Glance term="Exam" value={course.examIncluded ? "Included" : "Not included"} />
                {venues.length > 0 && <Glance term="Classroom locations" value={`${venues.length} UK locations`} />}
              </dl>
            </div>
            {course.overviewHtml && <div className="prose-content mt-8 text-[1.0625rem]" dangerouslySetInnerHTML={{ __html: course.overviewHtml }} />}
          </section>

          {course.bullets.length > 0 && (
            <section id="outcomes" aria-labelledby="outcomes-h" className="scroll-mt-36">
              <h2 id="outcomes-h" className="text-[1.75rem] font-semibold">
                What you&rsquo;ll learn
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {course.bullets.map((b) => (
                  <li key={b} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                    <CheckCircle aria-hidden size={22} weight="fill" className="mt-0.5 shrink-0 text-brand-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {course.included.length > 0 && (
                <>
                  <h3 className="mt-10 text-xl font-semibold">What&rsquo;s included</h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {course.included.map((i) => (
                      <li key={i.title} className="rounded-2xl bg-navy-50/70 p-5">
                        <p className="font-semibold text-navy-900">{i.title}</p>
                        {i.text && <p className="mt-1 text-[0.95rem] text-ink-muted">{i.text}</p>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {course.outlineHtml && (
            <section id="syllabus" aria-labelledby="syllabus-h" className="scroll-mt-36">
              <h2 id="syllabus-h" className="text-[1.75rem] font-semibold">
                Course syllabus
              </h2>
              <div className="mt-6 rounded-2xl border border-line bg-white p-6">
                <Expandable>
                  <div className="prose-content syllabus" dangerouslySetInnerHTML={{ __html: course.outlineHtml }} />
                </Expandable>
              </div>
            </section>
          )}

          <section id="dates" aria-labelledby="dates-h" className="scroll-mt-36">
            <h2 id="dates-h" className="text-[1.75rem] font-semibold">
              Dates &amp; prices
            </h2>
            <p className="mt-2 text-ink-muted">Choose how you&rsquo;d like to attend. Book online in a few minutes, or enquire and an advisor will help.</p>
            <div className="mt-6">
              <ScheduleTable
                courseName={course.name}
                classroom={classroom}
                virtual={course.virtual}
                online={online ? { path: online.path, price: online.price, access: online.access } : null}
                showPrices={SITE.showPrices}
                initialLocation={location?.locationName}
              />
            </div>
          </section>

          {venues.length > 0 && (
            <section aria-labelledby="venues-h">
              <h2 id="venues-h" className="text-xl font-semibold">
                {course.name} near you
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {venues.map((v) => (
                  <li key={v.path}>
                    <Link
                      href={v.path}
                      aria-current={v.path === location?.path ? "page" : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${v.path === location?.path ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-navy-900 hover:border-navy-600 hover:bg-navy-50"}`}
                    >
                      <MapPin aria-hidden size={13} /> {v.locationName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.faqs.length > 0 && (
            <section id="faqs" aria-labelledby="faqs-h" className="scroll-mt-36">
              <h2 id="faqs-h" className="text-[1.75rem] font-semibold">
                Frequently asked questions
              </h2>
              <div className="mt-6">
                <Faq items={course.faqs} />
              </div>
            </section>
          )}

          <section id="enquire" aria-labelledby="enquire-h" className="scroll-mt-36 rounded-3xl border border-line bg-white p-6 sm:p-10">
            <h2 id="enquire-h" className="text-[1.75rem] font-semibold">
              Enquire about {course.name}
            </h2>
            <p className="mt-2 text-ink-muted">Tell us a little about what you need and a training advisor will get back to you, usually within one working day.</p>
            <div className="mt-8">
              <EnquiryForm variant="course" course={location ? `${course.name} – ${location.locationName}` : course.name} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block" aria-label="Course help">
          <div className="sticky top-[calc(var(--header-h)+5rem)] space-y-4">
            <Reveal className="rounded-2xl border border-line bg-white p-6">
              <Student aria-hidden size={28} weight="duotone" className="text-brand-600" />
              <p className="mt-3 font-display text-lg font-semibold text-navy-900">Is this the right course?</p>
              <p className="mt-1.5 text-[0.95rem] text-ink-muted">Compare it with alternatives in under a minute with our Course Advisor.</p>
              <AdvisorButton className={buttonClass("secondary", "sm", "mt-4 w-full")} prefill={topic ? { topic } : undefined}>
                Ask the Course Advisor
              </AdvisorButton>
            </Reveal>
            <div className="on-dark rounded-2xl bg-navy-900 p-6 text-white">
              <p className="font-display text-lg font-semibold">Training a team?</p>
              <p className="mt-1.5 text-[0.95rem] text-white/75">We can run this course onsite at your offices, tailored to your business.</p>
              <Link href="/onsite" className={buttonClass("gold", "sm", "mt-4 w-full")}>
                Onsite training
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="border-t border-line bg-white py-16">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 id="related-h" className="text-[1.75rem] font-semibold">
                Related courses
              </h2>
              <Link href={category.path} className="hidden items-center gap-1 font-semibold text-navy-900 hover:underline sm:inline-flex">
                All {category.name} <ArrowRight aria-hidden size={16} />
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((c) => (
                <li key={c.path}>
                  <CourseCard course={c} categoryName={getCategory(c.category)?.name} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function Fact({ icon: Icon, term, value }: { icon: typeof Clock; term: string; value: string }) {
  return (
    <div className="relative pl-9">
      <dt className="text-sm text-ink-muted">
        <Icon aria-hidden size={26} weight="duotone" className="absolute left-0 top-0.5 text-brand-600" />
        {term}
      </dt>
      <dd className="font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

function Glance({ term, value, wide = false }: { term: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-sm font-semibold text-ink-muted">{term}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

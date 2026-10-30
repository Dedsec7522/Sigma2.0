import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Buildings, CalendarBlank, ChalkboardTeacher, CheckCircle, Desktop, Laptop, MapPin, Quotes, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { HeroBackdrop } from "@/components/ui/PageHero";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/JsonLd";
import { CourseCard, LevelBadge } from "@/components/CourseCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BeltPathway } from "@/components/home/BeltPathway";
import { HeroSearch } from "@/components/search/HeroSearch";
import { FutureOnly } from "@/components/FutureOnly";
import { AdvisorButton } from "@/components/advisor/AdvisorButton";
import { getCategories, getCategoryCourses, getCourseByPath, getCourses, getFeaturedCourses, getLocations, getUpcomingSessions, popularLocationSlugs } from "@/lib/catalog";
import { getPosts, pageMeta } from "@/lib/content";
import { DELEGATES_TRAINED, EIGHT_WASTES, TESTIMONIALS, WHY_US } from "@/lib/company";
import { itemListSchema } from "@/lib/schema";
import { formatDate, formatPrice, SITE } from "@/lib/site";
import type { Course } from "@/lib/types";

const legacy = pageMeta("/");

export const metadata: Metadata = {
  title: { absolute: legacy.title },
  description: "Lean Six Sigma and Six Sigma training across the UK since 1998. Yellow, Green, Black and Master Black Belt courses with exams included, in classrooms at over 90 UK locations, live online, self-paced or onsite for teams.",
  alternates: { canonical: "/" },
};

const BELT_PATHS = [
  "/courses/lean-six-sigma-training/yellow-belt",
  "/courses/lean-six-sigma-training/green-belt",
  "/courses/lean-six-sigma-training/black-belt",
  "/courses/lean-six-sigma-training/lean-six-sigma-master-black-belt-mbb-",
];

export default function HomePage() {
  const categories = getCategories();
  const featured = getFeaturedCourses();
  const belts = BELT_PATHS.map(getCourseByPath).filter((c): c is Course => Boolean(c));
  const upcoming = getUpcomingSessions(6);
  const posts = getPosts().slice(0, 3);
  const locations = getLocations().filter((l) => popularLocationSlugs.includes(l.slug)).slice(0, 12);
  const totalCourses = getCourses().length;
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <>
      <JsonLd data={itemListSchema(featured.map((c) => ({ name: c.name, path: c.path })), "Popular Six Sigma courses")} />

      {/* Hero */}
      <section className="on-dark relative overflow-hidden bg-navy-900 text-white">
        <HeroBackdrop />
        <div className="container-page relative grid grid-cols-[minmax(0,1fr)] items-center gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-24">
          <div>
            <div className="rise" style={{ "--d": "0ms" } as React.CSSProperties}>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 ring-1 ring-inset ring-white/15">
                <span className="size-2 rounded-full bg-gold-500" aria-hidden />
                Trusted since {SITE.foundingYear} · {DELEGATES_TRAINED} delegates trained
              </p>
            </div>
            <div className="rise" style={{ "--d": "60ms" } as React.CSSProperties}>
              <h1 className="mt-6 text-[2.35rem] font-semibold !leading-[1.08] !text-white sm:text-5xl lg:text-[3.6rem]">
                Lean Six Sigma training, <span className="text-gold-400">built around you</span>
              </h1>
            </div>
            <div className="rise" style={{ "--d": "120ms" } as React.CSSProperties}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Professional Six Sigma, Lean and Kaizen courses with exams included. Learn in a classroom at over 90 UK locations, live online, at your own pace, or onsite with your team.
              </p>
            </div>
            <div className="rise mt-8" style={{ "--d": "180ms" } as React.CSSProperties}>
              <HeroSearch />
            </div>
            <div className="rise mt-6 flex flex-wrap items-center gap-3" style={{ "--d": "240ms" } as React.CSSProperties}>
              <AdvisorButton className={buttonClass("gold", "lg")}>Find my ideal course</AdvisorButton>
              <Link href="/courses" className={buttonClass("outline-light", "lg")}>
                Browse all {totalCourses} courses
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <BeltPathway belts={belts} />
          </div>
        </div>
      </section>

      {/* Proof bar */}
      <section aria-label="At a glance" className="border-b border-line bg-white">
        <RevealGroup as="ul" className="container-page grid grid-cols-2 gap-px py-2 md:grid-cols-4">
          {[
            { k: String(SITE.foundingYear), v: "Training professionals since", icon: Buildings },
            { k: `${DELEGATES_TRAINED}+`, v: "Delegates trained", icon: UsersThree },
            { k: "90+", v: "UK training locations", icon: MapPin },
            { k: "4 ways", v: "Classroom, virtual, online, onsite", icon: ChalkboardTeacher },
          ].map((s) => (
            <RevealItem as="li" key={s.v} className="flex items-center gap-4 px-2 py-6 md:px-6">
              <s.icon aria-hidden size={30} weight="duotone" className="shrink-0 text-brand-600" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums text-navy-900">{s.k}</p>
                <p className="text-sm text-ink-muted">{s.v}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Categories */}
      <Section labelledBy="cat-h">
        <SectionHeader
          id="cat-h"
          eyebrow="Course library"
          title="Explore training by discipline"
          lead="Every course includes expert-led teaching, course materials and full support. Most certifications include the exam."
          action={
            <Link href="/courses" className={buttonClass("secondary", "md")}>
              View all courses <ArrowRight aria-hidden size={16} />
            </Link>
          }
        />
        <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const courses = getCategoryCourses(cat);
            return (
              <RevealItem as="li" key={cat.path}>
                <Link
                  href={cat.path}
                  className="group flex h-full items-start gap-5 rounded-2xl border border-line bg-white p-6 shadow-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-navy-100 hover:shadow-lift"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-900 group-hover:text-gold-400">
                    <CategoryIcon slug={cat.slug} size={26} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-lg font-semibold text-navy-900">{cat.name}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-brand-700">{courses.length} courses</span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-[0.95rem] text-ink-muted">{courses.slice(0, 3).map((c) => c.name).join(", ")}</span>
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Featured courses */}
      <Section tone="white" labelledBy="pop-h">
        <SectionHeader id="pop-h" eyebrow="Most popular" title="Courses professionals choose first" lead="Our most-booked certifications, with scheduled dates across the UK and online." />
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <RevealItem key={c.path}>
              <CourseCard course={c} categoryName={categoryName.get(c.category)} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Advisor band */}
      <section aria-labelledby="adv-h" className="container-page py-16 md:py-20">
        <Reveal className="on-dark relative overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-12 text-white sm:px-12 md:py-14">
          <HeroBackdrop />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="eyebrow !text-gold-400">Course Advisor</p>
              <h2 id="adv-h" className="mt-2 text-[1.75rem] font-semibold !text-white sm:text-[2.15rem]">
                Not sure which course is right for you?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Answer a few quick questions about your goals, experience and how you like to learn. We&rsquo;ll match you to the right course from our live catalogue and explain why.
              </p>
            </div>
            <AdvisorButton className={buttonClass("gold", "lg")}>Find my ideal course</AdvisorButton>
          </div>
        </Reveal>
      </section>

      {/* Explainer: helps people and answer engines understand the subject */}
      <Section tone="white" labelledBy="what-h">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Reveal>
            <p className="eyebrow">The essentials</p>
            <h2 id="what-h" className="mt-2 text-[1.75rem] font-semibold sm:text-[2.15rem]">
              What is Lean Six Sigma?
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-muted">
              <p>
                Lean Six Sigma improves business processes by removing waste and reducing defects or mistakes. It combines Lean&rsquo;s focus on flow with Six Sigma&rsquo;s data-driven DMAIC method (Define, Measure, Analyse, Improve, Control), helping any organisation produce better work, improve profitability and reduce costs.
              </p>
              <p>The methodology is built around eight types of waste:</p>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-2.5">
              {EIGHT_WASTES.map((w) => (
                <li key={w} className="flex items-center gap-2 text-ink">
                  <CheckCircle aria-hidden size={18} weight="fill" className="shrink-0 text-brand-600" /> {w}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-left text-[0.95rem]">
                <caption className="bg-navy-50 px-5 py-4 text-left font-display font-semibold text-navy-900">Lean Six Sigma belts compared</caption>
                <thead className="border-b border-line bg-white text-sm text-ink-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Course</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Level</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Duration</th>
                    {SITE.showPrices && (
                      <th scope="col" className="px-5 py-3 text-right font-semibold">
                        From
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {belts.map((b) => (
                    <tr key={b.path}>
                      <th scope="row" className="px-5 py-4 font-semibold">
                        <Link href={b.path} className="text-navy-900 underline-offset-4 hover:underline">
                          {b.name.replace("Lean Six Sigma ", "")}
                        </Link>
                      </th>
                      <td className="px-3 py-4">
                        <LevelBadge level={b.level} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-ink-muted">{b.duration}</td>
                      {SITE.showPrices && <td className="px-5 py-4 text-right font-semibold tabular-nums text-navy-900">{b.fromPrice ? formatPrice(b.fromPrice) : "—"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              Yellow Belt gives a base level of knowledge. Green and Black Belt build on this to launch and lead projects, and Master Black Belt certifies experienced leaders who coach others. All belt courses include exams.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Delivery formats */}
      <Section labelledBy="fmt-h">
        <SectionHeader id="fmt-h" eyebrow="Flexible delivery" title="Learn the way that suits you" />
        <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ChalkboardTeacher, title: "Classroom", text: "Modern training venues in over 90 locations across the UK.", href: "/locations", cta: "Find a venue" },
            { icon: Desktop, title: "Live online", text: "Instructor-led virtual classes you can join from home or the office.", href: "/courses", cta: "See virtual dates" },
            { icon: Laptop, title: "Self-paced online", text: "Study in your own time with our online learning platform.", href: "/online-training/six-sigma", cta: "Online courses" },
            { icon: Buildings, title: "Onsite for teams", text: "Any course delivered at your offices or a venue of your choice.", href: "/onsite", cta: "Plan team training" },
          ].map((f) => (
            <RevealItem as="li" key={f.title}>
              <Link href={f.href} className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lift">
                <f.icon aria-hidden size={32} weight="duotone" className="text-brand-600" />
                <span className="mt-4 font-display text-lg font-semibold text-navy-900">{f.title}</span>
                <span className="mt-1.5 text-[0.95rem] text-ink-muted">{f.text}</span>
                <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-navy-900">
                  {f.cta} <ArrowRight aria-hidden size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Upcoming dates */}
      {upcoming.length > 0 && (
        <Section tone="white" labelledBy="dates-h">
          <SectionHeader
            id="dates-h"
            eyebrow="Training calendar"
            title="Upcoming course dates"
            action={
              <Link href="/courses" className={buttonClass("secondary", "md")}>
                All courses and dates
              </Link>
            }
          />
          <Reveal className="mt-10 overflow-hidden rounded-2xl border border-line">
            <ul className="divide-y divide-line bg-white">
              {upcoming.map((s) => (
                <FutureOnly key={`${s.course.path}-${s.date}-${s.location}`} date={s.date}>
                <li className="grid items-center gap-3 px-5 py-4 sm:grid-cols-[9rem_1fr_auto] sm:gap-6">
                  <p className="flex items-center gap-2 font-semibold tabular-nums text-navy-900">
                    <CalendarBlank aria-hidden size={18} className="text-brand-600" />
                    {formatDate(s.date, { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  <div>
                    <Link href={s.course.path} className="font-semibold text-navy-900 hover:underline">
                      {s.course.name}
                    </Link>
                    <p className="text-sm text-ink-muted">
                      {s.method === "virtual" ? "Live online" : s.location} · {s.duration ?? s.course.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:justify-end">
                    {SITE.showPrices && s.price && <span className="font-semibold tabular-nums text-navy-900">{formatPrice(s.price)}</span>}
                    {s.bookingUrl && (
                      <a href={s.bookingUrl} className={buttonClass("primary", "sm")}>
                        Book <span className="sr-only">{s.course.name} on {formatDate(s.date)}</span>
                      </a>
                    )}
                  </div>
                </li>
                </FutureOnly>
              ))}
            </ul>
          </Reveal>
        </Section>
      )}

      {/* Why us + business */}
      <Section labelledBy="why-h">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              id="why-h"
              eyebrow="Why train with us"
              title="Over 25 years of quality training"
              lead="Our trainers are industry experts, highly experienced in planning and delivering quality management solutions using Six Sigma, Lean and Kaizen methodologies."
            />
            <RevealGroup as="ul" className="mt-8 grid gap-4 sm:grid-cols-2">
              {WHY_US.map((w) => (
                <RevealItem as="li" key={w.title} className="rounded-2xl border border-line bg-white p-5">
                  <p className="font-display font-semibold text-navy-900">{w.title}</p>
                  <p className="mt-1.5 text-[0.95rem] text-ink-muted">{w.text}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
          <Reveal className="on-dark relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-navy-900 p-8 text-white sm:p-10">
            <HeroBackdrop />
            <div className="relative">
              <p className="eyebrow !text-gold-400">Solutions for business</p>
              <h2 className="mt-2 text-[1.6rem] font-semibold !text-white sm:text-3xl">Training tailored to your organisation</h2>
              <p className="mt-4 text-white/80">
                We take time to understand your needs and how your business works before developing training tailored to your industry and goals. We can deliver custom Six Sigma and Lean programmes onsite at your offices or a venue of your choice, and even create bespoke content just for you.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Link href="/onsite" className={buttonClass("gold", "md")}>
                Plan team training
              </Link>
              <a href={`tel:${SITE.phone}`} className={buttonClass("outline-light", "md")}>
                Call {SITE.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Testimonials */}
      <Section tone="tint" labelledBy="testi-h">
        <SectionHeader
          id="testi-h"
          eyebrow="Testimonials"
          title="What our delegates say"
          action={
            <Link href="/testimonial" className={buttonClass("secondary", "md")}>
              More reviews
            </Link>
          }
        />
        <RevealGroup as="ul" className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <RevealItem as="li" key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-card">
                <Quotes aria-hidden size={30} weight="fill" className="text-gold-500" />
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <p className="font-semibold text-navy-900">{t.name}</p>
                  <p className="text-sm text-ink-muted">{t.role}</p>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Locations + blog */}
      <Section tone="white" labelledBy="loc-h">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeader id="loc-h" eyebrow="Across the UK" title="Classroom training near you" lead="Our classroom training runs in major towns and cities across the UK. These are the locations in most demand." />
            <ul className="mt-8 flex flex-wrap gap-2">
              {locations.map((l) => (
                <li key={l.slug}>
                  <Link href={l.path} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-navy-900 transition-colors hover:border-navy-600 hover:bg-navy-50">
                    <MapPin aria-hidden size={14} className="text-brand-600" /> {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/locations" className="mt-6 inline-flex items-center gap-1 font-semibold text-navy-900 hover:underline">
              View all locations <ArrowRight aria-hidden size={16} />
            </Link>
          </div>
          <div>
            <SectionHeader
              eyebrow="Insights"
              title="Recent articles"
              action={
                <Link href="/blog" className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:underline">
                  All articles <ArrowRight aria-hidden size={16} />
                </Link>
              }
            />
            <ul className="mt-8 space-y-4">
              {posts.map((p) => (
                <li key={p.path}>
                  <Link href={p.path} className="group flex gap-5 rounded-2xl p-2 transition-colors hover:bg-navy-50">
                    {p.image && (
                      <span className="relative hidden aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-xl bg-navy-50 sm:block">
                        <Image src={p.image} alt="" fill sizes="144px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </span>
                    )}
                    <span className="py-1">
                      {p.date && <span className="text-sm text-ink-subtle">{formatDate(p.date)}</span>}
                      <span className="mt-1 block font-display font-semibold !leading-snug text-navy-900">{p.title}</span>
                      <span className="mt-1 line-clamp-2 block text-[0.95rem] text-ink-muted">{p.excerpt}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}

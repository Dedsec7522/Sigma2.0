import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { pageMeta } from "@/lib/content";
import { DELEGATES_TRAINED, TIMELINE } from "@/lib/company";
import { breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const m = pageMeta("/about-us");
export const metadata: Metadata = {
  title: { absolute: m.title || "About Us | SixSigma.co.uk" },
  description: m.description || `Six Sigma Training is a brand of Pentagon Training, founded in ${SITE.foundingYear} in Maidenhead and the UK's longest-serving business improvement training provider.`,
  alternates: { canonical: "/about-us" },
};

export default function AboutPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "About us", path: "/about-us" },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="About us" title={`Six Sigma pioneers since ${SITE.foundingYear}`} lead={`Over ${DELEGATES_TRAINED} people trained in Six Sigma, Lean and Kaizen, by the UK's longest-serving business improvement training provider.`} />

      <Section labelledBy="do-h">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">What we do</p>
            <h2 id="do-h" className="mt-2 text-[1.75rem] font-semibold sm:text-[2.15rem]">
              Specialists in business improvement training
            </h2>
          </Reveal>
          <Reveal delay={0.06} className="space-y-4 text-lg leading-relaxed text-ink-muted">
            <p>
              Six Sigma Training is an official brand of Pentagon Training, founded in {SITE.foundingYear}. We have delivered certified Six Sigma training solutions to thousands of organisations, specialising in Six Sigma, Lean Six Sigma, Lean and Kaizen training and consultancy, alongside courses in areas such as Microsoft Excel, GDPR and project management.
            </p>
            <p>
              Whether you&rsquo;re an individual, a public sector organisation or a private business, we&rsquo;re here to help you find the best training solution for your needs.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="white" labelledBy="story-h">
        <SectionHeader id="story-h" eyebrow="Our story" title="Milestones" />
        <RevealGroup as="ol" className="relative mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map((t) => (
            <RevealItem as="li" key={t.year} className="relative border-t-2 border-navy-100 pt-6">
              <span aria-hidden className="absolute -top-[7px] left-0 size-3 rounded-full bg-brand-600 ring-4 ring-white" />
              <p className="font-display text-3xl font-semibold tabular-nums text-navy-900">{t.year}</p>
              <p className="mt-2 font-semibold text-navy-900">{t.title}</p>
              <p className="mt-1 text-[0.95rem] text-ink-muted">{t.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section labelledBy="mv-h">
        <h2 id="mv-h" className="sr-only">
          Mission and vision
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal className="rounded-3xl border border-line bg-white p-8">
            <p className="eyebrow">Our mission</p>
            <p className="mt-3 text-lg leading-relaxed text-ink">
              We understand that each customer is different and has different training needs. That&rsquo;s why we listen to and help you assess your needs before helping you find the most appropriate solution, and we&rsquo;re with you every step of the way.
            </p>
          </Reveal>
          <Reveal delay={0.06} className="on-dark rounded-3xl bg-navy-900 p-8 text-white">
            <p className="eyebrow !text-gold-400">Our vision</p>
            <p className="mt-3 text-lg leading-relaxed text-white/90">
              We aim to make quality learning affordable and accessible to all, by hiring skilled, motivated trainers to deliver a complete and fulfilling learning experience.
            </p>
          </Reveal>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/courses" className={buttonClass("primary", "md")}>
            Explore our courses
          </Link>
          <Link href="/clients" className={buttonClass("secondary", "md")}>
            See who we&rsquo;ve trained
          </Link>
        </div>
      </Section>
    </>
  );
}

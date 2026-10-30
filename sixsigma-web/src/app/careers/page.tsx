import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { pageMeta } from "@/lib/content";
import { CAREER_PERKS, CAREER_ROLES, CAREER_VALUES } from "@/lib/company";
import { breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const m = pageMeta("/careers");
export const metadata: Metadata = {
  title: { absolute: m.title || "Careers | SixSigma.co.uk" },
  description: m.description || "Join the UK's Six Sigma specialists. Opportunities for trainers, sales, marketing, IT and finance professionals in Maidenhead.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
  ];
  const apply = `mailto:${SITE.email}?subject=${encodeURIComponent("Job application")}`;
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="Careers" title="Join the UK's Six Sigma specialists" lead="We're growing to support a loyal client base, and we're looking for energetic, enthusiastic experts who are passionate about learning.">
        <a href={apply} className={buttonClass("gold", "lg")}>
          Apply now
        </a>
      </PageHero>

      <Section labelledBy="op-h">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Opportunities</p>
            <h2 id="op-h" className="mt-2 text-[1.75rem] font-semibold sm:text-[2.15rem]">
              An exciting time to join
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              We aim to deliver a world-class training experience and we&rsquo;re seeking people with top skills and knowledge to meet our clients&rsquo; high expectations. Our culture is one of integrity and accountability, and we strive to operate ethically at all times.
            </p>
          </Reveal>
          <Reveal delay={0.06} className="rounded-3xl border border-line bg-white p-8">
            <p className="font-display font-semibold text-navy-900">Teams we recruit for</p>
            <ul className="mt-4 space-y-2.5">
              {CAREER_ROLES.map((r) => (
                <li key={r} className="flex items-center gap-2.5 text-ink">
                  <CheckCircle aria-hidden size={20} weight="fill" className="text-brand-600" /> {r}
                </li>
              ))}
            </ul>
            <a href={apply} className={buttonClass("primary", "md", "mt-6")}>
              Send us your CV
            </a>
          </Reveal>
        </div>
      </Section>

      <Section tone="white" labelledBy="perks-h">
        <SectionHeader id="perks-h" eyebrow="Life at our Maidenhead office" title="The perks" />
        <RevealGroup as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAREER_PERKS.map((p) => (
            <RevealItem as="li" key={p.title} className="rounded-2xl bg-navy-50/70 p-6">
              <p className="font-display font-semibold text-navy-900">{p.title}</p>
              <p className="mt-1.5 text-[0.95rem] text-ink-muted">{p.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section labelledBy="val-h">
        <SectionHeader id="val-h" eyebrow="Our commitment to our staff" title="What we stand for" />
        <RevealGroup as="ol" className="mt-10 grid gap-4 md:grid-cols-3">
          {CAREER_VALUES.map((v, i) => (
            <RevealItem as="li" key={v.title} className="rounded-2xl border border-line bg-white p-6">
              <span className="font-display text-sm font-semibold text-brand-700">0{i + 1}</span>
              <p className="mt-2 font-display text-lg font-semibold text-navy-900">{v.title}</p>
              <p className="mt-1.5 text-[0.95rem] text-ink-muted">{v.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}

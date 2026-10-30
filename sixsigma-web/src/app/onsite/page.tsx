import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Phone } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section, SectionHeader } from "@/components/ui/Section";
import { RevealGroup, RevealItem, Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getCategories } from "@/lib/catalog";
import { clientGroups, pageMeta } from "@/lib/content";
import { ONSITE_BENEFITS } from "@/lib/company";
import { breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const m = pageMeta("/onsite");
export const metadata: Metadata = {
  title: { absolute: m.title || "Onsite Six Sigma Training | In-House Training" },
  description: m.description || "Onsite Six Sigma, Lean Six Sigma, Lean and Kaizen training delivered at your offices or a venue of your choice, tailored to your business.",
  alternates: { canonical: "/onsite" },
};

export default function OnsitePage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Onsite training", path: "/onsite" },
  ];
  const sectors = clientGroups().map((g) => g.sector);
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Training for teams"
        title="Onsite Six Sigma training, tailored to your organisation"
        lead="Onsite programmes are our speciality. Any of our courses can be delivered at your offices or a venue of your choice, covering Six Sigma and Lean Six Sigma Yellow, Green and Black Belt, Lean, Kaizen and business improvement."
      >
        <a href="#enquire" className={buttonClass("gold", "lg")}>
          Request a team quote
        </a>
        <a href={`tel:${SITE.phone}`} className={buttonClass("outline-light", "lg")}>
          <Phone aria-hidden size={18} /> {SITE.phoneDisplay}
        </a>
      </PageHero>

      <Section labelledBy="ben-h">
        <SectionHeader id="ben-h" eyebrow="Why onsite" title="World-class training at your doorstep" lead="We have extensive experience delivering bespoke, tailored Lean Six Sigma programmes that help businesses achieve operational excellence and meet their corporate goals." />
        <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ONSITE_BENEFITS.map((b, i) => (
            <RevealItem as="li" key={b.title} className="rounded-2xl border border-line bg-white p-6">
              <span className="font-display text-sm font-semibold tabular-nums text-brand-700">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 font-display text-lg font-semibold text-navy-900">{b.title}</p>
              <p className="mt-1.5 text-[0.95rem] text-ink-muted">{b.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section tone="white" labelledBy="how-h">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Built around your goals</p>
            <h2 id="how-h" className="mt-2 text-[1.75rem] font-semibold sm:text-[2.15rem]">
              A programme that fits your business
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-muted">
              <p>
                Our team of highly experienced Lean Six Sigma consultants are fully versed in running Six Sigma projects across industry, delivering improvements to an exceptionally high standard.
              </p>
              <p>
                We can add or remove any elements of Six Sigma and Lean Six Sigma to suit your setting, and build a toolset focused on your key business drivers: reducing costs, increasing profit, minimising waste and increasing operational efficiency.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="font-display font-semibold text-navy-900">Topics we deliver onsite</p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {getCategories().map((c) => (
                <li key={c.path}>
                  <Link href={c.path} className="flex items-center gap-2 rounded-xl bg-navy-50/70 px-4 py-3 font-medium text-navy-900 hover:bg-navy-50">
                    <CheckCircle aria-hidden size={18} weight="fill" className="shrink-0 text-brand-600" /> {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            {sectors.length > 0 && (
              <>
                <p className="mt-8 font-display font-semibold text-navy-900">Sectors we work with</p>
                <p className="mt-2 text-ink-muted">{sectors.join(" · ")}</p>
              </>
            )}
          </Reveal>
        </div>
      </Section>

      <section id="enquire" aria-labelledby="enq-h" className="scroll-mt-24 py-16 md:py-24">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Reveal>
            <p className="eyebrow">Get a quote</p>
            <h2 id="enq-h" className="mt-2 text-[1.75rem] font-semibold sm:text-[2.15rem]">
              Tell us about your team
            </h2>
            <p className="mt-4 text-lg text-ink-muted">Share a few details and a training consultant will come back with options and a tailored quote, usually within one working day.</p>
            <ul className="mt-6 space-y-2.5">
              {["No obligation", "Any course, any UK location", "Content tailored to your business"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-ink">
                  <CheckCircle aria-hidden size={20} weight="fill" className="text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="rounded-3xl border border-line bg-white p-6 sm:p-10">
            <EnquiryForm variant="team" />
          </div>
        </div>
      </section>
    </>
  );
}

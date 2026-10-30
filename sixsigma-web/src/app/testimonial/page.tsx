import type { Metadata } from "next";
import Link from "next/link";
import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { pageMeta } from "@/lib/content";
import { TESTIMONIALS } from "@/lib/company";
import { breadcrumbSchema } from "@/lib/schema";

const m = pageMeta("/testimonial");
export const metadata: Metadata = {
  title: { absolute: m.title || "Six Sigma Testimonials | SixSigma.co.uk" },
  description: m.description || "What delegates say about their Six Sigma, Lean and Kaizen training with SixSigma.co.uk.",
  alternates: { canonical: "/testimonial" },
};

export default function TestimonialsPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Testimonials", path: "/testimonial" },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="Testimonials" title="What our delegates say" lead="We've helped many happy customers with their Six Sigma and Lean training needs." />
      <section aria-label="Testimonials" className="container-page py-14 md:py-20">
        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <RevealItem as="li" key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-line">
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
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/courses" className={buttonClass("primary", "md")}>
            Find your course
          </Link>
        </div>
      </section>
    </>
  );
}

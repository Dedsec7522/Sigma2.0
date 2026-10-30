import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { clientGroups, pageMeta } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

const m = pageMeta("/clients");
export const metadata: Metadata = {
  title: { absolute: m.title || "Our Clients | SixSigma.co.uk" },
  description: m.description || "Organisations across finance, local government, the NHS, police and more who have trained with SixSigma.co.uk.",
  alternates: { canonical: "/clients" },
};

export default function ClientsPage() {
  const groups = clientGroups();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Clients", path: "/clients" },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Our clients"
        title="Trusted by organisations across the UK"
        lead="Since 1998 we've trained independent learners and helped businesses and government departments throughout the UK improve their operations, across finance, manufacturing, pharmaceuticals, local government, universities, charities, IT, police services and the NHS."
      />
      <section aria-label="Clients by sector" className="container-page py-14 md:py-20">
        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <RevealItem as="li" key={g.sector} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-lg font-semibold">{g.sector}</h2>
              <ul className="mt-4 space-y-1.5 text-[0.95rem] text-ink-muted">
                {g.clients.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/onsite" className={buttonClass("primary", "md")}>
            Train your team
          </Link>
          <Link href="/testimonial" className={buttonClass("secondary", "md")}>
            Read testimonials
          </Link>
        </div>
      </section>
    </>
  );
}

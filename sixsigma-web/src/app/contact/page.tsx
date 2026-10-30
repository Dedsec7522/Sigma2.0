import type { Metadata } from "next";
import Link from "next/link";
import { Clock, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { pageMeta } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const m = pageMeta("/contact");
export const metadata: Metadata = {
  title: { absolute: m.title || "Contact Us | SixSigma.co.uk" },
  description: m.description || "Contact the SixSigma.co.uk team by phone, email or our enquiry form for course advice, quotes and bookings.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];
  const mapQuery = encodeURIComponent(`${SITE.address.street}, ${SITE.address.locality} ${SITE.address.postcode}`);
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="Contact" title="Talk to a training advisor" lead="Whether you're choosing a course, booking for a team or have a question about an existing booking, we're here to help." />
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 py-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:py-16">
        <section aria-labelledby="form-h" className="rounded-3xl border border-line bg-white p-6 sm:p-10">
          <h2 id="form-h" className="text-[1.6rem] font-semibold">
            Send us a message
          </h2>
          <p className="mt-2 text-ink-muted">We usually reply within one working day.</p>
          <div className="mt-8">
            <EnquiryForm variant="general" />
          </div>
        </section>
        <aside aria-label="Contact details" className="space-y-4">
          <ul className="space-y-3">
            <ContactItem icon={Phone} title="Call us" href={`tel:${SITE.phone}`} value={SITE.phoneDisplay} />
            <ContactItem icon={EnvelopeSimple} title="Email us" href={`mailto:${SITE.email}`} value={SITE.email} />
            <ContactItem icon={Clock} title="Opening hours" value={SITE.hours} />
            <ContactItem
              icon={MapPin}
              title="Head office"
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              value={`${SITE.address.street}, ${SITE.address.locality} ${SITE.address.postcode}`}
            />
          </ul>
          <div className="on-dark rounded-2xl bg-navy-900 p-6 text-white">
            <p className="font-display text-lg font-semibold">Booking for a team?</p>
            <p className="mt-1.5 text-[0.95rem] text-white/75">
              Any course can be delivered onsite at your offices. Visit our <Link href="/onsite" className="font-semibold text-gold-400 underline underline-offset-4">onsite training</Link> page for a tailored quote.
            </p>
          </div>
          <p className="px-1 text-xs text-ink-subtle">
            {SITE.legalName} · Company No. {SITE.companyNumber} · VAT No. {SITE.vatNumber}
          </p>
        </aside>
      </div>
    </>
  );
}

function ContactItem({ icon: Icon, title, value, href }: { icon: typeof Phone; title: string; value: string; href?: string }) {
  const body = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon aria-hidden size={22} weight="duotone" />
      </span>
      <span>
        <span className="block text-sm text-ink-muted">{title}</span>
        <span className="block font-semibold text-navy-900">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-navy-600" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {body}
        </a>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">{body}</div>
      )}
    </li>
  );
}

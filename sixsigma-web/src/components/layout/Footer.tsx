import Image from "next/image";
import Link from "next/link";
import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { getCategories, getCategoryCourses, getLocations, popularLocationSlugs } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { CookieSettingsLink } from "./CookieConsent";

export function Footer() {
  const categories = getCategories();
  const locations = getLocations().filter((l) => popularLocationSlugs.slice(0, 10).includes(l.slug));
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-navy-950 text-white/75">
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-12 py-16 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <Image src="/brand/white-logo.png" alt="Six Sigma" width={361} height={136} className="h-14 w-auto" />
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed">
            The UK&rsquo;s Six Sigma specialists since {SITE.foundingYear}, providing professional training in Six Sigma, Lean Six Sigma, Lean and Kaizen through classroom, virtual, online and onsite delivery.
          </p>
          <ul className="mt-6 space-y-3 text-[0.95rem]">
            <li>
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-3 hover:text-white">
                <Phone aria-hidden size={18} className="text-gold-400" /> {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:text-white">
                <EnvelopeSimple aria-hidden size={18} className="text-gold-400" /> {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin aria-hidden size={18} className="mt-1 shrink-0 text-gold-400" />
              <address className="not-italic">
                {SITE.address.street}, {SITE.address.locality} {SITE.address.postcode}
              </address>
            </li>
          </ul>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <FooterCol title="Courses">
            {categories.map((c) => (
              <FooterLink key={c.path} href={c.path}>{c.name}</FooterLink>
            ))}
            <FooterLink href="/courses">All courses</FooterLink>
          </FooterCol>
          <FooterCol title="Popular courses">
            {categories.slice(0, 4).flatMap((c) => getCategoryCourses(c).slice(0, 2)).map((c) => (
              <FooterLink key={c.path} href={c.path}>{c.name}</FooterLink>
            ))}
          </FooterCol>
          <FooterCol title="Training near you">
            {locations.map((l) => (
              <FooterLink key={l.path} href={l.path}>{l.name}</FooterLink>
            ))}
            <FooterLink href="/locations">All locations</FooterLink>
          </FooterCol>
          <FooterCol title="Company">
            <FooterLink href="/about-us">About us</FooterLink>
            <FooterLink href="/clients">Clients</FooterLink>
            <FooterLink href="/testimonial">Testimonials</FooterLink>
            <FooterLink href="/onsite">Onsite training</FooterLink>
            <FooterLink href="/online-training/six-sigma">Online training</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/resources">Resources</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/contact">Contact us</FooterLink>
          </FooterCol>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {SITE.legalName}. Company No. {SITE.companyNumber}. VAT No. {SITE.vatNumber}.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link href="/terms" className="hover:text-white">Terms &amp; conditions</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/cookies" className="hover:text-white">Cookie policy</Link></li>
            <li><CookieSettingsLink /></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider !text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-[0.95rem]">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}

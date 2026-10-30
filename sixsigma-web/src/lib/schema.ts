// Schema.org JSON-LD builders. Every value mirrors content visible on the page.
import { absoluteUrl, SITE } from "./site";
import { stripTags } from "./text";
import type { Course, Faq, OnlineCourse, Session } from "./types";

const ORG_ID = `${SITE.url}/#organization`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: SITE.brand,
    alternateName: "Six Sigma Training",
    legalName: SITE.legalName,
    url: SITE.url,
    logo: absoluteUrl("/brand/logo-lg.png"),
    description: SITE.description,
    foundingDate: String(SITE.foundingYear),
    email: SITE.email,
    telephone: SITE.phone,
    vatID: `GB${SITE.vatNumber.replace(/\s/g, "")}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      postalCode: SITE.address.postcode,
      addressCountry: SITE.address.country,
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    sameAs: SITE.sameAs,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.brand,
    inLanguage: "en-GB",
    publisher: { "@id": ORG_ID },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqSchema(faqs: Faq[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: stripTags(f.a) },
    })),
  };
}

const isoDuration = (days: number | null) => (days ? `P${days}D` : undefined);

// Prices only appear in structured data when they are shown on the page.
const offer = (price: number | null | undefined, url: string) =>
  SITE.showPrices && price ? { offers: { "@type": "Offer", price, priceCurrency: "GBP", category: "Paid", availability: "https://schema.org/InStock", url } } : {};

// courseWorkload must be an ISO 8601 duration; durations are published in whole days.
const workload = (days: number | null) => (days ? { courseWorkload: isoDuration(days) } : {});

function instance(s: Session, course: Course) {
  const virtual = s.method === "virtual";
  return {
    "@type": "CourseInstance",
    courseMode: virtual ? "Online" : "Onsite",
    startDate: s.date,
    ...workload(course.durationDays),
    location: virtual
      ? { "@type": "VirtualLocation", url: absoluteUrl(course.path) }
      : { "@type": "Place", name: s.location, address: { "@type": "PostalAddress", addressLocality: s.location, addressCountry: "GB" } },
    ...offer(s.price, absoluteUrl(course.path)),
  };
}

export function courseSchema(course: Course, opts: { path?: string; sessions?: Session[]; online?: OnlineCourse | null } = {}) {
  const sessions = (opts.sessions ?? [...course.classroom, ...course.virtual]).slice(0, 12);
  const instances: object[] = sessions.map((s) => instance(s, course));
  if (opts.online) {
    instances.push({ "@type": "CourseInstance", courseMode: "Online", ...workload(course.durationDays), ...offer(opts.online.price, absoluteUrl(opts.online.path)) });
  }
  // Every course can be delivered onsite for teams; this keeps a valid instance when
  // no public dates are scheduled. No price is published for it, so none is given.
  instances.push({ "@type": "CourseInstance", courseMode: "Onsite", ...workload(course.durationDays), location: { "@type": "Place", name: "Your organisation's premises (onsite training)" } });
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${absoluteUrl(opts.path ?? course.path)}#course`,
    name: course.name,
    description: course.meta.description || course.summary,
    url: absoluteUrl(opts.path ?? course.path),
    provider: { "@id": ORG_ID, "@type": "EducationalOrganization", name: SITE.brand, url: SITE.url },
    inLanguage: "en-GB",
    educationalLevel: course.level.charAt(0).toUpperCase() + course.level.slice(1),
    ...(course.bullets.length ? { teaches: course.bullets } : {}),
    ...(course.prerequisites ? { coursePrerequisites: course.prerequisites } : {}),
    ...(course.audience ? { audience: { "@type": "Audience", audienceType: course.audience } } : {}),
    ...(course.durationDays ? { timeRequired: isoDuration(course.durationDays) } : {}),
    ...(course.certificateIncluded
      ? { educationalCredentialAwarded: { "@type": "EducationalOccupationalCredential", name: `${course.name} certificate`, credentialCategory: "Certificate" } }
      : {}),
    ...(SITE.showPrices && course.fromPrice
      ? { offers: { "@type": "Offer", price: course.fromPrice, priceCurrency: "GBP", category: "Paid", url: absoluteUrl(opts.path ?? course.path) } }
      : {}),
    hasCourseInstance: instances,
  };
}

export function onlineCourseSchema(o: OnlineCourse) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${absoluteUrl(o.path)}#course`,
    name: `${o.name} (self-paced online)`,
    description: o.meta.description || o.intro,
    url: absoluteUrl(o.path),
    provider: { "@id": ORG_ID, "@type": "EducationalOrganization", name: SITE.brand, url: SITE.url },
    inLanguage: "en-GB",
    // Self-paced: no fixed workload is published, so courseWorkload is omitted rather than guessed.
    hasCourseInstance: [{ "@type": "CourseInstance", courseMode: "Online", ...offer(o.price, absoluteUrl(o.path)) }],
    ...offer(o.price, absoluteUrl(o.path)),
  };
}

export function itemListSchema(items: { name: string; path: string }[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(it.path), name: it.name })),
  };
}

export function articleSchema(p: { title: string; description: string; path: string; date: string | null; image: string | null; author: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    mainEntityOfPage: absoluteUrl(p.path),
    url: absoluteUrl(p.path),
    ...(p.date ? { datePublished: p.date } : {}),
    ...(p.image ? { image: absoluteUrl(p.image) } : {}),
    author: p.author ? { "@type": "Person", name: p.author } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en-GB",
  };
}

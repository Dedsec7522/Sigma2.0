import "server-only";
import rawCategories from "@/data/categories.json";
import rawCourses from "@/data/courses.json";
import rawLocations from "@/data/locations.json";
import rawOnline from "@/data/online.json";
import rawCourseLocations from "@/data/course-locations.json";
import inventory from "@/data/url-inventory.json";
import { cleanHtml, cleanText, firstSentences, stripTags } from "./text";
import { IS_STATIC_PREVIEW, legacyUrl } from "./site";
import type { Category, Course, CourseLocation, DeliveryMethod, Faq, Level, Location, OnlineCourse, Session } from "./types";

type Meta = { title: string; description: string; keywords: string };
type RawSession = { method: string; location: string; locationSlug: string | null; date: string | null; price: number | null; duration: string | null; bookingUrl: string | null };
type RawCourse = {
  category: string; slug: string; path: string; name: string; status: number; meta?: Meta; h1?: string; topicId?: string | null;
  bullets?: string[]; overviewHtml?: string; outlineHtml?: string; faqs?: { q: string; a: string }[];
  included?: { title: string; text: string }[]; keyPoints?: Record<string, string>; deliveryMethods?: string[];
  onlineCourseSlug?: string | null; classroom?: RawSession[]; virtual?: RawSession[]; related?: string[]; popularLocations?: string[];
};

const TODAY = new Date().toISOString().slice(0, 10);

const cleanMeta = (m?: Meta) => ({
  title: cleanText(m?.title),
  description: cleanText(m?.description),
});

const cleanFaqs = (faqs?: { q: string; a: string }[]): Faq[] =>
  (faqs ?? []).map((f) => ({ q: cleanText(f.q), a: cleanHtml(f.a) })).filter((f) => f.q && f.a);

function sessions(list: RawSession[] | undefined): Session[] {
  return (list ?? [])
    .filter((s) => s.date && s.date >= TODAY)
    .map((s): Session => ({
      method: s.method === "virtual" ? "virtual" : "classroom",
      location: cleanText(s.location),
      locationSlug: s.locationSlug,
      date: s.date!,
      price: s.price,
      duration: s.duration ? cleanText(s.duration).replace(/Days Days/, "Days") : null,
      bookingUrl: legacyUrl(s.bookingUrl),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Levels follow the progression the site itself describes (Yellow is the base
// level, Green builds on it, Black leads projects, Master Black Belt coaches).
function inferLevel(name: string, days: number | null = null): Level {
  const n = name.toLowerCase();
  if (n.includes("master black belt")) return "expert";
  if (n.includes("black belt")) return "advanced";
  if (n.includes("green belt")) return "intermediate";
  if (n.includes("yellow belt") || n.includes("white belt")) return "foundation";
  if (n.includes("foundation & practitioner") || n.includes("foundation and practitioner")) return "intermediate";
  if (n.includes("practitioner")) return "intermediate";
  if (n.includes("foundation") || n.includes("introduction") || n.includes("fundamentals")) return "foundation";
  if (n.includes("advanced")) return "advanced";
  if (n.includes("data protection officer") || n.includes("cbcmp") || n.includes("cpapm")) return "advanced";
  // Courses with no level in their name: a single day is an introduction to the topic.
  return days !== null && days <= 1 ? "foundation" : "intermediate";
}

const parseDays = (d?: string) => {
  const m = d?.match(/(\d+)/);
  return m ? Number(m[1]) : null;
};

const METHOD_ORDER: DeliveryMethod[] = ["classroom", "virtual", "online", "onsite"];

function faqAnswer(faqs: Faq[], pattern: RegExp) {
  const f = faqs.find((x) => pattern.test(x.q));
  return f ? stripTags(f.a) : null;
}

function buildCourse(c: RawCourse, onlineSlugs: Set<string>): Course {
  const faqs = cleanFaqs(c.faqs);
  const classroom = sessions(c.classroom);
  const virtual = sessions(c.virtual);
  const overviewText = stripTags(c.overviewHtml ?? "").replace(/^.*?Overview\s*/i, "");
  const durationText = cleanText(c.keyPoints?.duration).replace(/Days Days/, "Days") || null;
  const allPrices = [...classroom, ...virtual].map((s) => s.price).filter((p): p is number => typeof p === "number" && p > 0);
  const name = cleanText(c.name);
  const onlineCourseSlug = c.onlineCourseSlug && onlineSlugs.has(c.onlineCourseSlug) ? c.onlineCourseSlug : null;
  // The scraped `deliveryMethods` is a generic tab bar (identical on every course), so
  // derive the real options from the schedule. Any course can be delivered onsite.
  const offered: Record<DeliveryMethod, boolean> = {
    classroom: Boolean(c.classroom?.length) || coursesWithLocalDates.has(c.path),
    virtual: Boolean(c.virtual?.length),
    online: Boolean(onlineCourseSlug),
    onsite: true,
  };
  const methods = METHOD_ORDER.filter((m) => offered[m]);
  return {
    slug: c.slug,
    category: c.category,
    path: c.path,
    name,
    h1: cleanText(c.h1) || name,
    meta: cleanMeta(c.meta),
    topicId: c.topicId ?? null,
    bullets: (c.bullets ?? []).map(cleanText).filter(Boolean),
    summary: firstSentences(overviewText, 260),
    overviewHtml: cleanHtml(c.overviewHtml).replace(/^<h3>[^<]*Overview<\/h3>\s*/i, ""),
    outlineHtml: cleanHtml(c.outlineHtml).replace(/<(\/?)h4>/g, "<$1h3>"),
    faqs,
    included: (c.included ?? []).map((i) => ({ title: cleanText(i.title), text: cleanText(i.text) })).filter((i) => i.title),
    duration: durationText,
    durationDays: parseDays(durationText ?? undefined),
    examIncluded: /included/i.test(c.keyPoints?.["exam(s)"] ?? ""),
    certificateIncluded: /included/i.test(c.keyPoints?.["certificate(s)"] ?? ""),
    support: cleanText(c.keyPoints?.support) || null,
    deliveryMethods: methods,
    onlineCourseSlug,
    classroom,
    virtual,
    fromPrice: allPrices.length ? Math.min(...allPrices) : null,
    related: (c.related ?? []).filter((p) => p !== c.path),
    popularLocations: c.popularLocations ?? [],
    level: inferLevel(name, parseDays(durationText ?? undefined)),
    audience: faqAnswer(faqs, /who (is|should)|who.*for\?/i),
    prerequisites: faqAnswer(faqs, /prerequisite|prior knowledge|experience required/i),
    hours: faqAnswer(faqs, /training hours|what time/i),
  };
}

// ---------------------------------------------------------------- online
type RawOnline = {
  path: string; slug: string; status: number; meta?: Meta; h1?: string; name?: string; intro?: string; overviewHtml?: string;
  outlineHtml?: string; faqs?: { q: string; a: string }[]; addons?: { id: string; label: string; price: number }[];
  basePrice?: number | null; bookingAction?: string | null; related?: string[];
};

const online: OnlineCourse[] = (rawOnline.courses as RawOnline[])
  .filter((o) => o.status === 200 && o.name)
  .map((o) => ({
    slug: o.slug,
    path: o.path,
    name: cleanText(o.name),
    h1: cleanText(o.h1) || cleanText(o.name),
    meta: cleanMeta(o.meta),
    intro: cleanText(o.intro),
    overviewHtml: cleanHtml(o.overviewHtml).replace(/^<h3>[^<]*Overview<\/h3>\s*/i, ""),
    outlineHtml: cleanHtml(o.outlineHtml).replace(/<(\/?)h4>/g, "<$1h3>"),
    faqs: cleanFaqs(o.faqs),
    addons: (o.addons ?? []).map((a) => ({ ...a, label: cleanText(a.label) })).filter((a) => a.label),
    price: o.basePrice ?? null,
    bookingUrl: legacyUrl(o.bookingAction ?? null),
    related: o.related ?? [],
    level: inferLevel(cleanText(o.name)),
    learners: (rawOnline.hub.cards as { path: string; learners: string | null; duration: string | null }[]).find((c) => c.path === o.path)?.learners ?? null,
    access: (rawOnline.hub.cards as { path: string; learners: string | null; duration: string | null }[]).find((c) => c.path === o.path)?.duration ?? null,
  }));
const onlineSlugs = new Set(online.map((o) => o.slug));

// ---------------------------------------------------------------- courses
// Courses whose city pages list classroom dates, even if the main course page lists none.
const coursesWithLocalDates = new Set(
  (rawCourseLocations as { path: string; classroom?: unknown[] }[]).filter((cl) => cl.classroom?.length).map((cl) => cl.path.split("/").slice(0, 4).join("/")),
);
const courses: Course[] = (rawCourses as RawCourse[]).filter((c) => c.status === 200).map((c) => buildCourse(c, onlineSlugs));
const courseByPath = new Map(courses.map((c) => [c.path, c]));

// Dates and prices are baked in at build time; flag builds made from stale data.
const scrapedOn = (inventory as { generated?: string }).generated;
const dataAgeDays = scrapedOn ? (Date.now() - Date.parse(scrapedOn)) / 86_400_000 : Infinity;
if (dataAgeDays > 7 || !courses.some((c) => c.classroom.length || c.virtual.length)) {
  console.warn(`[catalog] Course data was scraped on ${scrapedOn ?? "an unknown date"} and may be stale. Run tools/scrape_site.py --refresh and rebuild.`);
}

type RawCategory = { slug: string; path: string; name: string; courseOrder: string[]; meta?: Meta; h1?: string; intro?: string; sections?: { heading: string; paragraphs: string[] }[] };

const categories: Category[] = (rawCategories as RawCategory[]).map((c) => ({
  slug: c.slug,
  path: c.path,
  // Legacy tiles append the course count to the name ("Business Improvement Tools 11").
  name: cleanText(c.name).replace(/\s+\d+$/, ""),
  h1: cleanText(c.h1) || cleanText(c.name),
  meta: cleanMeta(c.meta),
  intro: cleanText(c.intro),
  sections: (c.sections ?? [])
    .map((s) => ({ heading: cleanText(s.heading), paragraphs: s.paragraphs.map(cleanText).filter(Boolean) }))
    .filter((s) => s.heading && s.paragraphs.length && !/training features/i.test(s.heading)),
  courseSlugs: c.courseOrder.filter((slug) => courseByPath.has(`${c.path}/${slug}`)),
}));

// ---------------------------------------------------------------- locations
type RawLocation = { slug: string; path: string; status: number; meta?: Meta; name?: string; intro?: string; detailHtml?: string };
const locations: Location[] = (rawLocations.locations as RawLocation[])
  .filter((l) => l.status === 200 && l.name)
  .map((l) => ({
    slug: l.slug,
    path: l.path,
    name: cleanText(l.name),
    meta: cleanMeta(l.meta),
    intro: cleanText(l.intro),
    detailHtml: cleanHtml(l.detailHtml),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
const locationBySlug = new Map(locations.map((l) => [l.slug, l]));
export const popularLocationSlugs: string[] = (rawLocations.popular as string[]).filter((s) => locationBySlug.has(s));
export const locationsIndex = { meta: cleanMeta(rawLocations.meta as Meta), h1: cleanText(rawLocations.h1), intro: cleanText(rawLocations.intro) };

// ---------------------------------------------------------------- course × location
type RawCourseLocation = { path: string; status: number; meta?: Meta; h1?: string; classroom?: RawSession[]; redirectsTo?: string };
// GitHub Pages caps a site at 1 GB, and 1,740 full course × location pages exceed it,
// so the static preview builds them for the most popular cities only.
const PREVIEW_CITIES = new Set(popularLocationSlugs.slice(0, 6));
const courseLocations: CourseLocation[] = (rawCourseLocations as RawCourseLocation[])
  .filter((cl) => cl.status === 200 && !cl.redirectsTo)
  .filter((cl) => !IS_STATIC_PREVIEW || PREVIEW_CITIES.has(cl.path.split("/")[4]))
  .flatMap((cl) => {
    const [, , category, slug, loc] = cl.path.split("/");
    const course = courseByPath.get(`/courses/${category}/${slug}`);
    if (!course) return [];
    const location = locationBySlug.get(loc);
    return [{
      path: cl.path,
      coursePath: course.path,
      locationSlug: loc,
      locationName: location?.name ?? cleanText(loc.replace(/-/g, " ")).replace(/\b\w/g, (m) => m.toUpperCase()),
      h1: cleanText(cl.h1),
      meta: cleanMeta(cl.meta),
      classroom: sessions(cl.classroom),
    }];
  });
const courseLocationByPath = new Map(courseLocations.map((cl) => [cl.path, cl]));

// ---------------------------------------------------------------- accessors
export const getCourses = () => courses;
export const getCourse = (category: string, slug: string) => courseByPath.get(`/courses/${category}/${slug}`);
export const getCourseByPath = (path: string) => courseByPath.get(path);
export const getCategories = () => categories;
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getCategoryCourses = (cat: Category) =>
  cat.courseSlugs.map((s) => courseByPath.get(`${cat.path}/${s}`)).filter((c): c is Course => Boolean(c));
export const getLocations = () => locations;
export const getLocation = (slug: string) => locationBySlug.get(slug);
export const getCourseLocations = () => courseLocations;
export const getCourseLocation = (path: string) => courseLocationByPath.get(path);
export const getCourseLocationsFor = (course: Course) => courseLocations.filter((cl) => cl.coursePath === course.path);
export const getOnlineCourses = () => online;
export const getOnlineCourse = (slug: string) => online.find((o) => o.slug === slug);
export const onlineHub = {
  meta: cleanMeta(rawOnline.hub.meta as Meta),
  h1: cleanText(rawOnline.hub.h1),
  intro: cleanText(rawOnline.hub.intro),
};

export function getRelatedCourses(course: Course, limit = 3) {
  const explicit = course.related.map((p) => courseByPath.get(p)).filter((c): c is Course => Boolean(c));
  const sameCategory = courses.filter((c) => c.category === course.category && c.path !== course.path);
  const out: Course[] = [];
  for (const c of [...explicit, ...sameCategory]) {
    if (!out.some((o) => o.path === c.path)) out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

/** Upcoming sessions across every course, soonest first. */
export function getUpcomingSessions(limit = 8) {
  return courses
    .flatMap((c) => [...c.classroom, ...c.virtual].map((s) => ({ ...s, course: c })))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export const FEATURED_COURSE_PATHS = [
  "/courses/lean-six-sigma-training/green-belt",
  "/courses/lean-six-sigma-training/yellow-belt",
  "/courses/lean-six-sigma-training/black-belt",
  "/courses/six-sigma-training/green-belt",
  "/courses/lean-training/lean-practitioner",
  "/courses/kaizen-training/certified-kaizen-foundation",
];
export const getFeaturedCourses = () => FEATURED_COURSE_PATHS.map((p) => courseByPath.get(p)).filter((c): c is Course => Boolean(c));

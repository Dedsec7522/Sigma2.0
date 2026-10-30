import "server-only";
import { getCategories, getCourses, getOnlineCourses } from "./catalog";
import { SITE } from "./site";
import type { CourseIndexEntry } from "./types";

let cached: CourseIndexEntry[] | null = null;

export function getCourseIndex(): CourseIndexEntry[] {
  if (cached) return cached;
  const categories = new Map(getCategories().map((c) => [c.slug, c.name]));
  const online = new Map(getOnlineCourses().map((o) => [o.slug, o]));
  cached = getCourses().map((c) => {
    const o = c.onlineCourseSlug ? online.get(c.onlineCourseSlug) : undefined;
    const dates = [...c.classroom, ...c.virtual].map((s) => s.date).sort();
    return {
      path: c.path,
      name: c.name,
      category: c.category,
      categoryName: categories.get(c.category) ?? c.category,
      level: c.level,
      duration: c.duration,
      durationDays: c.durationDays,
      methods: c.deliveryMethods,
      fromPrice: SITE.showPrices ? c.fromPrice : null,
      onlinePath: o?.path ?? null,
      onlinePrice: SITE.showPrices ? (o?.price ?? null) : null,
      examIncluded: c.examIncluded,
      summary: c.summary,
      audience: c.audience,
      prerequisites: c.prerequisites,
      nextDate: dates[0] ?? null,
      keywords: [c.name, c.meta.title, ...c.bullets].join(" ").toLowerCase(),
    };
  });
  return cached;
}

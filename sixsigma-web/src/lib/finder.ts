import "server-only";
import { toCard } from "@/components/CourseCard";
import type { FinderCourse } from "@/components/course/CourseFinder";
import { getCategories } from "./catalog";
import type { Course } from "./types";

export function toFinder(courses: Course[]): FinderCourse[] {
  const names = new Map(getCategories().map((c) => [c.slug, c.name]));
  return courses.map((c) => ({
    ...toCard(c),
    category: c.category,
    categoryName: names.get(c.category) ?? c.category,
    methods: c.deliveryMethods,
    durationDays: c.durationDays,
    keywords: [c.name, c.meta.title, ...c.bullets].join(" ").toLowerCase(),
  }));
}

// Invariants on the real scraped catalogue (src/data). These catch scraper or
// data-layer regressions before they reach the site.
import { describe, expect, it } from "vitest";
import { getCourse, getCourses, getOnlineCourses } from "./catalog";
import { courseSchema } from "./schema";

const today = new Date().toISOString().slice(0, 10);

describe("catalogue", () => {
  const courses = getCourses();

  it("has the full course list", () => {
    expect(courses.length).toBeGreaterThanOrEqual(40);
  });

  it("derives delivery methods from real schedules", () => {
    for (const c of courses) {
      expect(c.deliveryMethods).toContain("onsite");
      expect(c.deliveryMethods.includes("online")).toBe(Boolean(c.onlineCourseSlug));
      if (c.virtual.length) expect(c.deliveryMethods).toContain("virtual");
      if (c.classroom.length) expect(c.deliveryMethods).toContain("classroom");
    }
    // The scraped tab bar claimed self-paced for every course; only some really have it.
    expect(courses.filter((c) => c.deliveryMethods.includes("online")).length).toBe(getOnlineCourses().filter((o) => courses.some((c) => c.onlineCourseSlug === o.slug)).length);
  });

  it("merges city-page dates beyond the 10 shown on a course page", () => {
    const green = getCourse("lean-six-sigma-training", "green-belt")!;
    expect(green.classroom.length).toBeGreaterThan(10);
    expect(new Set(green.classroom.map((s) => s.bookingUrl)).size).toBe(green.classroom.length);
  });

  it("never lists a session that has already started", () => {
    for (const c of courses) for (const s of [...c.classroom, ...c.virtual]) expect(s.date >= today).toBe(true);
  });

  it("uses the lowest scheduled price as the 'from' price", () => {
    for (const c of courses) {
      const prices = [...c.classroom, ...c.virtual].map((s) => s.price).filter((p): p is number => !!p && p > 0);
      expect(c.fromPrice).toBe(prices.length ? Math.min(...prices) : null);
    }
  });
});

describe("course structured data", () => {
  it("uses ISO 8601 workloads and always has a course instance", () => {
    for (const c of getCourses()) {
      const data = courseSchema(c) as { hasCourseInstance: { courseWorkload?: string }[]; provider: { url?: string } };
      expect(data.hasCourseInstance.length).toBeGreaterThan(0);
      for (const i of data.hasCourseInstance) if (i.courseWorkload) expect(i.courseWorkload).toMatch(/^P\d+D$/);
      expect(data.provider.url).toBeTruthy();
    }
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { nextQuestion, nextUpcomingDate, recommend, topicFromText } from "./advisor";
import type { CourseIndexEntry } from "./types";

const course = (over: Partial<CourseIndexEntry> & Pick<CourseIndexEntry, "path" | "name" | "category" | "level">): CourseIndexEntry => ({
  categoryName: "Lean Six Sigma Training",
  duration: "2 Days",
  durationDays: 2,
  methods: ["classroom", "virtual", "onsite"],
  fromPrice: 1000,
  onlinePath: null,
  onlinePrice: null,
  examIncluded: true,
  summary: "",
  audience: null,
  prerequisites: null,
  nextDate: "2026-11-10",
  upcomingDates: ["2026-11-10", "2027-01-12"],
  keywords: over.name.toLowerCase(),
  ...over,
});

const INDEX: CourseIndexEntry[] = [
  course({ path: "/courses/lean-six-sigma-training/yellow-belt", name: "Lean Six Sigma Yellow Belt", category: "lean-six-sigma-training", level: "foundation", onlinePath: "/online-course/lean-six-sigma-yellow-belt" }),
  course({ path: "/courses/lean-six-sigma-training/green-belt", name: "Lean Six Sigma Green Belt", category: "lean-six-sigma-training", level: "intermediate", durationDays: 5, duration: "5 Days" }),
  course({ path: "/courses/lean-six-sigma-training/black-belt-upgrade", name: "Lean Six Sigma Black Belt Upgrade", category: "lean-six-sigma-training", level: "advanced", durationDays: 5 }),
  course({ path: "/courses/business-improvement-tools/tableau-training", name: "Tableau Training", category: "business-improvement-tools", level: "foundation", methods: ["onsite"] }),
];

afterEach(() => vi.useRealTimers());

describe("recommend", () => {
  it("recommends the fundamentals to a beginner", () => {
    const r = recommend({ topic: "lean-six-sigma", goal: "basics", experience: "none", audience: "me", format: "any" }, INDEX);
    expect(r.primary?.course.path).toBe("/courses/lean-six-sigma-training/yellow-belt");
  });

  it("sends Green Belt holders to the Black Belt upgrade", () => {
    const r = recommend({ topic: "lean-six-sigma", goal: "lead", experience: "green", audience: "me", format: "any" }, INDEX);
    expect(r.primary?.course.path).toBe("/courses/lean-six-sigma-training/black-belt-upgrade");
  });

  it("links to the self-paced version when that format is chosen", () => {
    const r = recommend({ topic: "lean-six-sigma", goal: "basics", experience: "none", audience: "me", format: "online" }, INDEX);
    expect(r.primary?.href).toBe("/online-course/lean-six-sigma-yellow-belt");
  });

  it("returns no match rather than a course in the wrong format", () => {
    const r = recommend({ topic: "data-tools", tool: "tableau", goal: "projects", experience: "some", audience: "me", format: "online" }, INDEX);
    expect(r.primary).toBeNull();
  });

  it("only ever returns courses from the catalogue it was given", () => {
    const paths = new Set(INDEX.map((c) => c.path));
    const r = recommend({ topic: "lean-six-sigma", goal: "certify", experience: "some", audience: "team", format: "any" }, INDEX);
    for (const rec of [r.primary, ...r.alternatives, ...r.candidates]) if (rec) expect(paths.has(rec.course.path)).toBe(true);
  });
});

describe("nextUpcomingDate", () => {
  it("skips dates that passed after the index was built", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-01T12:00:00Z"));
    expect(nextUpcomingDate({ nextDate: "2026-11-10", upcomingDates: ["2026-11-10", "2027-01-12"] })).toBe("2027-01-12");
  });

  it("returns null when every date has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-06-01T12:00:00Z"));
    expect(nextUpcomingDate({ nextDate: "2026-11-10", upcomingDates: ["2026-11-10"] })).toBeNull();
  });

  it("does not count a past date as 'starting soon'", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-06-01T12:00:00Z"));
    const r = recommend({ topic: "lean-six-sigma", goal: "basics", experience: "none", audience: "me", format: "classroom", timing: "soon" }, INDEX);
    expect(r.primary?.reasons.some((x) => x.startsWith("Scheduled dates"))).toBe(false);
  });
});

describe("questions and free text", () => {
  it("only offers formats that the matching courses actually run", () => {
    const q = nextQuestion({ topic: "data-tools", tool: "tableau", goal: "projects", experience: "some", audience: "me" }, INDEX);
    expect(q?.id).toBe("format");
    expect(q?.options.map((o) => o.value)).not.toContain("classroom");
  });

  it("maps free text to a topic", () => {
    expect(topicFromText("I want to become a scrum master").topic).toBe("agile");
    expect(topicFromText("We need Power BI dashboards")).toMatchObject({ topic: "data-tools", tool: "power-bi" });
  });
});

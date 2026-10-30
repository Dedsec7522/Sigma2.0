import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { buttonClass } from "@/components/ui/button";
import { CourseFinder } from "@/components/course/CourseFinder";
import { AdvisorButton } from "@/components/advisor/AdvisorButton";
import { getCategories, getCategoryCourses } from "@/lib/catalog";
import { toFinder } from "@/lib/finder";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: { absolute: "Six Sigma Courses | Lean Six Sigma, Lean & Kaizen Training UK" },
  description: "Browse every Six Sigma, Lean Six Sigma, Lean, Kaizen and business improvement course we run across the UK. Compare levels, durations, dates and delivery options.",
  alternates: { canonical: "/courses" },
};

export default function CoursesPage() {
  const categories = getCategories();
  const courses = categories.flatMap(getCategoryCourses);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
  ];
  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), itemListSchema(courses.map((c) => ({ name: c.name, path: c.path })), "Six Sigma training courses")]} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Course library"
        title="Find your course"
        lead={`${courses.length} professional courses across ${categories.length} disciplines, from one-day introductions to Master Black Belt. Filter by level, delivery and topic, or let our Course Advisor recommend one.`}
      >
        <AdvisorButton className={buttonClass("gold", "md")}>Get a recommendation</AdvisorButton>
      </PageHero>
      <div className="container-page -mt-8 pb-20">
        <CourseFinder courses={toFinder(courses)} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </div>
    </>
  );
}

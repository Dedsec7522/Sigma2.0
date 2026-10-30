import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePage } from "@/components/course/CoursePage";
import { getCourseByPath, getCourseLocation, getCourseLocations } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourseLocations().map((cl) => {
    const [, , category, course, location] = cl.path.split("/");
    return { category, course, location };
  });
}

async function load(params: PageProps<"/courses/[category]/[course]/[location]">["params"]) {
  const { category, course, location } = await params;
  const cl = getCourseLocation(`/courses/${category}/${course}/${location}`);
  const c = cl ? getCourseByPath(cl.coursePath) : undefined;
  return cl && c ? { cl, course: c } : null;
}

export async function generateMetadata({ params }: PageProps<"/courses/[category]/[course]/[location]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { cl, course } = data;
  const title = cl.meta.title || `${course.name} Training in ${cl.locationName}`;
  const description = cl.meta.description || `${course.name} training in ${cl.locationName}. ${course.duration ?? ""} course with dates, prices and booking.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: cl.path },
    openGraph: { title, description, url: cl.path, type: "website" },
  };
}

export default async function Page({ params }: PageProps<"/courses/[category]/[course]/[location]">) {
  const data = await load(params);
  if (!data) notFound();
  return <CoursePage course={data.course} location={data.cl} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePage } from "@/components/course/CoursePage";
import { getCourse, getCourses } from "@/lib/catalog";
import { truncate } from "@/lib/text";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().map((c) => ({ category: c.category, course: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[category]/[course]">): Promise<Metadata> {
  const { category, course: slug } = await params;
  const course = getCourse(category, slug);
  if (!course) return {};
  return {
    title: { absolute: course.meta.title || `${course.name} | Six Sigma Training` },
    description: course.meta.description || truncate(course.summary, 158),
    alternates: { canonical: course.path },
    openGraph: { title: course.meta.title || course.name, description: course.meta.description || course.summary, url: course.path, type: "website" },
  };
}

export default async function Page({ params }: PageProps<"/courses/[category]/[course]">) {
  const { category, course: slug } = await params;
  const course = getCourse(category, slug);
  if (!course) notFound();
  return <CoursePage course={course} />;
}

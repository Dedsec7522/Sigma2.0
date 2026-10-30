import type { MetadataRoute } from "next";
import { getCategories, getCourseLocations, getCourses, getLocations, getOnlineCourses } from "@/lib/catalog";
import { getBlogCategories, getPosts } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Lists every indexable URL the site serves. Unlike the legacy sitemap, it omits
// the 163 URLs that only redirect, so crawlers spend their budget on real pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date | string = now) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  });

  const statics = ["/about-us", "/clients", "/testimonial", "/careers", "/onsite", "/resources", "/contact", "/terms", "/privacy-policy", "/cookies"];

  return [
    entry("/", 1, "daily"),
    entry("/courses", 0.9, "daily"),
    ...getCategories().map((c) => entry(c.path, 0.9, "weekly")),
    ...getCourses().map((c) => entry(c.path, 0.9, "daily")),
    entry("/online-training/six-sigma", 0.8, "weekly"),
    ...getOnlineCourses().map((o) => entry(o.path, 0.8, "weekly")),
    entry("/locations", 0.7, "monthly"),
    ...getLocations().map((l) => entry(l.path, 0.6, "monthly")),
    ...getCourseLocations().map((cl) => entry(cl.path, 0.6, "daily")),
    entry("/blog", 0.7, "weekly"),
    ...getBlogCategories().map((c) => entry(c.path, 0.4, "weekly")),
    ...getPosts().map((p) => entry(p.path, 0.6, "monthly", p.date ?? now)),
    ...statics.map((s) => entry(s, s.startsWith("/terms") || s.startsWith("/privacy") || s.startsWith("/cookies") ? 0.2 : 0.5, "monthly")),
  ];
}

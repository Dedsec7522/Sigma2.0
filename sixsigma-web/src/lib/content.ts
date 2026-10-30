import "server-only";
import rawBlog from "@/data/blog.json";
import rawBlogCategories from "@/data/blog-categories.json";
import rawPages from "@/data/pages.json";
import { cleanHtml, cleanText, stripTags, truncate } from "./text";
import { legacyUrl } from "./site";

type Meta = { title: string; description: string; keywords: string };

// ---------------------------------------------------------------- blog
type RawPost = {
  path: string; slug: string; status: number; meta?: Meta; title?: string; date?: string | null;
  image?: string | null; bodyHtml?: string; readingMinutes?: number; listPage?: number | null;
};

export type Post = {
  slug: string;
  path: string;
  title: string;
  meta: { title: string; description: string };
  date: string | null;
  image: string | null;
  author: string | null;
  bodyHtml: string;
  excerpt: string;
  readingMinutes: number;
  headings: { id: string; text: string }[];
};

const slugify = (s: string) => s.toLowerCase().replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function preparePost(p: RawPost): Post {
  let html = cleanHtml(p.bodyHtml);
  // Legacy layout: date icon, author name, then the hero image, all inside the body.
  html = html.replace(/^\s*<img[^>]*alt="date"[^>]*\/?>\s*/i, "");
  let author: string | null = null;
  const authorMatch = html.match(/^\s*<p>([^<]{2,40})<\/p>\s*/);
  if (authorMatch && !/[.!?]$/.test(authorMatch[1].trim())) {
    author = cleanText(authorMatch[1]);
    html = html.slice(authorMatch[0].length);
  }
  if (p.image) {
    const esc = p.image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`^\\s*<img[^>]*src="${esc}"[^>]*\\/?>\\s*`), "");
  }
  // Demote any h1 in body content and give h2s anchors for the table of contents.
  html = html.replace(/<h1>/g, "<h2>").replace(/<\/h1>/g, "</h2>");
  const headings: Post["headings"] = [];
  const used = new Set<string>();
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = stripTags(inner);
    let id = slugify(text) || "section";
    while (used.has(id)) id += "-2";
    used.add(id);
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  const plain = stripTags(html);
  const title = cleanText(p.title) || cleanText(p.meta?.title);
  // Some legacy posts have placeholder descriptions ("<p>", or just the title); use the opening text instead.
  const legacyDescription = cleanText(p.meta?.description);
  const description = legacyDescription.length >= 50 && !legacyDescription.includes("<") ? legacyDescription : truncate(plain, 155);
  return {
    slug: p.slug,
    path: p.path,
    title,
    meta: { title: cleanText(p.meta?.title) || title, description },
    date: p.date ?? null,
    image: p.image ?? null,
    author,
    bodyHtml: html,
    excerpt: truncate(plain, 180),
    readingMinutes: Math.max(1, Math.round(plain.split(" ").length / 220)),
    headings,
  };
}

const posts: Post[] = (rawBlog.posts as RawPost[])
  .filter((p) => p.status === 200 && (p.title || p.meta?.title))
  .map(preparePost)
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

export const getPosts = () => posts;

type RawBlogCategory = { path: string; slug: string; status: number; meta: Meta; h1: string; posts: string[] };
const blogCategories = (rawBlogCategories as RawBlogCategory[])
  .filter((c) => c.status === 200)
  .map((c) => ({
    slug: c.slug,
    path: c.path,
    h1: cleanText(c.h1),
    meta: { title: cleanText(c.meta.title), description: cleanText(c.meta.description) },
    posts: c.posts.map((s) => posts.find((p) => p.slug === s)).filter((p): p is Post => Boolean(p)),
  }));
export const getBlogCategories = () => blogCategories;
export const getBlogCategory = (slug: string) => blogCategories.find((c) => c.slug === slug);
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const BLOG_PAGE_SIZE = 9;

// ---------------------------------------------------------------- legacy static pages
type RawPage = { path: string; meta: Meta; h1: string; sections: { class: string; text: string; html: string }[] };
const pages = rawPages as RawPage[];
const page = (path: string) => pages.find((p) => p.path === path)!;

export const pageMeta = (path: string) => {
  const p = page(path);
  return { title: cleanText(p.meta.title), description: cleanText(p.meta.description) };
};

/** Legal pages are rendered verbatim from the legacy CMS (with encoding repaired). */
export function legalHtml(path: "/terms" | "/privacy-policy" | "/cookies") {
  const sec = page(path).sections.find((s) => s.class.includes("quick-links"));
  return cleanHtml(sec?.html ?? "")
    .replace(/^<h2>[^<]*<\/h2>\s*/, "")
    .replace(/(<h3>Who we are<\/h3>\s*){2,}/, "<h3>Who we are</h3>");
}

export type ClientGroup = { sector: string; clients: string[] };

export function clientGroups(): ClientGroup[] {
  const html = cleanHtml(page("/clients").sections.find((s) => s.class.includes("client "))?.html ?? "");
  const groups: ClientGroup[] = [];
  const re = /<h3>([^<]+)<\/h3>\s*<ul>([\s\S]*?)<\/ul>/g;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const clients = [...m[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => stripTags(x[1])).filter(Boolean);
    if (clients.length) groups.push({ sector: cleanText(m[1]), clients });
  }
  return groups;
}

export function downloadableResources() {
  const html = page("/resources").sections.find((s) => s.class.includes("resources"))?.html ?? "";
  return [...html.matchAll(/<a href="([^"]+)">([\s\S]*?)<img/g)].map((m) => ({
    href: legacyUrl(m[1])!,
    title: cleanText(m[2]).replace(/^Download our latest\s*/i, "").replace(/\s*resources$/i, "").replace(/\s*Training$/i, ""),
    format: (m[1].split(".").pop() ?? "").toUpperCase(),
  }));
}

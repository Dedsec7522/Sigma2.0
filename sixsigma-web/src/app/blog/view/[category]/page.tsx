import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Suspense } from "react";
import { Pagination, PostGrid, pageFrom, toSummary } from "@/components/blog/BlogList";
import { ClientPagedPosts } from "@/components/blog/ClientPagedPosts";
import { IS_STATIC_PREVIEW } from "@/lib/site";
import { BLOG_PAGE_SIZE, getBlogCategories, getBlogCategory } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
  return getBlogCategories().map((c) => ({ category: c.slug }));
}

// The static preview cannot read ?page= on the server (see ClientPagedPosts).
const readPage = async (sp: PageProps<"/blog/view/[category]">["searchParams"]) => (IS_STATIC_PREVIEW ? undefined : (await sp).page);

// Legacy blog category listing (e.g. /blog/view/lean-six-sigma-training), paginated with ?page=.
export async function generateMetadata({ params, searchParams }: PageProps<"/blog/view/[category]">): Promise<Metadata> {
  const cat = getBlogCategory((await params).category);
  if (!cat) return {};
  const pages = Math.ceil(cat.posts.length / BLOG_PAGE_SIZE);
  const page = pageFrom(await readPage(searchParams), pages);
  return {
    title: { absolute: page > 1 ? `${cat.meta.title} – Page ${page}` : cat.meta.title },
    description: cat.meta.description,
    alternates: { canonical: page > 1 ? `${cat.path}?page=${page}` : cat.path },
  };
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps<"/blog/view/[category]">) {
  const cat = getBlogCategory((await params).category);
  if (!cat) notFound();
  const pages = Math.ceil(cat.posts.length / BLOG_PAGE_SIZE);
  const page = pageFrom(await readPage(searchParams), pages);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: cat.h1 || "Articles", path: cat.path },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="Insights" title={cat.h1 || "Six Sigma and Lean blogs"} lead={cat.meta.description} />
      <section aria-label={`Articles, page ${page} of ${pages}`} className="container-page py-14">
        {IS_STATIC_PREVIEW ? (
          <Suspense fallback={<PostGrid posts={cat.posts.slice(0, BLOG_PAGE_SIZE).map(toSummary)} />}>
            <ClientPagedPosts posts={cat.posts.map(toSummary)} pageSize={BLOG_PAGE_SIZE} basePath={cat.path} label="Article pages" />
          </Suspense>
        ) : (
          <>
            <PostGrid posts={cat.posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE)} />
            <Pagination page={page} pages={pages} basePath={cat.path} label="Article pages" />
          </>
        )}
      </section>
    </>
  );
}

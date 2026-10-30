import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Suspense } from "react";
import { Pagination, PostGrid, pageFrom, toSummary } from "@/components/blog/BlogList";
import { ClientPagedPosts } from "@/components/blog/ClientPagedPosts";
import { BLOG_PAGE_SIZE, getPosts } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { formatDate, IS_STATIC_PREVIEW } from "@/lib/site";

// The static preview cannot read ?page= on the server (see ClientPagedPosts).
const readPage = async (sp: PageProps<"/blog">["searchParams"]) => (IS_STATIC_PREVIEW ? undefined : (await sp).page);


export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const pages = Math.ceil(getPosts().length / BLOG_PAGE_SIZE);
  const page = pageFrom(await readPage(searchParams), pages);
  return {
    title: { absolute: page > 1 ? `Six Sigma Blog – Page ${page} | SixSigma.co.uk` : "Six Sigma Blog | Lean Six Sigma Guides & Insights | SixSigma.co.uk" },
    description: "Guides, comparisons and career advice on Six Sigma, Lean Six Sigma, Lean and Kaizen from the UK's Six Sigma training specialists.",
    alternates: { canonical: page > 1 ? `/blog?page=${page}` : "/blog" },
  };
}

export default async function BlogIndex({ searchParams }: PageProps<"/blog">) {
  const posts = getPosts();
  const pages = Math.ceil(posts.length / BLOG_PAGE_SIZE);
  const page = pageFrom(await readPage(searchParams), pages);
  const slice = posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  const [lead, ...rest] = slice;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="Insights" title="The Six Sigma blog" lead="Practical guides, comparisons and career advice on Six Sigma, Lean and continuous improvement." />

      <section aria-label={`Articles, page ${page} of ${pages}`} className="container-page py-14">
        {lead && page === 1 && (
          <Link href={lead.path} className="group grid overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-shadow hover:shadow-lift md:grid-cols-2">
            {lead.image && (
              <span className="relative aspect-[16/10] bg-navy-50 md:aspect-auto">
                <Image src={lead.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" priority />
              </span>
            )}
            <span className="flex flex-col justify-center p-7 md:p-10">
              <span className="eyebrow">Latest article</span>
              <span className="mt-3 font-display text-2xl font-semibold !leading-tight text-navy-900 md:text-3xl">{lead.title}</span>
              <span className="mt-3 line-clamp-3 text-ink-muted">{lead.excerpt}</span>
              <span className="mt-5 text-sm text-ink-subtle">
                {lead.date && formatDate(lead.date)} · {lead.readingMinutes} min read
              </span>
            </span>
          </Link>
        )}

        <div className="mt-10">
          {IS_STATIC_PREVIEW ? (
            <Suspense fallback={<PostGrid posts={rest.map(toSummary)} />}>
              <ClientPagedPosts posts={posts.slice(1).map(toSummary)} pageSize={BLOG_PAGE_SIZE} basePath="/blog" label="Blog pages" />
            </Suspense>
          ) : (
            <>
              <PostGrid posts={page === 1 ? rest : slice} />
              <Pagination page={page} pages={pages} basePath="/blog" label="Blog pages" />
            </>
          )}
        </div>
      </section>
    </>
  );
}

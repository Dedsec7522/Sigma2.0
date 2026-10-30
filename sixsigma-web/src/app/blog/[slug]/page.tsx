import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { buttonClass } from "@/components/ui/button";
import { AdvisorButton } from "@/components/advisor/AdvisorButton";
import { getPost, getPosts } from "@/lib/content";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { formatDate } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  return {
    title: { absolute: p.meta.title },
    description: p.meta.description,
    alternates: { canonical: p.path },
    openGraph: { type: "article", title: p.meta.title, description: p.meta.description, url: p.path, ...(p.date ? { publishedTime: p.date } : {}), ...(p.image ? { images: [p.image] } : {}) },
  };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const posts = getPosts();
  const i = posts.findIndex((x) => x.slug === p.slug);
  const more = [posts[i + 1], posts[i + 2], posts[i - 1]].filter(Boolean).slice(0, 3);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: p.title, path: p.path },
  ];

  return (
    <>
      <JsonLd data={[articleSchema({ title: p.title, description: p.meta.description, path: p.path, date: p.date, image: p.image, author: p.author }), breadcrumbSchema(crumbs)]} />
      <article>
        <header className="border-b border-line bg-white">
          <div className="container-page max-w-4xl py-10 md:py-14">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-8 text-[2rem] font-semibold sm:text-[2.6rem]">{p.title}</h1>
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-muted">
              {p.author && <span className="font-semibold text-navy-900">{p.author}</span>}
              {p.date && <time dateTime={p.date}>{formatDate(p.date, { day: "numeric", month: "long", year: "numeric" })}</time>}
              <span>{p.readingMinutes} min read</span>
            </p>
          </div>
          {p.image && (
            <div className="container-page max-w-5xl pb-10">
              <div className="relative aspect-[16/8] overflow-hidden rounded-3xl bg-navy-50">
                <Image src={p.image} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
              </div>
            </div>
          )}
        </header>

        <div className="container-page grid max-w-6xl gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="prose-content min-w-0 text-[1.0938rem] leading-[1.75]" dangerouslySetInnerHTML={{ __html: p.bodyHtml }} />
          <aside className="hidden lg:block" aria-label="Article tools">
            <div className="sticky top-[calc(var(--header-h)+1.5rem)] space-y-6">
              {p.headings.length > 2 && (
                <nav aria-label="Contents">
                  <p className="font-display text-sm font-semibold uppercase tracking-wider text-ink-subtle">Contents</p>
                  <ol className="mt-3 space-y-2 border-l border-line">
                    {p.headings.slice(0, 14).map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent pl-4 text-sm text-ink-muted hover:border-navy-900 hover:text-navy-900">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div className="on-dark rounded-2xl bg-navy-900 p-5 text-white">
                <p className="font-display font-semibold">Ready to get certified?</p>
                <p className="mt-1.5 text-sm text-white/75">Our Course Advisor will match you to the right course in a minute.</p>
                <AdvisorButton className={buttonClass("gold", "sm", "mt-4 w-full")}>Find my course</AdvisorButton>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-h" className="border-t border-line bg-white py-14">
          <div className="container-page">
            <h2 id="more-h" className="text-[1.6rem] font-semibold">
              More articles
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((m) => (
                <li key={m.path}>
                  <Link href={m.path} className="group block">
                    <span className="relative block aspect-[16/9] overflow-hidden rounded-2xl bg-navy-50">
                      {m.image && <Image src={m.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                    </span>
                    <span className="mt-4 block font-display text-lg font-semibold !leading-snug text-navy-900 group-hover:underline">{m.title}</span>
                    {m.date && <span className="mt-1 block text-sm text-ink-subtle">{formatDate(m.date)}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

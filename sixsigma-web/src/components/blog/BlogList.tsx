import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import type { Post } from "@/lib/content";
import { formatDate } from "@/lib/site";

export const pageFrom = (v: string | string[] | undefined, max: number) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : 1;
};

export type PostSummary = Pick<Post, "path" | "title" | "date" | "image" | "excerpt" | "readingMinutes">;
export const toSummary = (p: Post): PostSummary => ({ path: p.path, title: p.title, date: p.date, image: p.image, excerpt: p.excerpt, readingMinutes: p.readingMinutes });

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <li key={p.path}>
          <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lift">
            <span className="relative block aspect-[16/9] bg-navy-50">
              {p.image && <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />}
            </span>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-sm text-ink-subtle">
                {p.date && <time dateTime={p.date}>{formatDate(p.date)}</time>} · {p.readingMinutes} min read
              </p>
              <h2 className="mt-2 text-lg font-semibold !leading-snug">
                <Link href={p.path} className="after:absolute after:inset-0">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 line-clamp-3 text-[0.95rem] text-ink-muted">{p.excerpt}</p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function Pagination({ page, pages, basePath, label }: { page: number; pages: number; basePath: string; label: string }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);
  return (
    <nav aria-label={label} className="mt-12 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className="flex h-10 items-center gap-1 rounded-full px-4 text-sm font-semibold text-navy-900 hover:bg-navy-50">
          <CaretLeft aria-hidden size={14} /> Previous
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1)
        .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
        .map((n, i, arr) => (
          <span key={n} className="flex items-center gap-1.5">
            {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-ink-subtle">…</span>}
            <Link
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              className={`grid size-10 place-items-center rounded-full text-sm font-semibold tabular-nums ${n === page ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-navy-50"}`}
            >
              {n}
            </Link>
          </span>
        ))}
      {page < pages && (
        <Link href={href(page + 1)} rel="next" className="flex h-10 items-center gap-1 rounded-full px-4 text-sm font-semibold text-navy-900 hover:bg-navy-50">
          Next <CaretRight aria-hidden size={14} />
        </Link>
      )}
    </nav>
  );
}

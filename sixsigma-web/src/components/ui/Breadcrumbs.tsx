import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import type { Crumb } from "@/lib/schema";

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-white/70 hover:text-white" : "text-ink-muted hover:text-navy-900";
  const current = tone === "dark" ? "text-white" : "text-navy-900";
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={`font-medium ${current}`}>
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className={`transition-colors ${muted}`}>
                    {c.name}
                  </Link>
                  <CaretRight aria-hidden size={12} className={tone === "dark" ? "text-white/40" : "text-ink-subtle"} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

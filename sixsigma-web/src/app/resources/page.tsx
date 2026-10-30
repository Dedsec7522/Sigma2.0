import type { Metadata } from "next";
import { DownloadSimple, FileImage, FilePdf } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { downloadableResources, pageMeta } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

const m = pageMeta("/resources");
export const metadata: Metadata = {
  title: { absolute: m.title || "Free Six Sigma Resources | SixSigma.co.uk" },
  description: m.description || "Free Six Sigma, Lean and Kaizen training resources to download.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  const items = downloadableResources();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} eyebrow="Free resources" title="Six Sigma resources" lead="Free training resources for Six Sigma, Lean and Kaizen, ready to download." />
      <section aria-label="Downloads" className="container-page py-14 md:py-20">
        <RevealGroup as="ul" className="grid gap-4 md:grid-cols-2">
          {items.map((r) => {
            const Icon = r.format === "PDF" ? FilePdf : FileImage;
            return (
              <RevealItem as="li" key={r.href}>
                <a href={r.href} className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-[border-color,box-shadow] hover:border-navy-100 hover:shadow-card" download>
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                    <Icon aria-hidden size={24} weight="duotone" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-navy-900">{r.title}</span>
                    <span className="text-sm text-ink-muted">{r.format} download</span>
                  </span>
                  <DownloadSimple aria-hidden size={20} className="text-ink-subtle transition-transform group-hover:translate-y-0.5 group-hover:text-navy-900" />
                </a>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>
    </>
  );
}

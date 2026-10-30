import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { legalHtml } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

export function LegalPage({ path, title, lead }: { path: "/terms" | "/privacy-policy" | "/cookies"; title: string; lead: string }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero crumbs={crumbs} title={title} lead={lead} />
      <div className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-white p-6 sm:p-10">
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: legalHtml(path) }} />
        </div>
      </div>
    </>
  );
}

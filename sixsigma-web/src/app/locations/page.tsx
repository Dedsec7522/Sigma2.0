import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { getLocations, locationsIndex, popularLocationSlugs } from "@/lib/catalog";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: { absolute: locationsIndex.meta.title || "Six Sigma Training Locations Across the UK" },
  description: locationsIndex.meta.description,
  alternates: { canonical: "/locations" },
};

export default function LocationsPage() {
  const locations = getLocations();
  const popular = popularLocationSlugs.map((s) => locations.find((l) => l.slug === s)!).filter(Boolean);
  const groups = new Map<string, typeof locations>();
  for (const l of locations) {
    const k = l.name[0].toUpperCase();
    groups.set(k, [...(groups.get(k) ?? []), l]);
  }
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        crumbs={crumbs}
        eyebrow={`${locations.length} UK locations`}
        title={locationsIndex.h1 || "Six Sigma training locations"}
        lead="We use modern, accessible training venues in major cities across the UK, with good transport links and accommodation nearby. We can also bring the classroom to a location of your choice."
      />

      <section aria-labelledby="pop-h" className="container-page py-14">
        <h2 id="pop-h" className="text-[1.6rem] font-semibold">
          Most popular locations
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {popular.map((l) => (
            <li key={l.slug}>
              <Link href={l.path} className="group flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-4 font-semibold text-navy-900 shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lift">
                <MapPin aria-hidden size={18} weight="duotone" className="text-brand-600" /> {l.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="az-h" className="border-t border-line bg-white py-14">
        <div className="container-page">
          <h2 id="az-h" className="text-[1.6rem] font-semibold">
            All locations A–Z
          </h2>
          <nav aria-label="Jump to letter" className="mt-5 flex flex-wrap gap-1.5">
            {[...groups.keys()].map((k) => (
              <a key={k} href={`#loc-${k}`} className="grid size-9 place-items-center rounded-lg border border-line text-sm font-semibold text-navy-900 hover:bg-navy-50">
                {k}
              </a>
            ))}
          </nav>
          <div className="mt-10 columns-2 gap-10 sm:columns-3 lg:columns-4">
            {[...groups.entries()].map(([k, list]) => (
              <Reveal key={k} className="mb-8 break-inside-avoid">
                <h3 id={`loc-${k}`} className="scroll-mt-28 border-b border-line pb-2 text-lg font-semibold text-brand-700">
                  {k}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {list.map((l) => (
                    <li key={l.slug}>
                      <Link href={l.path} className="text-ink-muted transition-colors hover:text-navy-900 hover:underline">
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

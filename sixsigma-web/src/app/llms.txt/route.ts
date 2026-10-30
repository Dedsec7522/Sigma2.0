import { getCategories, getCategoryCourses, getOnlineCourses } from "@/lib/catalog";
import { LEVEL_LABEL, METHOD_LABEL } from "@/lib/types";
import { absoluteUrl, formatPrice, SITE } from "@/lib/site";

// llms.txt (llmstxt.org): a plain-text map of the site for AI assistants. It
// complements, and never replaces, the sitemap, structured data and HTML.
export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    `# ${SITE.brand}`,
    "",
    `> ${SITE.description} Operated by ${SITE.legalName} (founded ${SITE.foundingYear}, Maidenhead, UK).`,
    "",
    "Key facts:",
    "- Delivery: classroom (over 90 UK locations), live online instructor-led, self-paced online, and onsite for teams.",
    "- Six Sigma and Lean Six Sigma belt courses include exams.",
    `- Contact: ${SITE.phoneDisplay} (from abroad ${SITE.phone}), ${SITE.email}.`,
    "- Prices are in GBP and confirmed at booking.",
    "",
  ];
  for (const cat of getCategories()) {
    lines.push(`## ${cat.name}`, "");
    for (const c of getCategoryCourses(cat)) {
      const facts = [
        LEVEL_LABEL[c.level],
        c.duration,
        c.examIncluded ? "exam included" : null,
        c.deliveryMethods.map((m) => METHOD_LABEL[m].toLowerCase()).join(", "),
        SITE.showPrices && c.fromPrice ? `from ${formatPrice(c.fromPrice)}` : null,
      ].filter(Boolean);
      lines.push(`- [${c.name}](${absoluteUrl(c.path)}): ${facts.join("; ")}. ${c.summary}`);
    }
    lines.push("");
  }
  lines.push("## Self-paced online courses", "");
  for (const o of getOnlineCourses()) {
    lines.push(`- [${o.name} (online)](${absoluteUrl(o.path)})${SITE.showPrices && o.price ? `: ${formatPrice(o.price)}` : ""}`);
  }
  lines.push(
    "",
    "## Company",
    "",
    `- [About us](${absoluteUrl("/about-us")})`,
    `- [Onsite training for teams](${absoluteUrl("/onsite")})`,
    `- [Training locations](${absoluteUrl("/locations")})`,
    `- [Contact](${absoluteUrl("/contact")})`,
    `- [Blog](${absoluteUrl("/blog")})`,
    "",
  );
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

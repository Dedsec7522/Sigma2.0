import type { MetadataRoute } from "next";
import { IS_STATIC_PREVIEW, SITE } from "@/lib/site";

export const dynamic = "force-static";

// Mirrors the live robots.txt. One fix: the legacy AI-bot groups had no Disallow
// lines, and a bot-specific group overrides "*", so those bots could crawl booking
// and checkout. Every group now carries the same private-path rules.
const PRIVATE = ["/cms", "/login", "/booking", "/cart/", "/checkout/", "/summary", "/api/"];

const AI_AND_SEARCH_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "FirecrawlAgent",
  "AndiBot",
  "ExaBot",
  "PhindBot",
  "YouBot",
  "DuckAssistBot",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "Googlebot",
  "Baiduspider",
  "Yandex",
];

export default function robots(): MetadataRoute.Robots {
  if (IS_STATIC_PREVIEW) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_AND_SEARCH_AGENTS, allow: "/", disallow: PRIVATE },
      { userAgent: ["MJ12bot", "GermCrawler", "Sogou"], disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

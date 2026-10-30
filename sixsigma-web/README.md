# SixSigma.co.uk – front end

Redesigned, statically generated front end for www.sixsigma.co.uk, built with Next.js 16 (App Router), React 19, Tailwind CSS 4 and Motion. Every page is rendered to HTML at build time from the live site's own content; booking, basket and checkout stay on the existing platform.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## How it fits together

| Area | Where |
| --- | --- |
| Content source | `src/data/*.json`, produced by `../tools/scrape_site.py` from the live site |
| Data layer (cleans encoding, types, accessors) | `src/lib/catalog.ts`, `src/lib/content.ts`, `src/lib/company.ts` |
| Design tokens | `src/app/globals.css` (`@theme`) |
| Structured data (Organization, Course, CourseInstance, BreadcrumbList, FAQPage, BlogPosting) | `src/lib/schema.ts` |
| Course Advisor | engine `src/lib/advisor.ts`, UI `src/components/advisor/`, optional AI re-ranking `src/app/api/advisor/route.ts` |
| Enquiries | form `src/components/forms/EnquiryForm.tsx`, API `src/app/api/enquiry/route.ts` |
| Legacy redirects and proxies | `next.config.ts` |
| SEO files | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts` |

### URL preservation

Every one of the 2,048 URLs that return 200 on the live site is generated with the same path, and every one of the 163 sitemap URLs that the live site redirects is kept as a single 301 to the same destination (`next.config.ts` reads them from `src/data/url-inventory.json`). Check a build with:

```bash
npm run build && npm start &
python -I ../tools/verify_urls.py http://localhost:3000
```

### Transactional paths

`/booking/*`, `/cart/*`, `/checkout/*`, `/summary/*`, `/cms/*`, `/login`, `/uploads/*` and the legacy form endpoints are proxied to `LEGACY_ORIGIN` (fallback rewrites), so "Book now" buttons and downloads keep working on the same domain. In production, point `LEGACY_ORIGIN` at the origin server that runs the existing platform (not the public hostname, or requests will loop back to this app).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, default `https://www.sixsigma.co.uk` |
| `LEGACY_ORIGIN` | Origin of the existing booking/checkout platform |
| `ENQUIRY_WEBHOOK_URL`, `ENQUIRY_WEBHOOK_TOKEN` | Where validated enquiries are POSTed as JSON (CRM, HubSpot or backend). Required in production; in development enquiries are written to `.data/enquiries.jsonl` |
| `ANTHROPIC_API_KEY` | Optional. Enables AI re-ranking and plain-English explanations in the Course Advisor. Without it the advisor uses its deterministic engine only |
| `ADVISOR_MODEL` | Optional model override for the advisor (default `claude-opus-5-5`) |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container (the live site uses `GTM-WQPHP6G`). Loaded only after the visitor accepts analytics cookies |
| `NEXT_PUBLIC_SHOW_PRICES` | Set to `false` to hide prices site-wide |

## Refreshing content

Course dates, prices and pages come from the live site. Re-run the scraper (it caches pages in `tools/.cache`; pass `--refresh` to re-download), then rebuild:

```bash
python -I ../tools/scrape_site.py --refresh
npm run build
```

New courses, locations and blog posts appear automatically, and the Course Advisor picks up new courses with no code changes. For daily schedule updates, run both commands on a schedule, or replace the JSON files with a feed from the booking system.

## Course Advisor

1. A short adaptive questionnaire (topic, goal, experience, audience, format, time, start date). Questions that don't apply are skipped, free text can answer several at once, and every answer can be changed.
2. `recommend()` scores the real catalogue on topic, level, experience, format availability, duration and scheduled dates, and returns a best match, up to two alternatives and its reasons.
3. If `ANTHROPIC_API_KEY` is set, the shortlist is sent to `/api/advisor`. The model may only choose from that shortlist (JSON-schema enum, re-validated on the server) and writes a short explanation. Any failure falls back to step 2.

No personal data is collected by the advisor.

# Sigma 2.0 – SixSigma.co.uk redesign

A redesigned, SEO- and AI-search-optimised front end for www.sixsigma.co.uk, with an AI Course Advisor, built from the live site's own content and preserving every existing URL.

**Preview:** https://dedsec7522.github.io/Sigma2.0/

| Folder | What it is |
| --- | --- |
| [`sixsigma-web/`](sixsigma-web/README.md) | The Next.js 16 site: setup, architecture, environment variables and deployment |
| `tools/scrape_site.py` | Pulls courses, dates, prices, locations, blog and pages from the live site into `sixsigma-web/src/data` |
| `tools/verify_urls.py` | Checks all 2,211 legacy URLs against a running build (pages, canonicals, structured data, redirects) |
| `tools/advisor-scenarios.ts` | Scenario tests for the Course Advisor |

## About the GitHub Pages preview

The preview is a static export, so it differs from the production build:

- It is marked `noindex` so it doesn't compete with the live site in search results.
- "Book now" and downloads go to the live sixsigma.co.uk platform.
- Enquiry forms validate but can't be sent (there is no server), and the Course Advisor uses its built-in ranking without the optional AI step.
- To stay under GitHub Pages' 1 GB limit, course-by-location pages are included for the six most popular cities only.
- It is served under `/Sigma2.0/`, so paths differ from the live site; the production build serves the original URLs at the domain root.

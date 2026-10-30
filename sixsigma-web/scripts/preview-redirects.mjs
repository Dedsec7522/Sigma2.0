// Static hosts can't send redirects, so after a static export this writes small
// redirect pages for (1) the legacy URLs the live site redirects and (2) course ×
// location pages left out of the preview, which forward to their course page.
// Usage (after `next build` with STATIC_EXPORT=1): node scripts/preview-redirects.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = "out";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE = "https://www.sixsigma.co.uk";
const inventory = JSON.parse(readFileSync("src/data/url-inventory.json", "utf8")).urls;

const targets = new Map();
for (const u of inventory) {
  if (u.redirected && u.final !== u.path) targets.set(u.path, u.final);
  else if (u.status === 200 && /^\/courses\/[^/]+\/[^/]+\/[^/]+$/.test(u.path)) targets.set(u.path, u.path.split("/").slice(0, 4).join("/"));
}
targets.set("/online-course/six-sigma-white-belt", "/online-training/six-sigma");

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
let written = 0;
for (const [from, to] of targets) {
  const dir = path.join(OUT, from);
  if (existsSync(path.join(dir, "index.html"))) continue; // a real page exists
  const href = escape(`${BASE}${to === "/" ? "/" : `${to}/`}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, "index.html"),
    `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Redirecting…</title>` +
      `<meta name="robots" content="noindex"><link rel="canonical" href="${escape(SITE + to)}">` +
      `<meta http-equiv="refresh" content="0; url=${href}"></head>` +
      `<body><p>This page has moved to <a href="${href}">${href}</a>.</p></body></html>\n`,
  );
  written++;
}
console.log(`preview-redirects: wrote ${written} redirect pages`);

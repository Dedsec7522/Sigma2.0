import type { NextConfig } from "next";
import inventory from "./src/data/url-inventory.json";

// Every sitemap URL the live site redirects is preserved as one permanent hop to
// the same destination (no chains). The white-belt online page returns HTTP 500
// on the live site; it follows its Lean sibling to the online training hub.
const legacyRedirects = [
  ...inventory.urls
    .filter((u) => u.redirected && u.final !== u.path)
    .map((u) => ({ source: u.path, destination: u.final, permanent: true })),
  { source: "/online-course/six-sigma-white-belt", destination: "/online-training/six-sigma", permanent: true },
];

// Transactional paths (booking, basket, checkout, CMS, downloads) are still served by the
// legacy platform. Proxy them so every existing URL keeps working on the same domain.
const LEGACY_ORIGIN = process.env.LEGACY_ORIGIN ?? "https://www.sixsigma.co.uk";
const LEGACY_PATHS = [
  "/booking/:path*",
  "/cart/:path*",
  "/checkout/:path*",
  "/summary/:path*",
  "/cms/:path*",
  "/login",
  "/uploads/:path*",
  "/send/:path*",
  "/enquiry/:path*",
  "/filter/:path*",
  "/autocomplete/:path*",
];

const turbopack: NextConfig["turbopack"] = {
  rules: {
    "*.css": {
      loaders: ["@tailwindcss/turbopack"],
      as: "*.css",
    },
  },
};

// STATIC_EXPORT=1 builds a static preview for GitHub Pages: plain files under
// NEXT_PUBLIC_BASE_PATH, with no redirects, proxy, headers or API routes (the
// workflow removes src/app/api before building).
const staticExport: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
  turbopack,
};

const server: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack,
  async redirects() {
    return legacyRedirects;
  },
  async rewrites() {
    return {
      fallback: LEGACY_PATHS.map((source) => ({ source, destination: `${LEGACY_ORIGIN}${source}` })),
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default process.env.STATIC_EXPORT === "1" ? staticExport : server;

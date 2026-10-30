import type { Metadata, Viewport } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header, type NavCategory } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { JsonLd } from "@/components/ui/JsonLd";
import { getCategories, getCategoryCourses } from "@/lib/catalog";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { IS_STATIC_PREVIEW, SITE } from "@/lib/site";

const heading = Lexend({ subsets: ["latin"], variable: "--font-heading", weight: ["500", "600", "700"], display: "swap" });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Lean Six Sigma Courses | Six Sigma Training | Lean Six Sigma Training",
    template: "%s",
  },
  description: SITE.description,
  applicationName: SITE.brand,
  openGraph: { type: "website", siteName: SITE.brand, locale: "en_GB", images: [{ url: "/brand/logo-lg.png", width: 344, height: 118, alt: "Six Sigma" }] },
  twitter: { card: "summary", site: "@SixSigma8" },
  formatDetection: { telephone: false },
  // The GitHub Pages preview must not compete with the live site in search results.
  ...(IS_STATIC_PREVIEW ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#0b1d3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const nav: NavCategory[] = getCategories().map((c) => ({
    name: c.name,
    path: c.path,
    courses: getCategoryCourses(c).map((x) => ({ name: x.name, path: x.path })),
  }));

  return (
    <html lang="en-GB" className={`${heading.variable} ${body.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-navy-900 px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        {/* Scroll-reveal content is server-rendered transparent; show it when JavaScript is off. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Providers>
          <Header categories={nav} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <CookieConsent gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        </Providers>
      </body>
    </html>
  );
}

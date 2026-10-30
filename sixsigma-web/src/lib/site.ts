// Business facts used across the site. Everything here is taken from the live
// sixsigma.co.uk footer, contact and about pages.
export const SITE = {
  name: "Six Sigma",
  legalName: "Pentagon Training Limited",
  brand: "SixSigma.co.uk",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sixsigma.co.uk").replace(/\/$/, ""),
  phone: "+442036084550",
  phoneDisplay: "020 3608 4550",
  email: "info@sixsigma.co.uk",
  address: {
    street: "Building 3, 111 Concorde Rd",
    locality: "Maidenhead",
    postcode: "SL6 4BY",
    country: "GB",
  },
  foundingYear: 1998,
  vatNumber: "652 8880 03",
  companyNumber: "3011290",
  hours: "Monday to Sunday, 24 hours",
  sameAs: [
    "https://www.facebook.com/SixSigmaUK",
    "https://twitter.com/SixSigma8",
    "https://www.linkedin.com/in/six-sigma-7589775b",
  ],
  description:
    "SixSigma.co.uk are the UK's Six Sigma specialists, providing professional training for Six Sigma, Lean Six Sigma, Lean and Kaizen through classroom, virtual, online and onsite delivery.",
  // Live prices come from the booking system. Set to false to hide them site-wide.
  showPrices: process.env.NEXT_PUBLIC_SHOW_PRICES !== "false",
} as const;

export const absoluteUrl = (path = "/") => `${SITE.url}${path === "/" ? "" : path}`;

// Static preview build (GitHub Pages): served under a sub-path, with no server.
// Booking, checkout and downloads then go straight to the live platform.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const IS_STATIC_PREVIEW = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "1";
const LIVE_ORIGIN = "https://www.sixsigma.co.uk";

/** Prefixes a site-relative path with the deployment base path (for plain <a>/fetch, not <Link>). */
export const withBase = (path: string) => (path.startsWith("/") && !path.startsWith("//") ? `${BASE_PATH}${path}` : path);

/** URLs served by the legacy platform (booking, checkout, uploads). */
export const legacyUrl = (path: string | null) => (path && IS_STATIC_PREVIEW && path.startsWith("/") ? `${LIVE_ORIGIN}${path}` : path);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "Europe/London" }).format(new Date(`${iso}T12:00:00Z`));

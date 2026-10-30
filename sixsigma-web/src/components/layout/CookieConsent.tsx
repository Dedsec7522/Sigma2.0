"use client";

import Link from "next/link";
import Script from "next/script";
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { buttonClass } from "@/components/ui/button";

// UK GDPR / PECR: analytics only load after an explicit opt-in. Essential cookies
// (booking, basket) are set by the legacy platform and are not affected.
const KEY = "ss-consent";
const EVENT = "ss-consent-change";
type Consent = "granted" | "denied" | null;

// Choices are stored as "granted:<timestamp>" and re-asked after 12 months.
const MAX_AGE_MS = 365 * 86_400_000;

function read(): Consent {
  try {
    const [choice, at] = (localStorage.getItem(KEY) ?? "").split(":");
    if (choice !== "granted" && choice !== "denied") return null;
    return at && Date.now() - Number(at) > MAX_AGE_MS ? null : choice;
  } catch {
    return null;
  }
}

function write(v: Consent) {
  try {
    if (v) localStorage.setItem(KEY, `${v}:${Date.now()}`);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the banner simply shows again next visit */
  }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

const useConsent = () => useSyncExternalStore(subscribe, read, () => "denied" as Consent);

export function CookieConsent({ gtmId }: { gtmId?: string }) {
  // The server snapshot is "denied", so the banner only appears after hydration.
  const consent = useConsent();

  return (
    <>
      {gtmId && /^GTM-[A-Z0-9]+$/.test(gtmId) && consent === "granted" && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      <AnimatePresence>
        {consent === null && (
          <motion.section
            aria-label="Cookie preferences"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.6 }}
            className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-line bg-white p-5 shadow-pop sm:inset-x-6 sm:bottom-6 sm:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <p className="text-[0.95rem] leading-relaxed text-ink-muted">
                We use essential cookies to run this site. With your permission we&rsquo;d also like to use analytics cookies to understand how it&rsquo;s used.{" "}
                <Link href="/cookies" className="font-semibold text-navy-900 underline underline-offset-4">Cookie policy</Link>
              </p>
              <div className="flex shrink-0 gap-2">
                <button type="button" className={buttonClass("secondary", "sm")} onClick={() => write("denied")}>
                  Essential only
                </button>
                <button type="button" className={buttonClass("primary", "sm")} onClick={() => write("granted")}>
                  Accept analytics
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

/** Deletes Google Analytics cookies on this host and its parent domains. */
function clearAnalyticsCookies() {
  const names = document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => /^(_ga|_gid|_gat|_gcl)/.test(n));
  const parts = location.hostname.split(".");
  const domains = parts.map((_, i) => parts.slice(i).join(".")).filter((d) => d.includes("."));
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${d}`;
  }
}

function changeSettings() {
  const hadAnalytics = read() === "granted";
  write(null);
  // Analytics already running can't be unloaded, so clear its cookies and reload.
  if (hadAnalytics) {
    clearAnalyticsCookies();
    location.reload();
  }
}

export function CookieSettingsLink() {
  return (
    <button type="button" className="hover:text-white" onClick={changeSettings}>
      Cookie settings
    </button>
  );
}

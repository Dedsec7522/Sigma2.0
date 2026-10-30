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

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function write(v: Consent) {
  try {
    if (v) localStorage.setItem(KEY, v);
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
      {gtmId && consent === "granted" && (
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

export function CookieSettingsLink() {
  return (
    <button type="button" className="hover:text-white" onClick={() => write(null)}>
      Cookie settings
    </button>
  );
}

"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const todayInLondon = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());

/**
 * Today's date (YYYY-MM-DD, UK time) in the browser, or "" on the server and during
 * hydration. Pages are built ahead of time, so this lets the browser drop sessions
 * that have passed since the build without causing a hydration mismatch.
 */
export function useToday() {
  return useSyncExternalStore(noopSubscribe, todayInLondon, () => "");
}

export const isPast = (date: string, today: string) => today !== "" && date < today;

"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};

/**
 * Reads a query parameter without opting the page out of static rendering:
 * the server (and hydration) see "", the browser then sees the real value.
 */
export function useUrlParam(name: string) {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name) ?? "",
    () => "",
  );
}

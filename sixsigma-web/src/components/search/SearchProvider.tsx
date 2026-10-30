"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Ctx = { open: (query?: string) => void };
const SearchContext = createContext<Ctx>({ open: () => {} });
export const useSearch = () => useContext(SearchContext);

const SiteSearch = dynamic(() => import("./SiteSearch").then((m) => m.SiteSearch), { ssr: false });

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; mounted: boolean; query: string; session: number }>({ open: false, mounted: false, query: "", session: 0 });
  const open = useCallback((query = "") => setState((s) => ({ open: true, mounted: true, query, session: s.session + 1 })), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  // Ctrl/Cmd + K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(() => ({ open }), [open]);
  return (
    <SearchContext.Provider value={value}>
      {children}
      {state.mounted && <SiteSearch key={state.session} open={state.open} initialQuery={state.query} onClose={close} />}
    </SearchContext.Provider>
  );
}

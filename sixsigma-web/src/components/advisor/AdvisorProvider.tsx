"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Answers } from "@/lib/advisor";

type Ctx = { open: (prefill?: Answers) => void; close: () => void };
const AdvisorContext = createContext<Ctx>({ open: () => {}, close: () => {} });
export const useAdvisor = () => useContext(AdvisorContext);

// The advisor is only downloaded when someone first opens it.
const CourseAdvisor = dynamic(() => import("./CourseAdvisor").then((m) => m.CourseAdvisor), { ssr: false });

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; prefill?: Answers; mounted: boolean; session: number }>({ open: false, mounted: false, session: 0 });
  const open = useCallback((prefill?: Answers) => setState((s) => ({ open: true, mounted: true, prefill, session: s.session + 1 })), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ open, close }), [open, close]);
  return (
    <AdvisorContext.Provider value={value}>
      {children}
      {state.mounted && <CourseAdvisor key={state.session} open={state.open} prefill={state.prefill} onClose={close} />}
    </AdvisorContext.Provider>
  );
}

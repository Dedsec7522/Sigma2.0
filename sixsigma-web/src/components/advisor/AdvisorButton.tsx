"use client";

import { Sparkle } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useAdvisor } from "./AdvisorProvider";
import type { Answers } from "@/lib/advisor";

/** Opens the Course Advisor, optionally with answers already filled in (e.g. the topic of the page). */
export function AdvisorButton({ className, children, prefill, icon = true }: { className: string; children: ReactNode; prefill?: Answers; icon?: boolean }) {
  const advisor = useAdvisor();
  return (
    <button type="button" className={className} onClick={() => advisor.open(prefill)}>
      {icon && <Sparkle aria-hidden size={18} weight="fill" />}
      {children}
    </button>
  );
}

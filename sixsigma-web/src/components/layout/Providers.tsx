"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { AdvisorProvider } from "@/components/advisor/AdvisorProvider";
import { SearchProvider } from "@/components/search/SearchProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AdvisorProvider>
        <SearchProvider>{children}</SearchProvider>
      </AdvisorProvider>
    </MotionConfig>
  );
}

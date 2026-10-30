"use client";

import type { ReactNode } from "react";
import { isPast, useToday } from "@/lib/use-today";

/** Renders its children only while `date` (YYYY-MM-DD) is today or later. */
export function FutureOnly({ date, children }: { date: string; children: ReactNode }) {
  const today = useToday();
  return isPast(date, today) ? null : children;
}

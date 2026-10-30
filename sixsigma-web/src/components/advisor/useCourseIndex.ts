"use client";

import { useEffect, useState } from "react";
import type { CourseIndexEntry } from "@/lib/types";
import { withBase } from "@/lib/site";

let request: Promise<CourseIndexEntry[]> | null = null;

/** Loads the statically generated /course-index.json once per page view. */
export function loadCourseIndex() {
  request ??= fetch(withBase("/course-index.json")).then((r) => {
    if (!r.ok) throw new Error(`Course index failed to load (${r.status})`);
    return r.json() as Promise<CourseIndexEntry[]>;
  });
  request.catch(() => {
    request = null;
  });
  return request;
}

export function useCourseIndex() {
  const [state, setState] = useState<{ data: CourseIndexEntry[] | null; error: string | null }>({ data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    loadCourseIndex().then(
      (data) => live && setState({ data, error: null }),
      (e: Error) => live && setState({ data: null, error: e.message }),
    );
    return () => {
      live = false;
    };
  }, [attempt]);
  return { ...state, retry: () => setAttempt((a) => a + 1) };
}

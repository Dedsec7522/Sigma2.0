"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSearch } from "./SearchProvider";
import { withBase } from "@/lib/site";

/**
 * A real GET form to /courses?q=… (works without JavaScript); with JavaScript it
 * opens the instant search overlay instead.
 */
export function HeroSearch() {
  const [q, setQ] = useState("");
  const search = useSearch();
  const router = useRouter();
  return (
    <form
      role="search"
      action={withBase("/courses")}
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/courses?q=${encodeURIComponent(q.trim())}`);
        else search.open();
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)] ring-1 ring-white/20 focus-within:ring-4 focus-within:ring-gold-400/60"
    >
      <MagnifyingGlass aria-hidden size={20} className="shrink-0 text-ink-subtle" />
      <label htmlFor="hero-q" className="sr-only">
        Search courses
      </label>
      <input
        id="hero-q"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        // A mouse click on the empty field opens instant search. Keyboard focus never
        // does (no unexpected context change), so keyboard users can type and submit.
        onPointerDown={(e) => {
          if (!q && e.pointerType === "mouse") {
            e.preventDefault();
            search.open();
          }
        }}
        placeholder="Search courses, e.g. Green Belt"
        className="h-12 min-w-0 flex-1 bg-transparent text-[1.0625rem] text-navy-900 outline-none placeholder:text-ink-subtle"
        autoComplete="off"
      />
      <button type="submit" className="h-12 shrink-0 rounded-full bg-navy-900 px-6 font-display text-[0.95rem] font-semibold text-white transition-colors hover:bg-navy-700">
        Search
      </button>
    </form>
  );
}

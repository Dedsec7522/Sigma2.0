"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, List, MagnifyingGlass, Phone, Sparkle, X } from "@phosphor-icons/react";
import { buttonClass } from "@/components/ui/button";
import { useAdvisor } from "@/components/advisor/AdvisorProvider";
import { useSearch } from "@/components/search/SearchProvider";
import { SITE } from "@/lib/site";

export type NavCategory = { name: string; path: string; courses: { name: string; path: string }[] };

type MenuKey = "courses" | "company" | "learn";
const MENU_IDS: Record<MenuKey, string> = { courses: "mega-courses", learn: "menu-learn", company: "menu-company" };

const COMPANY = [
  { name: "About us", path: "/about-us", blurb: "Six Sigma specialists since 1998" },
  { name: "Clients", path: "/clients", blurb: "Who we've trained across the UK" },
  { name: "Testimonials", path: "/testimonial", blurb: "What delegates say about us" },
  { name: "Careers", path: "/careers", blurb: "Join our team in Maidenhead" },
];
const LEARN = [
  { name: "Blog", path: "/blog", blurb: "Guides, salaries and comparisons" },
  { name: "Free resources", path: "/resources", blurb: "Downloadable Six Sigma material" },
];

export function Header({ categories }: { categories: NavCategory[] }) {
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const advisor = useAdvisor();
  const search = useSearch();
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Return focus to the trigger so keyboard users keep their place.
      navRef.current?.querySelector<HTMLElement>(`[aria-controls="${MENU_IDS[menu]}"]`)?.focus();
      setMenu(null);
    };
    const onClick = (e: MouseEvent) => !navRef.current?.contains(e.target as Node) && setMenu(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menu]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const hoverOpen = (key: MenuKey) => {
    window.clearTimeout(closeTimer.current);
    setMenu(key);
  };
  const hoverClose = () => {
    closeTimer.current = window.setTimeout(() => setMenu(null), 140);
  };
  // Close when keyboard focus moves to something outside the open menu (not on
  // clicks on blank areas inside it, where relatedTarget is null).
  const closeOnFocusLeave = (e: React.FocusEvent<HTMLLIElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && !e.currentTarget.contains(next)) setMenu(null);
  };

  const isActive = (p: string) => pathname === p || pathname.startsWith(`${p}/`);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[box-shadow,border-color] duration-300 ${
        scrolled ? "border-line shadow-[0_8px_24px_-16px_rgb(11_29_58/0.35)]" : "border-transparent"
      }`}
    >
      {/* Blur lives on its own layer: backdrop-filter on <header> would make it the
          containing block for the fixed mobile menu and collapse it to header height. */}
      <span aria-hidden className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80" />
      <div ref={navRef} className="container-page flex h-[var(--header-h)] items-center gap-4" onMouseLeave={hoverClose}>
        <Link href="/" className="mr-2 shrink-0 rounded-md" aria-label="Six Sigma home">
          <Image src="/brand/logo-lg.png" alt="Six Sigma, trusted since 1998" width={344} height={118} priority className="h-11 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {/* The panel sits inside this <li> so Tab moves from the trigger straight into it. */}
            <li onMouseEnter={() => hoverOpen("courses")} onBlur={closeOnFocusLeave}>
              <MenuTrigger label="Courses" open={menu === "courses"} active={isActive("/courses")} onToggle={() => setMenu(menu === "courses" ? null : "courses")} controls="mega-courses" />
              <AnimatePresence>
                {menu === "courses" && (
                  <motion.div
                    id="mega-courses"
                    key="mega"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-pop lg:block"
                    onMouseEnter={() => hoverOpen("courses")}
                  >
                    <div className="container-page grid grid-cols-[1fr_18rem] gap-10 py-8">
                      <div className="grid grid-cols-3 gap-x-8 gap-y-7">
                        {categories.map((cat) => (
                          <div key={cat.path}>
                            <Link href={cat.path} className="font-display text-[0.95rem] font-semibold text-navy-900 hover:text-brand-700">
                              {cat.name}
                            </Link>
                            <ul className="mt-2.5 space-y-1.5">
                              {cat.courses.slice(0, 5).map((c) => (
                                <li key={c.path}>
                                  <Link href={c.path} className="text-sm text-ink-muted transition-colors hover:text-navy-900">
                                    {c.name}
                                  </Link>
                                </li>
                              ))}
                              {cat.courses.length > 5 && (
                                <li>
                                  <Link href={cat.path} className="text-sm font-semibold text-brand-700 hover:text-navy-900">
                                    All {cat.courses.length} courses
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="on-dark flex flex-col justify-between rounded-2xl bg-navy-900 p-6 text-white">
                        <div>
                          <Sparkle aria-hidden size={26} weight="fill" className="text-gold-400" />
                          <p className="mt-4 font-display text-lg font-semibold">Not sure where to start?</p>
                          <p className="mt-2 text-sm leading-relaxed text-white/75">Answer a few quick questions and our Course Advisor will match you to the right course.</p>
                        </div>
                        <div className="mt-6 flex flex-col gap-2">
                          <button type="button" onClick={() => { setMenu(null); advisor.open(); }} className={buttonClass("gold", "sm")}>
                            Find my course
                          </button>
                          <Link href="/courses" className="text-center text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">
                            Browse all courses
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            <li onMouseEnter={hoverClose}>
              <NavLink href="/online-training/six-sigma" active={isActive("/online-training") || isActive("/online-course")}>Online training</NavLink>
            </li>
            <li onMouseEnter={hoverClose}>
              <NavLink href="/onsite" active={isActive("/onsite")}>For teams</NavLink>
            </li>
            <li onMouseEnter={hoverClose}>
              <NavLink href="/locations" active={isActive("/locations")}>Locations</NavLink>
            </li>
            <li className="relative" onMouseEnter={() => hoverOpen("learn")} onBlur={closeOnFocusLeave}>
              <MenuTrigger label="Insights" open={menu === "learn"} active={isActive("/blog") || isActive("/resources")} onToggle={() => setMenu(menu === "learn" ? null : "learn")} controls="menu-learn" />
              <SmallMenu id="menu-learn" open={menu === "learn"} items={LEARN} />
            </li>
            <li className="relative" onMouseEnter={() => hoverOpen("company")} onBlur={closeOnFocusLeave}>
              <MenuTrigger label="About" open={menu === "company"} active={COMPANY.some((c) => isActive(c.path))} onToggle={() => setMenu(menu === "company" ? null : "company")} controls="menu-company" />
              <SmallMenu id="menu-company" open={menu === "company"} items={COMPANY} />
            </li>
            <li onMouseEnter={hoverClose}>
              <NavLink href="/contact" active={isActive("/contact")}>Contact</NavLink>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a href={`tel:${SITE.phone}`} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50 2xl:flex">
            <Phone aria-hidden size={18} weight="duotone" className="text-brand-600" />
            {SITE.phoneDisplay}
          </a>
          <button type="button" onClick={() => search.open()} className="grid size-11 place-items-center rounded-full text-navy-900 transition-colors hover:bg-navy-50" aria-label="Search courses">
            <MagnifyingGlass size={20} aria-hidden />
          </button>
          <button type="button" onClick={() => advisor.open()} className={buttonClass("secondary", "sm", "max-md:hidden")}>
            <Sparkle aria-hidden size={16} weight="fill" className="text-brand-600" />
            Course advisor
          </button>
          <Link href="/contact" className={buttonClass("primary", "sm", "max-sm:hidden")}>
            Get a quote
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-navy-900 hover:bg-navy-50 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={22} aria-hidden /> : <List size={22} aria-hidden />}
          </button>
        </div>

      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto overscroll-contain border-t border-line bg-white lg:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              <MobileGroup title="Courses" items={[{ name: "All courses", path: "/courses" }, ...categories.map((c) => ({ name: c.name, path: c.path }))]} />
              {[
                { name: "Online training", path: "/online-training/six-sigma" },
                { name: "Training for teams", path: "/onsite" },
                { name: "Locations", path: "/locations" },
              ].map((l) => (
                <Link key={l.path} href={l.path} className="rounded-xl px-3 py-3.5 font-display text-lg font-semibold text-navy-900 hover:bg-navy-50">
                  {l.name}
                </Link>
              ))}
              <MobileGroup title="Insights" items={LEARN} />
              <MobileGroup title="About" items={COMPANY} />
              <Link href="/contact" className="rounded-xl px-3 py-3.5 font-display text-lg font-semibold text-navy-900 hover:bg-navy-50">
                Contact
              </Link>
              <div className="mt-4 grid gap-3 border-t border-line pt-6">
                <button type="button" onClick={() => { setMobileOpen(false); advisor.open(); }} className={buttonClass("gold", "lg")}>
                  <Sparkle aria-hidden size={18} weight="fill" /> Find my course
                </button>
                <a href={`tel:${SITE.phone}`} className={buttonClass("secondary", "lg")}>
                  <Phone aria-hidden size={18} /> Call {SITE.phoneDisplay}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative rounded-full px-3 py-2 text-[0.95rem] font-medium transition-colors hover:bg-navy-50 hover:text-navy-900 ${active ? "text-navy-900" : "text-ink-muted"}`}
    >
      {children}
      {active && <span aria-hidden className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand-600" />}
    </Link>
  );
}

function MenuTrigger({ label, open, active, onToggle, controls }: { label: string; open: boolean; active: boolean; onToggle: () => void; controls: string }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={`relative flex items-center gap-1 rounded-full px-3 py-2 text-[0.95rem] font-medium transition-colors hover:bg-navy-50 hover:text-navy-900 ${open || active ? "text-navy-900" : "text-ink-muted"}`}
    >
      {label}
      <CaretDown aria-hidden size={13} weight="bold" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      {active && <span aria-hidden className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand-600" />}
    </button>
  );
}

function SmallMenu({ id, open, items }: { id: string; open: boolean; items: { name: string; path: string; blurb: string }[] }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
          transition={{ type: "spring", stiffness: 460, damping: 32 }}
          style={{ transformOrigin: "top left" }}
          className="absolute left-0 top-[calc(100%+10px)] w-72 rounded-2xl border border-line bg-white p-2 shadow-pop"
        >
          <ul>
            {items.map((it) => (
              <li key={it.path}>
                <Link href={it.path} className="block rounded-xl px-3.5 py-2.5 transition-colors hover:bg-navy-50">
                  <span className="block font-display text-[0.95rem] font-semibold text-navy-900">{it.name}</span>
                  <span className="block text-sm text-ink-muted">{it.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileGroup({ title, items }: { title: string; items: { name: string; path: string }[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 font-display text-lg font-semibold text-navy-900 hover:bg-navy-50"
      >
        {title}
        <CaretDown aria-hidden size={16} weight="bold" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            style={{ overflow: "hidden" }}
            className="ml-3 border-l border-line pl-3"
          >
            {items.map((it) => (
              <li key={it.path}>
                <Link href={it.path} className="block rounded-lg px-3 py-2.5 text-ink-muted hover:bg-navy-50 hover:text-navy-900">
                  {it.name}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

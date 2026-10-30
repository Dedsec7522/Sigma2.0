import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { AdvisorButton } from "@/components/advisor/AdvisorButton";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-[2rem] font-semibold sm:text-[2.6rem]">We couldn&rsquo;t find that page</h1>
      <p className="mt-4 max-w-lg text-lg text-ink-muted">It may have moved, or the link may be out of date. Try browsing our courses, or let our Course Advisor point you in the right direction.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/courses" className={buttonClass("primary", "md")}>
          Browse courses
        </Link>
        <AdvisorButton className={buttonClass("secondary", "md")}>Ask the Course Advisor</AdvisorButton>
        <Link href="/" className={buttonClass("ghost", "md")}>
          Home
        </Link>
      </div>
    </section>
  );
}

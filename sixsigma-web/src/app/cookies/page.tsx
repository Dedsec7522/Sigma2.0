import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { pageMeta } from "@/lib/content";

const m = pageMeta("/cookies");
export const metadata: Metadata = {
  title: { absolute: m.title || "Cookie Policy | SixSigma.co.uk" },
  description: m.description || "How SixSigma.co.uk uses cookies and how to manage your preferences.",
  alternates: { canonical: "/cookies" },
};

export default function Page() {
  return <LegalPage path="/cookies" title="Cookie policy" lead="How we use cookies, and how you can change your preferences at any time using “Cookie settings” in the footer." />;
}

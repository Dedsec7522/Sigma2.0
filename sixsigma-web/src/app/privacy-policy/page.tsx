import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { pageMeta } from "@/lib/content";

const m = pageMeta("/privacy-policy");
export const metadata: Metadata = {
  title: { absolute: m.title || "Privacy Policy | SixSigma.co.uk" },
  description: m.description || "How Pentagon Training Ltd (SixSigma.co.uk) collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return <LegalPage path="/privacy-policy" title="Privacy policy" lead="How we collect, use and protect your personal data." />;
}

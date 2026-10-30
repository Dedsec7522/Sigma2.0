import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { pageMeta } from "@/lib/content";

const m = pageMeta("/terms");
export const metadata: Metadata = {
  title: { absolute: m.title || "Terms & Conditions | SixSigma.co.uk" },
  description: m.description || "Terms and conditions for booking training with Pentagon Training Ltd (SixSigma.co.uk).",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage path="/terms" title="Terms & conditions" lead="The terms that apply when you book training with Pentagon Training Ltd." />;
}

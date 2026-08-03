import type { Metadata } from "next";
import { AdvisorView } from "@/components/security/advisor-view";

export const metadata: Metadata = {
  title: "Security Advisor",
};

export default function AdvisorPage() {
  return <AdvisorView />;
}

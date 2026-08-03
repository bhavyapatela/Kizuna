import type { Metadata } from "next";
import { IdentityView } from "@/components/identity/identity-view";

export const metadata: Metadata = {
  title: "Identity Map",
};

export default function IdentityPage() {
  return <IdentityView />;
}

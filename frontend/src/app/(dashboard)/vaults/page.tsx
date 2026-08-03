import type { Metadata } from "next";
import { VaultsView } from "@/components/vault/vaults-view";

export const metadata: Metadata = {
  title: "Vaults",
};

export default function VaultsPage() {
  return <VaultsView />;
}

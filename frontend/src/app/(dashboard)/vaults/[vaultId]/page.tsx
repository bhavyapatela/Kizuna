import type { Metadata } from "next";
import { VaultDetailView } from "@/components/vault/vault-detail-view";

export const metadata: Metadata = {
  title: "Vault",
};

interface VaultPageProps {
  params: Promise<{ vaultId: string }>;
}

export default async function VaultPage({ params }: VaultPageProps) {
  const { vaultId } = await params;
  return <VaultDetailView vaultId={vaultId} />;
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PasswordGenerator } from "@/components/vault/password-generator";

export const metadata: Metadata = {
  title: "Generator",
};

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Generator"
        description="Create strong, unique passwords for every account."
      />
      <PasswordGenerator />
    </div>
  );
}

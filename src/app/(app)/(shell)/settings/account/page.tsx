import type { Metadata } from "next";

import { DeleteAccount, PasswordForm, SettingsCard } from "@/components/settings/SettingsForms";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountSettingsPage() {
  const user = await requireUser();
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true, accounts: { select: { provider: true } } },
  });
  const hasPassword = Boolean(record?.passwordHash);
  const providers = record?.accounts.map((a) => a.provider) ?? [];

  return (
    <div className="space-y-6">
      <SettingsCard
        title={hasPassword ? "Password" : "Set a password"}
        description={
          hasPassword
            ? "Change the password you use to log in."
            : `You sign in with ${providers.includes("google") ? "Google" : "a provider"}. Add a password to also log in with email.`
        }
      >
        <PasswordForm hasPassword={hasPassword} />
      </SettingsCard>
      <SettingsCard title="Delete account" description="Permanently remove your account and every resume.">
        <DeleteAccount email={user.email} />
      </SettingsCard>
    </div>
  );
}

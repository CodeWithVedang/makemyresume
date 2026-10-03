import type { Metadata } from "next";

import { ProfileForm, SettingsCard } from "@/components/settings/SettingsForms";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Profile settings" };

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  return (
    <SettingsCard title="Profile" description="Your account name. Resume content is edited inside each resume.">
      <ProfileForm name={user.name ?? ""} email={user.email} />
    </SettingsCard>
  );
}

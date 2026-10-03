/**
 * Activates a paid plan after a payment received by email/UPI is confirmed.
 *
 *   npm run plan:grant -- user@example.com PRO_QUARTERLY
 *   npm run plan:grant -- user@example.com FREE        # revoke
 *
 * Granting while a plan is still active extends from its current end date.
 */
import { PrismaClient } from "@prisma/client";

import { PLANS, type PlanId } from "../src/lib/billing/plans";

async function main() {
  const [email, planArg] = process.argv.slice(2);
  const plan = planArg as PlanId;
  if (!email || !plan || !(plan in PLANS)) {
    console.error(`Usage: npm run plan:grant -- <email> <${Object.keys(PLANS).join("|")}>`);
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new Error(`No account for ${email}`);

    if (plan === "FREE") {
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { plan: "FREE", status: "inactive", currentPeriodEnd: null },
        create: { userId: user.id, plan: "FREE", status: "inactive" },
      });
      console.log(`${email} is now on Free.`);
      return;
    }

    const existing = await prisma.subscription.findUnique({ where: { userId: user.id } });
    const now = new Date();
    const start =
      existing?.status === "active" && existing.currentPeriodEnd && existing.currentPeriodEnd > now
        ? existing.currentPeriodEnd
        : now;
    const days = PLANS[plan].durationDays ?? 0;
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { plan, status: "active", provider: "manual", currentPeriodEnd: end },
      create: { userId: user.id, plan, status: "active", provider: "manual", currentPeriodEnd: end },
    });
    console.log(`${email}: ${PLANS[plan].name} active until ${end.toDateString()}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

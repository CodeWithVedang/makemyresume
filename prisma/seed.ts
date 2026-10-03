/**
 * Development seed: one demo account with three clearly labelled demo
 * resumes. Refuses to run in production unless ALLOW_PRODUCTION_SEED=true.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { sampleResumes } from "../src/lib/resume/samples";
import { rootData, writeChildren } from "../src/server/resume-writer";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo-password-1";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    throw new Error("Refusing to seed a production database.");
  }
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: {
        email: DEMO_EMAIL,
        name: "Demo User",
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
        onboardedAt: new Date(),
      },
    });

    // Re-seeding replaces only demo resumes; anything the demo user created stays.
    await prisma.resume.deleteMany({ where: { userId: user.id, isDemo: true } });
    for (const sample of sampleResumes) {
      await prisma.$transaction(async (tx) => {
        const resume = await tx.resume.create({
          data: { userId: user.id, isDemo: true, ...rootData(sample) },
          select: { id: true },
        });
        await writeChildren(tx, resume.id, sample);
      });
    }
    console.log(`Seeded ${sampleResumes.length} demo resumes for ${DEMO_EMAIL} (password: ${DEMO_PASSWORD}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

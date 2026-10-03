-- Indian pricing plans (one-time passes). PRO is kept for backwards compatibility.
ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'JOB_PASS';
ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'PRO_QUARTERLY';
ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'PRO_YEARLY';

-- Lifetime share-link creations, limited per plan.
ALTER TABLE "User" ADD COLUMN "shareLinksCreated" INTEGER NOT NULL DEFAULT 0;

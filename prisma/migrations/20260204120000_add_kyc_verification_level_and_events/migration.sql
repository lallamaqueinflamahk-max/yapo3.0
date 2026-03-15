-- AlterTable
ALTER TABLE "User" ADD COLUMN "verificationLevel" TEXT NOT NULL DEFAULT 'unverified';

-- CreateTable
CREATE TABLE "VerificationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "provider" TEXT,
    "providerId" TEXT,
    "verificationLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerificationEvent_userId_createdAt_idx" ON "VerificationEvent"("userId", "createdAt");
CREATE INDEX "VerificationEvent_provider_providerId_idx" ON "VerificationEvent"("provider", "providerId");

ALTER TABLE "VerificationEvent" ADD CONSTRAINT "VerificationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

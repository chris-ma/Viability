-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('free', 'pro', 'studio');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('draft', 'active', 'complete', 'archived', 'killed');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('VIABLE', 'PROMISING', 'NEEDS_WORK', 'NOT_VIABLE');

-- CreateEnum
CREATE TYPE "AnswerValue" AS ENUM ('yes', 'partially', 'no', 'dont_know');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "planTier" "PlanTier" NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "IdeaStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "overallScore" DOUBLE PRECISION,
    "verdict" "Verdict",
    "reportUrl" TEXT,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension_results" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "dimensionId" INTEGER NOT NULL,
    "rawScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weightedScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "killFlag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dimension_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_responses" (
    "id" TEXT NOT NULL,
    "dimensionResultId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "answer" "AnswerValue" NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fix_it_modules" (
    "id" TEXT NOT NULL,
    "dimensionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedHours" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fix_it_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fix_it_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "fix_it_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_tokens" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "dimension_results_assessmentId_dimensionId_key" ON "dimension_results"("assessmentId", "dimensionId");

-- CreateIndex
CREATE UNIQUE INDEX "item_responses_dimensionResultId_itemId_key" ON "item_responses"("dimensionResultId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "fix_it_modules_dimensionId_key" ON "fix_it_modules"("dimensionId");

-- CreateIndex
CREATE UNIQUE INDEX "fix_it_progress_userId_moduleId_taskId_key" ON "fix_it_progress"("userId", "moduleId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "share_tokens_token_key" ON "share_tokens"("token");

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_results" ADD CONSTRAINT "dimension_results_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_responses" ADD CONSTRAINT "item_responses_dimensionResultId_fkey" FOREIGN KEY ("dimensionResultId") REFERENCES "dimension_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fix_it_progress" ADD CONSTRAINT "fix_it_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fix_it_progress" ADD CONSTRAINT "fix_it_progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "fix_it_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

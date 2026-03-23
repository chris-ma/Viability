-- Drop the old fix_it_progress table (has FK to fix_it_modules)
DROP TABLE IF EXISTS "fix_it_progress";

-- Drop the unused fix_it_modules table
DROP TABLE IF EXISTS "fix_it_modules";

-- CreateTable: simplified fix_it_progress with dimensionId instead of moduleId FK
CREATE TABLE "fix_it_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dimensionId" INTEGER NOT NULL,
    "taskId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "fix_it_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fix_it_progress_userId_dimensionId_taskId_key" ON "fix_it_progress"("userId", "dimensionId", "taskId");

-- AddForeignKey
ALTER TABLE "fix_it_progress" ADD CONSTRAINT "fix_it_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

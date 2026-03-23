import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { calculateScores } from "@/lib/scoring/engine"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { assessmentId } = await params

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, idea: { userId } },
    include: {
      dimensionResults: { include: { itemResponses: true } },
    },
  })
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Build answers map
  const allAnswers: Record<number, Record<string, string>> = {}
  for (const dr of assessment.dimensionResults) {
    allAnswers[dr.dimensionId] = {}
    for (const ir of dr.itemResponses) {
      allAnswers[dr.dimensionId][ir.itemId] = ir.answer
    }
  }

  const result = calculateScores(allAnswers as any)

  // Update dimension results with final scores and kill flags
  for (const dimScore of result.dimensionScores) {
    const dr = assessment.dimensionResults.find((d) => d.dimensionId === dimScore.dimensionId)
    if (dr) {
      await prisma.dimensionResult.update({
        where: { id: dr.id },
        data: {
          rawScore: dimScore.rawScore,
          weightedScore: dimScore.weightedScore,
          killFlag: dimScore.killFlag,
        },
      })
    }
  }

  // Update assessment with final score and verdict
  const completed = await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      overallScore: result.overallScore,
      verdict: result.verdict,
      completedAt: new Date(),
    },
  })

  // Update idea status
  await prisma.idea.update({
    where: { id: assessment.ideaId },
    data: { status: "complete" },
  })

  return NextResponse.json({
    assessment: completed,
    overallScore: result.overallScore,
    verdict: result.verdict,
    killFlags: result.killFlags,
    dimensionScores: result.dimensionScores,
  })
}

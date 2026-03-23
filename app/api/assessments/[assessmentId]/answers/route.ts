import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { calculateScores } from "@/lib/scoring/engine"
import { DIMENSIONS } from "@/lib/data/checklist"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { assessmentId } = await params
  const { dimensionId, itemId, answer } = await req.json()

  // Verify ownership
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, idea: { userId } },
  })
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Get or create dimension result
  let dimensionResult = await prisma.dimensionResult.findUnique({
    where: { assessmentId_dimensionId: { assessmentId, dimensionId } },
  })

  if (!dimensionResult) {
    dimensionResult = await prisma.dimensionResult.create({
      data: { assessmentId, dimensionId },
    })
  }

  // Upsert item response
  await prisma.itemResponse.upsert({
    where: { dimensionResultId_itemId: { dimensionResultId: dimensionResult.id, itemId } },
    update: { answer },
    create: { dimensionResultId: dimensionResult.id, itemId, answer },
  })

  // Recalculate scores for this dimension
  const allResponses = await prisma.itemResponse.findMany({
    where: { dimensionResultId: dimensionResult.id },
  })

  const dimension = DIMENSIONS.find((d) => d.id === dimensionId)
  if (dimension) {
    const itemAnswers: Record<string, string> = {}
    allResponses.forEach((r) => { itemAnswers[r.itemId] = r.answer })

    const allAnswers = { [dimensionId]: itemAnswers }
    const result = calculateScores(allAnswers as any)
    const dimScore = result.dimensionScores[0]

    await prisma.dimensionResult.update({
      where: { id: dimensionResult.id },
      data: {
        rawScore: dimScore.rawScore,
        weightedScore: dimScore.weightedScore,
        killFlag: dimScore.killFlag,
      },
    })
  }

  return NextResponse.json({ success: true })
}

import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { calculateScores } from "@/lib/scoring/engine"
import { ResultsClient } from "./results-client"
import type { AnswerValue } from "@/lib/scoring/engine"

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>
}) {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const { assessmentId } = await params

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/dashboard")

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      idea: { userId: user.id },
    },
    include: {
      idea: true,
      dimensionResults: {
        include: { itemResponses: true },
        orderBy: { dimensionId: "asc" },
      },
    },
  })

  if (!assessment) notFound()
  if (!assessment.completedAt) redirect(`/assessment/${assessmentId}/checklist`)

  // Rebuild scoring result from stored data
  const allAnswers: Record<number, Record<string, AnswerValue>> = {}
  for (const dr of assessment.dimensionResults) {
    allAnswers[dr.dimensionId] = {}
    for (const ir of dr.itemResponses) {
      allAnswers[dr.dimensionId][ir.itemId] = ir.answer as AnswerValue
    }
  }

  const scoringResult = calculateScores(allAnswers)

  const assessmentData = {
    id: assessment.id,
    overallScore: assessment.overallScore ?? scoringResult.overallScore,
    verdict: (assessment.verdict ?? scoringResult.verdict) as "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE",
    completedAt: assessment.completedAt.toISOString(),
    idea: {
      id: assessment.idea.id,
      title: assessment.idea.title,
      problem: assessment.idea.problem,
      solution: assessment.idea.solution,
      industry: assessment.idea.industry,
      model: assessment.idea.model,
    },
    dimensionResults: assessment.dimensionResults.map((dr) => ({
      dimensionId: dr.dimensionId,
      rawScore: dr.rawScore,
      weightedScore: dr.weightedScore,
      killFlag: dr.killFlag,
    })),
  }

  return (
    <ResultsClient
      assessment={assessmentData}
      dimensionScores={scoringResult.dimensionScores}
      killFlags={scoringResult.killFlags}
    />
  )
}

import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { calculateScores } from "@/lib/scoring/engine"
import { FIX_IT_MODULES } from "@/lib/data/fix-it-modules"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { ViabilityReportPDF } from "@/components/pdf/viability-report-pdf"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { assessmentId } = await params

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, completedAt: { not: null }, idea: { userId } },
    include: {
      idea: true,
      dimensionResults: {
        include: { itemResponses: true },
        orderBy: { dimensionId: "asc" },
      },
    },
  })

  if (!assessment || !assessment.completedAt || assessment.overallScore === null || !assessment.verdict) {
    return NextResponse.json({ error: "Not found or not completed" }, { status: 404 })
  }

  // Rebuild scores from stored answers
  const allAnswers: Record<number, Record<string, string>> = {}
  for (const dr of assessment.dimensionResults) {
    allAnswers[dr.dimensionId] = {}
    for (const ir of dr.itemResponses) {
      allAnswers[dr.dimensionId][ir.itemId] = ir.answer
    }
  }
  const result = calculateScores(allAnswers as any)

  // Build PDF props
  const dimensionRows = result.dimensionScores.map((ds) => ({
    name: ds.name,
    rawScore: ds.rawScore,
    weight: ds.weight,
    killFlag: ds.killFlag,
  }))

  const killFlags = result.killFlags.map((kf) => ({
    dimensionName: kf.dimensionName,
    reason: kf.reason,
  }))

  // Only include fix-it rows for weak dimensions (<50)
  const weakDimIds = result.dimensionScores.filter((d) => d.rawScore < 50).map((d) => d.dimensionId)
  const fixItRows = weakDimIds
    .map((dimId) => {
      const mod = FIX_IT_MODULES.find((m) => m.dimensionId === dimId)
      if (!mod) return null
      return {
        dimensionName: mod.dimensionName,
        estimatedTime: mod.estimatedTime,
        taskTitles: mod.tasks.map((t) => t.title),
      }
    })
    .filter(Boolean) as { dimensionName: string; estimatedTime: string; taskTitles: string[] }[]

  const pdfElement = createElement(ViabilityReportPDF, {
    ideaTitle: assessment.idea.title,
    industry: assessment.idea.industry,
    model: assessment.idea.model,
    problem: assessment.idea.problem,
    solution: assessment.idea.solution,
    overallScore: assessment.overallScore,
    verdict: assessment.verdict as "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE",
    completedAt: assessment.completedAt.toISOString(),
    dimensionRows,
    killFlags,
    fixItRows,
  })

  const buffer = await renderToBuffer(pdfElement as any)

  const safeTitle = assessment.idea.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="viability-report-${safeTitle}.pdf"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  })
}

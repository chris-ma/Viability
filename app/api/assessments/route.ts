import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const FREE_ASSESSMENT_LIMIT = 10

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return prisma.user.findUnique({ where: { clerkId } })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ideaId } = await req.json()

  // Verify ownership
  const idea = await prisma.idea.findFirst({ where: { id: ideaId, userId: user.id } })
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 })

  // Enforce free-tier limit
  if (user.planTier === "free") {
    const totalAssessments = await prisma.assessment.count({
      where: { idea: { userId: user.id } },
    })
    if (totalAssessments >= FREE_ASSESSMENT_LIMIT) {
      return NextResponse.json(
        {
          error: "Assessment limit reached",
          code: "LIMIT_REACHED",
          limit: FREE_ASSESSMENT_LIMIT,
          message: `Free accounts are limited to ${FREE_ASSESSMENT_LIMIT} assessments. Upgrade to Founder Pro for unlimited.`,
        },
        { status: 402 }
      )
    }
  }

  const assessment = await prisma.assessment.create({ data: { ideaId } })
  await prisma.idea.update({ where: { id: ideaId }, data: { status: "active" } })

  return NextResponse.json(assessment, { status: 201 })
}

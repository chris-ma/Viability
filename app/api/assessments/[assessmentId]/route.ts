import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ assessmentId: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { assessmentId } = await params

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      idea: { userId },
    },
    include: {
      idea: true,
      dimensionResults: {
        include: { itemResponses: true },
        orderBy: { dimensionId: "asc" },
      },
    },
  })

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(assessment)
}

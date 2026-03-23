import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ideas = await prisma.idea.findMany({
    where: { userId },
    include: {
      assessments: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { id: true, overallScore: true, verdict: true, completedAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(ideas)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, problem, solution, industry, model } = body

  if (!title || !problem || !solution || !industry || !model) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const idea = await prisma.idea.create({
    data: { userId, title, problem, solution, industry, model, status: "draft" },
  })

  return NextResponse.json(idea, { status: 201 })
}

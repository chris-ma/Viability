import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

// GET: fetch all progress for current user
export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const progress = await prisma.fixItProgress.findMany({
    where: { userId },
  })
  return NextResponse.json(progress)
}

// POST: toggle a task's completed state
export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { dimensionId, taskId, completed } = await req.json()
  if (typeof dimensionId !== "number" || typeof taskId !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const record = await prisma.fixItProgress.upsert({
    where: { userId_dimensionId_taskId: { userId, dimensionId, taskId } },
    create: {
      userId,
      dimensionId,
      taskId,
      completed: !!completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed: !!completed,
      completedAt: completed ? new Date() : null,
    },
  })

  return NextResponse.json(record)
}

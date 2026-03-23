import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ideaId } = await req.json()

  // Verify ownership
  const idea = await prisma.idea.findFirst({ where: { id: ideaId, userId } })
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 })

  const assessment = await prisma.assessment.create({
    data: { ideaId },
  })

  // Update idea status to active
  await prisma.idea.update({ where: { id: ideaId }, data: { status: "active" } })

  return NextResponse.json(assessment, { status: 201 })
}

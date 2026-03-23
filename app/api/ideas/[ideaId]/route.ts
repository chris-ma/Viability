import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

async function getUserId() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.id ?? null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ideaId: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ideaId } = await params
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, userId },
    include: {
      assessments: {
        orderBy: { startedAt: "desc" },
        include: { dimensionResults: { include: { itemResponses: true } } },
      },
    },
  })

  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(idea)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ideaId: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ideaId } = await params
  const body = await req.json()

  const idea = await prisma.idea.findFirst({ where: { id: ideaId, userId } })
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.idea.update({
    where: { id: ideaId },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ ideaId: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ideaId } = await params
  const idea = await prisma.idea.findFirst({ where: { id: ideaId, userId } })
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.idea.delete({ where: { id: ideaId } })
  return NextResponse.json({ success: true })
}

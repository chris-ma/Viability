import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const VALID_STAGES = [
  "new",
  "screened",
  "worth_contacting",
  "awaiting_info",
  "reviewing_financials",
  "dd",
  "rejected",
  "closed",
]

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return prisma.user.findUnique({ where: { clerkId } })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { stage } = await req.json()

  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 })
  }

  const listing = await prisma.bizListing.findFirst({ where: { id, userId: user.id } })
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.bizListing.update({
    where: { id },
    data: { pipelineStage: stage },
  })

  return NextResponse.json(updated)
}

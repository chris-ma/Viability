import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return prisma.user.findUnique({ where: { clerkId } })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const listing = await prisma.bizListing.findFirst({
    where: { id, userId: user.id },
    include: {
      fields: true,
      financials: true,
      classification: true,
      riskFlags: { orderBy: [{ severity: "desc" }, { createdAt: "asc" }] },
      missingInfo: { orderBy: [{ priority: "desc" }, { createdAt: "asc" }] },
      score: true,
      valuation: true,
      notes: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(listing)
}

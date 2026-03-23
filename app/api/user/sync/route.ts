import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) return NextResponse.json({ error: "No email found" }, { status: 400 })

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
    },
    create: {
      clerkId: userId,
      email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
    },
  })

  return NextResponse.json(user)
}

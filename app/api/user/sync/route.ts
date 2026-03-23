import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

// GET: called when dashboard redirects a new user here — sync then go to dashboard
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ""

  await prisma.user.upsert({
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

  return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))
}

// POST: called programmatically to sync user data
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

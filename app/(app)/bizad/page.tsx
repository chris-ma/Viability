import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { BizAdClient } from "@/components/bizad/dashboard-client"

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/sign-in")
  return user
}

export default async function BizAdPage() {
  const user = await getUser()

  const listings = await prisma.bizListing.findMany({
    where: { userId: user.id },
    include: { score: true },
    orderBy: { createdAt: "desc" },
  })

  return <BizAdClient listings={listings} />
}

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserButton } from "@clerk/nextjs"
import { Settings, Shield, Database, CreditCard } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function SettingsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { clerkId },
      include: {
        _count: {
          select: { ideas: true },
        },
      },
    }),
  ])

  if (!dbUser) redirect("/dashboard")

  const PLAN_LABELS: Record<string, string> = {
    free: "Free",
    pro: "Founder Pro",
    studio: "Studio",
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#F2D9C0] rounded-xl flex items-center justify-center">
            <Settings className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1C0F07]">Settings</h1>
            <p className="text-[#1C0F07]/55 mt-0.5">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1C0F07]/55" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <UserButton />
            <div>
              <p className="font-semibold text-[#1C0F07]">
                {clerkUser?.fullName ?? clerkUser?.firstName ?? "Your Account"}
              </p>
              <p className="text-sm text-[#1C0F07]/55">
                {clerkUser?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#1C0F07]/40">
            Click your avatar above to update your name, email, or password via Clerk.
          </p>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#1C0F07]/55" />
            Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-[#1C0F07]">{PLAN_LABELS[dbUser.planTier] ?? "Free"}</p>
              <p className="text-sm text-[#1C0F07]/55">
                {dbUser.planTier === "free"
                  ? "1 active assessment, basic Fix-It summaries"
                  : dbUser.planTier === "pro"
                  ? "Unlimited assessments, full Fix-It modules, PDF reports"
                  : "Everything in Pro + team collaboration"}
              </p>
            </div>
            <Badge variant={dbUser.planTier === "free" ? "secondary" : "green"}>
              {PLAN_LABELS[dbUser.planTier] ?? "Free"}
            </Badge>
          </div>
          {dbUser.planTier === "free" && (
            <div className="bg-[#FBF7F0] rounded-xl border border-[#F2D9C0] p-4">
              <p className="text-sm font-semibold text-[#1C0F07] mb-1">Upgrade to Founder Pro — £9/month</p>
              <p className="text-xs text-[#1C0F07]/55">Unlimited assessments, full Fix-It modules, PDF Viability Reports, re-testing.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account data */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-[#1C0F07]/55" />
            Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#1C0F07]/65">Member since</span>
            <span className="font-medium text-[#1C0F07]">{formatDate(dbUser.createdAt.toISOString())}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#1C0F07]/65">Ideas created</span>
            <span className="font-medium text-[#1C0F07]">{dbUser._count.ideas}</span>
          </div>
          <Separator />
          <div className="space-y-2 pt-1">
            <p className="text-xs text-[#1C0F07]/55">
              Your assessment data is private by default and never shared with third parties or used for advertising.
            </p>
            <p className="text-xs text-[#1C0F07]/55">
              To export your data or delete your account, contact <span className="text-[#D4622A]">support@viabilityfirst.com</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

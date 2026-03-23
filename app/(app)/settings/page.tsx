import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/db/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import {
  Lightbulb,
  BarChart3,
  CheckSquare,
  Calendar,
  CreditCard,
  Shield,
  Database,
  ExternalLink,
  Sparkles,
  Lock,
  Trash2,
  Download,
  ArrowRight,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

const PLAN_CONFIG: Record<string, {
  label: string
  description: string
  features: string[]
  badge: "secondary" | "green" | "amber"
}> = {
  free: {
    label: "Free",
    description: "Get started with up to 10 free assessments.",
    features: ["10 assessments included", "Full 8-dimension checklist", "Basic Fix-It summaries"],
    badge: "secondary",
  },
  pro: {
    label: "Founder Pro",
    description: "Everything you need to validate and iterate.",
    features: ["Unlimited ideas & assessments", "Full Fix-It modules", "PDF Viability Reports", "Re-testing & comparison"],
    badge: "green",
  },
  studio: {
    label: "Studio",
    description: "Team-level collaboration and management.",
    features: ["Everything in Founder Pro", "Team collaboration", "Shared idea workspaces", "Priority support"],
    badge: "amber",
  },
}

export default async function SettingsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { clerkId },
      include: {
        _count: { select: { ideas: true, fixItProgress: true } },
      },
    }),
  ])

  if (!dbUser) redirect("/dashboard")

  // Pull assessment stats
  const [completedAssessments, fixItDone] = await Promise.all([
    prisma.assessment.count({
      where: { idea: { userId: dbUser.id }, completedAt: { not: null } },
    }),
    prisma.fixItProgress.count({
      where: { userId: dbUser.id, completed: true },
    }),
  ])

  const plan = PLAN_CONFIG[dbUser.planTier] ?? PLAN_CONFIG.free
  const displayName = clerkUser?.fullName ?? clerkUser?.firstName ?? "Your Account"
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ""
  const avatarUrl = clerkUser?.imageUrl

  const stats = [
    { label: "Ideas created", value: dbUser._count.ideas, icon: Lightbulb, color: "text-[#D4622A]", bg: "bg-[#F2D9C0]" },
    { label: "Assessments done", value: completedAssessments, icon: BarChart3, color: "text-[#D4622A]", bg: "bg-[#F2D9C0]" },
    { label: "Fix-It tasks done", value: fixItDone, icon: CheckSquare, color: "text-green-600", bg: "bg-green-100" },
    { label: "Member since", value: formatDate(dbUser.createdAt), icon: Calendar, color: "text-[#1C0F07]/55", bg: "bg-[#F2D9C0]/60", wide: true },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* ── Profile banner ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Top gradient strip */}
        <div className="h-24 bg-gradient-to-r from-[#1C0F07] via-[#D4622A] to-[#E8A44A]" />
        <CardContent className="p-6 pt-0">
          <div className="flex items-end gap-5 -mt-10 mb-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={72}
                  height={72}
                  className="rounded-2xl border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-2xl border-4 border-white shadow-md bg-[#1C0F07] flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {displayName[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
            </div>
            {/* Name + plan badge (pushed down from the gradient) */}
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-[#1C0F07] truncate">{displayName}</h2>
                <Badge variant={plan.badge}>{plan.label}</Badge>
              </div>
              <p className="text-sm text-[#1C0F07]/55 truncate">{email}</p>
            </div>
            {/* Clerk profile button */}
            <div className="shrink-0 pb-1">
              <UserButton />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="bg-[#FBF7F0] rounded-xl p-3 flex flex-col gap-1"
                >
                  <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center mb-0.5`}>
                    <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </div>
                  <p className="text-base font-black text-[#1C0F07] leading-none">{s.value}</p>
                  <p className="text-xs text-[#1C0F07]/50 leading-tight">{s.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Plan & Billing ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#1C0F07]/55" />
            Plan &amp; Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-[#1C0F07]">{plan.label}</p>
              <p className="text-sm text-[#1C0F07]/55 mt-0.5">{plan.description}</p>
              <ul className="mt-2 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-[#1C0F07]/65 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#D4622A] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Badge variant={plan.badge} className="shrink-0">{plan.label}</Badge>
          </div>

          {dbUser.planTier === "free" && (
            <>
              <Separator />
              <div className="rounded-2xl border border-[#E8A44A]/40 bg-gradient-to-br from-[#FBF7F0] to-[#F2D9C0]/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#1C0F07] rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-[#E8A44A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1C0F07] mb-0.5">Upgrade to Founder Pro — £9/month</p>
                    <p className="text-xs text-[#1C0F07]/55 mb-3">
                      Unlimited assessments, full Fix-It modules, PDF Viability Reports, and re-testing.
                    </p>
                    <Button size="sm" className="gap-1.5">
                      Upgrade now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Account & Security ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1C0F07]/55" />
            Account &amp; Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {[
            {
              icon: Shield,
              label: "Profile details",
              sub: "Update your name, email address, or profile photo",
              action: "Edit via Clerk",
            },
            {
              icon: Lock,
              label: "Password",
              sub: "Change your password or enable passwordless sign-in",
              action: "Manage",
            },
          ].map((row, i) => {
            const Icon = row.icon
            return (
              <div key={row.label}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-[#F2D9C0] rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#1C0F07]/65" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1C0F07]">{row.label}</p>
                      <p className="text-xs text-[#1C0F07]/55 truncate">{row.sub}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <UserButton />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ── Data & Privacy ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-[#1C0F07]/55" />
            Data &amp; Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {[
            {
              icon: Database,
              label: "Your data",
              sub: "Assessment answers and idea details are private by default — never shared or used for advertising.",
            },
            {
              icon: Download,
              label: "Export your data",
              sub: "Download a copy of all your ideas, assessments, and scores in JSON format.",
              action: { label: "Request export", href: "mailto:support@viabilityfirst.com?subject=Data export request" },
            },
            {
              icon: ExternalLink,
              label: "Privacy policy",
              sub: "Read how we collect, store, and protect your data.",
              action: { label: "View policy", href: "/privacy" },
            },
          ].map((row, i) => {
            const Icon = row.icon
            return (
              <div key={row.label}>
                {i > 0 && <Separator />}
                <div className="flex items-start justify-between py-4 gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 bg-[#F2D9C0] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-[#1C0F07]/65" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1C0F07]">{row.label}</p>
                      <p className="text-xs text-[#1C0F07]/55 leading-relaxed">{row.sub}</p>
                    </div>
                  </div>
                  {"action" in row && row.action && (
                    <a
                      href={row.action.href}
                      className="shrink-0 text-xs font-semibold text-[#D4622A] hover:text-[#D4622A]/80 hover:underline whitespace-nowrap mt-0.5"
                    >
                      {row.action.label}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ── Danger zone ────────────────────────────────────────────────────── */}
      <Card className="border-red-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-red-700">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1C0F07]">Delete account</p>
              <p className="text-xs text-[#1C0F07]/55 mt-0.5 max-w-xs">
                Permanently delete your account and all associated ideas, assessments, and data. This cannot be undone.
              </p>
            </div>
            <a
              href="mailto:support@viabilityfirst.com?subject=Account deletion request"
              className="shrink-0"
            >
              <Button variant="destructive" size="sm">
                <Trash2 className="h-3.5 w-3.5" />
                Delete account
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

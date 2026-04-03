import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getVerdictConfig } from "@/lib/scoring/engine"
import { DIMENSIONS } from "@/lib/data/checklist"
import { FIX_IT_MODULES } from "@/lib/data/fix-it-modules"
import { formatDate } from "@/lib/utils"
import {
  Plus,
  ArrowRight,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Lightbulb,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { DashboardAnimations } from "@/components/animation/dashboard-animations"

const FREE_LIMIT = 10

async function getData(userId: string) {
  const [ideas, totalAssessments, fixItDone] = await Promise.all([
    prisma.idea.findMany({
      where: { userId, status: { notIn: ["archived", "killed"] } },
      include: {
        assessments: {
          orderBy: { startedAt: "desc" },
          take: 1,
          select: {
            id: true,
            overallScore: true,
            verdict: true,
            completedAt: true,
            startedAt: true,
            dimensionResults: {
              select: { dimensionId: true, rawScore: true, killFlag: true },
              orderBy: { dimensionId: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.assessment.count({ where: { idea: { userId } } }),
    prisma.fixItProgress.count({ where: { userId, completed: true } }),
  ])
  return { ideas, totalAssessments, fixItDone }
}

// ── Small helpers ────────────────────────────────────────────────────────────

function ScorePill({ score, verdict }: { score: number; verdict: string }) {
  const cfg = getVerdictConfig(verdict as any)
  return (
    <div className="text-center">
      <div
        className="text-5xl font-bold tracking-tight"
        style={{ color: cfg.color }}
      >
        {Math.round(score)}
      </div>
      <div
        className="text-xs font-semibold mt-1 uppercase tracking-widest"
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </div>
    </div>
  )
}

function DimBar({ dimensionId, rawScore, killFlag }: { dimensionId: number; rawScore: number; killFlag: boolean }) {
  const dim = DIMENSIONS.find((d) => d.id === dimensionId)
  if (!dim) return null
  const color = rawScore >= 75 ? "#22c55e" : rawScore >= 50 ? "#f59e0b" : "#ef4444"
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#6E6E73] w-28 shrink-0 truncate">{dim.shortName}</span>
      <div className="flex-1 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${rawScore}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[13px] font-semibold w-8 text-right shrink-0" style={{ color }}>
        {Math.round(rawScore)}
      </span>
      {killFlag && <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const clerkUser = await currentUser()

  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/api/user/sync")

  const { ideas, totalAssessments, fixItDone } = await getData(user.id)

  const firstName = clerkUser?.firstName ?? "there"
  const isFree = user.planTier === "free"
  const atLimit = isFree && totalAssessments >= FREE_LIMIT
  const nearLimit = isFree && totalAssessments >= FREE_LIMIT - 2

  // Completed assessments sorted by completedAt desc
  const completedIdeas = ideas
    .filter((i) => i.assessments[0]?.completedAt)
    .sort(
      (a, b) =>
        new Date(b.assessments[0]!.completedAt!).getTime() -
        new Date(a.assessments[0]!.completedAt!).getTime()
    )

  const featuredIdea = completedIdeas[0] ?? ideas[0] ?? null
  const otherIdeas = ideas.filter((i) => i.id !== featuredIdea?.id)

  const totalIdeas = ideas.length
  const viableCount = completedIdeas.filter((i) => i.assessments[0]?.verdict === "VIABLE").length
  const needsWorkCount = completedIdeas.filter(
    (i) => i.assessments[0]?.verdict === "NEEDS_WORK" || i.assessments[0]?.verdict === "NOT_VIABLE"
  ).length
  const inProgressCount = ideas.filter((i) => i.assessments[0] && !i.assessments[0].completedAt).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <DashboardAnimations />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div id="dash-header" className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="text-sm text-[#AEAEB2] mb-0.5">Good to see you,</p>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{firstName}</h1>
        </div>
        {atLimit ? (
          <Link href="/settings">
            <Button size="sm" className="gap-1.5 bg-[#1D1D1F] hover:bg-black">
              <Zap className="h-3.5 w-3.5" />
              Upgrade to continue
            </Button>
          </Link>
        ) : (
          <Link href="/assessment/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Assessment
            </Button>
          </Link>
        )}
      </div>

      {/* ── Plan usage bar (free tier) ──────────────────────────────────────── */}
      {isFree && (
        <div className={`rounded-2xl p-4 mb-6 flex items-center gap-4 ${atLimit ? "bg-red-50 ring-1 ring-red-200" : nearLimit ? "bg-amber-50 ring-1 ring-amber-200" : "bg-white ring-1 ring-black/[0.06]"}`}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${atLimit ? "text-red-700" : "text-[#1D1D1F]"}`}>
                {atLimit ? "Free limit reached" : `${totalAssessments} of ${FREE_LIMIT} free assessments used`}
              </span>
              <span className={`text-xs ${atLimit ? "text-red-500" : "text-[#AEAEB2]"}`}>
                {isFree ? "Free" : "Founder Pro"}
              </span>
            </div>
            <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${atLimit ? "bg-red-500" : nearLimit ? "bg-amber-500" : "bg-[#1D1D1F]"}`}
                style={{ width: `${Math.min((totalAssessments / FREE_LIMIT) * 100, 100)}%` }}
              />
            </div>
          </div>
          <Link href="/settings">
            <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
              {atLimit ? "Upgrade now" : "Go unlimited"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total ideas",   value: totalIdeas,       icon: Lightbulb,      color: "text-[#6E6E73]" },
          { label: "Viable",        value: viableCount,      icon: TrendingUp,     color: "text-green-600" },
          { label: "Needs work",    value: needsWorkCount,   icon: AlertTriangle,  color: "text-amber-500" },
          { label: "Fix-It done",   value: fixItDone,        icon: CheckCircle2,   color: "text-[#6E6E73]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dash-stat-card bg-white rounded-2xl ring-1 ring-black/[0.06] p-4">
            <Icon className={`h-4 w-4 ${color} mb-2`} />
            <div className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{value}</div>
            <div className="text-xs text-[#AEAEB2] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {ideas.length === 0 && (
        <div className="bg-white rounded-3xl ring-1 ring-black/[0.06] p-16 text-center">
          <div className="w-14 h-14 bg-[#F2F2F7] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lightbulb className="h-7 w-7 text-[#AEAEB2]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">No ideas yet</h2>
          <p className="text-sm text-[#6E6E73] mb-7 max-w-xs mx-auto">
            Run your first viability assessment — 40 questions, 8 dimensions, one clear verdict.
          </p>
          <Link href="/assessment/new">
            <Button size="lg">
              <Plus className="h-4 w-4" />
              Start your first assessment
            </Button>
          </Link>
        </div>
      )}

      {/* ── Featured (latest) project ────────────────────────────────────────── */}
      {featuredIdea && (() => {
        const a = featuredIdea.assessments[0]
        const cfg = a?.verdict ? getVerdictConfig(a.verdict as any) : null
        const dims = a?.dimensionResults ?? []
        const sorted = [...dims].sort((x, y) => x.rawScore - y.rawScore)
        const weakest = sorted.slice(0, 3)
        const strongest = sorted.slice(-3).reverse()
        const weakDimIds = dims.filter((d) => d.rawScore < 50).map((d) => d.dimensionId)
        const fixItCount = weakDimIds.filter((id) =>
          FIX_IT_MODULES.some((m) => m.dimensionId === id)
        ).length

        return (
          <div id="dash-featured" className="mb-6">
            <p className="text-xs font-medium text-[#AEAEB2] uppercase tracking-widest mb-3">
              Latest Project
            </p>
            <div className="bg-white rounded-3xl ring-1 ring-black/[0.06] overflow-hidden">
              {/* Top bar in verdict color */}
              {cfg && <div className="h-0.5 w-full" style={{ backgroundColor: cfg.color }} />}

              <div className="p-6 sm:p-8">
                {/* Title row */}
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-[#1D1D1F] tracking-tight mb-1 truncate">
                      {featuredIdea.title}
                    </h2>
                    <p className="text-sm text-[#6E6E73]">
                      {featuredIdea.industry}
                      {featuredIdea.model ? ` · ${featuredIdea.model}` : ""}
                    </p>
                    <p className="text-xs text-[#AEAEB2] mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {a?.completedAt
                        ? `Assessed ${formatDate(a.completedAt)}`
                        : a
                        ? "Assessment in progress"
                        : "Not yet assessed"}
                    </p>
                  </div>
                  {a?.completedAt && a.overallScore != null && cfg ? (
                    <ScorePill score={a.overallScore} verdict={a.verdict!} />
                  ) : a ? (
                    <Badge variant="secondary" className="shrink-0">In Progress</Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0">Draft</Badge>
                  )}
                </div>

                {/* Dimension highlights — only if completed */}
                {a?.completedAt && dims.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
                    <div>
                      <p className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-widest mb-2">Strongest</p>
                      <div className="space-y-2">
                        {strongest.map((d) => <DimBar key={d.dimensionId} {...d} />)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-widest mb-2">Weakest</p>
                      <div className="space-y-2">
                        {weakest.map((d) => <DimBar key={d.dimensionId} {...d} />)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-black/[0.04]">
                  {a?.completedAt ? (
                    <>
                      <Link href={`/assessment/${a.id}/results`}>
                        <Button size="sm" className="gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5" />
                          View Results
                        </Button>
                      </Link>
                      <Link href={`/assessment/${a.id}/checklist`}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          Re-assess
                        </Button>
                      </Link>
                      {fixItCount > 0 && (
                        <Link href="/fix-it">
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Wrench className="h-3.5 w-3.5" />
                            Fix-It
                            <span className="ml-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {fixItCount}
                            </span>
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : a ? (
                    <Link href={`/assessment/${a.id}/checklist`}>
                      <Button size="sm" className="gap-1.5">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Continue Assessment
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/assessment/new">
                      <Button size="sm" className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Start Assessment
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── All other projects ───────────────────────────────────────────────── */}
      {otherIdeas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[#AEAEB2] uppercase tracking-widest">
              All Projects
            </p>
            <Link href="/ideas" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] flex items-center gap-1 transition-colors">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherIdeas.slice(0, 6).map((idea) => {
              const a = idea.assessments[0]
              const cfg = a?.verdict ? getVerdictConfig(a.verdict as any) : null
              const href = a?.completedAt
                ? `/assessment/${a.id}/results`
                : a
                ? `/assessment/${a.id}/checklist`
                : `/assessment/new`

              return (
                <Link key={idea.id} href={href}>
                  <div className="dash-project-card bg-white rounded-2xl ring-1 ring-black/[0.06] p-5 hover:shadow-md hover:ring-black/[0.10] transition-all cursor-pointer h-full flex flex-col">
                    {/* Score line */}
                    {cfg && a?.overallScore != null && (
                      <div className="h-0.5 rounded-full mb-4" style={{ backgroundColor: cfg.color, width: `${a.overallScore}%` }} />
                    )}

                    <div className="flex items-start justify-between gap-3 flex-1">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-[#1D1D1F] line-clamp-2 leading-snug mb-1">
                          {idea.title}
                        </h3>
                        <p className="text-xs text-[#AEAEB2] truncate">{idea.industry}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {a?.completedAt && a.overallScore != null && cfg ? (
                          <div>
                            <div className="text-xl font-bold tracking-tight" style={{ color: cfg.color }}>
                              {Math.round(a.overallScore)}
                            </div>
                            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: cfg.color }}>
                              {cfg.label}
                            </div>
                          </div>
                        ) : a ? (
                          <span className="text-[11px] font-medium text-[#AEAEB2]">In Progress</span>
                        ) : (
                          <span className="text-[11px] font-medium text-[#AEAEB2]">Draft</span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#AEAEB2] mt-3 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(idea.updatedAt)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, BarChart3, Lightbulb, TrendingUp, AlertTriangle, Wrench, ArrowRight, CheckCircle2 } from "lucide-react"
import { getVerdictConfig } from "@/lib/scoring/engine"
import { FIX_IT_MODULES } from "@/lib/data/fix-it-modules"
import { formatDate } from "@/lib/utils"

async function getData(userId: string) {
  const [ideas, fixItProgress] = await Promise.all([
    prisma.idea.findMany({
      where: { userId },
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
            dimensionResults: { where: { rawScore: { lt: 50 } }, select: { dimensionId: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.fixItProgress.findMany({ where: { userId, completed: true } }),
  ])
  return { ideas, fixItProgress }
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/api/user/sync")

  const { ideas, fixItProgress } = await getData(user.id)

  const activeIdeas = ideas.filter((i) => i.status !== "archived" && i.status !== "killed")
  const completedAssessments = activeIdeas.filter((i) => i.assessments[0]?.completedAt)
  const viableCount = completedAssessments.filter(
    (i) => i.assessments[0]?.verdict === "VIABLE"
  ).length
  const needsWorkCount = completedAssessments.filter(
    (i) => i.assessments[0]?.verdict === "NEEDS_WORK" || i.assessments[0]?.verdict === "NOT_VIABLE"
  ).length

  // Fix-It stats
  const completedTaskIds = new Set(fixItProgress.map((p) => `${p.dimensionId}:${p.taskId}`))
  const weakDimensions = completedAssessments.flatMap((i) =>
    (i.assessments[0]?.dimensionResults ?? []).map((dr) => dr.dimensionId)
  )
  const uniqueWeakDims = [...new Set(weakDimensions)]
  const totalFixItTasks = uniqueWeakDims.reduce((sum, dimId) => {
    const module = FIX_IT_MODULES.find((m) => m.dimensionId === dimId)
    return sum + (module?.tasks.length ?? 0)
  }, 0)
  const doneFixItTasks = uniqueWeakDims.reduce((sum, dimId) => {
    const module = FIX_IT_MODULES.find((m) => m.dimensionId === dimId)
    if (!module) return sum
    return sum + module.tasks.filter((t) => completedTaskIds.has(`${dimId}:${t.id}`)).length
  }, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your idea viability workspace</p>
        </div>
        <Link href="/assessment/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Ideas", value: activeIdeas.length, icon: Lightbulb, color: "text-gray-600", bg: "bg-gray-100" },
          { label: "Assessed", value: completedAssessments.length, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Viable", value: viableCount, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
          { label: "Need Work", value: needsWorkCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Fix-It progress banner */}
      {totalFixItTasks > 0 && (
        <Link href="/fix-it">
          <Card className="mb-6 border-amber-200 bg-amber-50/40 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Wrench className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-bold text-gray-900">Fix-It Progress</p>
                    <span className="text-xs text-gray-500">{doneFixItTasks}/{totalFixItTasks} tasks</span>
                  </div>
                  <Progress value={(doneFixItTasks / totalFixItTasks) * 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1.5">
                    {doneFixItTasks === totalFixItTasks
                      ? "All tasks complete — time to re-assess!"
                      : `${totalFixItTasks - doneFixItTasks} tasks remaining across ${uniqueWeakDims.length} dimension${uniqueWeakDims.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Ideas list */}
      {activeIdeas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start your first viability assessment. It takes less than 30 minutes and could save you months of wasted effort.
            </p>
            <Link href="/assessment/new">
              <Button size="lg">
                <Plus className="h-4 w-4" />
                Assess My First Idea
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Ideas</h2>
          <div className="space-y-3">
            {activeIdeas.slice(0, 8).map((idea) => {
              const latestAssessment = idea.assessments[0]
              const verdictConfig = latestAssessment?.verdict
                ? getVerdictConfig(latestAssessment.verdict as any)
                : null
              const weakCount = latestAssessment?.dimensionResults?.length ?? 0

              return (
                <Link
                  key={idea.id}
                  href={
                    latestAssessment?.completedAt
                      ? `/assessment/${latestAssessment.id}/results`
                      : latestAssessment
                      ? `/assessment/${latestAssessment.id}/checklist`
                      : `/assessment/new`
                  }
                >
                  <Card className="hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-900 truncate">{idea.title}</h3>
                            <Badge variant="secondary" className="shrink-0 text-xs">{idea.industry}</Badge>
                            {weakCount > 0 && (
                              <Badge variant="amber" className="shrink-0 text-xs">
                                {weakCount} dimension{weakCount !== 1 ? "s" : ""} to fix
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{idea.problem}</p>
                          <p className="text-xs text-gray-400 mt-1">Updated {formatDate(idea.updatedAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {latestAssessment?.completedAt && latestAssessment.overallScore !== null ? (
                            <div>
                              <div
                                className="text-2xl font-black"
                                style={{ color: verdictConfig?.color }}
                              >
                                {Math.round(latestAssessment.overallScore)}
                              </div>
                              <div className={`text-xs font-bold ${verdictConfig?.textColor}`}>
                                {verdictConfig?.label}
                              </div>
                            </div>
                          ) : latestAssessment ? (
                            <Badge variant="secondary">In Progress</Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
          {activeIdeas.length > 8 && (
            <div className="mt-4 text-center">
              <Link href="/ideas">
                <Button variant="outline" size="sm">
                  View all {activeIdeas.length} ideas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

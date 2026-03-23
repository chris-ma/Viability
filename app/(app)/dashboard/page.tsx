import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart3, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"
import { getVerdictConfig } from "@/lib/scoring/engine"
import { formatDate } from "@/lib/utils"

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      ideas: {
        include: {
          assessments: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: { id: true, overallScore: true, verdict: true, completedAt: true, startedAt: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
    },
  })
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  // Auto-sync user on first visit
  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    // Will be created via API but for SSR we redirect
    redirect("/api/user/sync")
  }

  user = await getUser() as any

  const ideas = (user as any)?.ideas ?? []
  const completedAssessments = ideas.filter(
    (i: any) => i.assessments[0]?.completedAt
  )
  const viableCount = completedAssessments.filter(
    (i: any) => i.assessments[0]?.verdict === "VIABLE"
  ).length
  const killFlagCount = ideas.filter((i: any) => i.status === "killed").length

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Ideas", value: ideas.length, icon: Lightbulb, color: "text-blue-600" },
          { label: "Completed", value: completedAssessments.length, icon: BarChart3, color: "text-green-600" },
          { label: "Viable Ideas", value: viableCount, icon: TrendingUp, color: "text-green-600" },
          { label: "Killed", value: killFlagCount, icon: AlertTriangle, color: "text-red-600" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Ideas list or empty state */}
      {ideas.length === 0 ? (
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
            {ideas.map((idea: any) => {
              const latestAssessment = idea.assessments[0]
              const verdictConfig = latestAssessment?.verdict
                ? getVerdictConfig(latestAssessment.verdict)
                : null

              return (
                <Link
                  key={idea.id}
                  href={
                    latestAssessment?.completedAt
                      ? `/assessment/${latestAssessment.id}/results`
                      : latestAssessment
                      ? `/assessment/${latestAssessment.id}/checklist`
                      : `/assessment/new?ideaId=${idea.id}`
                  }
                >
                  <Card className="hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">{idea.title}</h3>
                            <Badge variant="secondary" className="shrink-0 text-xs">{idea.industry}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{idea.problem}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Updated {formatDate(idea.updatedAt)}
                          </p>
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
        </div>
      )}
    </div>
  )
}

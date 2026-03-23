import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Lightbulb } from "lucide-react"
import { getVerdictConfig } from "@/lib/scoring/engine"
import { formatDate } from "@/lib/utils"

export default async function IdeasPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/dashboard")

  const ideas = await prisma.idea.findMany({
    where: { userId: user.id },
    include: {
      assessments: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { id: true, overallScore: true, verdict: true, completedAt: true, startedAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Ideas</h1>
          <p className="text-gray-500 mt-1">All your business idea assessments</p>
        </div>
        <Link href="/assessment/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Idea
          </Button>
        </Link>
      </div>

      {ideas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas yet</h3>
            <p className="text-gray-500 mb-6">Start your first assessment to see your ideas here.</p>
            <Link href="/assessment/new">
              <Button>
                <Plus className="h-4 w-4" />
                Assess Your First Idea
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const latest = idea.assessments[0]
            const verdictConfig = latest?.verdict ? getVerdictConfig(latest.verdict as any) : null
            const href = latest?.completedAt
              ? `/assessment/${latest.id}/results`
              : latest
              ? `/assessment/${latest.id}/checklist`
              : `/assessment/new`

            return (
              <Link key={idea.id} href={href}>
                <Card className="hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="font-bold text-gray-900">{idea.title}</h2>
                          <Badge variant="secondary" className="text-xs">{idea.industry}</Badge>
                          <Badge variant="outline" className="text-xs">{idea.model}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{idea.problem}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Created {formatDate(idea.createdAt)}</span>
                          {latest && (
                            <span>{idea.assessments.length} assessment{idea.assessments.length !== 1 ? "s" : ""}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {latest?.completedAt && latest.overallScore !== null ? (
                          <div>
                            <div
                              className="text-3xl font-black"
                              style={{ color: verdictConfig?.color }}
                            >
                              {Math.round(latest.overallScore)}
                            </div>
                            <div className={`text-xs font-bold ${verdictConfig?.textColor}`}>
                              {verdictConfig?.label}
                            </div>
                          </div>
                        ) : latest ? (
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
      )}
    </div>
  )
}

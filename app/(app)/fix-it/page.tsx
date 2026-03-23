import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FIX_IT_MODULES } from "@/lib/data/fix-it-modules"
import { Wrench, ArrowRight, CheckCircle2 } from "lucide-react"

export default async function FixItPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/dashboard")

  // Find all completed assessments with low-scoring dimensions
  const assessments = await prisma.assessment.findMany({
    where: { idea: { userId: user.id }, completedAt: { not: null } },
    include: {
      idea: { select: { title: true } },
      dimensionResults: { where: { rawScore: { lt: 50 } } },
    },
    orderBy: { completedAt: "desc" },
  })

  const activeModules = assessments
    .flatMap((a) =>
      a.dimensionResults.map((dr) => ({
        assessmentId: a.id,
        ideaTitle: a.idea.title,
        dimensionId: dr.dimensionId,
        rawScore: dr.rawScore,
        module: FIX_IT_MODULES.find((m) => m.dimensionId === dr.dimensionId),
      }))
    )
    .filter((m) => m.module)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Wrench className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Fix-It Centre</h1>
            <p className="text-gray-500 mt-0.5">Action plans for your low-scoring dimensions</p>
          </div>
        </div>
      </div>

      {activeModules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active Fix-It modules</h3>
            <p className="text-gray-500 mb-6">
              Either all your dimensions score above 50%, or you haven't completed an assessment yet.
            </p>
            <Link href="/assessment/new">
              <Button>Start an Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeModules.map((item, i) => {
            const { module } = item
            if (!module) return null

            return (
              <Card key={i} className="border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="amber" className="text-xs">Fix-It</Badge>
                        <span className="text-xs text-gray-400">{item.ideaTitle}</span>
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">⏱ {module.estimatedTime}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-red-500">{Math.round(item.rawScore)}%</div>
                      <div className="text-xs text-gray-400">current score</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-5">
                    {module.tasks.map((task, ti) => (
                      <div key={task.id} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">
                          {ti + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                          {task.resource && (
                            <p className="text-xs text-blue-600 mt-1">📎 {task.resource}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href={`/assessment/${item.assessmentId}/checklist`}>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="h-4 w-4" />
                      Re-assess after completing tasks
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FIX_IT_MODULES } from "@/lib/data/fix-it-modules"
import { Wrench, CheckCircle2 } from "lucide-react"
import { FixItClient, type ActiveModule } from "./fix-it-client"

export default async function FixItPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/dashboard")

  // Load low-scoring dimensions from completed assessments
  const assessments = await prisma.assessment.findMany({
    where: { idea: { userId: user.id }, completedAt: { not: null } },
    include: {
      idea: { select: { id: true, title: true, status: true } },
      dimensionResults: { where: { rawScore: { lt: 50 } } },
    },
    orderBy: { completedAt: "desc" },
  })

  // Load user's existing fix-it task progress
  const progressRecords = await prisma.fixItProgress.findMany({
    where: { userId: user.id },
  })
  const progressMap = new Map<string, boolean>()
  for (const p of progressRecords) {
    progressMap.set(`${p.dimensionId}:${p.taskId}`, p.completed)
  }

  // Build active modules list (exclude archived/killed ideas)
  const modules: ActiveModule[] = assessments
    .filter((a) => a.idea.status !== "archived" && a.idea.status !== "killed")
    .flatMap((a) =>
      a.dimensionResults.map((dr) => {
        const module = FIX_IT_MODULES.find((m) => m.dimensionId === dr.dimensionId)
        if (!module) return null
        const completedTaskIds = module.tasks
          .filter((t) => progressMap.get(`${dr.dimensionId}:${t.id}`) === true)
          .map((t) => t.id)
        return {
          assessmentId: a.id,
          ideaTitle: a.idea.title,
          dimensionId: dr.dimensionId,
          rawScore: dr.rawScore,
          module,
          completedTaskIds,
        } satisfies ActiveModule
      })
    )
    .filter((m): m is ActiveModule => m !== null)

  // Summary stats
  const totalTasks = modules.reduce((s, m) => s + m.module.tasks.length, 0)
  const completedTasks = modules.reduce((s, m) => s + m.completedTaskIds.length, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Wrench className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1C0F07]">Fix-It Centre</h1>
            <p className="text-[#1C0F07]/55 mt-0.5">Action plans for your low-scoring dimensions</p>
          </div>
        </div>

        {modules.length > 0 && (
          <div className="bg-[#FBF7F0] rounded-2xl border border-[#F2D9C0] p-4 flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-[#1C0F07]">{completedTasks}</div>
              <div className="text-xs text-[#1C0F07]/55">tasks done</div>
            </div>
            <div className="h-8 w-px bg-[#F2D9C0]" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#1C0F07]">{totalTasks - completedTasks}</div>
              <div className="text-xs text-[#1C0F07]/55">remaining</div>
            </div>
            <div className="h-8 w-px bg-[#F2D9C0]" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#1C0F07]">{modules.length}</div>
              <div className="text-xs text-[#1C0F07]/55">active modules</div>
            </div>
          </div>
        )}
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1C0F07] mb-2">No active Fix-It modules</h3>
            <p className="text-[#1C0F07]/55 mb-6 max-w-sm mx-auto">
              Either all your dimensions score above 50%, or you haven't completed an assessment yet.
            </p>
            <Link href="/assessment/new">
              <Button>Start an Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <FixItClient modules={modules} />
      )}
    </div>
  )
}

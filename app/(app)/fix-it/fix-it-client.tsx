"use client"
import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Clock, ExternalLink, CheckCircle2, Circle } from "lucide-react"
import { toast } from "sonner"
import type { FixItModuleData } from "@/lib/data/fix-it-modules"

export interface ActiveModule {
  assessmentId: string
  ideaTitle: string
  dimensionId: number
  rawScore: number
  module: FixItModuleData
  completedTaskIds: string[]
}

export function FixItClient({ modules }: { modules: ActiveModule[] }) {
  const [completedMap, setCompletedMap] = useState<Record<string, Set<string>>>(() => {
    const map: Record<string, Set<string>> = {}
    for (const m of modules) {
      map[m.dimensionId] = new Set(m.completedTaskIds)
    }
    return map
  })
  const [, startTransition] = useTransition()

  async function toggleTask(dimensionId: number, taskId: string) {
    const key = String(dimensionId)
    const current = new Set(completedMap[key] ?? [])
    const wasCompleted = current.has(taskId)
    const nowCompleted = !wasCompleted

    // Optimistic update
    setCompletedMap((prev) => {
      const next = { ...prev }
      const set = new Set(prev[key] ?? [])
      if (nowCompleted) set.add(taskId)
      else set.delete(taskId)
      next[key] = set
      return next
    })

    startTransition(async () => {
      try {
        const res = await fetch("/api/fix-it/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dimensionId, taskId, completed: nowCompleted }),
        })
        if (!res.ok) throw new Error()
      } catch {
        // Revert on error
        setCompletedMap((prev) => {
          const next = { ...prev }
          const set = new Set(prev[key] ?? [])
          if (wasCompleted) set.add(taskId)
          else set.delete(taskId)
          next[key] = set
          return next
        })
        toast.error("Failed to save progress. Please try again.")
      }
    })
  }

  // Deduplicate by dimensionId (keep highest score for tie-breaking)
  const seen = new Set<number>()
  const unique = modules.filter((m) => {
    if (seen.has(m.dimensionId)) return false
    seen.add(m.dimensionId)
    return true
  })

  return (
    <div className="space-y-6">
      {unique.map((item, idx) => {
        const { module } = item
        const completed = completedMap[item.dimensionId] ?? new Set()
        const doneCount = module.tasks.filter((t) => completed.has(t.id)).length
        const totalCount = module.tasks.length
        const pct = Math.round((doneCount / totalCount) * 100)
        const allDone = doneCount === totalCount

        return (
          <motion.div
            key={item.dimensionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: idx * 0.07 }}
          >
            <Card className={allDone ? "border-green-200 bg-green-50/30" : "border-amber-200"}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={allDone ? "green" : "amber"} className="text-xs">
                        {allDone ? "Complete" : "Fix-It"}
                      </Badge>
                      <span className="text-xs text-[#1D1D1F]/40 truncate">{item.ideaTitle}</span>
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-[#1D1D1F]/55 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{module.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-red-500">{Math.round(item.rawScore)}%</div>
                    <div className="text-xs text-[#1D1D1F]/40">current score</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#1D1D1F]/55">{doneCount}/{totalCount} tasks done</span>
                    <span className="text-xs font-semibold text-[#1D1D1F]/80">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>

                <p className="text-sm text-gray-600 mt-3">{module.description}</p>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-5">
                  {module.tasks.map((task) => {
                    const done = completed.has(task.id)
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                          done
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-[#E8E8ED]/60 hover:border-[#D2D2D7] hover:bg-[#F5F5F7]"
                        }`}
                        onClick={() => toggleTask(item.dimensionId, task.id)}
                      >
                        <div className="shrink-0 mt-0.5">
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${done ? "line-through text-[#1D1D1F]/40" : "text-[#1D1D1F]"}`}>
                            {task.title}
                          </p>
                          {!done && (
                            <p className="text-xs text-[#1D1D1F]/55 mt-0.5">{task.description}</p>
                          )}
                          {task.resource && !done && (
                            <div className="flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3 text-blue-500 shrink-0" />
                              <span className="text-xs text-[#6E6E73]">{task.resource}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Link href={`/assessment/${item.assessmentId}/checklist`}>
                    <Button variant={allDone ? "default" : "outline"} size="sm">
                      <ArrowRight className="h-4 w-4" />
                      {allDone ? "Re-assess Now" : "Re-assess after completing tasks"}
                    </Button>
                  </Link>
                  {allDone && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      All tasks complete — time to re-assess!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

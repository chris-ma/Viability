"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LiveRadarPreview } from "@/components/charts/live-radar-preview"
import { DIMENSIONS } from "@/lib/data/checklist"
import { calculateScores } from "@/lib/scoring/engine"
import type { ScoringResult, AnswerValue } from "@/lib/scoring/engine"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type AllAnswers = Record<number, Record<string, AnswerValue>>

const ANSWER_OPTIONS: Array<{ value: AnswerValue; label: string; description: string; color: string }> = [
  { value: "yes", label: "Yes", description: "Fully confirmed", color: "border-green-500 bg-green-50 text-green-800" },
  { value: "partially", label: "Partially", description: "Some evidence", color: "border-amber-500 bg-amber-50 text-amber-800" },
  { value: "no", label: "No", description: "Not yet", color: "border-red-500 bg-red-50 text-red-800" },
  { value: "dont_know", label: "Don't Know", description: "Unvalidated", color: "border-gray-400 bg-gray-50 text-gray-700" },
]

function AnswerButton({
  option,
  selected,
  onClick,
}: {
  option: (typeof ANSWER_OPTIONS)[number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 min-w-0 rounded-xl border-2 px-3 py-2.5 text-center transition-all duration-150",
        selected ? option.color : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
      )}
    >
      <div className="text-sm font-bold">{option.label}</div>
      <div className="text-xs opacity-70 hidden sm:block">{option.description}</div>
    </button>
  )
}

export default function ChecklistPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const router = useRouter()
  const { assessmentId } = use(params)

  const [allAnswers, setAllAnswers] = useState<AllAnswers>({})
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null)
  const [activeDimension, setActiveDimension] = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [assessmentTitle, setAssessmentTitle] = useState("")

  // Load existing answers
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`)
        if (!res.ok) return
        const data = await res.json()
        setAssessmentTitle(data.idea?.title ?? "")

        const answers: AllAnswers = {}
        for (const dr of data.dimensionResults ?? []) {
          answers[dr.dimensionId] = {}
          for (const ir of dr.itemResponses ?? []) {
            answers[dr.dimensionId][ir.itemId] = ir.answer
          }
        }
        setAllAnswers(answers)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assessmentId])

  // Recalculate score whenever answers change
  useEffect(() => {
    if (Object.keys(allAnswers).length > 0) {
      const result = calculateScores(allAnswers)
      setScoringResult(result)
    }
  }, [allAnswers])

  const totalItems = DIMENSIONS.reduce((sum, d) => sum + d.items.length, 0)
  const totalAnswered = Object.values(allAnswers).reduce(
    (sum, dim) => sum + Object.keys(dim).length,
    0
  )
  const completionPct = totalItems > 0 ? (totalAnswered / totalItems) * 100 : 0

  async function saveAnswer(dimensionId: number, itemId: string, answer: AnswerValue) {
    const key = `${dimensionId}-${itemId}`
    setSaving(key)

    setAllAnswers((prev) => ({
      ...prev,
      [dimensionId]: { ...(prev[dimensionId] ?? {}), [itemId]: answer },
    }))

    try {
      await fetch(`/api/assessments/${assessmentId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dimensionId, itemId, answer }),
      })
    } catch {
      toast.error("Failed to save answer")
    } finally {
      setSaving(null)
    }
  }

  async function handleSubmit() {
    if (totalAnswered < totalItems * 0.5) {
      toast.error("Please answer at least 50% of questions before submitting.")
      return
    }
    setSubmitting(true)

    try {
      const res = await fetch(`/api/assessments/${assessmentId}/submit`, { method: "POST" })
      if (!res.ok) throw new Error("Submit failed")
      router.push(`/assessment/${assessmentId}/results`)
    } catch {
      toast.error("Failed to submit assessment. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  const activeKillFlags = scoringResult?.killFlags ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-black text-gray-900 truncate">{assessmentTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={completionPct} className="flex-1 max-w-xs" />
          <span className="text-sm font-medium text-gray-600">
            {totalAnswered}/{totalItems} answered
          </span>
        </div>
      </div>

      {/* Kill flag alerts */}
      {activeKillFlags.length > 0 && (
        <div className="mb-6 space-y-2">
          {activeKillFlags.map((flag) => (
            <div
              key={flag.itemId}
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Kill Flag: {flag.dimensionName}</p>
                <p className="text-xs text-red-600 mt-0.5">{flag.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* Main checklist */}
        <div className="flex-1 min-w-0 space-y-3">
          {DIMENSIONS.map((dimension) => {
            const dimAnswers = allAnswers[dimension.id] ?? {}
            const answeredInDim = Object.keys(dimAnswers).length
            const isComplete = answeredInDim === dimension.items.length
            const isActive = activeDimension === dimension.id
            const dimScore = scoringResult?.dimensionScores.find(
              (d) => d.dimensionId === dimension.id
            )
            const hasKillFlag = dimScore?.killFlag

            return (
              <Card key={dimension.id} className={cn(hasKillFlag ? "border-red-300" : "")}>
                {/* Dimension header */}
                <button
                  className="w-full p-5 flex items-center gap-4 text-left"
                  onClick={() => setActiveDimension(isActive ? 0 : dimension.id)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : answeredInDim > 0
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : dimension.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{dimension.name}</span>
                      {hasKillFlag && (
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {answeredInDim}/{dimension.items.length} answered
                      </span>
                      <span className="text-xs text-gray-400">Weight: {Math.round(dimension.weight * 100)}%</span>
                      {dimScore && answeredInDim > 0 && (
                        <span
                          className="text-xs font-bold"
                          style={{
                            color:
                              dimScore.rawScore >= 75
                                ? "#22c55e"
                                : dimScore.rawScore >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {Math.round(dimScore.rawScore)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {isActive ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Items */}
                {isActive && (
                  <div className="border-t border-gray-100">
                    {dimension.items.map((item, idx) => {
                      const currentAnswer = dimAnswers[item.id]
                      const isSaving = saving === `${dimension.id}-${item.id}`

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "p-5",
                            idx > 0 ? "border-t border-gray-100" : "",
                            item.isKillFlagItem ? "bg-red-50/30" : ""
                          )}
                        >
                          <div className="mb-3">
                            <div className="flex items-start gap-2">
                              {item.isKillFlagItem && (
                                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                              )}
                              <p className="text-sm font-semibold text-gray-900">{item.question}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-6">{item.helpText}</p>
                          </div>
                          <div className={cn("flex gap-2", isSaving ? "opacity-60" : "")}>
                            {ANSWER_OPTIONS.map((option) => (
                              <AnswerButton
                                key={option.value}
                                option={option}
                                selected={currentAnswer === option.value}
                                onClick={() => saveAnswer(dimension.id, item.id, option.value)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}

          {/* Submit */}
          <div className="mt-6 pb-8">
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-gray-900 mb-2">Ready to get your verdict?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {totalAnswered < totalItems
                    ? `You have ${totalItems - totalAnswered} unanswered questions. You can still submit.`
                    : "All questions answered. Submit to see your full Viability Score."}
                </p>
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting || totalAnswered === 0}
                  className="min-w-40"
                >
                  {submitting ? (
                    "Calculating..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit &amp; Get Verdict
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar - live radar preview (desktop only) */}
        <div className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-6 space-y-4">
            <LiveRadarPreview
              scoringResult={scoringResult}
              completionPercentage={completionPct}
            />

            {/* Dimension status */}
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Progress</p>
                <div className="space-y-2">
                  {DIMENSIONS.map((dim) => {
                    const answered = Object.keys(allAnswers[dim.id] ?? {}).length
                    const complete = answered === dim.items.length
                    const started = answered > 0
                    return (
                      <button
                        key={dim.id}
                        onClick={() => setActiveDimension(dim.id)}
                        className="w-full flex items-center gap-2 text-left hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            complete ? "bg-green-500" : started ? "bg-blue-400" : "bg-gray-200"
                          )}
                        />
                        <span className="text-xs text-gray-600 truncate">{dim.shortName}</span>
                        <span className="text-xs text-gray-400 ml-auto shrink-0">
                          {answered}/{dim.items.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

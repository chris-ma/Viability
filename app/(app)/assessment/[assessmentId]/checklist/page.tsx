"use client"
import { useState, useEffect, use, useCallback, useTransition, memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiveRadarPreview } from "@/components/charts/live-radar-preview"
import { DIMENSIONS } from "@/lib/data/checklist"
import { calculateScores } from "@/lib/scoring/engine"
import type { ScoringResult, AnswerValue } from "@/lib/scoring/engine"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Send, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type AllAnswers = Record<number, Record<string, AnswerValue>>

const ANSWER_OPTIONS: Array<{ value: AnswerValue; label: string; description: string; color: string }> = [
  { value: "yes",        label: "Yes",        description: "Fully confirmed",  color: "border-green-500 bg-green-50 text-green-800" },
  { value: "partially",  label: "Partially",  description: "Some evidence",    color: "border-amber-500 bg-amber-50 text-amber-800" },
  { value: "no",         label: "No",         description: "Not yet",          color: "border-red-500 bg-red-50 text-red-800" },
  { value: "dont_know",  label: "Don't Know", description: "Unvalidated",      color: "border-[#D2D2D7] bg-[#F5F5F7] text-[#6E6E73]" },
]

const AnswerButton = memo(function AnswerButton({
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
        selected ? option.color : "border-[#D2D2D7] bg-white text-[#6E6E73] hover:border-[#AEAEB2]"
      )}
    >
      <div className="text-sm font-bold">{option.label}</div>
      <div className="text-xs opacity-70 hidden sm:block">{option.description}</div>
    </button>
  )
})

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
  const [, startScoreTransition] = useTransition()

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

  // Recalculate score whenever answers change (deferred so it doesn't block UI)
  useEffect(() => {
    if (Object.keys(allAnswers).length > 0) {
      startScoreTransition(() => {
        setScoringResult(calculateScores(allAnswers))
      })
    }
  }, [allAnswers])

  const totalItems = DIMENSIONS.reduce((sum, d) => sum + d.items.length, 0)
  const totalAnswered = Object.values(allAnswers).reduce(
    (sum, dim) => sum + Object.keys(dim).length,
    0
  )
  const completionPct = totalItems > 0 ? (totalAnswered / totalItems) * 100 : 0
  const completedDims = DIMENSIONS.filter(
    (d) => Object.keys(allAnswers[d.id] ?? {}).length === d.items.length
  ).length

  const saveAnswer = useCallback(async function saveAnswer(dimensionId: number, itemId: string, answer: AnswerValue) {
    const key = `${dimensionId}-${itemId}`
    setSaving(key)

    const newDimAnswers = { ...(allAnswers[dimensionId] ?? {}), [itemId]: answer }
    const newAllAnswers = { ...allAnswers, [dimensionId]: newDimAnswers }
    setAllAnswers(newAllAnswers)

    // Auto-advance to next dimension when this one is complete
    const dimension = DIMENSIONS.find((d) => d.id === dimensionId)
    const justCompleted = dimension && Object.keys(newDimAnswers).length === dimension.items.length
    if (justCompleted) {
      const nextDim = DIMENSIONS.find((d) => d.id === dimensionId + 1)
      if (nextDim) {
        setTimeout(() => {
          setActiveDimension(nextDim.id)
          document.getElementById(`dim-${nextDim.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 400)
      }
    }

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
  }, [allAnswers, assessmentId])

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
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-5">
          <div className="h-6 bg-[#E8E8ED] rounded-full w-1/3 mx-auto" />
          <div className="h-10 bg-[#E8E8ED] rounded-2xl w-2/3 mx-auto" />
          <div className="h-2 bg-[#E8E8ED] rounded-full w-full" />
          <div className="h-48 bg-[#E8E8ED]/50 rounded-2xl" />
          <div className="h-48 bg-[#E8E8ED]/30 rounded-2xl" />
        </div>
      </div>
    )
  }

  const activeKillFlags = scoringResult?.killFlags ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

      {/* ── Project hero header ────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-widest mb-1">
          Viability Assessment
        </p>
        <h1 className="text-3xl font-black text-[#1D1D1F] mb-4 truncate">
          {assessmentTitle}
        </h1>

        {/* Overall progress bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-[#E8E8ED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D1D1F] rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-[#1D1D1F] whitespace-nowrap">
            {totalAnswered}/{totalItems}
          </span>
          <span className="text-xs text-[#1D1D1F]/40 whitespace-nowrap hidden sm:block">
            {completedDims}/{DIMENSIONS.length} sections
          </span>
        </div>
      </div>

      {/* ── Kill flag alerts ───────────────────────────────────────────────── */}
      {activeKillFlags.length > 0 && (
        <div className="mb-6 space-y-2">
          {activeKillFlags.map((flag) => (
            <div
              key={flag.itemId}
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4"
            >
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Kill Flag — {flag.dimensionName}</p>
                <p className="text-xs text-red-600 mt-0.5">{flag.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-6 items-start">

        {/* ── Main checklist ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-3">

          {DIMENSIONS.map((dimension) => {
            const dimAnswers = allAnswers[dimension.id] ?? {}
            const answeredInDim = Object.keys(dimAnswers).length
            const isComplete = answeredInDim === dimension.items.length
            const isActive = activeDimension === dimension.id
            const dimScore = scoringResult?.dimensionScores.find((d) => d.dimensionId === dimension.id)
            const hasKillFlag = dimScore?.killFlag

            return (
              <Card
                key={dimension.id}
                id={`dim-${dimension.id}`}
                className={cn(
                  "overflow-hidden transition-shadow",
                  hasKillFlag ? "border-red-300" : "",
                  isActive ? "shadow-md" : ""
                )}
              >
                {/* Dimension header button */}
                <button
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#F5F5F7]/60 transition-colors"
                  onClick={() => setActiveDimension(isActive ? 0 : dimension.id)}
                >
                  {/* Status dot */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : answeredInDim > 0
                        ? "bg-[#E8E8ED] text-[#6E6E73]"
                        : "bg-[#E8E8ED]/50 text-[#1D1D1F]/40"
                    )}
                  >
                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : dimension.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#1D1D1F] text-sm">{dimension.name}</span>
                      {hasKillFlag && (
                        <Badge variant="red" className="text-xs shrink-0">Kill Flag</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[#1D1D1F]/55">
                        {answeredInDim}/{dimension.items.length} answered
                      </span>
                      {dimScore && answeredInDim > 0 && (
                        <span
                          className="text-xs font-bold"
                          style={{
                            color:
                              dimScore.rawScore >= 75 ? "#22c55e"
                              : dimScore.rawScore >= 50 ? "#f59e0b"
                              : "#ef4444",
                          }}
                        >
                          {Math.round(dimScore.rawScore)}%
                        </span>
                      )}
                      <span className="text-xs text-[#1D1D1F]/40 hidden sm:block">
                        Weight {Math.round(dimension.weight * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  {answeredInDim > 0 && !isComplete && (
                    <div className="w-16 h-1 bg-[#E8E8ED] rounded-full overflow-hidden shrink-0 hidden sm:block">
                      <div
                        className="h-full bg-[#6E6E73] rounded-full"
                        style={{ width: `${(answeredInDim / dimension.items.length) * 100}%` }}
                      />
                    </div>
                  )}

                  <motion.div
                    animate={{ rotate: isActive ? 90 : 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="shrink-0"
                  >
                    <ChevronRight className="h-4 w-4 text-[#1D1D1F]/40" />
                  </motion.div>
                </button>

                {/* Questions */}
                <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                  <div className="border-t border-[#E8E8ED]/60">
                    {dimension.items.map((item, idx) => {
                      const currentAnswer = dimAnswers[item.id]
                      const isSaving = saving === `${dimension.id}-${item.id}`

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "px-5 py-4",
                            idx > 0 ? "border-t border-[#E8E8ED]/60" : "",
                            item.isKillFlagItem ? "bg-red-50/30" : ""
                          )}
                        >
                          <div className="mb-3">
                            <div className="flex items-start gap-2">
                              {item.isKillFlagItem && (
                                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                              )}
                              <p className="text-sm font-semibold text-[#1D1D1F] leading-relaxed">
                                {item.question}
                              </p>
                            </div>
                            <p className="text-xs text-[#1D1D1F]/55 mt-1 leading-relaxed ml-6">
                              {item.helpText}
                            </p>
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

                    {/* Next section nudge */}
                    {isComplete && (
                      <div className="px-5 py-3 bg-green-50/60 border-t border-green-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Section complete
                        </span>
                        {(() => {
                          const nextDim = DIMENSIONS.find((d) => d.id === dimension.id + 1)
                          return nextDim ? (
                            <button
                              onClick={() => setActiveDimension(nextDim.id)}
                              className="text-xs font-semibold text-[#6E6E73] flex items-center gap-1 hover:underline"
                            >
                              Next: {nextDim.shortName}
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </Card>
            )
          })}

          {/* Submit card */}
          <div className="pt-2 pb-10">
            <div className="rounded-2xl border-2 border-dashed border-[#E8E8ED] bg-[#F5F5F7] p-6 text-center">
              <p className="font-bold text-[#1D1D1F] mb-1 text-lg">Ready for your verdict?</p>
              <p className="text-sm text-[#1D1D1F]/55 mb-5">
                {totalAnswered < totalItems
                  ? `${totalItems - totalAnswered} questions unanswered — you can still submit now.`
                  : "All questions answered. Submit to see your full Viability Score."}
              </p>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={submitting || totalAnswered === 0}
                className="min-w-48"
              >
                {submitting ? "Calculating…" : (
                  <>
                    <Send className="h-4 w-4" />
                    Get My Verdict
                  </>
                )}
              </Button>
              {totalAnswered > 0 && (
                <p className="text-xs text-[#1D1D1F]/40 mt-3">
                  {Math.round(completionPct)}% complete · {totalAnswered} answers recorded
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
        <div className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-6 space-y-4">

            {/* Live radar */}
            <LiveRadarPreview
              scoringResult={scoringResult}
              completionPercentage={completionPct}
            />

            {/* Section progress */}
            <div className="bg-white rounded-2xl border border-[#E8E8ED] p-4">
              <p className="text-xs font-semibold text-[#1D1D1F]/55 uppercase tracking-wider mb-3">
                Sections
              </p>
              <div className="space-y-1">
                {DIMENSIONS.map((dim) => {
                  const answered = Object.keys(allAnswers[dim.id] ?? {}).length
                  const complete = answered === dim.items.length
                  const started = answered > 0
                  return (
                    <button
                      key={dim.id}
                      onClick={() => setActiveDimension(dim.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 text-left px-2 py-2 rounded-xl transition-colors",
                        activeDimension === dim.id
                          ? "bg-[#E8E8ED]/60"
                          : "hover:bg-[#E8E8ED]/40"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          complete ? "bg-green-500" : started ? "bg-[#6E6E73]" : "bg-[#E8E8ED]"
                        )}
                      />
                      <span className="text-xs text-[#1D1D1F]/70 truncate flex-1">{dim.shortName}</span>
                      <span className="text-xs text-[#1D1D1F]/40 shrink-0">
                        {answered}/{dim.items.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

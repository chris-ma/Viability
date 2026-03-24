"use client"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ViabilityRadarChart, buildRadarData } from "@/components/charts/radar-chart"
import { ScoreGauge } from "@/components/charts/score-gauge"
import { DimensionBars } from "@/components/charts/dimension-bars"
import { FIX_IT_MODULES } from "@/lib/data/fix-it-modules"
import { getVerdictConfig } from "@/lib/scoring/engine"
import type { DimensionScore, KillFlag, ScoringResult } from "@/lib/scoring/engine"
import {
  AlertTriangle,
  Download,
  Share2,
  ArrowRight,
  RotateCcw,
  XCircle,
  Wrench,
  Clock,
  ExternalLink,
  Archive,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface ResultsClientProps {
  assessment: {
    id: string
    overallScore: number
    verdict: "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE"
    completedAt: string
    previousScore?: number | null
    idea: {
      id: string
      title: string
      problem: string
      solution: string
      industry: string
      model: string
    }
    dimensionResults: Array<{
      dimensionId: number
      rawScore: number
      weightedScore: number
      killFlag: boolean
    }>
  }
  dimensionScores: DimensionScore[]
  killFlags: KillFlag[]
  previousScores?: Array<{ dimensionId: number; rawScore: number }> | null
}

// ── Action Plan component ───────────────────────────────────────────────────

const VERDICT_PLANS = {
  VIABLE: {
    headline: "You're ready to build.",
    color: "#22c55e",
    bg: "bg-green-50",
    border: "border-green-200",
    steps: [
      { icon: "🎯", title: "Define your MVP scope", body: "List the minimum set of features needed to deliver value to your first 10 customers. Cut everything else." },
      { icon: "👥", title: "Get 10 paying users in 30 days", body: "Don't build more — sell first. Use your existing network and direct outreach to find your first paying customers before writing another line of code." },
      { icon: "📅", title: "Set a 90-day launch milestone", body: "Work backwards from a public launch date. Define what 'done' looks like and ship it. Momentum beats perfection." },
    ],
  },
  PROMISING: {
    headline: "Strong foundations — close the gaps first.",
    color: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-200",
    steps: [
      { icon: "🔧", title: "Work the Fix-It modules below", body: "Each module has specific tasks to close the gap. Complete them before writing code — they take days, not months." },
      { icon: "🔁", title: "Re-assess after fixing your weakest dimension", body: "Once you've completed a Fix-It module, come back and re-assess that dimension. Use score improvement as your signal to proceed." },
      { icon: "💬", title: "Validate with 5 real conversations", body: "Book 5 customer discovery calls this week. Your goal: confirm people have this problem badly enough to pay. Use the Mom Test — ask about past behaviour, not future intentions." },
    ],
  },
  NEEDS_WORK: {
    headline: "Serious gaps — don't build yet.",
    color: "#f97316",
    bg: "bg-orange-50",
    border: "border-orange-200",
    steps: [
      { icon: "🛑", title: "Pause any building or spending", body: "Do not hire, build, or invest further until you've addressed the red dimensions. Every pound spent now is likely wasted." },
      { icon: "🔧", title: "Prioritise your lowest-scoring dimension", body: "Start with your single lowest score. Use its Fix-It module to generate evidence. One gap at a time." },
      { icon: "🔄", title: "Consider a fundamental pivot", body: "If market need or business model are below 40%, question the core assumption. Who else has this problem? What business model have others used successfully?" },
    ],
  },
  NOT_VIABLE: {
    headline: "Fundamental issues — pivot or move on.",
    color: "#ef4444",
    bg: "bg-red-50",
    border: "border-red-200",
    steps: [
      { icon: "📋", title: "Write down your core assumption", body: "What is the single biggest bet this idea rests on? Is it the customer, the problem, the distribution, or the model? Changing one of these is a pivot — and often leads to something better." },
      { icon: "🔄", title: "Run a pivot exercise", body: "Keep your solution but change the customer. Or keep the customer but change the problem you solve. Use the 'same team, different idea' framework and run a new assessment." },
      { icon: "💡", title: "Start a new assessment", body: "The fastest way to find a viable idea is to test many quickly. Every failed assessment builds your instincts. Start fresh with what you've learned." },
    ],
  },
}

function ActionPlan({
  verdict,
  score,
  dimensionScores,
  assessmentId,
  fixItModules,
}: {
  verdict: string
  score: number
  dimensionScores: DimensionScore[]
  assessmentId: string
  fixItModules: Array<{ dimensionId: number; title: string } | null>
}) {
  const plan = VERDICT_PLANS[verdict as keyof typeof VERDICT_PLANS]
  if (!plan) return null

  const weakest = [...dimensionScores].sort((a, b) => a.rawScore - b.rawScore).slice(0, 3)

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${plan.bg} ${plan.border}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: plan.color }} />
        <h2 className="text-base font-bold text-[#1D1D1F]">What to do now — {plan.headline}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {plan.steps.map((step, i) => (
          <div key={i} className="bg-white/80 rounded-xl p-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{step.icon}</span>
              <p className="text-sm font-semibold text-[#1D1D1F] leading-tight">{step.title}</p>
            </div>
            <p className="text-xs text-[#6E6E73] leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>

      {/* Priority dimensions for non-viable results */}
      {(verdict === "PROMISING" || verdict === "NEEDS_WORK") && weakest.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Fix these first →</p>
          <div className="flex flex-wrap gap-2">
            {weakest.map((d) => (
              <a
                key={d.dimensionId}
                href={`#fixit-${d.dimensionId}`}
                className="inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 text-xs font-medium text-[#1D1D1F] hover:shadow-sm transition-shadow border border-black/[0.06]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {d.name} · {Math.round(d.rawScore)}%
                <ChevronRight className="h-3 w-3 text-[#AEAEB2]" />
              </a>
            ))}
          </div>
        </div>
      )}

      {verdict === "VIABLE" && (
        <div className="flex flex-wrap gap-2">
          <Link href="/assessment/new">
            <button className="inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 text-xs font-medium text-[#1D1D1F] hover:shadow-sm transition-shadow border border-black/[0.06]">
              <span className="text-green-500">✓</span> Test another idea
              <ChevronRight className="h-3 w-3 text-[#AEAEB2]" />
            </button>
          </Link>
          <Link href={`/assessment/${assessmentId}/checklist`}>
            <button className="inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 text-xs font-medium text-[#1D1D1F] hover:shadow-sm transition-shadow border border-black/[0.06]">
              Re-assess after progress
              <ChevronRight className="h-3 w-3 text-[#AEAEB2]" />
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.5, ease: "easeOut" as const },
}

export function ResultsClient({ assessment, dimensionScores, killFlags, previousScores }: ResultsClientProps) {
  const [showKillFlow, setShowKillFlow] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const router = useRouter()
  const verdictConfig = getVerdictConfig(assessment.verdict)
  const radarData = buildRadarData(dimensionScores)

  const weakDimensions = dimensionScores.filter((d) => d.rawScore < 50)
  const fixItModules = weakDimensions
    .map((d) => FIX_IT_MODULES.find((m) => m.dimensionId === d.dimensionId))
    .filter(Boolean)

  const isKillVerdict = assessment.verdict === "NOT_VIABLE"
  const multipleKillFlags = killFlags.length >= 3

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }

  async function handleArchive(status: "archived" | "killed") {
    setArchiving(true)
    try {
      const res = await fetch(`/api/ideas/${assessment.idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === "archived" ? "Idea archived. You can find it in My Ideas." : "Idea marked as killed.")
      router.push("/dashboard")
    } catch {
      toast.error("Failed to update idea. Please try again.")
      setArchiving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div className="mb-8" {...fadeUp}>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">Assessment Complete</Badge>
          <span className="text-xs text-[#1D1D1F]/40">{formatDate(assessment.completedAt)}</span>
        </div>
        <h1 className="text-3xl font-black text-[#1D1D1F] mb-1">{assessment.idea.title}</h1>
        <p className="text-[#1D1D1F]/55 text-sm">{assessment.idea.industry} · {assessment.idea.model}</p>
      </motion.div>

      {/* ── What to do now ─────────────────────────────────────────────── */}
      <motion.div className="mb-6" {...fadeUp}>
        <ActionPlan
          verdict={assessment.verdict}
          score={assessment.overallScore}
          dimensionScores={dimensionScores}
          assessmentId={assessment.id}
          fixItModules={fixItModules}
        />
      </motion.div>

      {/* Kill Flags Banner */}
      {killFlags.length > 0 && (
        <motion.div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5" {...fadeUp}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 mb-2">
                {killFlags.length} Kill Flag{killFlags.length > 1 ? "s" : ""} Triggered
              </p>
              <div className="space-y-2">
                {killFlags.map((flag) => (
                  <div key={flag.itemId}>
                    <p className="text-sm font-semibold text-red-600">{flag.dimensionName}</p>
                    <p className="text-xs text-red-500">{flag.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main verdict + gauge */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
      >
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <ScoreGauge score={assessment.overallScore} verdict={assessment.verdict} />
            <Separator className="my-4" />
            <p className="text-sm text-[#1D1D1F]/65 text-center">{verdictConfig.description}</p>
            <p className="text-xs text-[#1D1D1F]/40 text-center mt-2">{verdictConfig.action}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Viability Radar</CardTitle>
              {previousScores && assessment.previousScore != null && (
                <Badge variant="secondary" className="text-xs">
                  {assessment.overallScore > assessment.previousScore
                    ? `+${Math.round(assessment.overallScore - assessment.previousScore)} pts`
                    : `${Math.round(assessment.overallScore - assessment.previousScore)} pts`}{" "}
                  vs previous
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#1D1D1F]/40">
              Grey dashed = industry benchmark
              {previousScores && " · Purple dashed = previous assessment"}
            </p>
          </CardHeader>
          <CardContent>
            <ViabilityRadarChart
              data={radarData}
              verdict={assessment.verdict}
              size="lg"
              previousScores={previousScores ?? undefined}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Dimension breakdown */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Dimension Breakdown</CardTitle>
            <p className="text-sm text-[#1D1D1F]/55">Sorted worst-first. Green ≥75%, Amber 50–74%, Red &lt;50%</p>
          </CardHeader>
          <CardContent>
            <DimensionBars
              dimensionScores={dimensionScores}
              showFixItLinks={true}
              previousScores={previousScores ?? undefined}
              onFixItClick={(dimId) => {
                document.getElementById(`fixit-${dimId}`)?.scrollIntoView({ behavior: "smooth" })
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Fix-It Modules */}
      {fixItModules.length > 0 && (
        <div className="mb-6">
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="w-8 h-8 bg-amber-100/80 rounded-xl flex items-center justify-center">
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1D1D1F]">Fix-It Modules</h2>
              <p className="text-sm text-[#1D1D1F]/55">{fixItModules.length} dimension{fixItModules.length > 1 ? "s" : ""} scoring below 50% — here's how to fix them</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {fixItModules.map((module, idx) => {
              if (!module) return null
              const dimScore = dimensionScores.find((d) => d.dimensionId === module.dimensionId)

              return (
                <motion.div
                  key={module.dimensionId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.08 }}
                >
                  <Card id={`fixit-${module.dimensionId}`} className="border-amber-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="amber" className="mb-2 text-xs">Fix-It Module</Badge>
                          <CardTitle className="text-base">{module.title}</CardTitle>
                          <div className="flex items-center gap-1.5 text-xs text-[#1D1D1F]/55 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.estimatedTime}</span>
                          </div>
                        </div>
                        {dimScore && (
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-black text-red-500">{Math.round(dimScore.rawScore)}%</div>
                            <div className="text-xs text-[#1D1D1F]/40">current score</div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#1D1D1F]/65">{module.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {module.tasks.map((task, i) => (
                          <div key={task.id} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#E8E8ED] flex items-center justify-center text-xs font-bold text-[#1D1D1F]/55 shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1D1D1F]">{task.title}</p>
                              <p className="text-xs text-[#1D1D1F]/55 mt-0.5">{task.description}</p>
                              {task.resource && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {task.resource.split(",").map((r) => {
                                    const site = r.trim()
                                    const url = site.startsWith("http") ? site : `https://${site}`
                                    return (
                                      <a key={site} href={url} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[#0071E3] hover:underline">
                                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                        {site}
                                      </a>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Kill Idea Flow */}
      {(isKillVerdict || multipleKillFlags) && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <XCircle className="h-8 w-8 text-red-500 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-black text-red-700 mb-2">
                    This idea is showing fundamental viability issues.
                  </h3>
                  <p className="text-sm text-red-600 mb-4">
                    Your score of {Math.round(assessment.overallScore)} and {killFlags.length} kill flag{killFlags.length !== 1 ? "s" : ""} indicate this idea — in its current form — faces serious obstacles to viability. This is genuinely valuable information.
                  </p>
                  <p className="text-sm text-[#1D1D1F]/65 mb-4">
                    The most common response is to either <strong>pivot</strong> (change a fundamental assumption about the market, customer, or model) or <strong>archive</strong> (save the idea and come back with new information). Both are valid.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/assessment/new">
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4" />
                        Test a New Idea
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive("archived")}
                      disabled={archiving}
                    >
                      <Archive className="h-4 w-4" />
                      Archive This Idea
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleArchive("killed")}
                      disabled={archiving}
                    >
                      <XCircle className="h-4 w-4" />
                      Kill This Idea
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div {...fadeUp}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex flex-wrap gap-3">
                <Link href="/assessment/new">
                  <Button size="lg">
                    <ArrowRight className="h-4 w-4" />
                    {assessment.verdict === "VIABLE" ? "Build Your MVP" : "Test Another Idea"}
                  </Button>
                </Link>
                <Link href={`/assessment/${assessment.id}/checklist`}>
                  <Button variant="outline" size="lg">
                    <RotateCcw className="h-4 w-4" />
                    Re-assess
                  </Button>
                </Link>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <a href={`/api/assessments/${assessment.id}/pdf`} download>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

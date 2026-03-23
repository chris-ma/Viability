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
          <span className="text-xs text-gray-400">{formatDate(assessment.completedAt)}</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">{assessment.idea.title}</h1>
        <p className="text-gray-500 text-sm">{assessment.idea.industry} · {assessment.idea.model}</p>
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
            <p className="text-sm text-gray-600 text-center">{verdictConfig.description}</p>
            <p className="text-xs text-gray-400 text-center mt-2">{verdictConfig.action}</p>
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
            <p className="text-xs text-gray-400">
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
            <p className="text-sm text-gray-500">Sorted worst-first. Green ≥75%, Amber 50–74%, Red &lt;50%</p>
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
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Fix-It Modules</h2>
              <p className="text-sm text-gray-500">{fixItModules.length} dimension{fixItModules.length > 1 ? "s" : ""} scoring below 50% — here's how to fix them</p>
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
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.estimatedTime}</span>
                          </div>
                        </div>
                        {dimScore && (
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-black text-red-500">{Math.round(dimScore.rawScore)}%</div>
                            <div className="text-xs text-gray-400">current score</div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {module.tasks.map((task, i) => (
                          <div key={task.id} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                              {task.resource && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <ExternalLink className="h-3 w-3 text-blue-500" />
                                  <p className="text-xs text-blue-600">{task.resource}</p>
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
                  <p className="text-sm text-gray-600 mb-4">
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

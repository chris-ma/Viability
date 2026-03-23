import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ViabilityRadarChart } from "@/components/charts/radar-chart"
import { ScoreGauge } from "@/components/charts/score-gauge"
import { DimensionBars } from "@/components/charts/dimension-bars"
import { ArrowRight, ArrowLeft } from "lucide-react"
import type { DimensionScore } from "@/lib/scoring/engine"

// Demo assessment data — a fictional "AI Meal Planning App" idea
const DEMO_SCORES: DimensionScore[] = [
  { dimensionId: 1, name: "Market Need & Problem Validation", shortName: "Market Need", weight: 0.2, rawScore: 72, weightedScore: 14.4, killFlag: false, answeredCount: 6, totalItems: 6 },
  { dimensionId: 2, name: "Target Market & Size", shortName: "Market Size", weight: 0.1, rawScore: 65, weightedScore: 6.5, killFlag: false, answeredCount: 5, totalItems: 5 },
  { dimensionId: 3, name: "Competitive Landscape", shortName: "Competition", weight: 0.12, rawScore: 45, weightedScore: 5.4, killFlag: true, answeredCount: 6, totalItems: 6 },
  { dimensionId: 4, name: "Business Model & Revenue Viability", shortName: "Business Model", weight: 0.18, rawScore: 60, weightedScore: 10.8, killFlag: false, answeredCount: 6, totalItems: 6 },
  { dimensionId: 5, name: "Founder-Market Fit", shortName: "Founder Fit", weight: 0.12, rawScore: 83, weightedScore: 9.96, killFlag: false, answeredCount: 6, totalItems: 6 },
  { dimensionId: 6, name: "Financial Readiness", shortName: "Financial Ready", weight: 0.15, rawScore: 55, weightedScore: 8.25, killFlag: false, answeredCount: 5, totalItems: 5 },
  { dimensionId: 7, name: "Execution & Operational Feasibility", shortName: "Feasibility", weight: 0.08, rawScore: 78, weightedScore: 6.24, killFlag: false, answeredCount: 5, totalItems: 5 },
  { dimensionId: 8, name: "Early Traction Indicators", shortName: "Traction", weight: 0.05, rawScore: 30, weightedScore: 1.5, killFlag: false, answeredCount: 5, totalItems: 5 },
]

const DEMO_OVERALL = 63
const DEMO_VERDICT = "PROMISING" as const

const radarData = DEMO_SCORES.map((d) => ({
  dimension: d.shortName,
  score: d.rawScore,
  benchmark: 55,
  fullMark: 100,
  killFlag: d.killFlag,
}))

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-semibold text-sm text-gray-700">Demo Assessment — AI Meal Planning App</span>
            <Badge variant="secondary" className="text-xs">Read Only</Badge>
          </div>
          <Link href="/sign-up">
            <Button size="sm">
              Assess My Idea Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Demo banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-blue-800 text-sm">This is a demo assessment</p>
            <p className="text-xs text-blue-600 mt-0.5">See what your results will look like. Create a free account to assess your own idea.</p>
          </div>
          <Link href="/sign-up" className="shrink-0">
            <Button size="sm" variant="blue">
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <ScoreGauge score={DEMO_OVERALL} verdict={DEMO_VERDICT} />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Good foundation but specific gaps need addressing before proceeding.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Viability Radar</CardTitle>
              <p className="text-xs text-gray-400">Grey dashed = industry benchmark</p>
            </CardHeader>
            <CardContent>
              <ViabilityRadarChart data={radarData} verdict={DEMO_VERDICT} size="lg" />
            </CardContent>
          </Card>
        </div>

        {/* Dimension bars */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dimension Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DimensionBars dimensionScores={DEMO_SCORES} />
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gray-900 border-gray-900 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-black mb-3">Ready to assess your own idea?</h2>
            <p className="text-gray-400 mb-6">Get your Viability Score in under 30 minutes — free.</p>
            <Link href="/sign-up">
              <Button variant="green" size="xl">
                Start My Free Assessment
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"
import { DIMENSIONS } from "@/lib/data/checklist"
import type { ScoringResult } from "@/lib/scoring/engine"

interface LiveRadarPreviewProps {
  scoringResult: ScoringResult | null
  completionPercentage: number
}

const VERDICT_COLORS = {
  VIABLE: "#22c55e",
  PROMISING: "#3b82f6",
  NEEDS_WORK: "#f59e0b",
  NOT_VIABLE: "#ef4444",
  default: "#6b7280",
}

export function LiveRadarPreview({ scoringResult, completionPercentage }: LiveRadarPreviewProps) {
  const color = scoringResult
    ? VERDICT_COLORS[scoringResult.verdict]
    : VERDICT_COLORS.default

  const data = DIMENSIONS.map((dim) => {
    const dimScore = scoringResult?.dimensionScores.find(
      (d) => d.dimensionId === dim.id
    )
    return {
      dimension: dim.shortName,
      score: dimScore ? Math.round(dimScore.rawScore) : 0,
      fullMark: 100,
    }
  })

  return (
    <div className="bg-[#F5F5F7] rounded-2xl border border-[#E8E8ED] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#1D1D1F]/55 uppercase tracking-wider">
          Live Preview
        </span>
        <span className="text-xs font-bold text-[#1D1D1F]">
          {Math.round(completionPercentage)}% complete
        </span>
      </div>

      {/* Completion ring indicator */}
      <div className="mb-3">
        <div className="h-1.5 bg-[#E8E8ED] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1D1D1F] rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 8, fill: "#9ca3af" }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>

      {scoringResult && (
        <div className="mt-2 text-center">
          <span className="text-xs text-[#1D1D1F]/55">Current score: </span>
          <span className="text-xs font-bold text-[#1D1D1F]">
            {scoringResult.overallScore}
          </span>
        </div>
      )}
    </div>
  )
}

"use client"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { getScoreColor } from "@/lib/scoring/engine"

interface RadarDataPoint {
  dimension: string
  score: number
  fullMark: number
  killFlag?: boolean
}

interface ViabilityRadarChartProps {
  data: RadarDataPoint[]
  verdict: "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE"
  size?: "sm" | "lg"
}

const VERDICT_COLORS = {
  VIABLE: "#22c55e",
  PROMISING: "#3b82f6",
  NEEDS_WORK: "#f59e0b",
  NOT_VIABLE: "#ef4444",
}

const INDUSTRY_BENCHMARKS: Record<string, number> = {
  "Market Need": 62,
  "Market Size": 58,
  "Competition": 55,
  "Business Model": 60,
  "Founder Fit": 57,
  "Financial Ready": 52,
  "Feasibility": 65,
  "Traction": 35,
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: RadarDataPoint; value: number }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-bold text-gray-900 mb-1">{data.dimension}</p>
        <p className="text-gray-600">Score: <span className="font-semibold" style={{ color: getScoreColor(data.score) }}>{Math.round(data.score)}/100</span></p>
        {data.killFlag && (
          <p className="text-red-500 font-semibold mt-1">⚠ Kill Flag</p>
        )}
      </div>
    )
  }
  return null
}

export function ViabilityRadarChart({ data, verdict, size = "lg" }: ViabilityRadarChartProps) {
  const color = VERDICT_COLORS[verdict]
  const height = size === "sm" ? 200 : 380

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: size === "sm" ? 9 : 11, fill: "#6b7280", fontWeight: 500 }}
        />
        <Tooltip content={<CustomTooltip />} />
        {/* Industry benchmark */}
        <Radar
          name="Industry Benchmark"
          dataKey="benchmark"
          stroke="#9ca3af"
          fill="#9ca3af"
          fillOpacity={0.1}
          strokeDasharray="4 4"
          strokeWidth={1}
          dot={false}
        />
        {/* User scores */}
        <Radar
          name="Your Score"
          dataKey="score"
          stroke={color}
          fill={color}
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function buildRadarData(
  dimensionScores: Array<{ shortName: string; rawScore: number; killFlag: boolean }>
): RadarDataPoint[] {
  return dimensionScores.map((d) => ({
    dimension: d.shortName,
    score: Math.round(d.rawScore),
    benchmark: INDUSTRY_BENCHMARKS[d.shortName] ?? 55,
    fullMark: 100,
    killFlag: d.killFlag,
  }))
}

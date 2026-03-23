"use client"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
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
  previousScores?: Array<{ dimensionId: number; rawScore: number }>
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
      <div className="bg-white border border-[#F2D9C0] rounded-xl shadow-lg p-3 text-xs">
        <p className="font-bold text-[#1C0F07] mb-1">{data.dimension}</p>
        <p className="text-[#1C0F07]/65">Score:<span className="font-semibold" style={{ color: getScoreColor(data.score) }}>{Math.round(data.score)}/100</span></p>
        {data.killFlag && (
          <div className="flex items-center gap-1 text-red-500 font-semibold mt-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Kill Flag</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export function ViabilityRadarChart({ data, verdict, size = "lg", previousScores }: ViabilityRadarChartProps) {
  const color = VERDICT_COLORS[verdict]
  const height = size === "sm" ? 200 : 380

  // Merge previous scores into radar data as a "previous" key
  const chartData = previousScores
    ? data.map((d) => {
        const prev = previousScores.find((p) => {
          // Match by position (dimensionId order matches data order)
          const idx = data.indexOf(d)
          return previousScores[idx] !== undefined
        })
        const idx = data.indexOf(d)
        return { ...d, previous: Math.round(previousScores[idx]?.rawScore ?? 0) }
      })
    : data

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
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
          {/* Previous assessment overlay */}
          {previousScores && (
            <Radar
              name="Previous Assessment"
              dataKey="previous"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.08}
              strokeDasharray="5 3"
              strokeWidth={1.5}
              dot={false}
            />
          )}
          {/* Current scores */}
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
    </motion.div>
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

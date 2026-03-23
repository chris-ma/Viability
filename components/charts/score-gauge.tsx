"use client"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { getVerdictConfig } from "@/lib/scoring/engine"

interface ScoreGaugeProps {
  score: number
  verdict: "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE"
}

const RADIAN = Math.PI / 180

// Gauge segments: NOT_VIABLE (0-40), NEEDS_WORK (40-60), PROMISING (60-80), VIABLE (80-100)
const GAUGE_SEGMENTS = [
  { value: 40, color: "#ef4444" },  // NOT_VIABLE
  { value: 20, color: "#f59e0b" },  // NEEDS_WORK
  { value: 20, color: "#3b82f6" },  // PROMISING
  { value: 20, color: "#22c55e" },  // VIABLE
]

const TOTAL = 100
const START_ANGLE = 180
const END_ANGLE = 0

export function ScoreGauge({ score, verdict }: ScoreGaugeProps) {
  const config = getVerdictConfig(verdict)
  const clampedScore = Math.max(0, Math.min(100, score))

  // Needle angle: 180deg (left) = 0, 0deg (right) = 100
  const needleAngle = START_ANGLE - (clampedScore / TOTAL) * 180

  const needle = (cx: number, cy: number, angle: number) => {
    const length = 90
    const rad = RADIAN * angle
    const x = cx + length * Math.cos(-rad)
    const y = cy + length * Math.sin(-rad)
    return (
      <g>
        <line
          x1={cx}
          y1={cy}
          x2={x}
          y2={y}
          stroke="#1f2937"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill="#1f2937" />
      </g>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={GAUGE_SEGMENTS}
              cx="50%"
              cy="100%"
              startAngle={START_ANGLE}
              endAngle={END_ANGLE}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={false}
            >
              {GAUGE_SEGMENTS.map((seg, i) => (
                <Cell key={i} fill={seg.color} opacity={0.85} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Needle overlay */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 180"
          preserveAspectRatio="xMidYMid meet"
        >
          {needle(150, 150, needleAngle)}
        </svg>
      </div>

      {/* Score display */}
      <div className="text-center -mt-4">
        <div className="text-6xl font-black text-gray-900">{Math.round(score)}</div>
        <div className={`text-lg font-bold mt-1 ${config.textColor}`}>{config.label}</div>
      </div>
    </div>
  )
}

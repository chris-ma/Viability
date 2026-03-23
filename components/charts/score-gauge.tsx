"use client"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { getVerdictConfig } from "@/lib/scoring/engine"

interface ScoreGaugeProps {
  score: number
  verdict: "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE"
}

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
// Needle at score=0 points left (CSS rotate -180), at score=100 points right (CSS rotate 0)
// needleCSSRotate = score * 1.8 - 180
function scoreToRotateDeg(s: number) {
  return s * 1.8 - 180
}

export function ScoreGauge({ score, verdict }: ScoreGaugeProps) {
  const config = getVerdictConfig(verdict)
  const clampedScore = Math.max(0, Math.min(100, score))
  const targetRotate = scoreToRotateDeg(clampedScore)

  // Start needle at 0-score position, animate to actual on mount
  const [rotateDeg, setRotateDeg] = useState(scoreToRotateDeg(0))

  useEffect(() => {
    const t = setTimeout(() => setRotateDeg(targetRotate), 150)
    return () => clearTimeout(t)
  }, [targetRotate])

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
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

        {/* Needle overlay — rotates around (150, 150) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 180"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            style={{
              transformOrigin: "150px 150px",
              transform: `rotate(${rotateDeg}deg)`,
              transition: "transform 1.1s cubic-bezier(0.34, 1.15, 0.64, 1)",
            }}
          >
            {/* Needle pointing right along +x axis; rotation brings it to correct position */}
            <line
              x1={150}
              y1={150}
              x2={240}
              y2={150}
              stroke="#1D1D1F"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={150} cy={150} r={6} fill="#1D1D1F" />
          </g>
        </svg>
      </div>

      {/* Score display */}
      <div className="text-center -mt-4">
        <div className="text-6xl font-black text-[#1D1D1F]">{Math.round(score)}</div>
        <div className={`text-lg font-bold mt-1 ${config.textColor}`}>{config.label}</div>
      </div>
    </motion.div>
  )
}

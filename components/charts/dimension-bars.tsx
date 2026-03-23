"use client"
import { Badge } from "@/components/ui/badge"

interface DimensionBarProps {
  dimensionScores: Array<{
    dimensionId: number
    name: string
    shortName: string
    weight: number
    rawScore: number
    weightedScore: number
    killFlag: boolean
    answeredCount: number
    totalItems: number
  }>
  showFixItLinks?: boolean
  onFixItClick?: (dimensionId: number) => void
}

function getBarColor(score: number): string {
  if (score >= 75) return "bg-green-500"
  if (score >= 50) return "bg-amber-500"
  return "bg-red-500"
}

function getBarTextColor(score: number): string {
  if (score >= 75) return "text-green-700"
  if (score >= 50) return "text-amber-700"
  return "text-red-700"
}

export function DimensionBars({ dimensionScores, showFixItLinks, onFixItClick }: DimensionBarProps) {
  // Sort worst first
  const sorted = [...dimensionScores].sort((a, b) => a.rawScore - b.rawScore)

  return (
    <div className="space-y-3">
      {sorted.map((dim) => (
        <div key={dim.dimensionId}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-700 truncate">{dim.name}</span>
              {dim.killFlag && (
                <Badge variant="red" className="shrink-0 text-xs px-1.5 py-0.5">
                  KILL FLAG
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 ml-3 shrink-0">
              <span className={`text-sm font-bold ${getBarTextColor(dim.rawScore)}`}>
                {Math.round(dim.rawScore)}%
              </span>
              <span className="text-xs text-gray-400">w:{Math.round(dim.weight * 100)}%</span>
              {showFixItLinks && dim.rawScore < 50 && onFixItClick && (
                <button
                  onClick={() => onFixItClick(dim.dimensionId)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
                >
                  Fix it →
                </button>
              )}
            </div>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(dim.rawScore)}`}
              style={{ width: `${dim.rawScore}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

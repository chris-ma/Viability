import { prisma } from "@/lib/db/prisma"

const VERDICT_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  VIABLE:     { label: "Viable",     color: "#22c55e", bg: "bg-green-100 text-green-700" },
  PROMISING:  { label: "Promising",  color: "#f59e0b", bg: "bg-amber-100 text-amber-700" },
  NEEDS_WORK: { label: "Needs Work", color: "#f97316", bg: "bg-orange-100 text-orange-700" },
  NOT_VIABLE: { label: "Not Viable", color: "#ef4444", bg: "bg-red-100 text-red-700" },
}

export default async function AdminSubmissionsPage() {
  const assessments = await prisma.assessment.findMany({
    where: { completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      overallScore: true,
      verdict: true,
      completedAt: true,
      dimensionResults: { select: { dimensionId: true, rawScore: true, killFlag: true } },
      idea: {
        select: {
          title: true,
          industry: true,
          model: true,
          problem: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  })

  const DIMENSION_NAMES: Record<number, string> = {
    1: "Market Need",
    2: "Target Market",
    3: "Competition",
    4: "Business Model",
    5: "Founder Fit",
    6: "Financial",
    7: "Execution",
    8: "Traction",
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Submissions</h1>
        <p className="text-sm text-[#6E6E73] mt-1">{assessments.length} completed assessments</p>
      </div>

      <div className="space-y-4">
        {assessments.map((a) => {
          const cfg = a.verdict ? VERDICT_STYLES[a.verdict] : null
          const killFlags = a.dimensionResults.filter((d) => d.killFlag)
          const sortedDims = [...a.dimensionResults].sort((x, y) => x.rawScore - y.rawScore)

          return (
            <div key={a.id} className="bg-white rounded-2xl ring-1 ring-black/[0.06] p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-semibold text-[#1D1D1F] truncate">{a.idea.title}</h3>
                    {cfg && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    )}
                    {killFlags.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-red-100 text-red-600">
                        {killFlags.length} kill flag{killFlags.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#AEAEB2]">
                    {a.idea.user.email} · {a.idea.industry} · {a.idea.model}
                  </p>
                  <p className="text-xs text-[#AEAEB2]">
                    {a.completedAt ? new Date(a.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
                {a.overallScore != null && (
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-bold tracking-tight" style={{ color: cfg?.color ?? "#AEAEB2" }}>
                      {Math.round(a.overallScore)}
                    </div>
                    <div className="text-xs text-[#AEAEB2]">/ 100</div>
                  </div>
                )}
              </div>

              {/* Problem summary */}
              <p className="text-xs text-[#6E6E73] mb-4 line-clamp-2 leading-relaxed">{a.idea.problem}</p>

              {/* Dimension scores */}
              {sortedDims.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sortedDims.map((d) => {
                    const score = Math.round(d.rawScore)
                    const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"
                    return (
                      <div key={d.dimensionId} className="flex items-center justify-between bg-[#F5F5F7] rounded-lg px-2.5 py-1.5">
                        <span className="text-[11px] text-[#6E6E73] truncate mr-1">{DIMENSION_NAMES[d.dimensionId]}</span>
                        <span className="text-[11px] font-bold shrink-0 flex items-center gap-0.5" style={{ color }}>
                          {score}
                          {d.killFlag && <span className="text-red-500">⚡</span>}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {assessments.length === 0 && (
          <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] p-12 text-center">
            <p className="text-[#AEAEB2] text-sm">No completed assessments yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

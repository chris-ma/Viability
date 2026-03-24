import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import { Users, FileText, CheckCircle2, TrendingUp, AlertTriangle, XCircle, BarChart3 } from "lucide-react"

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] p-5">
      <Icon className="h-4 w-4 text-[#AEAEB2] mb-3" />
      <div className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{value}</div>
      <div className="text-sm text-[#6E6E73] mt-0.5">{label}</div>
      {sub && <div className="text-xs text-[#AEAEB2] mt-1">{sub}</div>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    totalIdeas,
    totalAssessments,
    completedAssessments,
    verdictCounts,
    recentUsers,
    recentAssessments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.idea.count(),
    prisma.assessment.count(),
    prisma.assessment.count({ where: { completedAt: { not: null } } }),
    prisma.assessment.groupBy({
      by: ["verdict"],
      _count: true,
      where: { verdict: { not: null } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, name: true, planTier: true, createdAt: true, _count: { select: { ideas: true } } },
    }),
    prisma.assessment.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 8,
      select: {
        id: true,
        overallScore: true,
        verdict: true,
        completedAt: true,
        idea: { select: { title: true, industry: true, user: { select: { email: true } } } },
      },
    }),
  ])

  const verdictMap = Object.fromEntries(verdictCounts.map((v) => [v.verdict, v._count]))
  const completionRate = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0
  const avgScore = recentAssessments.length
    ? Math.round(recentAssessments.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / recentAssessments.length)
    : 0

  const VERDICT_STYLES: Record<string, { label: string; color: string; bg: string }> = {
    VIABLE:     { label: "Viable",      color: "#22c55e", bg: "bg-green-100 text-green-700" },
    PROMISING:  { label: "Promising",   color: "#f59e0b", bg: "bg-amber-100 text-amber-700" },
    NEEDS_WORK: { label: "Needs Work",  color: "#f97316", bg: "bg-orange-100 text-orange-700" },
    NOT_VIABLE: { label: "Not Viable",  color: "#ef4444", bg: "bg-red-100 text-red-700" },
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Overview</h1>
        <p className="text-sm text-[#6E6E73] mt-1">All platform activity at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users" value={totalUsers} icon={Users} />
        <StatCard label="Total ideas" value={totalIdeas} icon={FileText} />
        <StatCard label="Assessments completed" value={completedAssessments} icon={CheckCircle2} sub={`${completionRate}% completion rate`} />
        <StatCard label="Avg score (recent)" value={avgScore} icon={BarChart3} sub="last 8 assessments" />
      </div>

      {/* Verdict breakdown */}
      <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-4">Verdict distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(VERDICT_STYLES).map(([key, cfg]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold tracking-tight" style={{ color: cfg.color }}>
                {verdictMap[key] ?? 0}
              </div>
              <div className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F]">Recent signups</h2>
            <Link href="/admin/users" className="text-xs text-[#0071E3] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F] truncate">{u.email}</p>
                  <p className="text-xs text-[#AEAEB2]">{u._count.ideas} idea{u._count.ideas !== 1 ? "s" : ""} · {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                </div>
                <span className="text-[10px] font-medium bg-[#F5F5F7] text-[#6E6E73] px-2 py-0.5 rounded-full shrink-0 uppercase">
                  {u.planTier}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent assessments */}
        <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F]">Recent assessments</h2>
            <Link href="/admin/submissions" className="text-xs text-[#0071E3] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentAssessments.map((a) => {
              const cfg = a.verdict ? VERDICT_STYLES[a.verdict] : null
              return (
                <div key={a.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F] truncate">{a.idea.title}</p>
                    <p className="text-xs text-[#AEAEB2] truncate">{a.idea.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.overallScore != null && (
                      <span className="text-sm font-bold" style={{ color: cfg?.color ?? "#AEAEB2" }}>
                        {Math.round(a.overallScore)}
                      </span>
                    )}
                    {cfg && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

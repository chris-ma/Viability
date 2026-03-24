import { prisma } from "@/lib/db/prisma"

const PLAN_COLORS: Record<string, string> = {
  free: "bg-[#F5F5F7] text-[#6E6E73]",
  pro: "bg-blue-100 text-blue-700",
  studio: "bg-purple-100 text-purple-700",
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      planTier: true,
      createdAt: true,
      _count: { select: { ideas: true } },
      ideas: {
        select: {
          assessments: {
            where: { completedAt: { not: null } },
            select: { overallScore: true, verdict: true },
            orderBy: { completedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  const VERDICT_COLORS: Record<string, string> = {
    VIABLE: "#22c55e",
    PROMISING: "#f59e0b",
    NEEDS_WORK: "#f97316",
    NOT_VIABLE: "#ef4444",
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Users</h1>
        <p className="text-sm text-[#6E6E73] mt-1">{users.length} total accounts</p>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#F5F5F7]/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">Ideas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">Latest score</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {users.map((u) => {
                const bestAssessment = u.ideas
                  .flatMap((i) => i.assessments)
                  .sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))[0]

                return (
                  <tr key={u.id} className="hover:bg-[#F5F5F7]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#1D1D1F]">{u.name || "—"}</p>
                      <p className="text-xs text-[#AEAEB2]">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full uppercase ${PLAN_COLORS[u.planTier] ?? "bg-gray-100 text-gray-600"}`}>
                        {u.planTier}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#1D1D1F]">{u._count.ideas}</td>
                    <td className="px-5 py-3.5">
                      {bestAssessment ? (
                        <span className="font-semibold" style={{ color: VERDICT_COLORS[bestAssessment.verdict ?? ""] ?? "#AEAEB2" }}>
                          {Math.round(bestAssessment.overallScore ?? 0)}
                        </span>
                      ) : (
                        <span className="text-[#AEAEB2]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#6E6E73] text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

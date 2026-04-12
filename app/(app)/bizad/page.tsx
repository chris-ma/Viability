import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus, Briefcase, TrendingUp, AlertTriangle, Clock } from "lucide-react"

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/sign-in")
  return user
}

function pursuitColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-[#F5F5F7] text-[#6E6E73]"
  if (score >= 80) return "bg-green-100 text-green-700"
  if (score >= 65) return "bg-blue-100 text-blue-700"
  if (score >= 50) return "bg-amber-100 text-amber-700"
  return "bg-red-100 text-red-700"
}

function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    new: "New",
    screened: "Screened",
    worth_contacting: "Worth Contacting",
    awaiting_info: "Awaiting Info",
    reviewing_financials: "Reviewing Financials",
    dd: "Due Diligence",
    rejected: "Rejected",
    closed: "Closed",
  }
  return labels[stage] ?? stage
}

export default async function BizAdPage() {
  const user = await getUser()

  const listings = await prisma.bizListing.findMany({
    where: { userId: user.id },
    include: { score: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-[#1D1D1F] rounded-xl flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">BizAd Analyzer</h1>
          </div>
          <p className="text-sm text-[#6E6E73]">Analyze business-for-sale listings and surface acquisition intelligence.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/bizad/new">
            <Plus className="h-4 w-4" />
            Analyze Listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-[#AEAEB2]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">No listings analyzed yet</h2>
          <p className="text-sm text-[#6E6E73] max-w-sm mb-6">
            Paste a business-for-sale ad and get instant AI-powered acquisition intelligence — risk flags, scores, valuation, and due diligence questions.
          </p>
          <Button asChild>
            <Link href="/bizad/new">
              <Plus className="h-4 w-4" />
              Analyze your first listing
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/bizad/${listing.id}`}>
              <Card className="p-5 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col gap-3 group">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[#1D1D1F] text-sm leading-snug line-clamp-2 group-hover:text-[#0071E3] transition-colors">
                    {listing.title ?? "Untitled Listing"}
                  </h3>
                  {listing.analysisStatus === "processing" && (
                    <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Processing</span>
                  )}
                  {listing.analysisStatus === "failed" && (
                    <span className="shrink-0 text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">Failed</span>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6E6E73]">
                  {listing.locationText && (
                    <span className="bg-[#F5F5F7] px-2 py-0.5 rounded-full">{listing.locationText}</span>
                  )}
                  {listing.askingPrice && (
                    <span className="bg-[#F5F5F7] px-2 py-0.5 rounded-full font-medium text-[#1D1D1F]">
                      ${listing.askingPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="bg-[#F5F5F7] px-2 py-0.5 rounded-full">{stageLabel(listing.pipelineStage)}</span>
                </div>

                {/* Scores row */}
                {listing.score && (
                  <div className="flex items-center gap-3 mt-auto pt-2 border-t border-black/[0.05]">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-[#6E6E73]" />
                      <span className="text-[11px] text-[#6E6E73]">Pursuit</span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${pursuitColor(listing.score.pursuitScore)}`}>
                        {listing.score.pursuitScore !== null ? Math.round(listing.score.pursuitScore) : "—"}
                      </span>
                    </div>
                    {listing.score.riskLevel !== null && listing.score.riskLevel > 50 && (
                      <div className="flex items-center gap-1 text-red-500">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-[11px]">High risk</span>
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-1 text-[#AEAEB2]">
                      <Clock className="h-3 w-3" />
                      <span className="text-[11px]">{formatDate(listing.createdAt)}</span>
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

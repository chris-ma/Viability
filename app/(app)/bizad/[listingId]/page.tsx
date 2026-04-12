import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Card } from "@/components/ui/card"
import { ArrowLeft, MapPin, DollarSign, AlertTriangle, CheckCircle2, XCircle, HelpCircle, ChevronRight, Briefcase, TrendingUp } from "lucide-react"
import { BizStageSelector } from "@/components/bizad/stage-selector"

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/sign-in")
  return user
}

function scoreColor(score: number, invert = false): string {
  const effective = invert ? 100 - score : score
  if (effective >= 70) return "text-green-600"
  if (effective >= 50) return "text-amber-600"
  return "text-red-600"
}

function scoreRingColor(score: number, invert = false): string {
  const effective = invert ? 100 - score : score
  if (effective >= 70) return "stroke-green-500"
  if (effective >= 50) return "stroke-amber-500"
  return "stroke-red-500"
}

function ScoreRing({ score, label, invert = false, small = false }: { score: number | null; label: string; invert?: boolean; small?: boolean }) {
  if (score === null) return (
    <div className={`flex flex-col items-center gap-1.5 ${small ? "min-w-[60px]" : "min-w-[80px]"}`}>
      <div className={`${small ? "w-14 h-14" : "w-20 h-20"} rounded-full bg-[#F5F5F7] flex items-center justify-center`}>
        <span className="text-[#AEAEB2] text-sm">—</span>
      </div>
      <span className="text-[10px] text-[#6E6E73] font-medium text-center leading-tight">{label}</span>
    </div>
  )

  const size = small ? 56 : 80
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const effective = invert ? 100 - score : score

  return (
    <div className={`flex flex-col items-center gap-1.5 ${small ? "min-w-[60px]" : "min-w-[80px]"}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E5EA" strokeWidth="6" />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            className={scoreRingColor(effective, false)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${small ? "text-sm" : "text-lg"} font-bold ${scoreColor(effective, false)}`}>{Math.round(score)}</span>
        </div>
      </div>
      <span className="text-[10px] text-[#6E6E73] font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

function severityStyle(severity: string): string {
  switch (severity) {
    case "critical": return "border-red-200 bg-red-50"
    case "high":     return "border-orange-200 bg-orange-50"
    case "medium":   return "border-amber-200 bg-amber-50"
    default:         return "border-gray-200 bg-gray-50"
  }
}

function severityIcon(severity: string) {
  switch (severity) {
    case "critical": return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
    case "high":     return <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
    case "medium":   return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
    default:         return <AlertTriangle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
  }
}

function priorityStyle(priority: string): string {
  switch (priority) {
    case "high":   return "bg-red-100 text-red-700"
    case "medium": return "bg-amber-100 text-amber-700"
    default:       return "bg-gray-100 text-gray-600"
  }
}

function safeJson(str: string | null | undefined): string[] {
  if (!str) return []
  try { return JSON.parse(str) } catch { return [] }
}

function formatCurrency(val: number | null): string {
  if (val === null) return "—"
  return "$" + val.toLocaleString("en-AU", { maximumFractionDigits: 0 })
}

export default async function BizListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>
}) {
  const { listingId } = await params
  const user = await getUser()

  const listing = await prisma.bizListing.findFirst({
    where: { id: listingId, userId: user.id },
    include: {
      fields: true,
      financials: true,
      classification: true,
      riskFlags: { orderBy: [{ severity: "desc" }, { createdAt: "asc" }] },
      missingInfo: { orderBy: [{ priority: "desc" }, { createdAt: "asc" }] },
      score: true,
      valuation: true,
    },
  })

  if (!listing) notFound()

  const s = listing.score
  const v = listing.valuation
  const c = listing.classification

  const positives = safeJson(v?.positives)
  const negatives = safeJson(v?.negatives)
  const nextSteps = safeJson(v?.nextSteps)
  const ddQuestions = safeJson(v?.ddQuestions)

  // Build extracted fields table
  const fieldMap = new Map(listing.fields.map(f => [f.fieldName, f]))
  const financialMap = new Map(listing.financials.map(f => [f.metricType, f]))

  const displayFields: { label: string; value: string }[] = [
    { label: "Industry", value: c?.industry ?? "—" },
    { label: "Business Model", value: c?.businessModel ?? "—" },
    { label: "Customer Type", value: c?.customerType ?? "—" },
    { label: "Delivery Mode", value: c?.deliveryMode ?? "—" },
    { label: "Revenue Model", value: c?.revenueModel ?? "—" },
    { label: "Owner Model", value: c?.ownerModel ?? "—" },
    { label: "Lifecycle Stage", value: c?.lifecycleStage ?? "—" },
    { label: "Years Trading", value: fieldMap.get("yearsTrading")?.fieldValueNum ? `${fieldMap.get("yearsTrading")!.fieldValueNum} yrs` : "—" },
    { label: "Staff Count", value: fieldMap.get("staffCount")?.fieldValueNum ? `${fieldMap.get("staffCount")!.fieldValueNum}` : "—" },
    { label: "Owner Days/Week", value: fieldMap.get("ownerDaysPerWeek")?.fieldValueNum ? `${fieldMap.get("ownerDaysPerWeek")!.fieldValueNum} days/wk` : "—" },
    { label: "Lease Term", value: fieldMap.get("leaseTermYears")?.fieldValueNum ? `${fieldMap.get("leaseTermYears")!.fieldValueNum} years` : "—" },
    { label: "Freehold", value: fieldMap.get("freehold")?.fieldValueText ?? "—" },
    { label: "Recurring Revenue", value: fieldMap.get("recurringRevenue")?.fieldValueText ?? "—" },
    { label: "Training Offered", value: fieldMap.get("trainingOffered")?.fieldValueText ?? "—" },
    { label: "Seller Finance", value: fieldMap.get("sellerFinance")?.fieldValueText ?? "—" },
    { label: "Reason for Sale", value: fieldMap.get("reasonForSale")?.fieldValueText ?? "—" },
  ].filter(f => f.value !== "—")

  const financialFields: { label: string; value: string }[] = [
    { label: "Asking Price", value: formatCurrency(listing.askingPrice) },
    { label: "Revenue (Annual)", value: formatCurrency(financialMap.get("revenue")?.amount ?? null) },
    { label: "EBITDA", value: formatCurrency(financialMap.get("ebitda")?.amount ?? null) },
    { label: "SDE", value: formatCurrency(financialMap.get("sde")?.amount ?? null) },
    { label: "Net Profit", value: formatCurrency(financialMap.get("net_profit")?.amount ?? null) },
    { label: "Gross Profit", value: formatCurrency(financialMap.get("gross_profit")?.amount ?? null) },
    { label: "Rent (Annual)", value: formatCurrency(financialMap.get("rent")?.amount ?? null) },
    { label: "Wages (Annual)", value: formatCurrency(financialMap.get("wages")?.amount ?? null) },
  ].filter(f => f.value !== "—")

  const criticalFlags = listing.riskFlags.filter(f => f.severity === "critical")
  const highFlags = listing.riskFlags.filter(f => f.severity === "high")

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Back */}
      <Link
        href="/bizad"
        className="inline-flex items-center gap-1.5 text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All listings
      </Link>

      {/* ── 1. Header snapshot ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-[#1D1D1F] rounded-lg flex items-center justify-center shrink-0">
              <Briefcase className="h-3.5 w-3.5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight truncate">
              {listing.title ?? "Business Listing Analysis"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {listing.locationText && (
              <span className="inline-flex items-center gap-1 text-xs text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                <MapPin className="h-3 w-3" />
                {listing.locationText}
              </span>
            )}
            {listing.askingPrice && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(listing.askingPrice)} asking
              </span>
            )}
            {c?.industry && (
              <span className="text-xs text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-full">{c.industry}</span>
            )}
          </div>
        </div>
        <BizStageSelector listingId={listing.id} currentStage={listing.pipelineStage} />
      </div>

      {/* ── 2. Scores ─────────────────────────────────────────────────── */}
      {s && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#6E6E73]" />
            <h2 className="font-semibold text-[#1D1D1F]">Screening Scores</h2>
            {s.confidence && (
              <span className="ml-auto text-xs text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                {s.confidence} confidence
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-around">
            <ScoreRing score={s.completenessScore}     label="Completeness" />
            <ScoreRing score={s.financialClarityScore} label="Fin. Clarity" />
            <ScoreRing score={s.businessQualityScore}  label="Biz Quality" />
            <ScoreRing score={s.riskLevel}             label="Risk Level" invert />
            <ScoreRing score={s.valuationScore}        label="Valuation" />
            <ScoreRing score={s.pursuitScore}          label="Pursuit" />
          </div>
          {s.recommendation && (
            <div className="mt-4 pt-4 border-t border-black/[0.05] text-center">
              <span className="text-sm font-semibold text-[#1D1D1F]">Recommendation: </span>
              <span className="text-sm text-[#6E6E73]">{s.recommendation}</span>
            </div>
          )}
        </Card>
      )}

      {/* ── 3. Valuation block ───────────────────────────────────────── */}
      {v && (v.impliedMultiple || v.estimatedMid) && (
        <Card className="p-5">
          <h2 className="font-semibold text-[#1D1D1F] mb-4">Valuation Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-[#F5F5F7] rounded-xl">
              <p className="text-xs text-[#6E6E73] mb-1">Implied Multiple</p>
              <p className="text-xl font-bold text-[#1D1D1F]">{v.impliedMultiple ? `${v.impliedMultiple.toFixed(1)}x` : "—"}</p>
              <p className="text-xs text-[#AEAEB2]">{v.profitBasis?.replace("_", " ") ?? ""}</p>
            </div>
            <div className="text-center p-3 bg-[#F5F5F7] rounded-xl">
              <p className="text-xs text-[#6E6E73] mb-1">Fair Value (Low)</p>
              <p className="text-lg font-bold text-[#1D1D1F]">{formatCurrency(v.estimatedLow)}</p>
            </div>
            <div className="text-center p-3 bg-[#F5F5F7] rounded-xl">
              <p className="text-xs text-[#6E6E73] mb-1">Fair Value (Mid)</p>
              <p className="text-lg font-bold text-[#1D1D1F]">{formatCurrency(v.estimatedMid)}</p>
            </div>
            <div className="text-center p-3 bg-[#F5F5F7] rounded-xl">
              <p className="text-xs text-[#6E6E73] mb-1">Price Position</p>
              <p className={`text-lg font-bold capitalize ${
                v.pricePosition === "undervalued" ? "text-green-600" :
                v.pricePosition === "fair" ? "text-blue-600" :
                v.pricePosition === "overvalued" ? "text-red-600" : "text-[#6E6E73]"
              }`}>{v.pricePosition ?? "—"}</p>
            </div>
          </div>
          {v.pricingView && (
            <p className="mt-4 text-sm text-[#6E6E73] leading-relaxed">{v.pricingView}</p>
          )}
        </Card>
      )}

      {/* ── 4. Risk flags ─────────────────────────────────────────────── */}
      {listing.riskFlags.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-[#1D1D1F]">Risk Flags</h2>
            {criticalFlags.length > 0 && (
              <span className="ml-auto text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                {criticalFlags.length} critical
              </span>
            )}
          </div>
          <div className="space-y-3">
            {listing.riskFlags.map((flag) => (
              <div key={flag.id} className={`flex gap-3 p-3.5 rounded-xl border ${severityStyle(flag.severity)}`}>
                {severityIcon(flag.severity)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1D1D1F]">{flag.title}</span>
                    <span className="text-[10px] uppercase font-bold text-current opacity-60">{flag.severity}</span>
                  </div>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">{flag.description}</p>
                  {flag.recommendation && (
                    <p className="text-xs text-[#1D1D1F] font-medium mt-1.5">
                      <span className="text-[#6E6E73]">Action: </span>{flag.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 5. Missing information ───────────────────────────────────── */}
      {listing.missingInfo.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-4 w-4 text-[#6E6E73]" />
            <h2 className="font-semibold text-[#1D1D1F]">Missing Information</h2>
            <span className="ml-auto text-xs text-[#6E6E73]">{listing.missingInfo.length} items</span>
          </div>
          <div className="space-y-2.5">
            {listing.missingInfo.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl border border-black/[0.06] bg-[#F5F5F7]">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1D1D1F]">{item.title}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${priorityStyle(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                {item.whyItMatters && (
                  <p className="text-xs text-[#6E6E73] mb-2">{item.whyItMatters}</p>
                )}
                {item.suggestedQuestion && (
                  <div className="flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-[#0071E3] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#0071E3] font-medium italic">{item.suggestedQuestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 6. Extracted fields ──────────────────────────────────────── */}
      {(financialFields.length > 0 || displayFields.length > 0) && (
        <Card className="p-5">
          <h2 className="font-semibold text-[#1D1D1F] mb-4">Extracted Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialFields.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#AEAEB2] uppercase tracking-wider mb-3">Financials</h3>
                <div className="space-y-1.5">
                  {financialFields.map(f => (
                    <div key={f.label} className="flex justify-between items-center py-1.5 border-b border-black/[0.04] last:border-0">
                      <span className="text-xs text-[#6E6E73]">{f.label}</span>
                      <span className="text-xs font-semibold text-[#1D1D1F]">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {displayFields.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#AEAEB2] uppercase tracking-wider mb-3">Business Details</h3>
                <div className="space-y-1.5">
                  {displayFields.map(f => (
                    <div key={f.label} className="flex justify-between items-center py-1.5 border-b border-black/[0.04] last:border-0">
                      <span className="text-xs text-[#6E6E73]">{f.label}</span>
                      <span className="text-xs font-semibold text-[#1D1D1F] text-right max-w-[60%] leading-tight">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── 7. AI Summary ────────────────────────────────────────────── */}
      {v?.aiSummary && (
        <Card className="p-5 space-y-5">
          <h2 className="font-semibold text-[#1D1D1F]">AI Analysis Summary</h2>

          <div className="p-4 bg-[#F5F5F7] rounded-xl">
            <p className="text-sm text-[#1D1D1F] leading-relaxed">{v.aiSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positives.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Positives</h3>
                <ul className="space-y-1.5">
                  {positives.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1D1D1F]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {negatives.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Concerns</h3>
                <ul className="space-y-1.5">
                  {negatives.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1D1D1F]">
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {nextSteps.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#AEAEB2] uppercase tracking-wider mb-2">Next Steps</h3>
              <ol className="space-y-1.5 list-none">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#1D1D1F]">
                    <span className="shrink-0 w-5 h-5 bg-[#1D1D1F] text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {ddQuestions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#AEAEB2] uppercase tracking-wider mb-2">Due Diligence Questions</h3>
              <ul className="space-y-2">
                {ddQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1D1D1F] p-2.5 bg-[#F5F5F7] rounded-lg">
                    <ChevronRight className="h-4 w-4 text-[#0071E3] shrink-0 mt-0.5" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { ArrowLeft, AlertTriangle, HelpCircle } from "lucide-react"
import { BizStageSelector } from "@/components/bizad/stage-selector"
import {
  ListingHeader,
  ScoresSection,
  ValuationSection,
  TiltFlagCard,
  MissingInfoCard,
  RevealCard,
  AISummarySection,
} from "@/components/bizad/results-client"

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/sign-in")
  return user
}

function safeJson(str: string | null | undefined): string[] {
  if (!str) return []
  try { return JSON.parse(str) } catch { return [] }
}

function fmt(val: number | null): string {
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

  const positives    = safeJson(v?.positives)
  const negatives    = safeJson(v?.negatives)
  const nextSteps    = safeJson(v?.nextSteps)
  const ddQuestions  = safeJson(v?.ddQuestions)

  type ExtractedField   = typeof listing.fields[number]
  type FinancialMetric  = typeof listing.financials[number]

  const fieldMap     = new Map<string, ExtractedField>(listing.fields.map((f: ExtractedField) => [f.fieldName, f]))
  const financialMap = new Map<string, FinancialMetric>(listing.financials.map((f: FinancialMetric) => [f.metricType, f]))

  const financialFields = [
    { label: "Asking Price",     value: fmt(listing.askingPrice) },
    { label: "Revenue (Annual)", value: fmt(financialMap.get("revenue")?.amount ?? null) },
    { label: "EBITDA",           value: fmt(financialMap.get("ebitda")?.amount ?? null) },
    { label: "SDE",              value: fmt(financialMap.get("sde")?.amount ?? null) },
    { label: "Net Profit",       value: fmt(financialMap.get("net_profit")?.amount ?? null) },
    { label: "Gross Profit",     value: fmt(financialMap.get("gross_profit")?.amount ?? null) },
    { label: "Rent (Annual)",    value: fmt(financialMap.get("rent")?.amount ?? null) },
    { label: "Wages (Annual)",   value: fmt(financialMap.get("wages")?.amount ?? null) },
  ].filter((f: { label: string; value: string }) => f.value !== "—")

  const detailFields = [
    { label: "Industry",          value: c?.industry },
    { label: "Business Model",    value: c?.businessModel },
    { label: "Customer Type",     value: c?.customerType },
    { label: "Delivery Mode",     value: c?.deliveryMode },
    { label: "Revenue Model",     value: c?.revenueModel },
    { label: "Owner Model",       value: c?.ownerModel },
    { label: "Lifecycle Stage",   value: c?.lifecycleStage },
    { label: "Years Trading",     value: fieldMap.get("yearsTrading")?.fieldValueNum != null ? `${fieldMap.get("yearsTrading")!.fieldValueNum} yrs` : null },
    { label: "Staff Count",       value: fieldMap.get("staffCount")?.fieldValueNum?.toString() ?? null },
    { label: "Owner Days/Week",   value: fieldMap.get("ownerDaysPerWeek")?.fieldValueNum != null ? `${fieldMap.get("ownerDaysPerWeek")!.fieldValueNum} days/wk` : null },
    { label: "Lease Term",        value: fieldMap.get("leaseTermYears")?.fieldValueNum != null ? `${fieldMap.get("leaseTermYears")!.fieldValueNum} years` : null },
    { label: "Freehold",          value: fieldMap.get("freehold")?.fieldValueText },
    { label: "Recurring Revenue", value: fieldMap.get("recurringRevenue")?.fieldValueText },
    { label: "Training Offered",  value: fieldMap.get("trainingOffered")?.fieldValueText },
    { label: "Seller Finance",    value: fieldMap.get("sellerFinance")?.fieldValueText },
    { label: "Reason for Sale",   value: fieldMap.get("reasonForSale")?.fieldValueText },
  ].filter((f: { label: string; value: string | null | undefined }) => f.value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20 p-6 lg:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Back */}
        <Link
          href="/bizad"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All listings
        </Link>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <ListingHeader
              title={listing.title}
              locationText={listing.locationText}
              askingPrice={listing.askingPrice}
              industry={c?.industry ?? null}
            />
          </div>
          <BizStageSelector listingId={listing.id} currentStage={listing.pipelineStage} />
        </div>

        {/* ── Scores ─────────────────────────────────────────────── */}
        {s && <ScoresSection scores={s} />}

        {/* ── Valuation ──────────────────────────────────────────── */}
        {v && (v.impliedMultiple || v.estimatedMid) && (
          <ValuationSection
            impliedMultiple={v.impliedMultiple}
            estimatedLow={v.estimatedLow}
            estimatedMid={v.estimatedMid}
            estimatedHigh={v.estimatedHigh}
            pricePosition={v.pricePosition}
            profitBasis={v.profitBasis}
            pricingView={v.pricingView}
          />
        )}

        {/* ── Risk flags ─────────────────────────────────────────── */}
        {listing.riskFlags.length > 0 && (
          <RevealCard delay={0.05}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h2 className="font-semibold text-slate-800">Risk Flags</h2>
              {listing.riskFlags.filter(f => f.severity === "critical").length > 0 && (
                <span className="ml-auto text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                  {listing.riskFlags.filter(f => f.severity === "critical").length} critical
                </span>
              )}
            </div>
            <div className="space-y-3">
              {listing.riskFlags.map((flag) => (
                <TiltFlagCard
                  key={flag.id}
                  severity={flag.severity}
                  title={flag.title}
                  description={flag.description}
                  recommendation={flag.recommendation}
                  evidenceSnippet={flag.evidenceSnippet}
                />
              ))}
            </div>
          </RevealCard>
        )}

        {/* ── Missing info ───────────────────────────────────────── */}
        {listing.missingInfo.length > 0 && (
          <RevealCard delay={0.1}>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800">Missing Information</h2>
              <span className="ml-auto text-xs text-slate-400">{listing.missingInfo.length} items</span>
            </div>
            <div className="space-y-2.5">
              {listing.missingInfo.map((item) => (
                <MissingInfoCard
                  key={item.id}
                  title={item.title}
                  whyItMatters={item.whyItMatters ?? null}
                  suggestedQuestion={item.suggestedQuestion ?? null}
                  priority={item.priority}
                />
              ))}
            </div>
          </RevealCard>
        )}

        {/* ── Extracted fields ───────────────────────────────────── */}
        {(financialFields.length > 0 || detailFields.length > 0) && (
          <RevealCard delay={0.15}>
            <h2 className="font-semibold text-slate-800 mb-4">Extracted Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialFields.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Financials</h3>
                  <div className="space-y-1.5">
                    {financialFields.map(f => (
                      <div key={f.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-xs text-slate-400">{f.label}</span>
                        <span className="text-xs font-semibold text-slate-700">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailFields.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Business Details</h3>
                  <div className="space-y-1.5">
                    {detailFields.map(f => (
                      <div key={f.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-xs text-slate-400">{f.label}</span>
                        <span className="text-xs font-semibold text-slate-700 text-right max-w-[55%] leading-tight capitalize">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </RevealCard>
        )}

        {/* ── AI Summary ─────────────────────────────────────────── */}
        {v?.aiSummary && (
          <AISummarySection
            aiSummary={v.aiSummary}
            positives={positives}
            negatives={negatives}
            nextSteps={nextSteps}
            ddQuestions={ddQuestions}
          />
        )}
      </div>
    </div>
  )
}

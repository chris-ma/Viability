import type { ExtractedListing } from "./extract"

export interface BizScoreResult {
  completenessScore: number
  financialClarityScore: number
  businessQualityScore: number
  riskLevel: number
  valuationScore: number
  pursuitScore: number
  confidence: "high" | "medium" | "low"
  recommendation: string
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function calcCompleteness(e: ExtractedListing): number {
  const weights: [boolean, number][] = [
    [e.askingPrice !== null, 10],
    [e.revenue !== null, 12],
    [e.ebitda !== null || e.sde !== null || e.netProfit !== null, 12],
    [e.location !== null, 5],
    [e.industry !== null, 5],
    [e.ownerInvolvement !== null, 10],
    [e.leaseTermYears !== null || e.freehold === true, 10],
    [e.staffCount !== null, 8],
    [e.reasonForSale !== null, 5],
    [e.inventoryIncluded !== null, 8],
    [e.yearsTrading !== null, 8],
    // evidence quality proxy: has specific financial figures
    [!e.financialVagueness, 7],
  ]

  const total = weights.reduce((sum, [, w]) => sum + w, 0)
  const present = weights.reduce((sum, [cond, w]) => sum + (cond ? w : 0), 0)
  return clamp((present / total) * 100)
}

function calcFinancialClarity(e: ExtractedListing): number {
  let score = 50

  if (e.revenue !== null) score += 15
  if (e.profitBasisLabel !== null && (e.ebitda !== null || e.sde !== null || e.netProfit !== null)) score += 20
  if (e.rent !== null && e.deliveryMode !== "online") score += 10
  if (e.yearsTrading !== null && e.yearsTrading > 1) score += 10
  if (e.financialVagueness) score -= 20
  if (e.numbersInconsistent) score -= 15
  if (!e.revenueAnnual && e.revenue !== null) score -= 10

  return clamp(score)
}

function calcBusinessQuality(e: ExtractedListing): number {
  let score = 50

  if (e.recurringRevenue) score += 15
  if (e.ownerModel === "manager-run") score += 12
  if (e.yearsTrading !== null && e.yearsTrading >= 5) score += 8
  if (e.revenueModel === "recurring") score += 10
  if (e.lifecycleStage === "growth") score += 8
  if (e.lifecycleStage === "stable") score += 5

  if (e.ownerModel === "owner-operated" && e.ownerDaysPerWeek !== null && e.ownerDaysPerWeek >= 4) score -= 12
  if (!e.recurringRevenue && e.revenueModel === "transactional") score -= 10
  if (e.lifecycleStage === "distressed") score -= 20
  if (e.lifecycleStage === "lifestyle") score -= 5

  return clamp(score)
}

function calcRiskLevel(e: ExtractedListing): number {
  let risk = 20

  if (e.ownerModel === "owner-operated" && e.ownerDaysPerWeek !== null && e.ownerDaysPerWeek >= 4) risk += 20
  if (e.financialVagueness) risk += 15
  if (e.deliveryMode === "physical" && e.leaseTermYears === null) risk += 15
  if (e.hasVagueReasonForSale) risk += 10
  if (e.numbersInconsistent) risk += 15
  if (e.supplierDependence !== null && e.supplierDependence.toLowerCase().includes("one")) risk += 10
  if (e.hasAddBacks) risk += 8
  if (e.lifecycleStage === "distressed") risk += 15

  return clamp(risk)
}

// Industry multiple bands [low, mid, high]
const SECTOR_BANDS: Record<string, [number, number, number]> = {
  retail:        [1.5, 2.5, 3.5],
  saas:          [4.0, 6.0, 10.0],
  service:       [2.0, 3.5, 5.0],
  franchise:     [1.5, 2.5, 3.5],
  manufacturing: [2.5, 3.5, 5.0],
  wholesale:     [2.0, 3.0, 4.5],
  default:       [2.0, 3.0, 4.5],
}

function getSectorBand(e: ExtractedListing): [number, number, number] {
  const model = e.businessModel ?? "default"
  return SECTOR_BANDS[model] ?? SECTOR_BANDS.default
}

function calcValuationScore(
  e: ExtractedListing,
): { score: number; impliedMultiple: number | null; estimatedLow: number | null; estimatedMid: number | null; estimatedHigh: number | null; pricePosition: string; profitBasis: string } {
  const profit = e.ebitda ?? e.sde ?? e.netProfit
  const profitBasis = e.ebitda ? "ebitda" : e.sde ? "sde" : e.netProfit ? "net_profit" : "unknown"

  if (!profit || !e.askingPrice) {
    return { score: 40, impliedMultiple: null, estimatedLow: null, estimatedMid: null, estimatedHigh: null, pricePosition: "uncertain", profitBasis }
  }

  const implied = e.askingPrice / profit
  const [low, mid, high] = getSectorBand(e)
  const estLow = profit * low
  const estMid = profit * mid
  const estHigh = profit * high

  let score: number
  let pricePosition: string

  if (e.askingPrice <= estLow * 0.85) {
    score = 90; pricePosition = "undervalued"
  } else if (e.askingPrice <= estMid * 1.1) {
    score = 70; pricePosition = "fair"
  } else if (e.askingPrice <= estHigh * 1.2) {
    score = 45; pricePosition = "overvalued"
  } else {
    score = 20; pricePosition = "overvalued"
  }

  return { score: clamp(score), impliedMultiple: implied, estimatedLow: estLow, estimatedMid: estMid, estimatedHigh: estHigh, pricePosition, profitBasis }
}

function calcPursuit(
  completeness: number,
  financialClarity: number,
  businessQuality: number,
  valuationScore: number,
  riskLevel: number,
): number {
  return clamp(
    0.20 * completeness +
    0.20 * financialClarity +
    0.25 * businessQuality +
    0.20 * valuationScore +
    0.15 * (100 - riskLevel)
  )
}

function getConfidence(e: ExtractedListing, completeness: number): "high" | "medium" | "low" {
  if (completeness >= 70 && !e.financialVagueness && !e.numbersInconsistent) return "high"
  if (completeness >= 45) return "medium"
  return "low"
}

function getRecommendation(pursuitScore: number): string {
  if (pursuitScore >= 80) return "Strong pursue"
  if (pursuitScore >= 65) return "Pursue with targeted questions"
  if (pursuitScore >= 50) return "Request more info first"
  return "Likely reject unless strategic fit"
}

export interface ScoringOutput extends BizScoreResult {
  impliedMultiple: number | null
  estimatedLow: number | null
  estimatedMid: number | null
  estimatedHigh: number | null
  pricePosition: string
  profitBasis: string
}

export function scoreExtracted(e: ExtractedListing): ScoringOutput {
  const completenessScore = calcCompleteness(e)
  const financialClarityScore = calcFinancialClarity(e)
  const businessQualityScore = calcBusinessQuality(e)
  const riskLevel = calcRiskLevel(e)
  const valuation = calcValuationScore(e)
  const valuationScore = valuation.score
  const pursuitScore = calcPursuit(completenessScore, financialClarityScore, businessQualityScore, valuationScore, riskLevel)
  const confidence = getConfidence(e, completenessScore)
  const recommendation = getRecommendation(pursuitScore)

  return {
    completenessScore,
    financialClarityScore,
    businessQualityScore,
    riskLevel,
    valuationScore,
    pursuitScore,
    confidence,
    recommendation,
    impliedMultiple: valuation.impliedMultiple,
    estimatedLow: valuation.estimatedLow,
    estimatedMid: valuation.estimatedMid,
    estimatedHigh: valuation.estimatedHigh,
    pricePosition: valuation.pricePosition,
    profitBasis: valuation.profitBasis,
  }
}

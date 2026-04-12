import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { extractListing } from "@/lib/bizad/extract"
import { scoreExtracted } from "@/lib/bizad/score"
import { detectFlags, detectMissing } from "@/lib/bizad/flags"
import { generateSummary } from "@/lib/bizad/summarize"

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return prisma.user.findUnique({ where: { clerkId } })
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const listings = await prisma.bizListing.findMany({
    where: { userId: user.id },
    include: { score: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(listings)
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const rawText: string = body.rawText ?? ""
  const sourceType: string = body.sourceType ?? "text"

  if (!rawText || rawText.trim().length < 50) {
    return NextResponse.json({ error: "Listing text is too short" }, { status: 400 })
  }

  // Create listing record
  const listing = await prisma.bizListing.create({
    data: {
      userId: user.id,
      rawText,
      sourceType,
      analysisStatus: "processing",
    },
  })

  try {
    // Step 1: Extract structured data via LLM
    const extracted = await extractListing(rawText)

    // Update listing with extracted basics
    await prisma.bizListing.update({
      where: { id: listing.id },
      data: {
        title: extracted.title,
        brokerName: extracted.brokerName,
        locationText: extracted.location,
        askingPrice: extracted.askingPrice,
      },
    })

    // Save extracted fields
    const fieldEntries = [
      { fieldName: "industry", fieldValueText: extracted.industry },
      { fieldName: "subIndustry", fieldValueText: extracted.subIndustry },
      { fieldName: "businessType", fieldValueText: extracted.businessType },
      { fieldName: "reasonForSale", fieldValueText: extracted.reasonForSale },
      { fieldName: "ownerInvolvement", fieldValueText: extracted.ownerInvolvement },
      { fieldName: "customerBase", fieldValueText: extracted.customerBase },
      { fieldName: "supplierDependence", fieldValueText: extracted.supplierDependence },
      { fieldName: "transitionSupport", fieldValueText: extracted.transitionSupport },
      { fieldName: "profitBasisLabel", fieldValueText: extracted.profitBasisLabel },
      { fieldName: "staffCount", fieldValueNum: extracted.staffCount },
      { fieldName: "yearsTrading", fieldValueNum: extracted.yearsTrading },
      { fieldName: "ownerDaysPerWeek", fieldValueNum: extracted.ownerDaysPerWeek },
      { fieldName: "leaseTermYears", fieldValueNum: extracted.leaseTermYears },
      { fieldName: "freehold", fieldValueText: extracted.freehold !== null ? String(extracted.freehold) : null },
      { fieldName: "recurringRevenue", fieldValueText: extracted.recurringRevenue !== null ? String(extracted.recurringRevenue) : null },
      { fieldName: "trainingOffered", fieldValueText: extracted.trainingOffered !== null ? String(extracted.trainingOffered) : null },
      { fieldName: "sellerFinance", fieldValueText: extracted.sellerFinance !== null ? String(extracted.sellerFinance) : null },
      { fieldName: "inventoryIncluded", fieldValueText: extracted.inventoryIncluded !== null ? String(extracted.inventoryIncluded) : null },
    ].filter(f => f.fieldValueText !== null || f.fieldValueNum !== null)

    if (fieldEntries.length > 0) {
      await prisma.bizExtractedField.createMany({
        data: fieldEntries.map(f => ({ ...f, listingId: listing.id })),
      })
    }

    // Save financial metrics
    const financialEntries = [
      { metricType: "revenue", amount: extracted.revenue },
      { metricType: "ebitda", amount: extracted.ebitda },
      { metricType: "sde", amount: extracted.sde },
      { metricType: "net_profit", amount: extracted.netProfit },
      { metricType: "gross_profit", amount: extracted.grossProfit },
      { metricType: "rent", amount: extracted.rent },
      { metricType: "wages", amount: extracted.wages },
    ].filter(f => f.amount !== null)

    if (financialEntries.length > 0) {
      await prisma.bizFinancialMetric.createMany({
        data: financialEntries.map(f => ({
          ...f,
          listingId: listing.id,
          periodType: "annual",
        })),
      })
    }

    // Save classification
    await prisma.bizClassification.create({
      data: {
        listingId: listing.id,
        industry: extracted.industry,
        businessModel: extracted.businessModel,
        customerType: extracted.customerType,
        deliveryMode: extracted.deliveryMode,
        ownerModel: extracted.ownerModel,
        revenueModel: extracted.revenueModel,
        lifecycleStage: extracted.lifecycleStage,
      },
    })

    // Step 2: Score
    const scores = scoreExtracted(extracted)

    await prisma.bizScore.create({
      data: {
        listingId: listing.id,
        completenessScore: scores.completenessScore,
        financialClarityScore: scores.financialClarityScore,
        businessQualityScore: scores.businessQualityScore,
        riskLevel: scores.riskLevel,
        valuationScore: scores.valuationScore,
        pursuitScore: scores.pursuitScore,
        confidence: scores.confidence,
        recommendation: scores.recommendation,
      },
    })

    // Step 3: Risk flags
    const flags = detectFlags(extracted)
    if (flags.length > 0) {
      await prisma.bizRiskFlag.createMany({
        data: flags.map(f => ({ ...f, listingId: listing.id })),
      })
    }

    // Step 4: Missing info
    const missing = detectMissing(extracted)
    if (missing.length > 0) {
      await prisma.bizMissingInfo.createMany({
        data: missing.map(m => ({ ...m, listingId: listing.id })),
      })
    }

    // Step 5: Valuation + AI summary
    const aiSummary = await generateSummary(extracted, scores, flags, missing)

    await prisma.bizValuation.create({
      data: {
        listingId: listing.id,
        profitBasis: scores.profitBasis,
        impliedMultiple: scores.impliedMultiple,
        estimatedLow: scores.estimatedLow,
        estimatedMid: scores.estimatedMid,
        estimatedHigh: scores.estimatedHigh,
        pricePosition: scores.pricePosition,
        aiSummary: aiSummary.executiveSummary,
        positives: JSON.stringify(aiSummary.positives),
        negatives: JSON.stringify(aiSummary.negatives),
        pricingView: aiSummary.pricingView,
        nextSteps: JSON.stringify(aiSummary.nextSteps),
        ddQuestions: JSON.stringify(aiSummary.ddQuestions),
      },
    })

    // Mark complete
    await prisma.bizListing.update({
      where: { id: listing.id },
      data: { analysisStatus: "completed" },
    })

    return NextResponse.json({ id: listing.id }, { status: 201 })
  } catch (err) {
    console.error("BizAd analysis failed:", err)
    await prisma.bizListing.update({
      where: { id: listing.id },
      data: { analysisStatus: "failed" },
    })
    return NextResponse.json({ error: "Analysis failed", id: listing.id }, { status: 500 })
  }
}

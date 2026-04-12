import type { ExtractedListing } from "./extract"

export interface RiskFlag {
  flagCode: string
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  evidenceSnippet?: string
  recommendation?: string
}

export interface MissingInfoItem {
  missingCode: string
  title: string
  whyItMatters: string
  suggestedQuestion: string
  priority: "low" | "medium" | "high"
}

export function detectFlags(e: ExtractedListing): RiskFlag[] {
  const flags: RiskFlag[] = []

  if (e.financialVagueness) {
    flags.push({
      flagCode: "FINANCIAL_VAGUE",
      severity: "high",
      title: "Vague financial claims",
      description: "The listing uses vague financial language without specific figures. This makes it impossible to assess the actual financial performance of the business.",
      recommendation: "Request audited financial statements or tax returns before proceeding.",
    })
  }

  if (e.numbersInconsistent) {
    flags.push({
      flagCode: "NUMBERS_INCONSISTENT",
      severity: "critical",
      title: "Inconsistent financial numbers",
      description: "The financial figures in this listing appear inconsistent or contradictory. This could indicate errors, selective disclosure, or misleading presentation.",
      recommendation: "Do not proceed without a full reconciliation of financial figures and independent verification.",
    })
  }

  if (e.ownerModel === "owner-operated" && e.ownerDaysPerWeek !== null && e.ownerDaysPerWeek >= 4) {
    flags.push({
      flagCode: "HIGH_OWNER_DEPENDENCE",
      severity: "high",
      title: "High owner dependence",
      description: `The owner works approximately ${e.ownerDaysPerWeek} days per week in the business. A buyer who is not replacing this role full-time may face operational challenges.`,
      recommendation: "Assess whether the business model can function with a manager-run structure, or factor in the cost of a replacement manager.",
    })
  }

  if (e.deliveryMode === "physical" && e.leaseTermYears === null && e.freehold !== true) {
    flags.push({
      flagCode: "LEASE_MISSING",
      severity: "high",
      title: "Lease details missing",
      description: "This is a physical location business but no lease term information is provided. Lease risk is a major factor in physical retail and hospitality acquisitions.",
      recommendation: "Request full lease details including term, renewal options, rent review clauses, and landlord consent requirements before making an offer.",
    })
  }

  if (e.hasVagueReasonForSale) {
    flags.push({
      flagCode: "VAGUE_REASON_FOR_SALE",
      severity: "medium",
      title: "Vague reason for sale",
      description: "The reason given for selling the business is non-specific or generic. Genuine sellers typically provide clear, verifiable reasons.",
      recommendation: "Ask the seller directly for a specific reason and verify where possible.",
    })
  }

  if (e.hasAddBacks) {
    flags.push({
      flagCode: "UNEXPLAINED_ADDBACKS",
      severity: "medium",
      title: "Add-backs mentioned",
      description: "The listing mentions add-backs or adjustments to the profit figure. These can legitimately improve stated earnings, but they require full documentation and scrutiny.",
      recommendation: "Request a full add-back schedule with supporting documentation for each item.",
    })
  }

  if (e.lifecycleStage === "distressed") {
    flags.push({
      flagCode: "DISTRESSED_BUSINESS",
      severity: "critical",
      title: "Signs of business distress",
      description: "The listing contains language or indicators consistent with a business under financial or operational stress.",
      recommendation: "Conduct thorough due diligence on cash flow, liabilities, creditor relationships, and reason for distress before proceeding.",
    })
  }

  if (e.supplierDependence !== null && e.supplierDependence.toLowerCase().includes("one")) {
    flags.push({
      flagCode: "SUPPLIER_CONCENTRATION",
      severity: "medium",
      title: "Single supplier dependence",
      description: "The business appears to rely on a single supplier. Loss of this supplier could severely impact operations.",
      recommendation: "Verify supplier contract terms, exclusivity arrangements, and what happens if the supplier relationship ends.",
    })
  }

  if (e.ebitda === null && e.sde === null && e.netProfit === null) {
    flags.push({
      flagCode: "NO_PROFIT_FIGURE",
      severity: "critical",
      title: "No profit figure disclosed",
      description: "The listing does not disclose any profit figure (EBITDA, SDE, or net profit). Without this, no meaningful valuation or screening is possible.",
      recommendation: "Do not proceed without receiving clear profit figures and the basis on which they are calculated.",
    })
  }

  return flags
}

export function detectMissing(e: ExtractedListing): MissingInfoItem[] {
  const missing: MissingInfoItem[] = []

  if (e.revenue === null) {
    missing.push({
      missingCode: "MISSING_REVENUE",
      title: "Revenue not disclosed",
      whyItMatters: "Without revenue figures you cannot calculate margins or verify profit claims.",
      suggestedQuestion: "What is the annual revenue for the most recent financial year?",
      priority: "high",
    })
  }

  if (e.ebitda === null && e.sde === null && e.netProfit === null) {
    missing.push({
      missingCode: "MISSING_PROFIT",
      title: "Profit basis not disclosed",
      whyItMatters: "Profit is the key driver of business valuation. Without it, no multiple or fair value can be calculated.",
      suggestedQuestion: "What is the EBITDA or SDE for the most recent financial year, and how is it calculated?",
      priority: "high",
    })
  }

  if (e.yearsTrading === null) {
    missing.push({
      missingCode: "MISSING_TRADING_HISTORY",
      title: "Years in operation not stated",
      whyItMatters: "Longevity indicates business stability and reduces key-person risk.",
      suggestedQuestion: "How long has the business been operating, and is the current ownership period different?",
      priority: "medium",
    })
  }

  if (e.reasonForSale === null) {
    missing.push({
      missingCode: "MISSING_REASON_FOR_SALE",
      title: "Reason for sale not provided",
      whyItMatters: "Understanding why the owner is selling is critical context for any acquisition.",
      suggestedQuestion: "What is the primary reason the owner is selling at this time?",
      priority: "high",
    })
  }

  if (e.staffCount === null) {
    missing.push({
      missingCode: "MISSING_STAFFING",
      title: "Staffing details missing",
      whyItMatters: "Staff count and structure affects operational risk and transition feasibility.",
      suggestedQuestion: "How many staff are employed, and are any on permanent vs casual contracts?",
      priority: "medium",
    })
  }

  if (e.deliveryMode === "physical" && e.leaseTermYears === null) {
    missing.push({
      missingCode: "MISSING_LEASE",
      title: "Lease term not specified",
      whyItMatters: "For a physical location business, lease security is a primary risk factor.",
      suggestedQuestion: "What is the current lease term remaining, and are there renewal options available?",
      priority: "high",
    })
  }

  if (e.ownerInvolvement === null) {
    missing.push({
      missingCode: "MISSING_OWNER_ROLE",
      title: "Owner involvement not described",
      whyItMatters: "Knowing how much the business depends on the current owner is essential for transition planning.",
      suggestedQuestion: "How many days per week does the current owner work in the business, and what are their primary responsibilities?",
      priority: "medium",
    })
  }

  if (e.inventoryIncluded === null && e.businessModel !== "service") {
    missing.push({
      missingCode: "MISSING_INVENTORY",
      title: "Inventory treatment not specified",
      whyItMatters: "Inventory value can significantly affect the total acquisition cost.",
      suggestedQuestion: "Is stock/inventory included in the asking price, and if so, at what value?",
      priority: "medium",
    })
  }

  return missing
}

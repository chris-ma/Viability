import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ExtractedListing {
  // Basics
  title: string | null
  industry: string | null
  subIndustry: string | null
  location: string | null
  brokerName: string | null
  askingPrice: number | null
  businessType: string | null

  // Financials
  revenue: number | null
  revenueAnnual: boolean
  ebitda: number | null
  sde: number | null
  netProfit: number | null
  grossProfit: number | null
  rent: number | null
  wages: number | null
  inventoryIncluded: boolean | null
  plantEquipmentIncluded: boolean | null

  // Operational
  yearsTrading: number | null
  staffCount: number | null
  ownerInvolvement: string | null // "full-time" | "part-time" | "minimal" | "absentee"
  ownerDaysPerWeek: number | null
  recurringRevenue: boolean | null
  onlinePresence: string | null // "online" | "physical" | "hybrid"
  customerBase: string | null
  supplierDependence: string | null

  // Sale context
  reasonForSale: string | null
  freehold: boolean | null
  leaseTermYears: number | null
  trainingOffered: boolean | null
  sellerFinance: boolean | null
  transitionSupport: string | null

  // Classification
  businessModel: string | null  // service | retail | manufacturing | wholesale | saas | franchise
  customerType: string | null   // b2b | b2c | mixed
  deliveryMode: string | null   // online | physical | hybrid
  ownerModel: string | null     // owner-operated | manager-run
  revenueModel: string | null   // recurring | repeat | transactional
  lifecycleStage: string | null // growth | stable | distressed | lifestyle

  // Raw profit basis statement (what the seller calls profit)
  profitBasisLabel: string | null

  // Confidence indicators
  financialVagueness: boolean
  numbersInconsistent: boolean
  hasAddBacks: boolean
  hasVagueReasonForSale: boolean
}

export async function extractListing(rawText: string): Promise<ExtractedListing> {
  const prompt = `You are an expert business acquisition analyst. Extract structured information from the following business-for-sale listing advertisement.

Return a single JSON object matching the schema exactly. Use null for any field that is not mentioned or cannot be reliably inferred. Do not guess — if uncertain, return null.

For financial figures, always convert to annual amounts in the listing's currency. If a figure is stated monthly, multiply by 12.

Schema:
{
  "title": string | null,
  "industry": string | null,
  "subIndustry": string | null,
  "location": string | null,
  "brokerName": string | null,
  "askingPrice": number | null,
  "businessType": string | null,
  "revenue": number | null,
  "revenueAnnual": boolean,
  "ebitda": number | null,
  "sde": number | null,
  "netProfit": number | null,
  "grossProfit": number | null,
  "rent": number | null,
  "wages": number | null,
  "inventoryIncluded": boolean | null,
  "plantEquipmentIncluded": boolean | null,
  "yearsTrading": number | null,
  "staffCount": number | null,
  "ownerInvolvement": "full-time" | "part-time" | "minimal" | "absentee" | null,
  "ownerDaysPerWeek": number | null,
  "recurringRevenue": boolean | null,
  "onlinePresence": "online" | "physical" | "hybrid" | null,
  "customerBase": string | null,
  "supplierDependence": string | null,
  "reasonForSale": string | null,
  "freehold": boolean | null,
  "leaseTermYears": number | null,
  "trainingOffered": boolean | null,
  "sellerFinance": boolean | null,
  "transitionSupport": string | null,
  "businessModel": "service" | "retail" | "manufacturing" | "wholesale" | "saas" | "franchise" | null,
  "customerType": "b2b" | "b2c" | "mixed" | null,
  "deliveryMode": "online" | "physical" | "hybrid" | null,
  "ownerModel": "owner-operated" | "manager-run" | null,
  "revenueModel": "recurring" | "repeat" | "transactional" | null,
  "lifecycleStage": "growth" | "stable" | "distressed" | "lifestyle" | null,
  "profitBasisLabel": string | null,
  "financialVagueness": boolean,
  "numbersInconsistent": boolean,
  "hasAddBacks": boolean,
  "hasVagueReasonForSale": boolean
}

LISTING TEXT:
${rawText}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("No JSON found in extraction response")
  }

  return JSON.parse(jsonMatch[0]) as ExtractedListing
}

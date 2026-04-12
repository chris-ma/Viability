import Anthropic from "@anthropic-ai/sdk"
import type { ExtractedListing } from "./extract"
import type { ScoringOutput } from "./score"
import type { RiskFlag, MissingInfoItem } from "./flags"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AISummary {
  executiveSummary: string
  positives: string[]
  negatives: string[]
  pricingView: string
  nextSteps: string[]
  ddQuestions: string[]
}

export async function generateSummary(
  extracted: ExtractedListing,
  scores: ScoringOutput,
  flags: RiskFlag[],
  missing: MissingInfoItem[],
): Promise<AISummary> {
  const prompt = `You are an expert business acquisition analyst. Based on the structured analysis below, generate a concise screening report for a buyer evaluating this business for sale.

EXTRACTED DATA:
${JSON.stringify(extracted, null, 2)}

SCORES:
- Completeness: ${scores.completenessScore}/100
- Financial Clarity: ${scores.financialClarityScore}/100
- Business Quality: ${scores.businessQualityScore}/100
- Risk Level: ${scores.riskLevel}/100 (higher = more risk)
- Valuation Score: ${scores.valuationScore}/100
- Pursuit Score: ${scores.pursuitScore}/100
- Confidence: ${scores.confidence}
- Recommendation: ${scores.recommendation}
- Implied Multiple: ${scores.impliedMultiple ? scores.impliedMultiple.toFixed(2) + "x" : "N/A"}
- Price Position: ${scores.pricePosition}

RISK FLAGS (${flags.length}):
${flags.map(f => `- [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join("\n")}

MISSING INFORMATION (${missing.length}):
${missing.map(m => `- [${m.priority}] ${m.title}: ${m.whyItMatters}`).join("\n")}

Return a JSON object with exactly this structure:
{
  "executiveSummary": "2-3 sentence plain-English summary of what this business is and whether it warrants further investigation",
  "positives": ["up to 5 genuine positives about this listing"],
  "negatives": ["up to 5 genuine concerns or weaknesses"],
  "pricingView": "1-2 sentences on whether the asking price appears reasonable given the disclosed financials",
  "nextSteps": ["3-5 specific, actionable next steps for a buyer who wants to proceed"],
  "ddQuestions": ["6-8 targeted due diligence questions to ask the seller or broker"]
}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("No JSON found in summary response")
  }

  return JSON.parse(jsonMatch[0]) as AISummary
}

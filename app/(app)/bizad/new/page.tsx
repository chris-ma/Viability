"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Briefcase, Loader2, Sparkles } from "lucide-react"

const SAMPLE_TEXT = `Highly Profitable Cafe | Sydney Inner West | $395,000 + SAV

Established in 2018, this well-regarded cafe is located in the heart of Newtown. Trading 7 days per week, the business generates approximately $620,000 in annual revenue with an adjusted net profit of $145,000 after owner's wage.

The premises are leased at $42,000 per annum with a 3-year lease plus two 3-year options. Fully fitted and equipped with quality equipment. Inventory approximately $8,000 at cost included in the purchase.

Currently owner-operated with 4 part-time staff. Owner works approximately 5 days per week. The business has a loyal customer base with strong repeat trade. Reason for sale: owner relocating interstate.

Training and handover period of 4 weeks included.`

export default function NewBizAdPage() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charCount = text.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim().length < 50) {
      setError("Please paste more listing text (minimum 50 characters).")
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/bizad/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text, sourceType: "text" }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed")
      }

      router.push(`/bizad/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/bizad"
        className="inline-flex items-center gap-1.5 text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 bg-[#1D1D1F] rounded-xl flex items-center justify-center">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Analyze a Listing</h1>
      </div>
      <p className="text-sm text-[#6E6E73] mb-8">
        Paste the full text of a business-for-sale advertisement. The AI will extract key data, score the listing, flag risks, and generate due diligence questions.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="p-0 overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] bg-[#F5F5F7]">
            <span className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">Listing Text</span>
            <button
              type="button"
              onClick={() => setText(SAMPLE_TEXT)}
              className="text-xs text-[#0071E3] hover:underline font-medium"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the full listing text here — title, financials, location, lease details, reason for sale, and any other information from the advertisement..."
            className="w-full min-h-[320px] p-4 text-sm text-[#1D1D1F] placeholder:text-[#AEAEB2] resize-y outline-none font-[inherit] leading-relaxed"
            disabled={loading}
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-black/[0.06] bg-[#F5F5F7]">
            <span className={`text-xs ${charCount < 50 ? "text-[#AEAEB2]" : "text-[#6E6E73]"}`}>
              {charCount} characters {charCount < 50 && charCount > 0 ? `(${50 - charCount} more needed)` : ""}
            </span>
            <span className="text-xs text-[#AEAEB2]">Analysis takes ~20 seconds</span>
          </div>
        </Card>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading || charCount < 50}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing listing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze listing
            </>
          )}
        </Button>

        {loading && (
          <p className="text-center text-xs text-[#6E6E73] mt-3">
            Extracting data, scoring, and generating AI summary — this takes about 20 seconds.
          </p>
        )}
      </form>
    </div>
  )
}

"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { ArrowLeft, Briefcase, Loader2, Sparkles, FileText, Zap, ShieldCheck } from "lucide-react"

const SAMPLE_TEXT = `Highly Profitable Cafe | Sydney Inner West | $395,000 + SAV

Established in 2018, this well-regarded cafe is located in the heart of Newtown. Trading 7 days per week, the business generates approximately $620,000 in annual revenue with an adjusted net profit of $145,000 after owner's wage.

The premises are leased at $42,000 per annum with a 3-year lease plus two 3-year options. Fully fitted and equipped with quality equipment. Inventory approximately $8,000 at cost included in the purchase.

Currently owner-operated with 4 part-time staff. Owner works approximately 5 days per week. The business has a loyal customer base with strong repeat trade. Reason for sale: owner relocating interstate.

Training and handover period of 4 weeks included.`

const FEATURES = [
  { icon: Zap, label: "Instant extraction", desc: "Financials, operations, sale context" },
  { icon: ShieldCheck, label: "Risk flags", desc: "Missing data, vague claims, red flags" },
  { icon: Sparkles, label: "AI summary", desc: "Scoring, valuation & DD questions" },
]

// 3D tilt for the textarea card
function TiltFormCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 25 })
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 25 })

  return (
    <div ref={ref}
      onMouseMove={e => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      style={{ perspective: 900 }}
    >
      <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="rounded-2xl">
        {children}
      </motion.div>
    </div>
  )
}

export default function NewBizAdPage() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const charCount = text.length
  const ready = charCount >= 50

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) { setError("Please paste more listing text (minimum 50 characters)."); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/bizad/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text, sourceType: "text" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Analysis failed")
      router.push(`/bizad/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/30 p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link href="/bizad" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotateY: [0, 15, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200"
            >
              <Briefcase className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analyze a Listing</h1>
              <p className="text-xs text-slate-400">Paste text · Get instant intelligence</p>
            </div>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="flex flex-wrap gap-2 mb-7"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm">
              <Icon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">{label}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">— {desc}</span>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 180 }}
        >
          <TiltFormCard>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden mb-4">
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-sky-50/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Listing Text</span>
                </div>
                <button
                  type="button"
                  onClick={() => setText(SAMPLE_TEXT)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Load sample →
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste the full listing text here — title, financials, location, lease details, reason for sale, and any other information from the advertisement…"
                className="w-full min-h-[280px] p-5 text-sm text-slate-800 placeholder:text-slate-300 resize-y outline-none font-[inherit] leading-relaxed bg-transparent"
                disabled={loading}
              />

              {/* Footer bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-slate-300"} transition-colors`} />
                  <span className={`text-xs ${ready ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                    {charCount} chars {!ready && charCount > 0 ? `(${50 - charCount} more)` : ready ? "— ready" : ""}
                  </span>
                </div>
                <span className="text-xs text-slate-300">~20 second analysis</span>
              </div>
            </div>
          </TiltFormCard>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading || !ready}
            whileHover={ready && !loading ? { scale: 1.02, translateY: -1 } : {}}
            whileTap={ready && !loading ? { scale: 0.98 } : {}}
            className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            style={{
              background: ready && !loading
                ? "linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #6366f1 100%)"
                : "#e2e8f0",
              color: ready && !loading ? "white" : "#94a3b8",
              boxShadow: ready && !loading ? "0 8px 24px rgba(59,130,246,0.35)" : "none",
            }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing listing…
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze listing
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {loading && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-xs text-slate-400 mt-3 leading-relaxed"
              >
                Extracting structured data, computing scores, and generating AI summary…
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  )
}

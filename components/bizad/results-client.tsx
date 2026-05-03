"use client"

import { useRef } from "react"
import { motion, useMotionValue, useTransform, useSpring, useInView } from "framer-motion"
import {
  MapPin, DollarSign, AlertTriangle, CheckCircle2, XCircle,
  HelpCircle, ChevronRight, TrendingUp,
} from "lucide-react"

// ── Animated score ring ────────────────────────────────────────────────────────

function ringStroke(score: number, invert: boolean) {
  const eff = invert ? 100 - score : score
  if (eff >= 70) return "#22c55e"
  if (eff >= 50) return "#f59e0b"
  return "#ef4444"
}

function ringTextColor(score: number, invert: boolean) {
  const eff = invert ? 100 - score : score
  if (eff >= 70) return "text-emerald-600"
  if (eff >= 50) return "text-amber-500"
  return "text-red-500"
}

export function AnimatedScoreRing({
  score, label, invert = false,
}: {
  score: number | null
  label: string
  invert?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const size = 80
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const targetDash = score !== null ? (score / 100) * circ : 0

  if (score === null) return (
    <div ref={ref} className="flex flex-col items-center gap-1.5 min-w-[80px]">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
        <span className="text-slate-300 text-sm">—</span>
      </div>
      <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">{label}</span>
    </div>
  )

  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5 min-w-[80px]">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            stroke={ringStroke(score, invert)}
            strokeDasharray={`${targetDash} ${circ}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={inView ? { strokeDasharray: `${targetDash} ${circ}` } : {}}
            transition={{ duration: 1.0, delay: 0.1, ease: "easeOut" }}
          />
        </svg>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, type: "spring", stiffness: 220 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className={`text-lg font-bold ${ringTextColor(score, invert)}`}>{Math.round(score)}</span>
        </motion.div>
      </div>
      <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

// ── Section card that slides in when scrolled to ───────────────────────────────

export function RevealCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, rotateX: -6 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 180, damping: 22 }}
      style={{ transformPerspective: 900 }}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ── 3D tilt card for risk flags ────────────────────────────────────────────────

export function TiltFlagCard({
  severity, title, description, recommendation, evidenceSnippet,
}: {
  severity: string
  title: string
  description: string
  recommendation?: string | null
  evidenceSnippet?: string | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 28 })
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 28 })

  const styles: Record<string, { border: string; bg: string; icon: string; badge: string }> = {
    critical: { border: "border-red-200",    bg: "bg-red-50/80",    icon: "text-red-500",    badge: "bg-red-100 text-red-700" },
    high:     { border: "border-orange-200", bg: "bg-orange-50/80", icon: "text-orange-500", badge: "bg-orange-100 text-orange-700" },
    medium:   { border: "border-amber-200",  bg: "bg-amber-50/80",  icon: "text-amber-500",  badge: "bg-amber-100 text-amber-700" },
    low:      { border: "border-slate-200",  bg: "bg-slate-50/80",  icon: "text-slate-400",  badge: "bg-slate-100 text-slate-500" },
  }
  const s = styles[severity] ?? styles.low

  return (
    <div
      ref={ref}
      style={{ perspective: 700 }}
      onMouseMove={e => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
    >
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY }}
        whileHover={{ scale: 1.01 }}
        className={`flex gap-3 p-4 rounded-xl border ${s.border} ${s.bg} backdrop-blur-sm`}
      >
        <AlertTriangle className={`h-4 w-4 ${s.icon} shrink-0 mt-0.5`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{title}</span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${s.badge}`}>{severity}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          {recommendation && (
            <p className="text-xs text-slate-700 font-medium mt-1.5">
              <span className="text-slate-400">Action: </span>{recommendation}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Snapshot header bar ────────────────────────────────────────────────────────

export function ListingHeader({
  title, locationText, askingPrice, industry,
}: {
  title: string | null
  locationText: string | null
  askingPrice: number | null
  industry: string | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
        {title ?? "Business Listing Analysis"}
      </h1>
      <div className="flex flex-wrap gap-2">
        {locationText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm"
          >
            <MapPin className="h-3 w-3 text-sky-400" />
            {locationText}
          </motion.span>
        )}
        {askingPrice && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.22 }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-sm"
          >
            <DollarSign className="h-3 w-3" />
            ${askingPrice.toLocaleString()} asking
          </motion.span>
        )}
        {industry && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.29 }}
            className="text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm"
          >
            {industry}
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}

// ── Scores section ─────────────────────────────────────────────────────────────

export function ScoresSection({
  scores,
}: {
  scores: {
    completenessScore: number | null
    financialClarityScore: number | null
    businessQualityScore: number | null
    riskLevel: number | null
    valuationScore: number | null
    pursuitScore: number | null
    confidence: string | null
    recommendation: string | null
  }
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-slate-400" />
        <h2 className="font-semibold text-slate-800">Screening Scores</h2>
        {scores.confidence && (
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {scores.confidence} confidence
          </span>
        )}
      </div>
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="flex flex-wrap gap-4 justify-around"
      >
        {[
          { score: scores.completenessScore,     label: "Completeness",   invert: false },
          { score: scores.financialClarityScore, label: "Fin. Clarity",   invert: false },
          { score: scores.businessQualityScore,  label: "Biz Quality",    invert: false },
          { score: scores.riskLevel,             label: "Risk Level",     invert: true  },
          { score: scores.valuationScore,        label: "Valuation",      invert: false },
          { score: scores.pursuitScore,          label: "Pursuit",        invert: false },
        ].map(({ score, label, invert }) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.85 },
              show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 220, damping: 20 } },
            }}
          >
            <AnimatedScoreRing score={score} label={label} invert={invert} />
          </motion.div>
        ))}
      </motion.div>
      {scores.recommendation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-5 pt-4 border-t border-slate-100 text-center"
        >
          <span className="text-sm font-semibold text-slate-800">Recommendation: </span>
          <span className="text-sm text-slate-500">{scores.recommendation}</span>
        </motion.div>
      )}
    </div>
  )
}

// ── Valuation block ────────────────────────────────────────────────────────────

export function ValuationSection({
  impliedMultiple, estimatedLow, estimatedMid, estimatedHigh,
  pricePosition, profitBasis, pricingView,
}: {
  impliedMultiple: number | null
  estimatedLow: number | null
  estimatedMid: number | null
  estimatedHigh: number | null
  pricePosition: string | null
  profitBasis: string | null
  pricingView: string | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  const positionColor = pricePosition === "undervalued"
    ? "text-emerald-600"
    : pricePosition === "fair"
    ? "text-blue-600"
    : pricePosition === "overvalued"
    ? "text-red-500"
    : "text-slate-400"

  const statCells = [
    { label: "Implied Multiple", value: impliedMultiple ? `${impliedMultiple.toFixed(1)}x` : "—", sub: profitBasis?.replace("_", " ") ?? "" },
    { label: "Fair Value (Low)", value: estimatedLow ? `$${estimatedLow.toLocaleString("en-AU", { maximumFractionDigits: 0 })}` : "—", sub: "" },
    { label: "Fair Value (Mid)", value: estimatedMid ? `$${estimatedMid.toLocaleString("en-AU", { maximumFractionDigits: 0 })}` : "—", sub: "" },
    { label: "Price Position", value: pricePosition ?? "—", sub: "", color: positionColor },
  ]

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <h2 className="font-semibold text-slate-800 mb-4">Valuation Analysis</h2>
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {statCells.map(({ label, value, sub, color }) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22 } },
            }}
            whileHover={{ scale: 1.04, translateY: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-center p-3.5 bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-xl border border-slate-100"
          >
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-bold capitalize ${color ?? "text-slate-800"}`}>{value}</p>
            {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
          </motion.div>
        ))}
      </motion.div>
      {pricingView && (
        <p className="mt-4 text-sm text-slate-500 leading-relaxed">{pricingView}</p>
      )}
    </div>
  )
}

// ── AI Summary section ─────────────────────────────────────────────────────────

export function AISummarySection({
  aiSummary, positives, negatives, nextSteps, ddQuestions,
}: {
  aiSummary: string
  positives: string[]
  negatives: string[]
  nextSteps: string[]
  ddQuestions: string[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: "spring", stiffness: 160, damping: 22 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5"
    >
      <h2 className="font-semibold text-slate-800">AI Analysis Summary</h2>

      <div className="p-4 bg-gradient-to-br from-sky-50/80 to-blue-50/60 rounded-xl border border-sky-100">
        <p className="text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {positives.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2.5">Positives</h3>
            <motion.ul
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className="space-y-1.5"
            >
              {positives.map((p, i) => (
                <motion.li
                  key={i}
                  variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  {p}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}
        {negatives.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2.5">Concerns</h3>
            <motion.ul
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className="space-y-1.5"
            >
              {negatives.map((n, i) => (
                <motion.li
                  key={i}
                  variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                  {n}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}
      </div>

      {nextSteps.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Next Steps</h3>
          <ol className="space-y-1.5">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="shrink-0 w-5 h-5 bg-gradient-to-br from-sky-400 to-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {ddQuestions.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Due Diligence Questions</h3>
          <motion.ul
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="space-y-2"
          >
            {ddQuestions.map((q, i) => (
              <motion.li
                key={i}
                variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                className="flex items-start gap-2 text-sm text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <ChevronRight className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                {q}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </motion.div>
  )
}

// ── Missing info card ──────────────────────────────────────────────────────────

export function MissingInfoCard({
  title, whyItMatters, suggestedQuestion, priority,
}: {
  title: string
  whyItMatters: string | null
  suggestedQuestion: string | null
  priority: string
}) {
  const colors: Record<string, string> = {
    high: "bg-rose-100 text-rose-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-500",
  }
  return (
    <motion.div
      whileHover={{ scale: 1.01, translateY: -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="p-4 rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${colors[priority] ?? colors.low}`}>
          {priority}
        </span>
      </div>
      {whyItMatters && <p className="text-xs text-slate-400 mb-2">{whyItMatters}</p>}
      {suggestedQuestion && (
        <div className="flex items-start gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-500 font-medium italic">{suggestedQuestion}</p>
        </div>
      )}
    </motion.div>
  )
}

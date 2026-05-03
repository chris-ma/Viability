"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { Plus, Briefcase, TrendingUp, AlertTriangle, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface ListingScore {
  pursuitScore: number | null
  riskLevel: number | null
}

interface Listing {
  id: string
  title: string | null
  locationText: string | null
  askingPrice: number | null
  pipelineStage: string
  analysisStatus: string
  createdAt: Date
  score: ListingScore | null
}

function pursuitColor(score: number | null | undefined) {
  if (score == null) return "bg-slate-100 text-slate-500"
  if (score >= 80) return "bg-emerald-100 text-emerald-700"
  if (score >= 65) return "bg-sky-100 text-sky-700"
  if (score >= 50) return "bg-amber-100 text-amber-700"
  return "bg-rose-100 text-rose-600"
}

const STAGE_LABELS: Record<string, string> = {
  new: "New", screened: "Screened", worth_contacting: "Worth Contacting",
  awaiting_info: "Awaiting Info", reviewing_financials: "Reviewing Financials",
  dd: "Due Diligence", rejected: "Rejected", closed: "Closed",
}

// 3D tilt card using mouse-tracking motion values
function TiltCard({ listing }: { listing: Listing }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 })
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 })
  const glowX = useTransform(mx, [-0.5, 0.5], [0, 100])
  const glowY = useTransform(my, [-0.5, 0.5], [0, 100])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onMouseLeave() { mx.set(0); my.set(0) }

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={{ perspective: 800 }}>
      <Link href={`/bizad/${listing.id}`}>
        <motion.div
          style={{ rotateX: rotX, rotateY: rotY }}
          whileHover={{ scale: 1.02, translateZ: 10 }}
          transition={{ duration: 0.2 }}
          className="relative h-full rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 overflow-hidden cursor-pointer group"
        >
          {/* Glare overlay */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glowX.get()}% ${glowY.get()}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
            }}
          />

          {/* Top color stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-t-2xl" />

          <div className="p-5 flex flex-col gap-3">
            {/* Title */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {listing.title ?? "Untitled Listing"}
              </h3>
              {listing.analysisStatus === "processing" && (
                <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Processing</span>
              )}
              {listing.analysisStatus === "failed" && (
                <span className="shrink-0 text-[10px] bg-rose-100 text-rose-600 font-semibold px-2 py-0.5 rounded-full">Failed</span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
              {listing.locationText && (
                <span className="bg-slate-100 px-2 py-0.5 rounded-full">{listing.locationText}</span>
              )}
              {listing.askingPrice && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  ${listing.askingPrice.toLocaleString()}
                </span>
              )}
              <span className="bg-slate-100 px-2 py-0.5 rounded-full">{STAGE_LABELS[listing.pipelineStage] ?? listing.pipelineStage}</span>
            </div>

            {/* Score row */}
            {listing.score && (
              <div className="flex items-center gap-3 mt-auto pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400">Pursuit</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${pursuitColor(listing.score.pursuitScore)}`}>
                    {listing.score.pursuitScore != null ? Math.round(listing.score.pursuitScore) : "—"}
                  </span>
                </div>
                {listing.score.riskLevel != null && listing.score.riskLevel > 50 && (
                  <div className="flex items-center gap-1 text-rose-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-[11px]">High risk</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-1 text-slate-300">
                  <Clock className="h-3 w-3" />
                  <span className="text-[11px]">{formatDate(listing.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 28, rotateX: -8 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring" as const, stiffness: 220, damping: 22 } },
}

export function BizAdClient({ listings }: { listings: Listing[] }) {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-start justify-between mb-8 gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BizAd Analyzer</h1>
              <p className="text-xs text-slate-400 mt-0.5">AI-powered acquisition intelligence</p>
            </div>
          </div>
        </div>
        <Button asChild size="sm" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 border-0 shadow-md shadow-blue-200/50">
          <Link href="/bizad/new">
            <Plus className="h-4 w-4" />
            Analyze Listing
          </Link>
        </Button>
      </motion.div>

      {listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
          className="flex flex-col items-center justify-center py-28 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-5 shadow-lg shadow-blue-100"
          >
            <Sparkles className="h-9 w-9 text-blue-400" />
          </motion.div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">No listings analyzed yet</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            Paste a business-for-sale ad and get instant AI-powered acquisition intelligence — risk scores, valuations, and due diligence questions.
          </p>
          <Button asChild className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 border-0 shadow-md shadow-blue-200/50">
            <Link href="/bizad/new">
              <Plus className="h-4 w-4" />
              Analyze your first listing
            </Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          style={{ perspective: 1200 }}
        >
          {listings.map((listing) => (
            <motion.div key={listing.id} variants={item}>
              <TiltCard listing={listing} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

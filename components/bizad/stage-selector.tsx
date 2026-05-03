"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STAGES = [
  { value: "new",                  label: "New" },
  { value: "screened",             label: "Screened" },
  { value: "worth_contacting",     label: "Worth Contacting" },
  { value: "awaiting_info",        label: "Awaiting Info" },
  { value: "reviewing_financials", label: "Reviewing Financials" },
  { value: "dd",                   label: "Due Diligence" },
  { value: "rejected",             label: "Rejected" },
  { value: "closed",               label: "Closed" },
]

function stageStyle(stage: string) {
  switch (stage) {
    case "dd":                   return "bg-blue-100 text-blue-700 border-blue-200"
    case "worth_contacting":     return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "reviewing_financials": return "bg-purple-100 text-purple-700 border-purple-200"
    case "awaiting_info":        return "bg-amber-100 text-amber-700 border-amber-200"
    case "rejected":             return "bg-rose-100 text-rose-600 border-rose-200"
    case "closed":               return "bg-slate-100 text-slate-500 border-slate-200"
    default:                     return "bg-sky-50 text-sky-600 border-sky-200"
  }
}

export function BizStageSelector({
  listingId,
  currentStage,
}: {
  listingId: string
  currentStage: string
}) {
  const [stage, setStage] = useState(currentStage)
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStage = e.target.value
    setStage(newStage)
    setSaving(true)
    await fetch(`/api/bizad/listings/${listingId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    })
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 220 }}
      className="shrink-0 relative"
    >
      <select
        value={stage}
        onChange={handleChange}
        disabled={saving}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none shadow-sm transition-all duration-200 ${stageStyle(stage)} ${saving ? "opacity-60" : ""}`}
      >
        {STAGES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <AnimatePresence>
        {saving && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

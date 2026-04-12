"use client"

import { useState } from "react"

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

function stageStyle(stage: string): string {
  switch (stage) {
    case "dd":               return "bg-blue-100 text-blue-700"
    case "worth_contacting": return "bg-green-100 text-green-700"
    case "reviewing_financials": return "bg-purple-100 text-purple-700"
    case "rejected":         return "bg-red-100 text-red-700"
    case "closed":           return "bg-gray-100 text-gray-500"
    default:                 return "bg-[#F5F5F7] text-[#6E6E73]"
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
    <div className="shrink-0">
      <select
        value={stage}
        onChange={handleChange}
        disabled={saving}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer appearance-none ${stageStyle(stage)}`}
      >
        {STAGES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}

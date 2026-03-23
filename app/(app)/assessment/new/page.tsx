"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDUSTRIES, BUSINESS_MODELS } from "@/lib/data/checklist"
import { ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"

const STORAGE_KEY = "viability_draft_idea"

interface FormData {
  title: string
  problem: string
  solution: string
  industry: string
  model: string
}

const EMPTY_FORM: FormData = {
  title: "",
  problem: "",
  solution: "",
  industry: "",
  model: "",
}

function NewAssessmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  // Restore draft on return from sign-up
  useEffect(() => {
    const isResume = searchParams.get("resume") === "1"
    if (isResume && isSignedIn) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as FormData
          setForm(parsed)
          localStorage.removeItem(STORAGE_KEY)
          toast.success("Welcome back! Your idea draft has been restored.")
        }
      } catch {
        // ignore
      }
    }
  }, [isSignedIn, searchParams])

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const canSubmit =
    form.title.trim().length > 0 &&
    form.problem.trim().length > 0 &&
    form.solution.trim().length > 0 &&
    form.industry.length > 0 &&
    form.model.length > 0

  async function handleSubmit() {
    if (!canSubmit) return

    if (!isSignedIn) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch { /* ignore */ }
      router.push(`/sign-in?redirect_url=${encodeURIComponent("/assessment/new?resume=1")}`)
      return
    }

    setLoading(true)
    try {
      await fetch("/api/user/sync", { method: "POST" })

      const ideaRes = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!ideaRes.ok) throw new Error("Failed to create idea")
      const idea = await ideaRes.json()

      const assessmentRes = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
      })
      if (!assessmentRes.ok) throw new Error("Failed to create assessment")
      const assessment = await assessmentRes.json()

      router.push(`/assessment/${assessment.id}/checklist`)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1C0F07] rounded-2xl mb-5">
            <Sparkles className="h-6 w-6 text-[#E8A44A]" />
          </div>
          <h1 className="text-4xl font-black text-[#1C0F07] mb-3">
            What are you building?
          </h1>
          <p className="text-[#1C0F07]/55 text-base max-w-sm mx-auto">
            Tell us about your idea and we'll run it through 8 dimensions of viability.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Project name */}
          <div>
            <Label htmlFor="title" className="text-sm font-semibold text-[#1C0F07] mb-2 block">
              Project name <span className="text-[#D4622A]">*</span>
            </Label>
            <Input
              id="title"
              autoFocus
              placeholder="e.g. AI-powered tenant screening platform"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={80}
              className="text-base h-12"
            />
          </div>

          {/* Problem */}
          <div>
            <Label htmlFor="problem" className="text-sm font-semibold text-[#1C0F07] mb-2 block">
              What problem does it solve? <span className="text-[#D4622A]">*</span>
            </Label>
            <Textarea
              id="problem"
              placeholder="Who has this problem, and how badly does it hurt them?"
              value={form.problem}
              onChange={(e) => update("problem", e.target.value)}
              maxLength={400}
              className="min-h-[90px] resize-none"
            />
          </div>

          {/* Solution */}
          <div>
            <Label htmlFor="solution" className="text-sm font-semibold text-[#1C0F07] mb-2 block">
              How does your idea solve it? <span className="text-[#D4622A]">*</span>
            </Label>
            <Textarea
              id="solution"
              placeholder="What does the customer get, and how does it work?"
              value={form.solution}
              onChange={(e) => update("solution", e.target.value)}
              maxLength={400}
              className="min-h-[90px] resize-none"
            />
          </div>

          {/* Industry + model side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-[#1C0F07] mb-2 block">
                Industry <span className="text-[#D4622A]">*</span>
              </Label>
              <Select value={form.industry} onValueChange={(v) => update("industry", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-[#1C0F07] mb-2 block">
                Business model <span className="text-[#D4622A]">*</span>
              </Label>
              <Select value={form.model} onValueChange={(v) => update("model", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_MODELS.map((bm) => (
                    <SelectItem key={bm} value={bm}>{bm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CTA */}
          <Button
            className="w-full mt-2"
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading
              ? "Starting…"
              : isLoaded && !isSignedIn
              ? "Create Account & Start"
              : "Start Assessment"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-xs text-[#1C0F07]/40 text-center">
            ~20–25 minutes · 40+ questions · 8 viability dimensions
          </p>
        </div>
      </div>
    </div>
  )
}

export default function NewAssessmentPage() {
  return (
    <Suspense>
      <NewAssessmentForm />
    </Suspense>
  )
}

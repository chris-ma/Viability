"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDUSTRIES, BUSINESS_MODELS } from "@/lib/data/checklist"
import { ArrowRight, Lightbulb, LogIn } from "lucide-react"
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

export default function NewAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
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
          // Jump to the last non-empty step
          if (parsed.industry || parsed.model) setStep(3)
          else if (parsed.problem || parsed.solution) setStep(2)
          localStorage.removeItem(STORAGE_KEY)
          toast.success("Welcome back! Your idea draft has been restored.")
        }
      } catch {
        // ignore
      }
    }
  }, [isSignedIn, searchParams])

  const updateForm = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const canProceedStep1 = form.title.trim().length > 0
  const canProceedStep2 = form.problem.trim().length > 0 && form.solution.trim().length > 0
  const canSubmit = form.industry && form.model

  async function handleSubmit() {
    if (!canSubmit) return

    // If not signed in, save draft and prompt to sign in
    if (!isSignedIn) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      } catch {
        // ignore storage errors
      }
      // Redirect to sign-in with return URL
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-500">New Assessment</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Describe your idea</h1>
        <p className="text-gray-500">
          Tell us about your business idea. Be honest — the more accurate your answers, the more useful your viability verdict.
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step
                  ? "bg-green-500 text-white"
                  : s === step
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 ${s < step ? "bg-green-500" : "bg-gray-200"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-500">
          {step === 1 ? "Idea basics" : step === 2 ? "Problem & solution" : "Classification"}
        </span>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">
                  What's your idea called? *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. AI-powered tenant screening platform"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  maxLength={80}
                />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/80 characters</p>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                size="lg"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label htmlFor="problem" className="text-sm font-semibold text-gray-700 mb-2 block">
                  What problem does this solve? *
                </Label>
                <Textarea
                  id="problem"
                  placeholder="Describe the specific pain, frustration, or gap your idea addresses. Who experiences it and how badly?"
                  value={form.problem}
                  onChange={(e) => updateForm("problem", e.target.value)}
                  maxLength={400}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-400 mt-1">{form.problem.length}/400 characters</p>
              </div>

              <div>
                <Label htmlFor="solution" className="text-sm font-semibold text-gray-700 mb-2 block">
                  How does your idea solve it? *
                </Label>
                <Textarea
                  id="solution"
                  placeholder="Describe your solution clearly and specifically. What do customers get? How does it work?"
                  value={form.solution}
                  onChange={(e) => updateForm("solution", e.target.value)}
                  maxLength={400}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-400 mt-1">{form.solution.length}/400 characters</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  size="lg"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Industry *
                </Label>
                <Select
                  value={form.industry}
                  onValueChange={(v) => updateForm("industry", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Business Model *
                </Label>
                <Select
                  value={form.model}
                  onValueChange={(v) => updateForm("model", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business model" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_MODELS.map((bm) => (
                      <SelectItem key={bm} value={bm}>{bm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Summary</p>
                <p className="text-sm font-bold text-gray-900">{form.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{form.problem}</p>
              </div>

              {isLoaded && !isSignedIn && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <LogIn className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-800">
                    You'll need to create a free account to start your assessment. Your idea will be saved automatically.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  size="lg"
                >
                  {loading
                    ? "Starting..."
                    : isLoaded && !isSignedIn
                    ? "Create Account & Start"
                    : "Start Assessment"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                ~20–25 minutes · 40+ questions · 8 dimensions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

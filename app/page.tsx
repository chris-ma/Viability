import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  TrendingUp,
  Shield,
  BarChart3,
  Target,
  ArrowRight,
  AlertTriangle,
  BarChart2,
  DollarSign,
  Brain,
  Landmark,
  Cog,
  Sparkles,
  RefreshCcw,
} from "lucide-react"
import { AnimatedSection } from "@/components/ui/animated-section"

const STATS = [
  { value: "42%", label: "fail from no market need",      footnote: 1 },
  { value: "29%", label: "run out of cash early",          footnote: 1 },
  { value: "23%", label: "wrong team or founder fit",      footnote: 1 },
  { value: "90%", label: "of startups ultimately fail",    footnote: 2 },
]

const FOOTNOTES = [
  {
    id: 1,
    text: "CB Insights, \"The Top 12 Reasons Startups Fail\", analysis of 111 startup post-mortems (2019).",
    url: "https://www.cbinsights.com/research/startup-failure-reasons-top/",
  },
  {
    id: 2,
    text: "Embroker, \"2024 Startup Statistics\", citing Bureau of Labor Statistics & Harvard Business School research.",
    url: "https://www.embroker.com/blog/startup-statistics/",
  },
]

const DIMENSIONS = [
  { name: "Market Need & Problem Validation", weight: "20%", icon: Target },
  { name: "Target Market & Size", weight: "10%", icon: BarChart2 },
  { name: "Competitive Landscape", weight: "12%", icon: Shield },
  { name: "Business Model & Revenue", weight: "18%", icon: DollarSign },
  { name: "Founder-Market Fit", weight: "12%", icon: Brain },
  { name: "Financial Readiness", weight: "15%", icon: Landmark },
  { name: "Execution Feasibility", weight: "8%", icon: Cog },
  { name: "Early Traction Indicators", weight: "5%", icon: TrendingUp },
]

const VERDICTS = [
  { score: "80–100", label: "VIABLE",     color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   desc: "Build your MVP. You're ready to move forward." },
  { score: "60–79",  label: "PROMISING",  color: "#E8A44A", bg: "rgba(232,164,74,0.1)",  border: "rgba(232,164,74,0.3)",   desc: "Good foundation. Fix specific gaps first." },
  { score: "40–59",  label: "NEEDS WORK", color: "#D4622A", bg: "rgba(212,98,42,0.1)",   border: "rgba(212,98,42,0.25)",   desc: "Multiple gaps. High risk if you proceed now." },
  { score: "0–39",   label: "NOT VIABLE", color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",    desc: "Fundamental issues. Kill or pivot — both are wins." },
]

/* ── Laptop mockup (CSS/SVG, no images) ─────────────────────────────────── */
function LaptopMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Screen bezel */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "#1C0F07",
          padding: "10px 10px 0 10px",
          border: "2px solid rgba(232,164,74,0.3)",
        }}
      >
        {/* Menu bar dots */}
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-80" />
          <div className="flex-1 mx-3 h-5 rounded-full glass" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>
        {/* Screen content — mini results preview */}
        <div
          className="rounded-t-xl overflow-hidden"
          style={{ background: "var(--c-cream)", minHeight: 320 }}
        >
          {/* App header strip */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: "var(--c-blush)" }}>
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--c-espresso)" }}>
              <span className="text-white text-[9px] font-black">V</span>
            </div>
            <span className="text-[10px] font-semibold" style={{ color: "var(--c-espresso)", fontFamily: "var(--font-inter)" }}>Viability First</span>
            <div className="ml-auto">
              <div className="w-14 h-4 rounded-full" style={{ background: "var(--c-blush)" }} />
            </div>
          </div>

          {/* Main result area */}
          <div className="p-4 grid grid-cols-5 gap-3">
            {/* Score gauge placeholder */}
            <div className="col-span-2 glass rounded-xl p-3 flex flex-col items-center justify-center gap-1.5">
              <svg width="80" height="50" viewBox="0 0 120 70">
                {/* Gauge arc */}
                <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#F2D9C0" strokeWidth="10" strokeLinecap="round" />
                <path d="M 10 65 A 50 50 0 0 1 85 22" fill="none" stroke="#E8A44A" strokeWidth="10" strokeLinecap="round" />
                {/* Needle */}
                <line x1="60" y1="65" x2="83" y2="24" stroke="#1C0F07" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="60" cy="65" r="5" fill="#1C0F07" />
              </svg>
              <span className="text-lg font-black" style={{ color: "var(--c-espresso)", fontFamily: "var(--font-playfair)" }}>63</span>
              <span className="text-[8px] font-bold tracking-wider" style={{ color: "#E8A44A" }}>PROMISING</span>
            </div>

            {/* Dimension bars */}
            <div className="col-span-3 glass rounded-xl p-3 space-y-1.5">
              {[
                { label: "Market Need", score: 72, color: "#E8A44A" },
                { label: "Business Model", score: 60, color: "#E8A44A" },
                { label: "Competition", score: 45, color: "#D4622A" },
                { label: "Founder Fit", score: 83, color: "#22c55e" },
                { label: "Traction", score: 30, color: "#ef4444" },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[7px]" style={{ color: "var(--c-espresso)", fontFamily: "var(--font-inter)", opacity: 0.7 }}>{d.label}</span>
                    <span className="text-[7px] font-semibold" style={{ color: d.color, fontFamily: "var(--font-inter)" }}>{d.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--c-blush)" }}>
                    <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fix-It card strip */}
          <div className="mx-4 mb-4 rounded-xl p-3" style={{ background: "rgba(212,98,42,0.08)", border: "1px solid rgba(212,98,42,0.2)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3" style={{ color: "#D4622A" }} />
              <span className="text-[8px] font-bold" style={{ color: "#D4622A", fontFamily: "var(--font-inter)" }}>Fix-It: Competition · 3 tasks unlocked</span>
            </div>
            <div className="space-y-1">
              {["Map 5 direct competitors", "Identify your unfair advantage", "Run a differentiator test"].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded border" style={{ borderColor: "rgba(212,98,42,0.4)" }} />
                  <span className="text-[7px]" style={{ color: "var(--c-espresso)", fontFamily: "var(--font-inter)", opacity: 0.75 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Laptop base */}
      <div
        className="relative mx-auto"
        style={{
          height: 18,
          background: "linear-gradient(to bottom, #2a1a10, #1C0F07)",
          borderRadius: "0 0 14px 14px",
          boxShadow: "0 8px 32px rgba(28,15,7,0.4)",
        }}
      />
      <div
        className="mx-auto"
        style={{
          width: "55%",
          height: 6,
          background: "#150b04",
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 4px 16px rgba(28,15,7,0.3)",
        }}
      />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--c-cream)" }}>

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(251,247,240,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,98,42,0.12)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "var(--c-espresso)" }}
            >
              <span className="text-white text-sm font-black" style={{ fontFamily: "var(--font-playfair)" }}>V</span>
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-playfair)", color: "var(--c-espresso)" }}>
              Viability First
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                style={{ background: "var(--c-copper)", color: "white" }}
                className="hover:opacity-90"
              >
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-8">
        {/* Animated blobs */}
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection delay={0}>
            <div className="text-center mb-14">
              <Badge
                className="mb-6 text-xs font-medium px-4 py-1.5"
                style={{ background: "var(--c-blush)", color: "var(--c-copper)", border: "1px solid rgba(212,98,42,0.2)" }}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Free to start · No credit card required
              </Badge>

              <h1
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-6"
                style={{ color: "var(--c-espresso)" }}
              >
                Every wrong turn<br />
                <span style={{ color: "var(--c-copper)" }}>is a data point.</span>
              </h1>

              <p
                className="text-xl max-w-2xl mx-auto mb-4 leading-relaxed"
                style={{ color: "var(--c-espresso)", opacity: 0.65, fontFamily: "var(--font-inter)" }}
              >
                Get a scored, evidence-based verdict on your business idea across 8 viability dimensions — before you spend a single penny building the wrong thing.
              </p>
              <p
                className="text-sm max-w-xl mx-auto mb-10"
                style={{ color: "var(--c-copper)", fontFamily: "var(--font-inter)", opacity: 0.85 }}
              >
                Mistakes aren't failures. They're the curriculum. Viability First helps you learn faster.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto shadow-lg hover:opacity-90 transition-opacity"
                    style={{ background: "var(--c-copper)", color: "white" }}
                  >
                    Assess My Idea Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto"
                    style={{ borderColor: "rgba(212,98,42,0.4)", color: "var(--c-copper)" }}
                  >
                    View Demo Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Laptop mockup */}
          <AnimatedSection delay={0.15}>
            <div className="relative">
              {/* Glow behind laptop */}
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
                style={{ background: "radial-gradient(ellipse at center, var(--c-amber) 0%, transparent 70%)", transform: "scale(0.85)" }}
              />
              <LaptopMockup />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "var(--c-espresso)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <p
              className="text-center text-sm font-medium mb-12 uppercase tracking-widest"
              style={{ color: "rgba(242,217,192,0.5)", fontFamily: "var(--font-inter)" }}
            >
              Why most startups fail — and why you need this before you build
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="text-center">
                  <div
                    className="text-5xl font-black mb-2 inline-flex items-start gap-0.5"
                    style={{ color: "var(--c-amber)", fontFamily: "var(--font-playfair)" }}
                  >
                    {stat.value}
                    <sup className="text-sm mt-1" style={{ color: "rgba(232,164,74,0.5)", fontFamily: "var(--font-inter)" }}>
                      [{stat.footnote}]
                    </sup>
                  </div>
                  <div className="text-sm" style={{ color: "rgba(242,217,192,0.6)", fontFamily: "var(--font-inter)" }}>
                    {stat.label}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.4}>
            <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(242,217,192,0.08)" }}>
              <p className="text-xs mb-3" style={{ color: "rgba(242,217,192,0.25)", fontFamily: "var(--font-inter)" }}>
                References
              </p>
              <ol className="space-y-1.5">
                {FOOTNOTES.map((fn) => (
                  <li key={fn.id} className="flex gap-2">
                    <span className="text-[11px] shrink-0" style={{ color: "rgba(232,164,74,0.4)", fontFamily: "var(--font-inter)" }}>
                      [{fn.id}]
                    </span>
                    <a
                      href={fn.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] hover:underline transition-all"
                      style={{ color: "rgba(242,217,192,0.3)", fontFamily: "var(--font-inter)" }}
                    >
                      {fn.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="bg-blob bg-blob-3" style={{ opacity: 0.18 }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl mb-4" style={{ color: "var(--c-espresso)" }}>
                How it works
              </h2>
              <p className="text-lg" style={{ color: "var(--c-espresso)", opacity: 0.55, fontFamily: "var(--font-inter)" }}>
                Three steps. Thirty minutes. An honest answer.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Target className="h-6 w-6" />,
                title: "Describe your idea",
                desc: "Tell us your concept, the problem it solves, and the industry. Five minutes, no pressure.",
              },
              {
                step: "02",
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "Work through the checklist",
                desc: "Answer 40+ evidence-based questions across 8 viability dimensions. Be honest — the tool is on your side.",
              },
              {
                step: "03",
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Get your verdict",
                desc: "Receive a Viability Score, radar chart, and targeted Fix-It action plans for every weak spot.",
              },
            ].map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 0.1}>
                <div className="glass rounded-3xl p-8 h-full shadow-sm relative overflow-hidden">
                  <span
                    className="absolute -top-3 -right-1 text-8xl font-black select-none leading-none"
                    style={{ color: "var(--c-blush)", fontFamily: "var(--font-playfair)" }}
                  >
                    {step.step}
                  </span>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative"
                    style={{ background: "var(--c-espresso)", color: "var(--c-amber)" }}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-xl mb-3 relative" style={{ color: "var(--c-espresso)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed relative" style={{ color: "var(--c-espresso)", opacity: 0.6, fontFamily: "var(--font-inter)" }}>
                    {step.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8 Dimensions ───────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--c-blush)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl mb-4" style={{ color: "var(--c-espresso)" }}>
                8 Viability Dimensions
              </h2>
              <p className="text-lg" style={{ color: "var(--c-espresso)", opacity: 0.55, fontFamily: "var(--font-inter)" }}>
                Each weighted by its empirical correlation to startup failure
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIMENSIONS.map((d, i) => {
              const Icon = d.icon
              return (
                <AnimatedSection key={i} delay={i * 0.06}>
                  <div
                    className="glass rounded-2xl p-5 h-full hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: "rgba(212,98,42,0.12)" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: "var(--c-copper)" }} />
                    </div>
                    <div className="text-sm font-semibold mb-1" style={{ color: "var(--c-espresso)", fontFamily: "var(--font-inter)" }}>
                      {d.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--c-copper)", fontFamily: "var(--font-inter)", opacity: 0.8 }}>
                      Weight: <span className="font-bold">{d.weight}</span>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Verdicts ───────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="bg-blob bg-blob-1" style={{ opacity: 0.15, top: "-300px" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl mb-4" style={{ color: "var(--c-espresso)" }}>
                Clear verdicts. No fluff.
              </h2>
              <p className="text-lg" style={{ color: "var(--c-espresso)", opacity: 0.55, fontFamily: "var(--font-inter)" }}>
                We'll tell you exactly where you stand — even if that means pivoting. That's not failure, that's wisdom.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VERDICTS.map((v, i) => (
              <AnimatedSection key={v.label} delay={i * 0.08}>
                <div
                  className="glass rounded-2xl p-7 h-full"
                  style={{ background: v.bg, border: `1px solid ${v.border}` }}
                >
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-3xl font-black" style={{ color: "rgba(28,15,7,0.3)", fontFamily: "var(--font-playfair)" }}>
                      {v.score}
                    </span>
                    <span className="text-xl font-black tracking-wide" style={{ color: v.color, fontFamily: "var(--font-inter)" }}>
                      {v.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--c-espresso)", opacity: 0.7, fontFamily: "var(--font-inter)" }}>
                    {v.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fix-It ─────────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--c-espresso)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection direction="left">
            <div>
              <Badge
                className="mb-6 text-xs font-semibold px-4 py-1.5"
                style={{ background: "rgba(232,164,74,0.15)", color: "var(--c-amber)", border: "1px solid rgba(232,164,74,0.3)" }}
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                Fix-It Modules
              </Badge>
              <h2 className="text-4xl sm:text-5xl mb-5 leading-tight" style={{ color: "var(--c-blush)" }}>
                Scored poorly?<br />That's the starting line.
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "rgba(242,217,192,0.6)", fontFamily: "var(--font-inter)" }}>
                For every dimension under 50%, we unlock a targeted Fix-It Module. Specific tasks, real frameworks, time estimates — and a re-assessment trigger when you're done. Iteration is the product.
              </p>
              <div className="space-y-3">
                {[
                  "5 actionable real-world tasks per weak dimension",
                  "Recommended tools and frameworks",
                  "Time estimates per module",
                  "Re-assessment trigger when tasks are complete",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3" style={{ fontFamily: "var(--font-inter)" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--c-amber)" }} />
                    <span className="text-sm" style={{ color: "rgba(242,217,192,0.75)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1}>
            <div
              className="glass-dark rounded-3xl p-7"
              style={{ border: "1px solid rgba(232,164,74,0.2)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="h-5 w-5" style={{ color: "var(--c-amber)" }} />
                <span className="font-semibold text-sm" style={{ color: "var(--c-blush)", fontFamily: "var(--font-inter)" }}>
                  Fix-It: Market Need
                </span>
                <Badge
                  className="ml-auto text-[10px]"
                  style={{ background: "rgba(232,164,74,0.15)", color: "var(--c-amber)", border: "none" }}
                >
                  1–2 weeks
                </Badge>
              </div>
              <p className="text-xs mb-5" style={{ color: "rgba(242,217,192,0.45)", fontFamily: "var(--font-inter)" }}>
                Gap: You haven't validated that people are paying to solve this problem. That's fixable.
              </p>
              <div className="space-y-3">
                {[
                  "Conduct 5 Customer Discovery Interviews",
                  "Run a Google Trends Analysis",
                  "Find 3 relevant online communities",
                  "Build a landing page demand test",
                  "Document evidence of spending",
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded mt-0.5 shrink-0"
                      style={{ border: "1.5px solid rgba(232,164,74,0.35)", borderRadius: 4 }}
                    />
                    <span className="text-sm" style={{ color: "rgba(242,217,192,0.65)", fontFamily: "var(--font-inter)" }}>
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="bg-blob bg-blob-2" style={{ opacity: 0.18 }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl mb-3" style={{ color: "var(--c-espresso)" }}>
                Simple pricing
              </h2>
              <p className="text-lg" style={{ color: "var(--c-espresso)", opacity: 0.5, fontFamily: "var(--font-inter)" }}>
                Start free. Upgrade when you're ready to go deeper.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                plan: "Free",
                price: "£0",
                period: "forever",
                desc: "Explore the tool, no commitment",
                features: ["1 active assessment", "Viability Score + verdict", "Radar chart & dimension breakdown", "Basic Fix-It summaries"],
                cta: "Start free",
                href: "/sign-up",
                highlight: false,
              },
              {
                plan: "Founder Pro",
                price: "£9",
                period: "per month",
                desc: "For serious, iterating founders",
                features: ["Unlimited assessments", "Full Fix-It Modules with tasks", "PDF Viability Reports", "Idea history & re-testing", "Score improvement tracking"],
                cta: "Start Pro",
                href: "/sign-up",
                highlight: true,
              },
              {
                plan: "Studio",
                price: "£29",
                period: "per month",
                desc: "Teams, coaches & accelerators",
                features: ["Everything in Pro", "Team collaboration", "Advisor sharing", "Bulk idea management", "Analytics dashboard"],
                cta: "Start Studio",
                href: "/sign-up",
                highlight: false,
              },
            ].map((plan, i) => (
              <AnimatedSection key={plan.plan} delay={i * 0.1}>
                <div
                  className="rounded-3xl p-8 h-full flex flex-col"
                  style={
                    plan.highlight
                      ? { background: "var(--c-espresso)", border: `2px solid var(--c-amber)` }
                      : { background: "rgba(255,255,255,0.55)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.7)" }
                  }
                >
                  <div
                    className="text-sm font-semibold mb-2"
                    style={{ color: plan.highlight ? "var(--c-amber)" : "var(--c-copper)", fontFamily: "var(--font-inter)" }}
                  >
                    {plan.plan}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className="text-4xl font-black"
                      style={{ color: plan.highlight ? "var(--c-blush)" : "var(--c-espresso)", fontFamily: "var(--font-playfair)" }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: plan.highlight ? "rgba(242,217,192,0.45)" : "rgba(28,15,7,0.4)", fontFamily: "var(--font-inter)" }}
                    >
                      /{plan.period}
                    </span>
                  </div>
                  <p
                    className="text-sm mb-7"
                    style={{ color: plan.highlight ? "rgba(242,217,192,0.5)" : "rgba(28,15,7,0.5)", fontFamily: "var(--font-inter)" }}
                  >
                    {plan.desc}
                  </p>
                  <div className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          style={{ color: plan.highlight ? "var(--c-amber)" : "var(--c-copper)" }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: plan.highlight ? "rgba(242,217,192,0.75)" : "rgba(28,15,7,0.65)", fontFamily: "var(--font-inter)" }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.href}>
                    <Button
                      className="w-full"
                      size="lg"
                      style={
                        plan.highlight
                          ? { background: "var(--c-amber)", color: "var(--c-espresso)" }
                          : { borderColor: "rgba(212,98,42,0.4)", color: "var(--c-copper)" }
                      }
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--c-blush)" }}>
        <AnimatedSection>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-4xl sm:text-5xl mb-5" style={{ color: "var(--c-espresso)" }}>
              The best founders test their assumptions first.
            </h2>
            <p
              className="text-lg mb-10 leading-relaxed"
              style={{ color: "var(--c-espresso)", opacity: 0.6, fontFamily: "var(--font-inter)" }}
            >
              Getting a hard answer early isn't a setback — it's an advantage. Know where you stand before you spend a single hour building.
            </p>
            <Link href="/sign-up">
              <Button
                size="xl"
                className="shadow-lg hover:opacity-90 transition-opacity"
                style={{ background: "var(--c-copper)", color: "white" }}
              >
                Assess My Idea — It's Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(212,98,42,0.15)", background: "var(--c-espresso)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ background: "var(--c-amber)" }}
            >
              <span className="text-xs font-black" style={{ color: "var(--c-espresso)", fontFamily: "var(--font-playfair)" }}>V</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--c-blush)", fontFamily: "var(--font-playfair)" }}>
              Viability First
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(242,217,192,0.35)", fontFamily: "var(--font-inter)" }}>
            © 2026 Viability First. Every wrong turn is a data point.
          </p>
        </div>
      </footer>

    </div>
  )
}

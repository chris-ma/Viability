import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  RefreshCcw,
} from "lucide-react"
import { AnimatedSection } from "@/components/ui/animated-section"
import { HeroAnimations } from "@/components/animation/hero-animations"
import { StatCounter } from "@/components/animation/stat-counter"

const STATS = [
  { numeric: 42, suffix: "%", label: "fail from no market need",      footnote: 1 },
  { numeric: 29, suffix: "%", label: "run out of cash early",          footnote: 1 },
  { numeric: 23, suffix: "%", label: "wrong team or founder fit",      footnote: 1 },
  { numeric: 90, suffix: "%", label: "of startups ultimately fail",    footnote: 2 },
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
  { score: "80–100", label: "VIABLE",     color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", desc: "Build your MVP. You're ready to move forward." },
  { score: "60–79",  label: "PROMISING",  color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", desc: "Good foundation. Fix specific gaps first." },
  { score: "40–59",  label: "NEEDS WORK", color: "#f97316", bg: "#fff7ed", border: "#fed7aa", desc: "Multiple gaps. High risk if you proceed now." },
  { score: "0–39",   label: "NOT VIABLE", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", desc: "Fundamental issues. Kill or pivot — both are wins." },
]

/* ── App preview mockup ─────────────────────────────────────────────────── */
function AppMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Laptop frame */}
      <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/[0.08]"
        style={{ background: "#1D1D1F", padding: "10px 10px 0 10px" }}
      >
        {/* Menu bar */}
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          <div className="flex-1 mx-3 h-5 rounded-full bg-white/[0.06]" />
        </div>
        {/* Screen */}
        <div className="rounded-t-xl overflow-hidden bg-[#F5F5F7]" style={{ minHeight: 300 }}>
          {/* App header */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-black/[0.06]">
            <div className="w-5 h-5 rounded bg-[#1D1D1F] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">V</span>
            </div>
            <span className="text-[10px] font-semibold text-[#1D1D1F]">Viability First</span>
            <div className="ml-auto w-14 h-4 rounded-full bg-[#F5F5F7]" />
          </div>

          {/* Content */}
          <div className="p-4 grid grid-cols-5 gap-3">
            {/* Score gauge */}
            <div className="col-span-2 bg-white rounded-xl p-3 shadow-sm ring-1 ring-black/[0.06] flex flex-col items-center justify-center gap-1.5">
              <svg width="80" height="50" viewBox="0 0 120 70">
                <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#E8E8ED" strokeWidth="10" strokeLinecap="round" />
                <path d="M 10 65 A 50 50 0 0 1 85 22" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
                <line x1="60" y1="65" x2="83" y2="24" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="60" cy="65" r="5" fill="#1D1D1F" />
              </svg>
              <span className="text-lg font-bold text-[#1D1D1F]">63</span>
              <span className="text-[8px] font-semibold tracking-wider text-[#f59e0b]">PROMISING</span>
            </div>

            {/* Dimension bars */}
            <div className="col-span-3 bg-white rounded-xl p-3 shadow-sm ring-1 ring-black/[0.06] space-y-1.5">
              {[
                { label: "Market Need", score: 72, color: "#f59e0b" },
                { label: "Business Model", score: 60, color: "#f59e0b" },
                { label: "Competition", score: 45, color: "#f97316" },
                { label: "Founder Fit", score: 83, color: "#22c55e" },
                { label: "Traction", score: 30, color: "#ef4444" },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[7px] text-[#6E6E73]">{d.label}</span>
                    <span className="text-[7px] font-semibold" style={{ color: d.color }}>{d.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F5F5F7]">
                    <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fix-It strip */}
          <div className="mx-4 mb-4 rounded-xl p-3 bg-orange-50 ring-1 ring-orange-200">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span className="text-[8px] font-semibold text-orange-600">Fix-It: Competition · 3 tasks unlocked</span>
            </div>
            <div className="space-y-1">
              {["Map 5 direct competitors", "Identify your unfair advantage", "Run a differentiator test"].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded border border-orange-300" />
                  <span className="text-[7px] text-[#6E6E73]">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Laptop base */}
      <div className="relative mx-auto h-4 rounded-b-xl bg-[#2a2a2c]" />
      <div className="mx-auto h-1.5 rounded-b-xl bg-[#1D1D1F]" style={{ width: "55%" }} />
    </div>
  )
}

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1D1D1F] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="font-semibold text-[15px] text-[#1D1D1F] tracking-tight">Viability First</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-[#6E6E73] hover:text-[#1D1D1F] px-3">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-[#1D1D1F] text-white hover:bg-black rounded-full px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 sm:pt-24 pb-10 sm:pb-12 px-5 sm:px-6">
        <HeroAnimations />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div id="hero-badge" className="inline-flex items-center gap-2 bg-[#F5F5F7] rounded-full px-3.5 py-1.5 mb-6 sm:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[12px] sm:text-[13px] text-[#6E6E73] font-medium">Free to start · No credit card</span>
            </div>

            <h1 className="text-[38px] sm:text-6xl lg:text-[72px] font-bold text-[#1D1D1F] leading-[1.06] tracking-tight mb-5 sm:mb-6">
              {["Know", "if", "your", "idea"].map((w) => (
                <span key={w} className="gsap-hero-word inline-block">{w}&nbsp;</span>
              ))}
              <br />
              <span className="text-[#6E6E73]">
                {["is", "worth", "building."].map((w, i, arr) => (
                  <span key={w} className="gsap-hero-word inline-block">{w}{i < arr.length - 1 ? "\u00A0" : ""}</span>
                ))}
              </span>
            </h1>

            <p id="hero-sub" className="text-[17px] sm:text-xl text-[#6E6E73] max-w-2xl mx-auto mb-3 sm:mb-4 leading-relaxed font-normal">
              Get a scored, evidence-based verdict on your business idea across 8 viability dimensions — before you spend a single penny building the wrong thing.
            </p>
            <p id="hero-desc" className="text-sm text-[#AEAEB2] max-w-xs sm:max-w-xl mx-auto mb-8 sm:mb-10">
              Mistakes aren&apos;t failures. They&apos;re the curriculum. Viability First helps you learn faster.
            </p>

            <div id="hero-ctas" className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto bg-[#1D1D1F] text-white hover:bg-black rounded-2xl shadow-lg text-base">
                  Assess My Idea Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full sm:w-auto rounded-2xl border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7] text-base">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          <div id="hero-mockup">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-[#1D1D1F]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <AnimatedSection>
            <p className="text-center text-xs font-semibold mb-12 uppercase tracking-widest text-white/30">
              Why most startups fail — and why you need this before you build
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2 text-white tracking-tight">
                    <StatCounter value={stat.numeric} suffix={stat.suffix} />
                    <sup className="text-sm text-white/30 ml-0.5">[{stat.footnote}]</sup>
                  </div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.4}>
            <div className="mt-12 pt-8 border-t border-white/[0.06]">
              <p className="text-xs text-white/20 mb-3">References</p>
              <ol className="space-y-1.5">
                {FOOTNOTES.map((fn) => (
                  <li key={fn.id} className="flex gap-2">
                    <span className="text-[11px] text-white/25 shrink-0">[{fn.id}]</span>
                    <a href={fn.url} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
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
      <section className="py-16 sm:py-24 bg-[#F5F5F7]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-[28px] sm:text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight mb-4">How it works</h2>
              <p className="text-lg text-[#6E6E73]">Three steps. Thirty minutes. An honest answer.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                icon: <Target className="h-6 w-6 text-[#1D1D1F]" />,
                title: "Describe your idea",
                desc: "Tell us your concept, the problem it solves, and the industry. Five minutes, no pressure.",
              },
              {
                step: "02",
                icon: <CheckCircle2 className="h-6 w-6 text-[#1D1D1F]" />,
                title: "Work through the checklist",
                desc: "Answer 40+ evidence-based questions across 8 viability dimensions. Be honest — the tool is on your side.",
              },
              {
                step: "03",
                icon: <BarChart3 className="h-6 w-6 text-[#1D1D1F]" />,
                title: "Get your verdict",
                desc: "Receive a Viability Score, radar chart, and targeted Fix-It action plans for every weak spot.",
              },
            ].map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 h-full shadow-sm ring-1 ring-black/[0.06] relative overflow-hidden">
                  <span className="absolute -top-2 -right-1 text-7xl font-bold text-[#F5F5F7] select-none leading-none">
                    {step.step}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center mb-5 relative">
                    {step.icon}
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F] mb-2.5 relative">{step.title}</h3>
                  <p className="text-sm text-[#6E6E73] leading-relaxed relative">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8 Dimensions ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-[28px] sm:text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight mb-4">8 Viability Dimensions</h2>
              <p className="text-lg text-[#6E6E73]">Each weighted by its empirical correlation to startup failure</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DIMENSIONS.map((d, i) => {
              const Icon = d.icon
              return (
                <AnimatedSection key={i} delay={i * 0.06}>
                  <div className="bg-[#F5F5F7] rounded-2xl p-5 h-full hover:bg-white hover:shadow-md hover:ring-1 hover:ring-black/[0.06] transition-all">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm ring-1 ring-black/[0.06] flex items-center justify-center mb-3">
                      <Icon className="h-4.5 w-4.5 text-[#1D1D1F]" style={{ width: 18, height: 18 }} />
                    </div>
                    <div className="text-sm font-semibold text-[#1D1D1F] mb-1">{d.name}</div>
                    <div className="text-xs text-[#AEAEB2]">Weight: <span className="font-semibold text-[#6E6E73]">{d.weight}</span></div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Verdicts ───────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#F5F5F7]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-[28px] sm:text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight mb-4">Clear verdicts. No fluff.</h2>
              <p className="text-lg text-[#6E6E73] max-w-xl mx-auto">
                We&apos;ll tell you exactly where you stand — even if that means pivoting. That&apos;s not failure, that&apos;s wisdom.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VERDICTS.map((v, i) => (
              <AnimatedSection key={v.label} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-7 h-full shadow-sm ring-1 ring-black/[0.06]"
                  style={{ borderLeft: `3px solid ${v.color}` }}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-2xl font-bold text-[#AEAEB2]">{v.score}</span>
                    <span className="text-lg font-bold tracking-wide" style={{ color: v.color }}>{v.label}</span>
                  </div>
                  <p className="text-sm text-[#6E6E73] leading-relaxed">{v.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fix-It ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#1D1D1F]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          <AnimatedSection direction="left">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/[0.08] rounded-full px-4 py-1.5 mb-6">
                <RefreshCcw className="h-3 w-3 text-white/60" />
                <span className="text-[13px] font-medium text-white/60">Fix-It Modules</span>
              </div>
              <h2 className="text-[28px] sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
                Scored poorly?<br />That&apos;s the starting line.
              </h2>
              <p className="text-lg text-white/50 mb-8 leading-relaxed">
                For every dimension under 50%, we unlock a targeted Fix-It Module. Specific tasks, real frameworks, time estimates — and a re-assessment trigger when you&apos;re done.
              </p>
              <div className="space-y-3">
                {[
                  "5 actionable real-world tasks per weak dimension",
                  "Recommended tools and frameworks",
                  "Time estimates per module",
                  "Re-assessment trigger when tasks are complete",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white/40" />
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1}>
            <div className="bg-white/[0.06] rounded-2xl p-7 ring-1 ring-white/[0.08]">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="h-5 w-5 text-white/40" />
                <span className="font-semibold text-sm text-white/80">Fix-It: Market Need</span>
                <span className="ml-auto text-[10px] bg-white/[0.08] text-white/40 rounded-full px-2.5 py-1">1–2 weeks</span>
              </div>
              <p className="text-xs text-white/30 mb-5">
                Gap: You haven&apos;t validated that people are paying to solve this problem. That&apos;s fixable.
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
                    <div className="w-5 h-5 rounded mt-0.5 shrink-0 border border-white/[0.15]" style={{ borderRadius: 4 }} />
                    <span className="text-sm text-white/50">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-[28px] sm:text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight mb-3">Simple pricing</h2>
              <p className="text-lg text-[#6E6E73]">Start free. Upgrade when you&apos;re ready to go deeper.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                plan: "Free",
                price: "£0",
                period: "forever",
                desc: "Explore the tool, no commitment",
                features: ["10 free assessments", "Viability Score + verdict", "Radar chart & dimension breakdown", "Basic Fix-It summaries"],
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
                <div className={`rounded-2xl p-8 h-full flex flex-col ${
                  plan.highlight
                    ? "bg-[#1D1D1F] shadow-xl"
                    : "bg-[#F5F5F7]"
                }`}>
                  <div className={`text-sm font-semibold mb-2 ${plan.highlight ? "text-white/50" : "text-[#6E6E73]"}`}>
                    {plan.plan}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-[#1D1D1F]"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? "text-white/30" : "text-[#AEAEB2]"}`}>/{plan.period}</span>
                  </div>
                  <p className={`text-sm mb-7 ${plan.highlight ? "text-white/40" : "text-[#6E6E73]"}`}>{plan.desc}</p>
                  <div className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-white/40" : "text-[#AEAEB2]"}`} />
                        <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-[#6E6E73]"}`}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.href}>
                    <Button
                      className={`w-full rounded-xl ${
                        plan.highlight
                          ? "bg-white text-[#1D1D1F] hover:bg-white/90"
                          : "bg-[#1D1D1F] text-white hover:bg-black"
                      }`}
                      size="lg"
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
      <section className="py-16 sm:py-24 bg-[#F5F5F7]">
        <AnimatedSection>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-[28px] sm:text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight mb-5">
              The best founders test their assumptions first.
            </h2>
            <p className="text-lg text-[#6E6E73] mb-10 leading-relaxed">
              Getting a hard answer early isn&apos;t a setback — it&apos;s an advantage. Know where you stand before you spend a single hour building.
            </p>
            <Link href="/sign-up">
              <Button size="xl" className="bg-[#1D1D1F] text-white hover:bg-black rounded-2xl shadow-lg">
                Assess My Idea — It&apos;s Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1D1D1F] rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">V</span>
            </div>
            <span className="text-sm font-semibold text-[#1D1D1F]">Viability First</span>
          </div>
          <p className="text-xs text-[#AEAEB2]">© 2026 Viability First. Every wrong turn is a data point.</p>
        </div>
      </footer>

    </div>
  )
}

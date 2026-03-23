import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, TrendingUp, Zap, Shield, BarChart3, Target, ArrowRight, AlertTriangle } from "lucide-react"

const STATS = [
  { value: "42%", label: "of startups fail from no market need" },
  { value: "29%", label: "run out of cash before finding viability" },
  { value: "23%", label: "fail from wrong team or founder fit" },
  { value: "90%", label: "of startups ultimately fail" },
]

const DIMENSIONS = [
  { name: "Market Need & Problem Validation", weight: "20%", icon: "🎯" },
  { name: "Target Market & Size", weight: "10%", icon: "📊" },
  { name: "Competitive Landscape", weight: "12%", icon: "⚔️" },
  { name: "Business Model & Revenue", weight: "18%", icon: "💰" },
  { name: "Founder-Market Fit", weight: "12%", icon: "🧠" },
  { name: "Financial Readiness", weight: "15%", icon: "🏦" },
  { name: "Execution Feasibility", weight: "8%", icon: "⚙️" },
  { name: "Early Traction Indicators", weight: "5%", icon: "📈" },
]

const VERDICTS = [
  { score: "80–100", label: "VIABLE", color: "text-green-600", bg: "bg-green-50 border-green-200", desc: "Build your MVP. Ready to move forward." },
  { score: "60–79", label: "PROMISING", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", desc: "Good foundation. Fix specific gaps first." },
  { score: "40–59", label: "NEEDS WORK", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", desc: "Multiple gaps. High risk if you proceed now." },
  { score: "0–39", label: "NOT VIABLE", color: "text-red-600", bg: "bg-red-50 border-red-200", desc: "Fundamental issues. Kill or pivot now." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">V</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Viability First</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 text-xs">
          Free to start · No credit card required
        </Badge>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
          Kill bad ideas fast.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
            Build the right ones.
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Get a scored, evidence-based verdict on your business idea across 8 viability dimensions in under 30 minutes — before you spend a single pound.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="xl" className="w-full sm:w-auto">
              Assess My Idea Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="xl" variant="outline" className="w-full sm:w-auto">
              View Demo Assessment
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-gray-400 text-sm font-medium mb-10 uppercase tracking-wider">
            Why most startups fail — and why you need this before you build
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-xs mt-8">Source: CB Insights post-mortem analysis of 483+ startup failures</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-gray-900 mb-4">How it works</h2>
          <p className="text-gray-500 text-lg">Three steps to an honest viability verdict</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: <Target className="h-6 w-6" />,
              title: "Describe your idea",
              desc: "Tell us your business concept, the problem it solves, and the industry. Takes less than 5 minutes.",
            },
            {
              step: "02",
              icon: <CheckCircle2 className="h-6 w-6" />,
              title: "Work through the checklist",
              desc: "Answer 40+ evidence-based questions across 8 viability dimensions. Answer honestly — the app is on your side.",
            },
            {
              step: "03",
              icon: <BarChart3 className="h-6 w-6" />,
              title: "Get your verdict",
              desc: "Receive a scored Viability Report with radar chart, dimension breakdown, and targeted Fix-It action plans.",
            },
          ].map((step) => (
            <div key={step.step} className="relative">
              <div className="text-7xl font-black text-gray-100 absolute -top-4 -left-2 select-none">
                {step.step}
              </div>
              <div className="relative pt-8">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8 Dimensions */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 mb-4">8 Viability Dimensions</h2>
            <p className="text-gray-500 text-lg">Every dimension weighted by its empirical correlation to startup failure</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIMENSIONS.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="text-3xl mb-3">{d.icon}</div>
                <div className="text-sm font-bold text-gray-900 mb-1">{d.name}</div>
                <div className="text-xs text-gray-500">Weight: <span className="font-semibold text-gray-700">{d.weight}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdicts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Clear verdicts. No fluff.</h2>
          <p className="text-gray-500 text-lg">We'll tell you exactly where you stand — including if you should kill the idea</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VERDICTS.map((v) => (
            <div key={v.label} className={`rounded-2xl border p-6 ${v.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-black text-gray-400">{v.score}</span>
                <span className={`text-lg font-black ${v.color}`}>{v.label}</span>
              </div>
              <p className="text-gray-600 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fix-It */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="bg-gray-800 text-gray-300 mb-6">Fix-It Modules</Badge>
            <h2 className="text-4xl font-black text-white mb-4">
              Score poorly? Here's exactly how to fix it.
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              For every dimension where you score below 50%, the app unlocks a targeted Fix-It Module — specific, actionable tasks to close the gap and re-test.
            </p>
            <div className="space-y-3">
              {["5 actionable real-world tasks per weak dimension", "Recommended tools and frameworks", "Time estimates per module", "Re-assessment trigger when tasks are complete"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="text-white font-semibold text-sm">Fix-It: Market Need</span>
            </div>
            <p className="text-gray-400 text-xs mb-4">Gap: You haven't validated that people are paying to solve this problem.</p>
            <div className="space-y-3">
              {["Conduct 5 Customer Discovery Interviews", "Run a Google Trends Analysis", "Find 3 relevant online communities", "Build a landing page demand test", "Document evidence of spending"].map((task, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border border-gray-600 shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Simple pricing</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              plan: "Free",
              price: "£0",
              period: "forever",
              desc: "Explore the tool",
              features: ["1 active assessment", "Viability Score + verdict", "Radar chart & dimension breakdown", "Basic Fix-It summaries"],
              cta: "Start free",
              href: "/sign-up",
              highlight: false,
            },
            {
              plan: "Founder Pro",
              price: "£9",
              period: "per month",
              desc: "Serious founders",
              features: ["Unlimited assessments", "Full Fix-It Modules with tasks", "PDF Viability Reports", "Idea history & re-testing", "Score improvement tracking"],
              cta: "Start Pro",
              href: "/sign-up",
              highlight: true,
            },
            {
              plan: "Studio",
              price: "£29",
              period: "per month",
              desc: "Teams & coaches",
              features: ["Everything in Pro", "Team collaboration", "Advisor sharing", "Bulk idea management", "Analytics dashboard"],
              cta: "Start Studio",
              href: "/sign-up",
              highlight: false,
            },
          ].map((plan) => (
            <div key={plan.plan} className={`rounded-2xl border p-8 ${plan.highlight ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200"}`}>
              <div className={`text-sm font-semibold mb-2 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.plan}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>/{plan.period}</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
              <div className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-green-400" : "text-green-500"}`} />
                    <span className={`text-sm ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href={plan.href}>
                <Button variant={plan.highlight ? "green" : "outline"} className="w-full" size="lg">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Know before you build.
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Every aspiring founder deserves an honest answer before they bet their time and money.
          </p>
          <Link href="/sign-up">
            <Button size="xl">
              Assess My Idea — It's Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white text-xs font-black">V</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">Viability First</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Viability First. Kill bad ideas fast. Build the right ones.</p>
        </div>
      </footer>
    </div>
  )
}

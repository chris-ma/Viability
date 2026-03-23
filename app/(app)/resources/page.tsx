import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  DollarSign,
  BarChart2,
  Wrench,
  Target,
  ExternalLink,
  FileText,
  Brain,
  TrendingUp,
} from "lucide-react"

const RESOURCES = [
  {
    category: "Customer Discovery",
    icon: Users,
    color: "text-[#D4622A]",
    bg: "bg-blue-100",
    items: [
      {
        title: "The Mom Test",
        desc: "Rob Fitzpatrick's guide to asking customers the right questions — without them lying to you.",
        url: "momtestbook.com",
        type: "Book",
      },
      {
        title: "Customer Discovery Interview Template",
        desc: "A structured 30-minute interview guide for validating market need before building anything.",
        url: "notion.so",
        type: "Template",
      },
      {
        title: "Google Trends",
        desc: "Explore search interest over time to validate whether your problem is growing or dying.",
        url: "trends.google.com",
        type: "Tool",
      },
    ],
  },
  {
    category: "Market Sizing",
    icon: BarChart2,
    color: "text-green-600",
    bg: "bg-green-100",
    items: [
      {
        title: "TAM/SAM/SOM Calculator",
        desc: "Top-down and bottom-up approaches to estimating your addressable market with worked examples.",
        url: "strategyzer.com",
        type: "Framework",
      },
      {
        title: "Statista",
        desc: "Market size data, industry reports, and statistics for 80,000+ topics.",
        url: "statista.com",
        type: "Data",
      },
      {
        title: "IBISWorld Industry Reports",
        desc: "Industry benchmarks and market sizing data for comprehensive market analysis.",
        url: "ibisworld.com",
        type: "Data",
      },
    ],
  },
  {
    category: "Business Model",
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-100",
    items: [
      {
        title: "Business Model Canvas",
        desc: "Alexander Osterwalder's one-page framework for designing and stress-testing business models.",
        url: "strategyzer.com/canvas",
        type: "Framework",
      },
      {
        title: "Unit Economics Calculator",
        desc: "Calculate LTV, CAC, gross margin, and break-even point for your business model.",
        url: "visible.vc",
        type: "Tool",
      },
      {
        title: "Pricing Strategy Guide",
        desc: "When to charge per seat, per usage, per outcome — and how to validate your pricing hypothesis.",
        url: "priceintelligently.com",
        type: "Guide",
      },
    ],
  },
  {
    category: "Competitive Analysis",
    icon: Target,
    color: "text-red-600",
    bg: "bg-red-100",
    items: [
      {
        title: "G2 Crowd",
        desc: "Real user reviews of competitor products — find genuine customer pain points and gaps.",
        url: "g2.com",
        type: "Research",
      },
      {
        title: "Similar Web",
        desc: "Estimate competitor website traffic, acquisition channels, and audience demographics.",
        url: "similarweb.com",
        type: "Tool",
      },
      {
        title: "Competitive Intelligence Template",
        desc: "Structured framework for mapping competitors, their strengths, weaknesses, and pricing.",
        url: "notion.so",
        type: "Template",
      },
    ],
  },
  {
    category: "Founder Fit",
    icon: Brain,
    color: "text-purple-600",
    bg: "bg-purple-100",
    items: [
      {
        title: "Skills Gap Analysis",
        desc: "Identify the critical skills your idea needs vs. what you have — and a plan to close the gap.",
        url: "miro.com",
        type: "Template",
      },
      {
        title: "YC Startup School",
        desc: "Free online curriculum from Y Combinator — foundational content for early-stage founders.",
        url: "startupschool.org",
        type: "Course",
      },
      {
        title: "CoFoundersLab",
        desc: "Find and evaluate potential co-founders who complement your skills and domain gaps.",
        url: "cofounderslab.com",
        type: "Tool",
      },
    ],
  },
  {
    category: "Demand Testing",
    icon: TrendingUp,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    items: [
      {
        title: "Carrd",
        desc: "Build a simple landing page in under an hour to test demand before writing a line of code.",
        url: "carrd.co",
        type: "Tool",
      },
      {
        title: "Typeform",
        desc: "Create engaging surveys and waitlist forms to capture early interest and validate assumptions.",
        url: "typeform.com",
        type: "Tool",
      },
      {
        title: "The Lean Startup",
        desc: "Eric Ries' foundational book on building, measuring, and learning before scaling.",
        url: "theleanstartup.com",
        type: "Book",
      },
    ],
  },
  {
    category: "Financial Planning",
    icon: FileText,
    color: "text-teal-600",
    bg: "bg-teal-100",
    items: [
      {
        title: "Startup Cost Estimator",
        desc: "Structured template for estimating pre-revenue costs, runway, and funding requirements.",
        url: "notion.so",
        type: "Template",
      },
      {
        title: "Runway Calculator",
        desc: "Model your burn rate, cash runway, and the milestones you need to hit to survive.",
        url: "runway.com",
        type: "Tool",
      },
      {
        title: "Funding Options Map",
        desc: "From bootstrapping to angels to grants — a clear map of your funding options at each stage.",
        url: "fundingoptionsmap.com",
        type: "Guide",
      },
    ],
  },
  {
    category: "Essential Reading",
    icon: BookOpen,
    color: "text-gray-600",
    bg: "bg-[#F2D9C0]",
    items: [
      {
        title: "Zero to One — Peter Thiel",
        desc: "How to build a company that creates something genuinely new. Critical thinking on competitive moats.",
        url: "zerotoonebook.com",
        type: "Book",
      },
      {
        title: "The Hard Thing About Hard Things — Ben Horowitz",
        desc: "Unflinching advice on the realities of building a company when things don't go to plan.",
        url: "amazon.com",
        type: "Book",
      },
      {
        title: "$100M Offers — Alex Hormozi",
        desc: "How to design an offer so good that people feel stupid saying no. Pricing and value creation.",
        url: "acquisition.com",
        type: "Book",
      },
    ],
  },
]

const TYPE_COLORS: Record<string, string> = {
  Book: "bg-purple-100 text-purple-700",
  Tool: "bg-blue-100 text-blue-700",
  Framework: "bg-green-100 text-green-700",
  Template: "bg-amber-100 text-amber-700",
  Guide: "bg-orange-100 text-orange-700",
  Data: "bg-teal-100 text-teal-700",
  Research: "bg-red-100 text-red-700",
  Course: "bg-indigo-100 text-indigo-700",
}

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#F2D9C0] rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[#1C0F07]/80" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1C0F07]">Resources</h1>
            <p className="text-[#1C0F07]/55 mt-0.5">Tools, frameworks, and reading for each viability dimension</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {RESOURCES.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.category}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 ${section.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${section.color}`} />
                </div>
                <h2 className="text-lg font-bold text-[#1C0F07]">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Card key={item.title} className="hover:shadow-md hover:border-[#E8A44A]/60 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-bold text-[#1C0F07] leading-tight">{item.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[item.type] ?? "bg-[#F2D9C0] text-gray-600"}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#1C0F07]/55 mb-3 leading-relaxed">{item.desc}</p>
                      <div className="flex items-center gap-1 text-xs text-[#D4622A]">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span>{item.url}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

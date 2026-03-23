export interface ChecklistItem {
  id: string;
  question: string;
  helpText: string;
  isKillFlagItem?: boolean;
  killFlagCondition?: "no" | "no_and_runway_lt_6";
}

export interface Dimension {
  id: number;
  name: string;
  shortName: string;
  description: string;
  weight: number; // percentage weight 0-1
  failureCorrelation: string;
  items: ChecklistItem[];
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 1,
    name: "Market Need & Problem Validation",
    shortName: "Market Need",
    description:
      "Addresses the single biggest cause of startup failure — building something nobody wants.",
    weight: 0.2,
    failureCorrelation: "42% of failures",
    items: [
      {
        id: "1-1",
        question:
          "Is there a clearly defined, painful problem this idea addresses?",
        helpText:
          "The problem should be specific, real, and cause genuine frustration or cost to your target audience.",
      },
      {
        id: "1-2",
        question:
          "Have you spoken to at least 5 potential customers about this problem?",
        helpText:
          "Direct conversations — not surveys — with real people who could be your customers.",
      },
      {
        id: "1-3",
        question:
          "Do people currently pay money (time or cash) to solve this problem?",
        helpText:
          "If nobody is paying anything to address this problem today, question whether it's painful enough.",
        isKillFlagItem: true,
        killFlagCondition: "no",
      },
      {
        id: "1-4",
        question: "Is the problem frequent (experienced weekly or more)?",
        helpText:
          "Problems that occur infrequently are harder to monetise and harder to build habits around.",
      },
      {
        id: "1-5",
        question:
          "Is there evidence of search demand for solutions to this problem?",
        helpText:
          "Check Google Trends, keyword tools, or Reddit/Quora discussions showing people actively seeking solutions.",
      },
      {
        id: "1-6",
        question:
          "Can you articulate who specifically has this problem (not 'everyone')?",
        helpText:
          "'Everyone' is not a target market. You need a specific, definable segment of people.",
      },
    ],
  },
  {
    id: 2,
    name: "Target Market & Size",
    shortName: "Market Size",
    description:
      "Ensures there is a sufficiently large and reachable audience for the idea to be commercially meaningful.",
    weight: 0.1,
    failureCorrelation: "Compound factor across multiple failure types",
    items: [
      {
        id: "2-1",
        question:
          "Can you define your target customer with demographic and behavioural precision?",
        helpText:
          "Specific attributes: age range, occupation, income level, behaviours, and buying triggers.",
      },
      {
        id: "2-2",
        question:
          "Is the addressable market large enough to generate meaningful revenue (estimated TAM)?",
        helpText:
          "TAM (Total Addressable Market) should be large enough to support your revenue goals even at low market share.",
      },
      {
        id: "2-3",
        question: "Is the market growing, stable, or declining?",
        helpText:
          "Growing markets are easier to enter. Declining markets require exceptional differentiation.",
      },
      {
        id: "2-4",
        question:
          "Can you reach this market through identifiable, affordable channels?",
        helpText:
          "Do you know where your customers are and how to reach them without spending more than they're worth?",
      },
      {
        id: "2-5",
        question:
          "Are there underserved sub-segments you can own initially?",
        helpText:
          "Starting with a specific niche you can dominate is often better than targeting the whole market.",
      },
    ],
  },
  {
    id: 3,
    name: "Competitive Landscape",
    shortName: "Competition",
    description:
      "Evaluates whether the founder understands who they are competing against, and whether they have genuine differentiation.",
    weight: 0.12,
    failureCorrelation: "19% outcompeted",
    items: [
      {
        id: "3-1",
        question: "Have you identified at least 3 direct competitors?",
        helpText:
          "Direct competitors solve the same problem for the same customer in a similar way.",
      },
      {
        id: "3-2",
        question:
          "Have you identified indirect alternatives (including 'doing nothing')?",
        helpText:
          "Indirect competition includes workarounds, manual processes, or simply ignoring the problem.",
      },
      {
        id: "3-3",
        question:
          "Can you articulate a clear, specific differentiation from each competitor?",
        helpText:
          "'Better' is not a differentiator. You need specific, provable reasons why customers would choose you.",
      },
      {
        id: "3-4",
        question:
          "Is entry into this market protected by a meaningful barrier (cost, regulation, IP, network)?",
        helpText:
          "Barriers to entry protect your market position once you establish it.",
        isKillFlagItem: true,
        killFlagCondition: "no",
      },
      {
        id: "3-5",
        question:
          "Have you analysed competitor weaknesses and customer complaints?",
        helpText:
          "Reviews, forums, and cancellation data reveal gaps you can exploit.",
      },
      {
        id: "3-6",
        question:
          "Could a well-funded competitor replicate your idea within 12 months?",
        helpText:
          "If yes, you need a stronger moat or faster path to defensibility.",
      },
    ],
  },
  {
    id: 4,
    name: "Business Model & Revenue Viability",
    shortName: "Business Model",
    description:
      "Tests whether the idea can actually make money. Sourced from CB Insights data on 18% of startups failing from pricing and cost issues.",
    weight: 0.18,
    failureCorrelation: "18% pricing failures + 17% no model",
    items: [
      {
        id: "4-1",
        question: "Is there a clear, defined revenue model?",
        helpText:
          "You must know exactly how money flows to you — product sales, subscriptions, commissions, licensing, etc.",
      },
      {
        id: "4-2",
        question:
          "Have you estimated a realistic price point customers would pay?",
        helpText:
          "Based on willingness-to-pay research, not what you hope they'd pay.",
      },
      {
        id: "4-3",
        question:
          "Have you estimated the cost to deliver one unit of your product or service?",
        helpText:
          "Cost of Goods Sold (COGS): direct materials, labour, and delivery costs per unit.",
      },
      {
        id: "4-4",
        question:
          "Is the gross margin sufficient to cover operating costs at scale?",
        helpText:
          "Gross margin = (Revenue - COGS) / Revenue. Most sustainable businesses need 40%+ gross margin.",
        isKillFlagItem: true,
        killFlagCondition: "no",
      },
      {
        id: "4-5",
        question:
          "Is the revenue model recurring, one-time, or transactional — and does that work for your market?",
        helpText:
          "Recurring revenue (subscriptions) is generally more valuable and predictable than one-time sales.",
      },
      {
        id: "4-6",
        question: "Have you modelled a basic break-even scenario?",
        helpText:
          "At what number of customers/units sold does the business cover all costs?",
      },
    ],
  },
  {
    id: 5,
    name: "Founder-Market Fit",
    shortName: "Founder Fit",
    description:
      "Assesses whether the founder has the skills, knowledge, and personal context to execute this specific idea.",
    weight: 0.12,
    failureCorrelation: "23% wrong team",
    items: [
      {
        id: "5-1",
        question:
          "Do you have direct experience in the industry this idea operates in?",
        helpText:
          "Domain expertise dramatically increases your probability of success and reduces mistakes.",
      },
      {
        id: "5-2",
        question:
          "Do you have the core skill required to deliver the product or service?",
        helpText:
          "The primary skill needed to build or deliver your offering — technical, creative, operational.",
      },
      {
        id: "5-3",
        question:
          "If you lack a skill, have you identified a co-founder or key hire to fill it?",
        helpText:
          "Gaps in capability need to be filled before launch, not after problems arise.",
      },
      {
        id: "5-4",
        question:
          "Are you genuinely passionate about the problem — not just the idea?",
        helpText:
          "Problem obsession sustains you when the idea evolves. Idea attachment does not.",
      },
      {
        id: "5-5",
        question:
          "Can you sustain effort on this for 3–5 years without guaranteed financial return?",
        helpText:
          "Most ventures take longer and pay less than expected in the early years.",
      },
      {
        id: "5-6",
        question:
          "Do you have relevant network or relationships in this market?",
        helpText:
          "Early customers, advisors, suppliers, and industry contacts accelerate everything.",
      },
    ],
  },
  {
    id: 6,
    name: "Financial Readiness",
    shortName: "Financial Ready",
    description:
      "Addresses the second-biggest cause of startup failure — running out of cash (29% of failures).",
    weight: 0.15,
    failureCorrelation: "29% cash failure",
    items: [
      {
        id: "6-1",
        question:
          "Do you know how much startup capital is required to reach first revenue?",
        helpText:
          "The total capital needed before a single paying customer — setup, tools, marketing, staff.",
      },
      {
        id: "6-2",
        question:
          "Do you have access to or a plan to raise the required capital?",
        helpText:
          "Personal savings, friends and family, loans, grants, angels, or venture capital.",
        isKillFlagItem: true,
        killFlagCondition: "no_and_runway_lt_6",
      },
      {
        id: "6-3",
        question:
          "Have you estimated a personal financial runway (months you can operate without income)?",
        helpText:
          "How long can you operate without a salary? Less than 6 months is high risk.",
      },
      {
        id: "6-4",
        question:
          "Do you have a plan for covering the gap between launch and profitability?",
        helpText:
          "What bridges the period after you've spent startup capital but before revenue is self-sustaining?",
      },
      {
        id: "6-5",
        question: "Have you considered worst-case financial scenarios?",
        helpText:
          "What if revenue is 50% of projections? 3× slower to arrive? What's your contingency?",
      },
    ],
  },
  {
    id: 7,
    name: "Execution & Operational Feasibility",
    shortName: "Feasibility",
    description:
      "Tests whether the idea is actually buildable and deliverable with realistic resources.",
    weight: 0.08,
    failureCorrelation: "13% poor product development",
    items: [
      {
        id: "7-1",
        question:
          "Can you produce or deliver the product with current or attainable resources?",
        helpText:
          "Do you have or can you obtain the equipment, skills, and infrastructure to deliver?",
      },
      {
        id: "7-2",
        question:
          "Is the technical complexity of building this within your team's capability?",
        helpText:
          "Be honest about complexity. Underestimating technical challenges is a common and costly mistake.",
      },
      {
        id: "7-3",
        question:
          "Have you identified your key supply chain, production, or delivery requirements?",
        helpText:
          "Who are your key suppliers? What are your lead times, minimums, and dependencies?",
      },
      {
        id: "7-4",
        question:
          "Can you operate legally in your target market without prohibitive regulatory barriers?",
        helpText:
          "Licences, insurance, compliance, sector-specific regulations, and geographic restrictions.",
      },
      {
        id: "7-5",
        question:
          "Have you mapped the key risks that could prevent you from launching?",
        helpText:
          "At least 5 specific risks identified with likelihood and mitigation for each.",
      },
    ],
  },
  {
    id: 8,
    name: "Early Traction Indicators",
    shortName: "Traction",
    description:
      "Looks for any signal — however small — that the market is responding to this idea.",
    weight: 0.05,
    failureCorrelation: "Leading indicator of product-market fit",
    items: [
      {
        id: "8-1",
        question:
          "Have you received any unsolicited interest or enquiries from potential customers?",
        helpText:
          "People reaching out to you — not you chasing them — is a powerful early signal.",
      },
      {
        id: "8-2",
        question:
          "Have you run any low-cost demand tests (landing page, social post, waitlist)?",
        helpText:
          "A basic test of whether people take action when presented with your idea.",
      },
      {
        id: "8-3",
        question:
          "Do any potential customers say they would pay for this before it is built?",
        helpText:
          "Verbal commitment is weak, but written commitment or pre-payment is strong.",
      },
      {
        id: "8-4",
        question:
          "Have you secured any letters of intent, pre-orders, or pilot agreements?",
        helpText:
          "A documented, signed commitment from a potential customer is the gold standard of early traction.",
      },
      {
        id: "8-5",
        question:
          "Is there an existing community or audience for this problem you can engage?",
        helpText:
          "Reddit communities, Facebook groups, newsletters, or forums where your target customer already gathers.",
      },
    ],
  },
];

export const INDUSTRIES = [
  "Technology & Software",
  "Food & Beverage",
  "Health & Wellness",
  "Retail & E-commerce",
  "Professional Services",
  "Education & Training",
  "Finance & Fintech",
  "Real Estate",
  "Media & Content",
  "Travel & Tourism",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Agriculture & FoodTech",
  "Clean Energy & Sustainability",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Gaming & Entertainment",
  "Construction & Property",
  "Non-profit & Social Enterprise",
  "Other",
] as const;

export const BUSINESS_MODELS = [
  "Product (physical or digital)",
  "Service (professional or personal)",
  "SaaS / Subscription",
  "Marketplace",
  "Content / Media",
  "Franchise",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type BusinessModel = (typeof BUSINESS_MODELS)[number];

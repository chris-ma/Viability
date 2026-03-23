export interface FixItTask {
  id: string;
  title: string;
  description: string;
  resource?: string;
}

export interface FixItModuleData {
  dimensionId: number;
  dimensionName: string;
  title: string;
  description: string;
  estimatedTime: string;
  tasks: FixItTask[];
}

export const FIX_IT_MODULES: FixItModuleData[] = [
  {
    dimensionId: 1,
    dimensionName: "Market Need & Problem Validation",
    title: "Validate Your Market Need",
    description:
      "You haven't fully validated that a real, painful problem exists that people will pay to solve. This is the #1 cause of startup failure. Everything else in this assessment depends on having genuine market pull.",
    estimatedTime: "1–2 weeks",
    tasks: [
      {
        id: "1-t1",
        title: "Conduct 5 Customer Discovery Interviews",
        description:
          "Talk to real people in your target market. Ask about their current pain, what they use today, and what they'd pay for a better solution. Use the Mom Test framework — ask about past behaviour, not future intentions.",
        resource: "momtestbook.com",
      },
      {
        id: "1-t2",
        title: "Run a Google Trends Analysis",
        description:
          "Search your problem keywords and assess whether search volume is growing, stable, or declining. Screenshot and save results as evidence.",
        resource: "trends.google.com",
      },
      {
        id: "1-t3",
        title: "Find 3 Online Communities",
        description:
          "Search Reddit, Facebook Groups, and LinkedIn Groups where your target customers discuss this problem. Post a question about the problem (not your solution). Record the responses.",
        resource: "reddit.com, facebook.com/groups",
      },
      {
        id: "1-t4",
        title: "Build a Simple Demand Test",
        description:
          "Create a free landing page explaining your solution. Share it with 50 people. Track email sign-ups or enquiries as a proxy for genuine interest.",
        resource: "carrd.co or typedream.com",
      },
      {
        id: "1-t5",
        title: "Document Evidence of Spending",
        description:
          "Find 3 examples of people paying money (or significant time) to address this problem today. Screenshots, quotes, product listings, or service reviews all count.",
        resource: "G2, Trustpilot, App Store reviews",
      },
    ],
  },
  {
    dimensionId: 2,
    dimensionName: "Target Market & Size",
    title: "Define and Size Your Market",
    description:
      "Your target market isn't clearly defined or sized. Without knowing who you're selling to and how many of them exist, you can't build a sustainable business or a credible go-to-market strategy.",
    estimatedTime: "3–5 days",
    tasks: [
      {
        id: "2-t1",
        title: "Build a Precise Customer Persona",
        description:
          "Create one primary customer persona with: demographics (age, income, location), psychographics (values, fears, motivations), and behavioural patterns (how they buy, what they read, what they use now).",
        resource: "HubSpot Make My Persona tool",
      },
      {
        id: "2-t2",
        title: "Calculate Your TAM, SAM, and SOM",
        description:
          "TAM = total market if you had 100% share. SAM = the portion you can realistically serve. SOM = your realistic 1-3 year target. Use industry reports, LinkedIn data, and census statistics.",
        resource: "Statista, IBISWorld, LinkedIn Sales Navigator",
      },
      {
        id: "2-t3",
        title: "Research Market Trajectory",
        description:
          "Is your target market growing, stable, or declining? Find 2-3 industry reports or data sources that confirm the direction. A growing market makes everything easier.",
        resource: "Grand View Research, McKinsey, Deloitte reports",
      },
      {
        id: "2-t4",
        title: "Map Your Acquisition Channels",
        description:
          "Identify at least 3 specific channels where you can reach your target customer. Estimate cost-per-acquisition for each. Document which channels competitors use.",
      },
      {
        id: "2-t5",
        title: "Identify Your Beachhead Segment",
        description:
          "Pick one specific sub-segment of your market you can own first. This should be the most underserved, most reachable, and most willing-to-pay group.",
      },
    ],
  },
  {
    dimensionId: 3,
    dimensionName: "Competitive Landscape",
    title: "Map Your Competitive Landscape",
    description:
      "You don't have a clear picture of who you're competing against or what makes you genuinely different. In a crowded market, undefined differentiation is fatal.",
    estimatedTime: "1 week",
    tasks: [
      {
        id: "3-t1",
        title: "Build a Competitor Map",
        description:
          "List at least 5 competitors (3 direct, 2 indirect). For each: founding year, funding, pricing, customer reviews (positive and negative), key features, and stated positioning.",
        resource: "Crunchbase, G2, Product Hunt, App Store",
      },
      {
        id: "3-t2",
        title: "Read 50 Competitor Reviews",
        description:
          "Find your top 3 competitors' most recent 50 reviews each on G2, Trustpilot, or App Store. Tag complaints by category. These are your opportunities.",
        resource: "G2.com, Trustpilot.com",
      },
      {
        id: "3-t3",
        title: "Complete a Differentiation Canvas",
        description:
          "For each competitor, write one specific sentence explaining exactly why a customer would choose you over them. If you can't, you don't have differentiation — you have hope.",
      },
      {
        id: "3-t4",
        title: "Define Your Defensibility Strategy",
        description:
          "Document your moat. Choose from: switching costs, network effects, proprietary data, brand, regulatory licence, unique supply relationship, or cost advantage. One must be credible.",
      },
      {
        id: "3-t5",
        title: "Stress-Test Against a Well-Funded Attacker",
        description:
          "If a well-funded company entered your market tomorrow, what would you do? If your only answer is 'move faster', your moat is too thin. Develop a defensibility plan.",
      },
    ],
  },
  {
    dimensionId: 4,
    dimensionName: "Business Model & Revenue Viability",
    title: "Validate Your Business Model",
    description:
      "Your business model has gaps — either in how you generate revenue, your pricing, or your unit economics. A business that can't cover its costs is not viable, no matter how good the product.",
    estimatedTime: "3–5 days",
    tasks: [
      {
        id: "4-t1",
        title: "Complete a Unit Economics Model",
        description:
          "Calculate: Revenue per customer, Cost to Acquire Customer (CAC), Cost to Serve (COGS), Gross Margin, Customer Lifetime Value (LTV). LTV must be at least 3× CAC.",
      },
      {
        id: "4-t2",
        title: "Run Pricing Research",
        description:
          "Ask 10 potential customers: 'At what price would this be so cheap you'd question the quality? Too expensive? Expensive but acceptable? Exactly right?' Use the Van Westendorp model.",
        resource: "Van Westendorp Price Sensitivity Meter guide",
      },
      {
        id: "4-t3",
        title: "Calculate Your Break-Even Point",
        description:
          "At what monthly revenue do you cover all costs? How many customers is that? How long will it realistically take to reach that number?",
      },
      {
        id: "4-t4",
        title: "Model Three Revenue Scenarios",
        description:
          "Build conservative, base, and optimistic 12-month projections. Conservative = 50% of base. The conservative case must still show a viable path.",
      },
      {
        id: "4-t5",
        title: "Validate Revenue Model Against Competitors",
        description:
          "How do your competitors charge? If they've settled on a different model to the one you're planning, understand why before diverging.",
      },
    ],
  },
  {
    dimensionId: 5,
    dimensionName: "Founder-Market Fit",
    title: "Strengthen Your Founder-Market Fit",
    description:
      "There are gaps in your readiness to execute this specific idea. Founder-market fit — your specific ability to win in this specific market — is a key predictor of success.",
    estimatedTime: "1–2 weeks",
    tasks: [
      {
        id: "5-t1",
        title: "Complete a Skills Gap Analysis",
        description:
          "List the 5 most critical skills to succeed in this business. Rate yourself 1–5 on each. For any skill rated 3 or below, document exactly how you'll fill the gap.",
      },
      {
        id: "5-t2",
        title: "Map Your Relevant Network",
        description:
          "List every contact you have in this industry or adjacent industries. Who can introduce you to early customers? Who has operational experience you lack?",
      },
      {
        id: "5-t3",
        title: "Identify Co-founder or Advisor Candidates",
        description:
          "If you have a critical skill gap, name 3 specific people you could recruit as a co-founder or advisor. Draft an outreach message for each.",
      },
      {
        id: "5-t4",
        title: "Write a 'Why Me' Statement",
        description:
          "In 200 words, explain why you specifically are the right person to build this business. If you struggle to write it, investors will struggle to believe it.",
      },
      {
        id: "5-t5",
        title: "Assess Your Financial Commitment Capacity",
        description:
          "Be honest: can you work on this for 3–5 years without guaranteed income? What personal financial changes would you need to make to sustain that commitment?",
      },
    ],
  },
  {
    dimensionId: 6,
    dimensionName: "Financial Readiness",
    title: "Build Your Financial Foundation",
    description:
      "You don't have a clear picture of the capital you need, how you'll access it, or how long you can operate. Running out of cash is the #2 cause of startup failure. Fix this before you launch.",
    estimatedTime: "3–5 days",
    tasks: [
      {
        id: "6-t1",
        title: "Build a Startup Cost Inventory",
        description:
          "List every cost you'll incur before generating first revenue: equipment, software, legal setup, website, marketing, inventory, insurance, and personal salary gap.",
      },
      {
        id: "6-t2",
        title: "Calculate Your Personal Runway",
        description:
          "Monthly personal expenses minus current savings. How many months can you operate without a salary? Less than 12 months is high risk without other income sources.",
      },
      {
        id: "6-t3",
        title: "Research All Funding Options",
        description:
          "For each: personal savings, family/friends, bank loan, government grants, crowdfunding, angel investors, accelerators. Identify which are realistic for your situation.",
        resource: "gov.uk/business-finance-support, Crunchbase, f6s.com",
      },
      {
        id: "6-t4",
        title: "Model 3 Financial Scenarios",
        description:
          "Best case, base case, and worst case. The worst case should show what happens if revenue is 50% of expectation. Does the business survive 18 months?",
      },
      {
        id: "6-t5",
        title: "Create a Bridge-to-Profitability Plan",
        description:
          "Document month by month: capital in, costs out, revenue in. When does the business become self-sustaining? What triggers do you watch?",
      },
    ],
  },
  {
    dimensionId: 7,
    dimensionName: "Execution & Operational Feasibility",
    title: "Map Your Execution Path",
    description:
      "There are operational gaps in your plan. Without understanding how you'll actually build and deliver your product or service, you can't launch with confidence.",
    estimatedTime: "1 week",
    tasks: [
      {
        id: "7-t1",
        title: "Define Your MVP Scope",
        description:
          "What is the absolute minimum version of your product that could generate first revenue? Write it as a feature list with 'must have' and 'nice to have' columns.",
      },
      {
        id: "7-t2",
        title: "Build a Risk Register",
        description:
          "List your top 10 operational risks. For each: likelihood (1–5), impact (1–5), and a specific mitigation action. Focus on the high-likelihood, high-impact ones first.",
      },
      {
        id: "7-t3",
        title: "Map Your Supply Chain",
        description:
          "Who are your suppliers, manufacturers, or technology providers? What are their lead times, minimum orders, and reliability? What happens if your primary supplier fails?",
      },
      {
        id: "7-t4",
        title: "Conduct a Regulatory Research Sprint",
        description:
          "In your target market, what licences, permits, registrations, or compliance certifications do you need? List each, the issuing body, cost, and time to obtain.",
      },
      {
        id: "7-t5",
        title: "Build a Launch Timeline",
        description:
          "Work backwards from your target launch date. What must be completed each month? Where are the dependencies? What could slip the timeline?",
      },
    ],
  },
  {
    dimensionId: 8,
    dimensionName: "Early Traction Indicators",
    title: "Generate Your First Traction Signals",
    description:
      "You have no evidence yet that the market is responding to your idea. While early-stage traction is hard to get, low-cost signals are achievable for any idea — and they dramatically reduce risk.",
    estimatedTime: "1–2 weeks",
    tasks: [
      {
        id: "8-t1",
        title: "Build a Landing Page and Drive Traffic",
        description:
          "Create a one-page website explaining the problem and your solution. Add an email capture form. Share it in relevant communities. Track sign-up rate as your first demand signal.",
        resource: "Carrd.co, Typedream.com (free tier)",
      },
      {
        id: "8-t2",
        title: "Run a Social Media Demand Test",
        description:
          "Post about the problem (not the solution) on LinkedIn, Twitter/X, or relevant Facebook groups. Measure engagement, comments, and DMs as indicators of resonance.",
      },
      {
        id: "8-t3",
        title: "Seek Pre-orders or Letters of Intent",
        description:
          "Ask your 5 most interested contacts to either pre-pay a small deposit or sign a letter of intent. Even 1 paid commitment is worth more than 100 verbal endorsements.",
      },
      {
        id: "8-t4",
        title: "Join and Engage in 3 Relevant Communities",
        description:
          "Find the 3 most active communities where your target customer gathers. Add genuine value for 2 weeks before mentioning your idea. Then post about it and measure response.",
      },
      {
        id: "8-t5",
        title: "Document All Interest Signals",
        description:
          "Every email, DM, comment, and enquiry you receive is traction data. Track them in a spreadsheet with date, source, and what they said. This evidence matters for investors and co-founders.",
      },
    ],
  },
];

import { DIMENSIONS, ChecklistItem } from "@/lib/data/checklist";

export type AnswerValue = "yes" | "partially" | "no" | "dont_know";

export interface ItemAnswers {
  [itemId: string]: AnswerValue;
}

export interface DimensionScore {
  dimensionId: number;
  name: string;
  shortName: string;
  weight: number;
  rawScore: number; // 0-100
  weightedScore: number; // contribution to overall
  killFlag: boolean;
  answeredCount: number;
  totalItems: number;
}

export interface KillFlag {
  dimensionId: number;
  dimensionName: string;
  itemId: string;
  question: string;
  reason: string;
}

export interface ScoringResult {
  overallScore: number; // 0-100
  verdict: "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE";
  dimensionScores: DimensionScore[];
  killFlags: KillFlag[];
  totalAnswered: number;
  totalItems: number;
  isComplete: boolean;
}

const ANSWER_SCORES: Record<AnswerValue, number> = {
  yes: 3,
  partially: 1.5,
  no: 0,
  dont_know: 0,
};

const MAX_ITEM_SCORE = 3;

export function getVerdict(
  score: number
): "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE" {
  if (score >= 80) return "VIABLE";
  if (score >= 60) return "PROMISING";
  if (score >= 40) return "NEEDS_WORK";
  return "NOT_VIABLE";
}

export function getVerdictConfig(
  verdict: "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE"
) {
  const configs = {
    VIABLE: {
      label: "VIABLE",
      color: "#22c55e",
      bgColor: "bg-green-500",
      textColor: "text-green-600",
      borderColor: "border-green-500",
      description:
        "Strong signal across most dimensions. Ready to move forward with confidence.",
      action: "Build your MVP. Begin customer discovery.",
    },
    PROMISING: {
      label: "PROMISING",
      color: "#3b82f6",
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      borderColor: "border-blue-500",
      description:
        "Good foundation but specific gaps need addressing before proceeding.",
      action: "Complete Fix-It modules for failing dimensions. Re-assess within 30 days.",
    },
    NEEDS_WORK: {
      label: "NEEDS WORK",
      color: "#f59e0b",
      bgColor: "bg-amber-500",
      textColor: "text-amber-600",
      borderColor: "border-amber-500",
      description:
        "Multiple material gaps. Proceeding now carries high risk of failure.",
      action: "Pause. Work through Fix-It plans for all red dimensions before re-testing.",
    },
    NOT_VIABLE: {
      label: "NOT VIABLE",
      color: "#ef4444",
      bgColor: "bg-red-500",
      textColor: "text-red-600",
      borderColor: "border-red-500",
      description:
        "Fundamental issues with the idea's viability. Strong evidence to kill or pivot.",
      action: "Seriously consider pivoting or abandoning. Use Kill Idea guide.",
    },
  };
  return configs[verdict];
}

export function calculateScores(
  allAnswers: Record<number, ItemAnswers>
): ScoringResult {
  const dimensionScores: DimensionScore[] = [];
  const killFlags: KillFlag[] = [];
  let totalWeightedScore = 0;
  let totalAnswered = 0;
  let totalItems = 0;

  for (const dimension of DIMENSIONS) {
    const answers = allAnswers[dimension.id] || {};
    let rawPoints = 0;
    let maxPoints = 0;
    let answeredCount = 0;
    let dimensionKillFlag = false;

    for (const item of dimension.items) {
      totalItems++;
      maxPoints += MAX_ITEM_SCORE;

      const answer = answers[item.id];
      if (answer) {
        answeredCount++;
        totalAnswered++;
        rawPoints += ANSWER_SCORES[answer];

        // Check kill flags
        if (item.isKillFlagItem && answer === "no") {
          if (
            item.killFlagCondition === "no" ||
            item.killFlagCondition === "no_and_runway_lt_6"
          ) {
            // For no_and_runway_lt_6, we simplify: treat as kill flag when answered no
            dimensionKillFlag = true;
            killFlags.push({
              dimensionId: dimension.id,
              dimensionName: dimension.name,
              itemId: item.id,
              question: item.question,
              reason: getKillFlagReason(item.id),
            });
          }
        }
      }
    }

    const rawScore =
      maxPoints > 0 ? (rawPoints / maxPoints) * 100 : 0;
    const weightedScore = rawScore * dimension.weight;
    totalWeightedScore += weightedScore;

    dimensionScores.push({
      dimensionId: dimension.id,
      name: dimension.name,
      shortName: dimension.shortName,
      weight: dimension.weight,
      rawScore,
      weightedScore,
      killFlag: dimensionKillFlag,
      answeredCount,
      totalItems: dimension.items.length,
    });
  }

  const overallScore = Math.round(totalWeightedScore);
  const verdict = getVerdict(overallScore);
  const isComplete = totalAnswered === totalItems;

  return {
    overallScore,
    verdict,
    dimensionScores,
    killFlags,
    totalAnswered,
    totalItems,
    isComplete,
  };
}

function getKillFlagReason(itemId: string): string {
  const reasons: Record<string, string> = {
    "1-3":
      "If nobody currently pays to solve this problem, there's no proven market. This is the single biggest predictor of startup failure.",
    "3-4":
      "Without a meaningful barrier to entry, a well-funded competitor can replicate your idea. You need a defensible moat to build a sustainable business.",
    "4-4":
      "Insufficient gross margin means your business cannot cover operating costs at scale. This is a structural problem that cannot be fixed by growth alone.",
    "6-2":
      "Without capital access and sufficient runway, you risk running out of money before reaching viability — the #2 cause of startup failure.",
  };
  return (
    reasons[itemId] ||
    "This response indicates a critical risk to the viability of this business idea."
  );
}

export function getDimensionCompletionColor(
  rawScore: number,
  isComplete: boolean
): string {
  if (!isComplete) return "#6b7280"; // grey for incomplete
  if (rawScore >= 75) return "#22c55e"; // green
  if (rawScore >= 50) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

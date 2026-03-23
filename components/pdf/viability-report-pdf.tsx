import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"

// --- Types ---
interface DimensionRow {
  name: string
  rawScore: number
  weight: number
  killFlag: boolean
}

interface KillFlagRow {
  dimensionName: string
  reason: string
}

interface FixItRow {
  dimensionName: string
  estimatedTime: string
  taskTitles: string[]
}

interface ViabilityReportPDFProps {
  ideaTitle: string
  industry: string
  model: string
  problem: string
  solution: string
  overallScore: number
  verdict: "VIABLE" | "PROMISING" | "NEEDS_WORK" | "NOT_VIABLE"
  completedAt: string
  dimensionRows: DimensionRow[]
  killFlags: KillFlagRow[]
  fixItRows: FixItRow[]
}

// --- Helpers ---
const VERDICT_LABELS: Record<string, string> = {
  VIABLE: "VIABLE",
  PROMISING: "PROMISING",
  NEEDS_WORK: "NEEDS WORK",
  NOT_VIABLE: "NOT VIABLE",
}

const VERDICT_COLORS: Record<string, string> = {
  VIABLE: "#16a34a",
  PROMISING: "#2563eb",
  NEEDS_WORK: "#d97706",
  NOT_VIABLE: "#dc2626",
}

function scoreColor(score: number): string {
  if (score >= 75) return "#16a34a"
  if (score >= 50) return "#d97706"
  return "#dc2626"
}

// --- Styles ---
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    fontSize: 10,
    color: "#111827",
  },
  header: {
    backgroundColor: "#111827",
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 28,
    height: 28,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#111827",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  brandName: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  headerRight: {
    color: "#9ca3af",
    fontSize: 8,
  },
  body: {
    paddingHorizontal: 40,
    paddingTop: 28,
  },
  ideaTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metaBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 10,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
  },
  descText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.5,
    marginBottom: 12,
  },
  // Score + verdict block
  scoreBlock: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  scoreBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 110,
  },
  scoreNum: {
    fontSize: 42,
    fontFamily: "Helvetica-Bold",
  },
  scoreSub: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 2,
  },
  verdictBox: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    justifyContent: "center",
  },
  verdictLabel: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  verdictDesc: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
    marginBottom: 4,
  },
  verdictAction: {
    fontSize: 8,
    color: "#6b7280",
    fontFamily: "Helvetica-Oblique",
  },
  // Dimension table
  dimRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  dimName: {
    width: 180,
    fontSize: 9,
    color: "#111827",
  },
  dimBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  dimBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  dimScore: {
    width: 32,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  dimWeight: {
    width: 28,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "right",
  },
  killBadge: {
    backgroundColor: "#fee2e2",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 7,
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
    marginLeft: 6,
  },
  // Kill flags
  killCard: {
    backgroundColor: "#fff1f2",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 10,
    marginBottom: 8,
  },
  killDim: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
    marginBottom: 3,
  },
  killReason: {
    fontSize: 8,
    color: "#7f1d1d",
    lineHeight: 1.4,
  },
  // Fix-it
  fixCard: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
    padding: 10,
    marginBottom: 10,
  },
  fixHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fixDim: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
  },
  fixTime: {
    fontSize: 8,
    color: "#a16207",
  },
  fixTask: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  fixTaskNum: {
    fontSize: 8,
    color: "#a16207",
    width: 14,
  },
  fixTaskText: {
    fontSize: 8,
    color: "#374151",
    flex: 1,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
  },
})

// --- Component ---
export function ViabilityReportPDF({
  ideaTitle,
  industry,
  model,
  problem,
  solution,
  overallScore,
  verdict,
  completedAt,
  dimensionRows,
  killFlags,
  fixItRows,
}: ViabilityReportPDFProps) {
  const verdictColor = VERDICT_COLORS[verdict]
  const verdictLabel = VERDICT_LABELS[verdict]
  const sortedDims = [...dimensionRows].sort((a, b) => a.rawScore - b.rawScore)
  const dateStr = new Date(completedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const verdictDesc: Record<string, string> = {
    VIABLE: "Strong signal across most dimensions. Ready to move forward with confidence.",
    PROMISING: "Good foundation but specific gaps need addressing before proceeding.",
    NEEDS_WORK: "Multiple material gaps. Proceeding now carries high risk of failure.",
    NOT_VIABLE: "Fundamental issues with the idea's viability. Strong evidence to kill or pivot.",
  }
  const verdictAction: Record<string, string> = {
    VIABLE: "Build your MVP. Begin customer discovery.",
    PROMISING: "Complete Fix-It modules for failing dimensions. Re-assess within 30 days.",
    NEEDS_WORK: "Pause. Work through Fix-It plans for all red dimensions before re-testing.",
    NOT_VIABLE: "Seriously consider pivoting or abandoning. Use Kill Idea guide.",
  }

  return (
    <Document title={`Viability Report — ${ideaTitle}`} author="Viability First">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>V</Text>
            </View>
            <Text style={s.brandName}>Viability First</Text>
          </View>
          <Text style={s.headerRight}>Viability Report · {dateStr}</Text>
        </View>

        <View style={s.body}>
          {/* Idea info */}
          <Text style={s.ideaTitle}>{ideaTitle}</Text>
          <View style={s.metaRow}>
            <Text style={s.metaBadge}>{industry}</Text>
            <Text style={s.metaBadge}>{model}</Text>
          </View>

          <Text style={[s.descText, { marginBottom: 4 }]}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Problem: </Text>
            {problem}
          </Text>
          <Text style={s.descText}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Solution: </Text>
            {solution}
          </Text>

          {/* Score + verdict */}
          <Text style={s.sectionTitle}>Viability Verdict</Text>
          <View style={s.scoreBlock}>
            <View style={s.scoreBox}>
              <Text style={[s.scoreNum, { color: verdictColor }]}>{Math.round(overallScore)}</Text>
              <Text style={s.scoreSub}>out of 100</Text>
            </View>
            <View style={s.verdictBox}>
              <Text style={[s.verdictLabel, { color: verdictColor }]}>{verdictLabel}</Text>
              <Text style={s.verdictDesc}>{verdictDesc[verdict]}</Text>
              <Text style={s.verdictAction}>{verdictAction[verdict]}</Text>
            </View>
          </View>

          {/* Kill flags */}
          {killFlags.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Kill Flags ({killFlags.length})</Text>
              {killFlags.map((flag, i) => (
                <View key={i} style={s.killCard}>
                  <Text style={s.killDim}>{flag.dimensionName}</Text>
                  <Text style={s.killReason}>{flag.reason}</Text>
                </View>
              ))}
            </>
          )}

          {/* Dimension breakdown */}
          <Text style={s.sectionTitle}>Dimension Breakdown</Text>
          {sortedDims.map((dim, i) => (
            <View key={i} style={s.dimRow}>
              <View style={{ flexDirection: "row", alignItems: "center", width: 180 }}>
                <Text style={[s.dimName, { flex: 1 }]}>
                  {dim.name}
                </Text>
                {dim.killFlag && <Text style={s.killBadge}>KILL</Text>}
              </View>
              <View style={s.dimBarBg}>
                <View
                  style={[
                    s.dimBarFill,
                    { width: `${dim.rawScore}%`, backgroundColor: scoreColor(dim.rawScore) },
                  ]}
                />
              </View>
              <Text style={[s.dimScore, { color: scoreColor(dim.rawScore) }]}>
                {Math.round(dim.rawScore)}%
              </Text>
              <Text style={s.dimWeight}>{Math.round(dim.weight * 100)}%w</Text>
            </View>
          ))}

          {/* Fix-It summaries */}
          {fixItRows.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Fix-It Action Plans</Text>
              {fixItRows.map((row, i) => (
                <View key={i} style={s.fixCard}>
                  <View style={s.fixHeader}>
                    <Text style={s.fixDim}>{row.dimensionName}</Text>
                    <Text style={s.fixTime}>{row.estimatedTime}</Text>
                  </View>
                  {row.taskTitles.map((task, j) => (
                    <View key={j} style={s.fixTask}>
                      <Text style={s.fixTaskNum}>{j + 1}.</Text>
                      <Text style={s.fixTaskText}>{task}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Viability First — viabilityfirst.com</Text>
          <Text style={s.footerText}>{ideaTitle} · Generated {dateStr}</Text>
        </View>
      </Page>
    </Document>
  )
}

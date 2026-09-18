export type Severity = 'critical' | 'moderate' | 'low'

export interface RiskFlag {
  ruleName: string
  problem: string
  citation: string
  severity: Severity
  counterOffer: string
}

export interface AnalysisResult {
  summary: string
  flags: RiskFlag[]
  gaps: Gap[]
  checklist: ChecklistItem[]
}

export interface Gap {
  ruleName: string
  explanation: string
  counterOffer: string
}

export interface ChecklistItem {
  ruleName: string
  status: 'flagged' | 'gap' | 'clean'
}

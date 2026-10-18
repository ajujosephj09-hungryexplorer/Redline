import type { Rule } from '@/lib/rules/types'
import type { AnalysisResult, RiskFlag, Gap, ChecklistItem, Severity } from './types'
import { callOpenRouter } from './openrouter'
import type { Message } from './openrouter'

/**
 * JSON schema sent to the model via structured output.
 * Matches the shape we parse into AnalysisResult.
 */
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'Plain-English summary of the contract written for someone who is not a lawyer. Direct and confident language.',
    },
    flags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ruleName: { type: 'string', description: 'Name of the rule that triggered this flag.' },
          problem: { type: 'string', description: 'Confident, direct description of the problem. No hedging.' },
          citation: { type: 'string', description: 'EXACT verbatim sentence or passage copied from the contract. Not paraphrased.' },
          severity: { type: 'string', enum: ['critical', 'moderate', 'low'], description: 'Severity based on the specific language — scope, duration, and one-sidedness.' },
          counterOffer: { type: 'string', description: 'Specific replacement or amendment language tailored to this contract.' },
        },
        required: ['ruleName', 'problem', 'citation', 'severity', 'counterOffer'],
        additionalProperties: false,
      },
    },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ruleName: { type: 'string', description: 'Name of the gap-producing rule whose clause type is absent from the contract.' },
          explanation: { type: 'string', description: 'Why the absence of this clause type matters for the freelancer. Direct, no hedging.' },
          counterOffer: { type: 'string', description: 'Proposed contract language that would fill this gap, tailored to the contract.' },
        },
        required: ['ruleName', 'explanation', 'counterOffer'],
        additionalProperties: false,
      },
    },
    checklist: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ruleName: { type: 'string', description: 'The exact rule name.' },
          status: { type: 'string', enum: ['flagged', 'gap', 'clean'], description: 'flagged = rule triggered a risk flag; gap = clause type is missing; clean = clause exists and is fair.' },
        },
        required: ['ruleName', 'status'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'flags', 'gaps', 'checklist'],
  additionalProperties: false,
}

/**
 * Cleans an LLM-returned citation so it is a verbatim substring of the contract.
 * 1. Strips wrapping quotation marks (straight or smart quotes).
 * 2. Expands ellipsis: splits on "..." or "…", uses prefix/suffix as anchors
 *    to find the full passage in the contract text.
 */
function cleanCitation(raw: string, contractText: string): string {
  let cleaned = raw

  // Strip wrapping straight and smart quotes
  cleaned = cleaned.replace(/^[\u201C\u201D"]+/, '').replace(/[\u201C\u201D"]+$/, '')

  // Expand ellipsis if present
  const ellipsisPattern = /\.{3}|\u2026/
  if (ellipsisPattern.test(cleaned)) {
    const parts = cleaned.split(ellipsisPattern)
    if (parts.length === 2) {
      const prefix = parts[0].trimEnd()
      const suffix = parts[1].trimStart()
      if (prefix.length > 0 && suffix.length > 0) {
        const startIdx = contractText.indexOf(prefix)
        if (startIdx !== -1) {
          const suffixIdx = contractText.indexOf(suffix, startIdx + prefix.length)
          if (suffixIdx !== -1) {
            cleaned = contractText.slice(startIdx, suffixIdx + suffix.length)
          }
        }
      }
    }
  }

  return cleaned
}

function buildSystemPrompt(rules: Rule[]): string {
  const enabledRules = rules.filter((r) => r.enabled)

  let prompt =
    'You analyze freelance contracts for risks. You work for the freelancer, not the client.\n\n'

  if (enabledRules.length === 0) {
    prompt += 'No rules are active. Return an empty flags array, empty gaps array, empty checklist array, and a brief summary.\n'
    return prompt
  }

  prompt += 'RULES TO CHECK:\n'
  for (const rule of enabledRules) {
    const gapTag = rule.produces_gap ? ' [GAP-PRODUCING]' : ' [NON-GAP-PRODUCING]'
    prompt += `- ${rule.name}${gapTag}: ${rule.description}\n`
  }

  const gapRules = enabledRules.filter((r) => r.produces_gap)
  const nonGapRules = enabledRules.filter((r) => !r.produces_gap)

  prompt += `
INSTRUCTIONS:
1. Return a plain-English summary of the contract. Write it for someone who is not a lawyer. Use direct language — no jargon, no filler.

2. Return risk flags. For each flag, include:
   - ruleName: the exact rule name from the list above
   - problem: a confident, direct statement of why this clause is a problem. No hedging unless the language is genuinely ambiguous.
   - citation: the EXACT verbatim substring from the contract that triggers this flag. Copy it character-for-character from the input. Paraphrasing is a bug.
   - severity: assessed from the scope, duration, and one-sidedness of the SPECIFIC language, not from the category of clause. A non-compete lasting 6 months in one city is not the same severity as one lasting 24 months worldwide.
   - counterOffer: specific replacement language or amendment tailored to this contract's structure and terms. Not a generic template.
3. Flag aggressively when uncertain. False positives are preferred over false negatives.
4. Use confident tone. Save hedging for language that is genuinely ambiguous.
5. Sort flags by severity: critical first, then moderate, then low.
6. If a rule matches nothing in the contract, do not create a flag for it.

GAP DETECTION:
For each rule marked [GAP-PRODUCING], check if the contract contains any clause covering that topic. If the topic is entirely absent from the contract, return a gap. If a clause exists (even a bad one), do not return a gap for that rule — the clause's problems are covered by flags, not gaps.`

  if (gapRules.length > 0) {
    prompt += `\nGap-producing rules: ${gapRules.map((r) => r.name).join(', ')}.`
  }

  if (nonGapRules.length > 0) {
    prompt += `\nRules that NEVER produce gaps (absence is the preferred state): ${nonGapRules.map((r) => r.name).join(', ')}. Do NOT return gaps for these rules under any circumstances.`
  }

  prompt += `
For each gap, include:
   - ruleName: the exact rule name
   - explanation: why the absence of this clause type matters for the freelancer
   - counterOffer: proposed contract language that would fill the gap, tailored to this contract

RULES CHECKLIST:
Return a checklist with exactly one entry per active rule. For each rule:
   - ruleName: the exact rule name
   - status: "flagged" if the rule produced one or more risk flags, "gap" if the rule produced a gap, "clean" if the clause exists and is fair (no flag, no gap)
The checklist must contain exactly ${enabledRules.length} entries — one for each active rule listed above.`

  return prompt
}

/**
 * Analyzes a contract against a set of rules and returns structured results.
 * Returns flags (risky clauses), gaps (missing clauses), and a per-rule checklist.
 */
export async function analyzeContract(
  text: string,
  rules: Rule[]
): Promise<AnalysisResult> {
  const systemPrompt = buildSystemPrompt(rules)
  const enabledRules = rules.filter((r) => r.enabled)

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text },
  ]

  const raw = (await callOpenRouter(messages, ANALYSIS_SCHEMA)) as {
    summary: string
    flags: Array<{
      ruleName: string
      problem: string
      citation: string
      severity: string
      counterOffer: string
    }>
    gaps: Array<{
      ruleName: string
      explanation: string
      counterOffer: string
    }>
    checklist: Array<{
      ruleName: string
      status: string
    }>
  }

  // Normalize LLM-returned rule names to canonical names.
  // The LLM sometimes truncates "IP Assignment (overbroad)" to "IP Assignment".
  const canonicalNames = enabledRules.map((r) => r.name)
  function normalizeRuleName(llmName: string): string {
    if (canonicalNames.includes(llmName)) return llmName
    const lower = llmName.toLowerCase()
    const match = canonicalNames.find(
      (cn) => cn.toLowerCase().startsWith(lower) || lower.startsWith(cn.toLowerCase())
    )
    return match ?? llmName
  }

  // Validate and normalize flags
  const validSeverities = new Set<string>(['critical', 'moderate', 'low'])
  const flags: RiskFlag[] = (raw.flags ?? []).map((f) => ({
    ruleName: normalizeRuleName(f.ruleName),
    problem: f.problem,
    citation: cleanCitation(f.citation, text),
    severity: validSeverities.has(f.severity)
      ? (f.severity as Severity)
      : 'moderate',
    counterOffer: f.counterOffer,
  }))

  // Sort: critical → moderate → low
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    moderate: 1,
    low: 2,
  }
  flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  // Build a set of rule names that can produce gaps
  const gapProducingNames = new Set(
    enabledRules.filter((r) => r.produces_gap).map((r) => r.name)
  )

  // Build a set of rule names that produced flags
  const flaggedNames = new Set(flags.map((f) => f.ruleName))

  // Validate gaps: only gap-producing rules, and only when the rule was not flagged
  const gaps: Gap[] = (raw.gaps ?? [])
    .map((g) => ({ ...g, ruleName: normalizeRuleName(g.ruleName) }))
    .filter(
      (g) => gapProducingNames.has(g.ruleName) && !flaggedNames.has(g.ruleName)
    )
    .map((g) => ({
      ruleName: g.ruleName,
      explanation: g.explanation,
      counterOffer: g.counterOffer,
    }))

  // Deterministic backstop: if a gap-producing rule was neither flagged nor
  // gapped by the LLM, check whether the topic even appears in the contract.
  // If it doesn't, the LLM missed a gap — add one so the absence is never
  // silently marked "clean."
  const GAP_TOPIC_PATTERNS: Record<string, RegExp> = {
    'IP Assignment (overbroad)':
      /intellectual property|work product|ownership.*assign|assigns.*right|work.made.for.hire|copyright/i,
    'Payment Terms (unfavorable)':
      /\bpayment\b|\bcompensat/i,
    'Termination without guaranteed payment':
      /(may|can|shall)\s+(terminate|cancel)|termination\s+(clause|section|provision)/i,
  }

  for (const rule of enabledRules) {
    if (
      rule.produces_gap &&
      !flaggedNames.has(rule.name) &&
      !gaps.some((g) => g.ruleName === rule.name)
    ) {
      const pattern = GAP_TOPIC_PATTERNS[rule.name]
      if (pattern && !pattern.test(text)) {
        gaps.push({
          ruleName: rule.name,
          explanation: `This contract does not appear to contain a clause covering this area. ${rule.description}`,
          counterOffer:
            'Consider adding a clause that addresses this area before signing.',
        })
      }
    }
  }

  const gapNames = new Set(gaps.map((g) => g.ruleName))

  // Validate checklist statuses
  const validStatuses = new Set<string>(['flagged', 'gap', 'clean'])

  // Build the checklist: one entry per enabled rule, with server-side validation
  // of the status to make sure it's consistent with our flags and gaps
  const checklist: ChecklistItem[] = enabledRules.map((rule) => {
    let status: ChecklistItem['status']
    if (flaggedNames.has(rule.name)) {
      status = 'flagged'
    } else if (gapNames.has(rule.name)) {
      status = 'gap'
    } else {
      status = 'clean'
    }
    return { ruleName: rule.name, status }
  })

  return {
    summary: raw.summary ?? '',
    flags,
    gaps,
    checklist,
  }
}

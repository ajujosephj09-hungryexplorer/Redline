import type { Rule } from '@/lib/rules/types'
import type { AnalysisResult, RiskFlag, Severity } from './types'
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
  },
  required: ['summary', 'flags'],
  additionalProperties: false,
}

function buildSystemPrompt(rules: Rule[]): string {
  const enabledRules = rules.filter((r) => r.enabled)

  let prompt =
    'You analyze freelance contracts for risks. You work for the freelancer, not the client.\n\n'

  if (enabledRules.length === 0) {
    prompt += 'No rules are active. Return an empty flags array and a brief summary.\n'
    return prompt
  }

  prompt += 'RULES TO CHECK:\n'
  for (const rule of enabledRules) {
    prompt += `- ${rule.name}: ${rule.description}\n`
  }

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
6. If a rule matches nothing in the contract, do not create a flag for it.`

  return prompt
}

/**
 * Analyzes a contract against a set of rules and returns structured results.
 * Calls the model via OpenRouter. Gaps and checklist are populated by ticket 05.
 */
export async function analyzeContract(
  text: string,
  rules: Rule[]
): Promise<AnalysisResult> {
  const systemPrompt = buildSystemPrompt(rules)

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
  }

  // Validate and normalize flags
  const validSeverities = new Set<string>(['critical', 'moderate', 'low'])
  const flags: RiskFlag[] = (raw.flags ?? []).map((f) => ({
    ruleName: f.ruleName,
    problem: f.problem,
    citation: f.citation,
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

  return {
    summary: raw.summary ?? '',
    flags,
    gaps: [],
    checklist: [],
  }
}

import type { AnalysisResult } from './types'
import { callOpenRouter } from './openrouter'
import type { Message } from './openrouter'

/**
 * JSON schema for the question-answer response.
 * Simpler than the analysis schema — just a single answer string.
 */
const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description: 'The answer to the user question, grounded entirely in the contract text and analysis context.',
    },
  },
  required: ['answer'],
  additionalProperties: false,
}

function buildSystemPrompt(
  documentText: string,
  analysisContext: AnalysisResult
): string {
  const flagsSummary = analysisContext.flags
    .map(
      (f) =>
        `- ${f.ruleName} (${f.severity}): ${f.problem}\n  Citation: "${f.citation}"\n  Counter-offer: ${f.counterOffer}`
    )
    .join('\n')

  const gapsSummary = analysisContext.gaps
    .map((g) => `- ${g.ruleName}: ${g.explanation}`)
    .join('\n')

  return `You answer questions about a specific contract. You work for the freelancer reviewing this contract.

RULES — follow these exactly:
1. Answer ONLY from the contract text and the analysis context provided below. Do not draw on outside legal knowledge, general legal principles, or anything not contained in these two sources.
2. If the answer is not in the contract or the analysis context, say so plainly. Something like: "I can't find that in this contract." Do not guess or speculate.
3. You may explain why something was flagged — the analysis context has that information.
4. Write in plain language. Short, direct sentences. No legal jargon unless quoting the contract.
5. When quoting the contract, use the exact words from the text.

CONTRACT TEXT:
${documentText}

ANALYSIS SUMMARY:
${analysisContext.summary}

RISK FLAGS:
${flagsSummary || 'None.'}

GAPS (missing clauses):
${gapsSummary || 'None.'}`
}

export interface QuestionParams {
  question: string
  documentText: string
  analysisContext: AnalysisResult
  conversationHistory?: Array<{ role: string; content: string }>
}

/**
 * Answers a question about a contract using only the document text
 * and analysis context as sources. Never draws on external knowledge.
 */
export async function answerQuestion(
  params: QuestionParams
): Promise<{ answer: string }> {
  const { question, documentText, analysisContext, conversationHistory } = params

  const systemMessage = buildSystemPrompt(documentText, analysisContext)

  const messages: Message[] = [
    { role: 'system', content: systemMessage },
  ]

  // Append any prior conversation turns so the model has follow-up context
  if (conversationHistory && conversationHistory.length > 0) {
    for (const turn of conversationHistory) {
      const role = turn.role === 'user' ? 'user' : 'assistant'
      messages.push({ role, content: turn.content })
    }
  }

  // Append the current question
  messages.push({ role: 'user', content: question })

  const raw = (await callOpenRouter(messages, ANSWER_SCHEMA)) as {
    answer: string
  }

  return { answer: raw.answer ?? '' }
}

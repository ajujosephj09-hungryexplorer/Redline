import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/analysis/openrouter', () => ({
  callOpenRouter: vi.fn(),
}))

import { answerQuestion } from '@/lib/analysis/question'
import { callOpenRouter } from '@/lib/analysis/openrouter'
import type { AnalysisResult } from '@/lib/analysis/types'

const SAMPLE_TEXT = 'The Contractor assigns all intellectual property to Client. Payment is due within 90 days of invoice.'

const SAMPLE_ANALYSIS: AnalysisResult = {
  summary: 'A service agreement with an overbroad IP assignment and slow payment terms.',
  flags: [
    {
      ruleName: 'IP Assignment (overbroad)',
      problem: 'Assigns all IP including pre-existing work.',
      citation: 'The Contractor assigns all intellectual property to Client.',
      severity: 'critical',
      counterOffer: 'Limit assignment to deliverables created under this agreement.',
    },
    {
      ruleName: 'Payment Terms (unfavorable)',
      problem: '90-day payment window is too long.',
      citation: 'Payment is due within 90 days of invoice.',
      severity: 'moderate',
      counterOffer: 'Payment within 30 days of invoice.',
    },
  ],
  gaps: [],
  checklist: [
    { ruleName: 'IP Assignment (overbroad)', status: 'flagged' },
    { ruleName: 'Payment Terms (unfavorable)', status: 'flagged' },
  ],
}

describe('question box', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an answer grounded in the document', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({
      answer: 'The contract assigns all intellectual property to the client, including pre-existing work.',
    })

    const result = await answerQuestion({
      question: 'Who owns the IP?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
    })

    expect(result.answer).toBe(
      'The contract assigns all intellectual property to the client, including pre-existing work.'
    )
    expect(callOpenRouter).toHaveBeenCalledTimes(1)
  })

  it('returns not-found response for unanswerable questions', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({
      answer: "I can't find anything about insurance requirements in this contract.",
    })

    const result = await answerQuestion({
      question: 'What are the insurance requirements?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
    })

    expect(result.answer).toContain("can't find")
  })

  it('passes conversation history to the model', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({
      answer: 'Yes, that clause is in the first sentence of the contract.',
    })

    const history = [
      { role: 'user', content: 'Who owns the IP?' },
      { role: 'assistant', content: 'The client owns all IP under this contract.' },
    ]

    await answerQuestion({
      question: 'Where is that stated?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
      conversationHistory: history,
    })

    const calledMessages = vi.mocked(callOpenRouter).mock.calls[0][0]

    // System message + 2 history turns + current question = 4 messages
    expect(calledMessages).toHaveLength(4)
    expect(calledMessages[0].role).toBe('system')
    expect(calledMessages[1].role).toBe('user')
    expect(calledMessages[1].content).toBe('Who owns the IP?')
    expect(calledMessages[2].role).toBe('assistant')
    expect(calledMessages[2].content).toBe('The client owns all IP under this contract.')
    expect(calledMessages[3].role).toBe('user')
    expect(calledMessages[3].content).toBe('Where is that stated?')
  })

  it('includes contract text and analysis context in the system prompt', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({
      answer: 'The payment term is 90 days.',
    })

    await answerQuestion({
      question: 'What is the payment term?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
    })

    const calledMessages = vi.mocked(callOpenRouter).mock.calls[0][0]
    const systemMessage = calledMessages[0].content

    // System prompt should contain the contract text
    expect(systemMessage).toContain(SAMPLE_TEXT)

    // System prompt should contain the analysis summary
    expect(systemMessage).toContain(SAMPLE_ANALYSIS.summary)

    // System prompt should reference the flagged rules
    expect(systemMessage).toContain('IP Assignment (overbroad)')
    expect(systemMessage).toContain('Payment Terms (unfavorable)')
  })

  it('sends the answer JSON schema to callOpenRouter', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({
      answer: 'Test answer.',
    })

    await answerQuestion({
      question: 'Test?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
    })

    const calledSchema = vi.mocked(callOpenRouter).mock.calls[0][1] as Record<string, unknown>
    expect(calledSchema).toHaveProperty('type', 'object')
    expect(calledSchema).toHaveProperty('required')
    expect((calledSchema.required as string[]).includes('answer')).toBe(true)
  })

  it('works with empty conversation history', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({
      answer: 'The summary says this is a service agreement.',
    })

    await answerQuestion({
      question: 'What kind of contract is this?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
      conversationHistory: [],
    })

    const calledMessages = vi.mocked(callOpenRouter).mock.calls[0][0]

    // System message + current question only
    expect(calledMessages).toHaveLength(2)
    expect(calledMessages[0].role).toBe('system')
    expect(calledMessages[1].role).toBe('user')
  })

  it('includes grounding instructions in the system prompt', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({
      answer: 'Done.',
    })

    await answerQuestion({
      question: 'Anything?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
    })

    const systemMessage = vi.mocked(callOpenRouter).mock.calls[0][0][0].content

    // The prompt should instruct the model to stay grounded
    expect(systemMessage).toContain('ONLY from the contract text')
    expect(systemMessage).toContain('Do not draw on outside legal knowledge')
  })

  it('returns empty string when model returns no answer', async () => {
    vi.mocked(callOpenRouter).mockResolvedValueOnce({})

    const result = await answerQuestion({
      question: 'Test?',
      documentText: SAMPLE_TEXT,
      analysisContext: SAMPLE_ANALYSIS,
    })

    expect(result.answer).toBe('')
  })
})

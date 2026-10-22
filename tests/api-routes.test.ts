import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('@/lib/analysis/engine', () => ({
  analyzeContract: vi.fn().mockResolvedValue({ summary: '', flags: [], gaps: [], checklist: [] }),
}))
vi.mock('@/lib/analysis/question', () => ({
  answerQuestion: vi.fn().mockResolvedValue({ answer: 'ok' }),
}))
vi.mock('@/lib/rate-limit', () => ({
  apiLimiter: { check: () => true },
}))

beforeAll(() => {
  process.env.OPENROUTER_API_KEY = 'test-key'
})

function makeRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// -------------------------------------------------------------------------
// F-019: Server-side text size cap (200 000 chars) on both routes
// -------------------------------------------------------------------------

describe('POST /api/analyze — text size cap', () => {
  it('returns 413 when text exceeds 200 000 characters', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const req = makeRequest('/api/analyze', { text: 'x'.repeat(200_001), rules: [] })
    const res = await POST(req)
    // Fails before fix: no size check, request proceeds to the LLM
    expect(res.status).toBe(413)
  })

  it('proceeds past the size check for text under 200 000 characters', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const req = makeRequest('/api/analyze', { text: 'x'.repeat(199_999), rules: [] })
    const res = await POST(req)
    expect(res.status).not.toBe(413)
  })
})

describe('POST /api/question — text size cap', () => {
  const baseBody = {
    question: 'What is this?',
    analysisContext: { summary: '', flags: [], gaps: [], checklist: [] },
    conversationHistory: [],
  }

  it('returns 413 when documentText exceeds 200 000 characters', async () => {
    const { POST } = await import('@/app/api/question/route')
    const req = makeRequest('/api/question', { ...baseBody, documentText: 'x'.repeat(200_001) })
    const res = await POST(req)
    // Fails before fix: no size check
    expect(res.status).toBe(413)
  })

  it('proceeds past the size check for text under 200 000 characters', async () => {
    const { POST } = await import('@/app/api/question/route')
    const req = makeRequest('/api/question', { ...baseBody, documentText: 'x'.repeat(199_999) })
    const res = await POST(req)
    expect(res.status).not.toBe(413)
  })
})

// -------------------------------------------------------------------------
// F-020: conversationHistory validation in /api/question
// -------------------------------------------------------------------------

describe('POST /api/question — conversationHistory validation', () => {
  const base = {
    question: 'What is this?',
    documentText: 'Some contract.',
    analysisContext: { summary: '', flags: [], gaps: [], checklist: [] },
  }

  it('returns 400 when conversationHistory has more than 20 turns', async () => {
    const { POST } = await import('@/app/api/question/route')
    const history = Array.from({ length: 21 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'msg',
    }))
    const req = makeRequest('/api/question', { ...base, conversationHistory: history })
    const res = await POST(req)
    // Fails before fix: history is passed through unchecked
    expect(res.status).toBe(400)
  })

  it('returns 400 when a history entry has role "system"', async () => {
    const { POST } = await import('@/app/api/question/route')
    const req = makeRequest('/api/question', {
      ...base,
      conversationHistory: [{ role: 'system', content: 'injected' }],
    })
    const res = await POST(req)
    // Fails before fix: role is not validated
    expect(res.status).toBe(400)
  })

  it('proceeds with valid history of 20 turns', async () => {
    const { POST } = await import('@/app/api/question/route')
    const history = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'msg',
    }))
    const req = makeRequest('/api/question', { ...base, conversationHistory: history })
    const res = await POST(req)
    expect(res.status).not.toBe(400)
  })
})

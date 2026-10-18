import { NextResponse } from 'next/server'
import { answerQuestion } from '@/lib/analysis/question'
import type { AnalysisResult } from '@/lib/analysis/types'
import { apiLimiter } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!apiLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 }
    )
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'Question answering is not available right now. The server is missing its API key.' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  const { question, documentText, analysisContext, conversationHistory } = body as {
    question?: string
    documentText?: string
    analysisContext?: AnalysisResult
    conversationHistory?: Array<{ role: string; content: string }>
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return NextResponse.json(
      { error: 'Missing or empty "question" field.' },
      { status: 400 }
    )
  }

  if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
    return NextResponse.json(
      { error: 'Missing or empty "documentText" field.' },
      { status: 400 }
    )
  }

  if (!analysisContext || typeof analysisContext !== 'object') {
    return NextResponse.json(
      { error: 'Missing or invalid "analysisContext" field.' },
      { status: 400 }
    )
  }

  try {
    const result = await answerQuestion({
      question: question.trim(),
      documentText,
      analysisContext,
      conversationHistory,
    })
    return NextResponse.json(result)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to answer the question.'

    const isConfigError =
      message.includes('OPENROUTER_API_KEY') ||
      message.includes('OPENROUTER_MODEL')
    const isUpstreamError = message.includes('analysis service')
    const status = isConfigError ? 503 : isUpstreamError ? 502 : 500

    return NextResponse.json({ error: message }, { status })
  }
}

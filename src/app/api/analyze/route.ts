import { NextResponse } from 'next/server'
import { analyzeContract } from '@/lib/analysis/engine'
import type { Rule } from '@/lib/rules/types'

export async function POST(request: Request) {
  // Check that the API key is configured before doing anything else
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'Analysis is not available right now. The server is missing its API key.' },
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

  const { text, rules } = body as { text?: string; rules?: Rule[] }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
      { error: 'Missing or empty "text" field.' },
      { status: 400 }
    )
  }

  if (!Array.isArray(rules)) {
    return NextResponse.json(
      { error: '"rules" must be an array.' },
      { status: 400 }
    )
  }

  try {
    const result = await analyzeContract(text, rules)
    return NextResponse.json(result)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Analysis failed unexpectedly.'

    // Surface config errors as 503, everything else as 500
    const isConfigError =
      message.includes('OPENROUTER_API_KEY') ||
      message.includes('OPENROUTER_MODEL')
    const status = isConfigError ? 503 : 500

    return NextResponse.json({ error: message }, { status })
  }
}

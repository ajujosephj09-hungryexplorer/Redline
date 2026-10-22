export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Sends a chat completion request to OpenRouter and returns the parsed JSON
 * from the model's response. Throws on missing config, HTTP errors, or
 * malformed responses.
 */
export async function callOpenRouter(
  messages: Message[],
  jsonSchema: object
): Promise<unknown> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Add it to .env.local to enable contract analysis.'
    )
  }

  const model = process.env.OPENROUTER_MODEL
  if (!model) {
    throw new Error(
      'OPENROUTER_MODEL is not set. Add it to .env.local (e.g. OPENROUTER_MODEL=accounts/fireworks/models/deepseek-r1).'
    )
  }

  const body = {
    model,
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'analysis',
        strict: true,
        schema: jsonSchema,
      },
    },
    reasoning: { effort: 'low' },
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)

  let res: Response
  try {
    res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    const name = (err as { name?: string }).name
    if (name === 'AbortError') {
      throw new Error(
        'The analysis service timed out. Please try again in a moment.'
      )
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '(no body)')
    console.error(`OpenRouter request failed (${res.status}): ${text}`)
    throw new Error(
      'The analysis service returned an error. Please try again in a moment.'
    )
  }

  const data = await res.json()

  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    console.error(
      'OpenRouter response missing message content:',
      JSON.stringify(data).slice(0, 500)
    )
    throw new Error(
      'The analysis service returned an unexpected response. Please try again.'
    )
  }

  try {
    return JSON.parse(content)
  } catch {
    console.error('OpenRouter returned non-JSON content:', content.slice(0, 500))
    throw new Error(
      'The analysis service returned an unexpected response. Please try again.'
    )
  }
}

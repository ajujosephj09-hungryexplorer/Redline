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
    provider: {
      order: ['fireworks'],
      allow_fallbacks: false,
      require_parameters: true,
    },
    reasoning: { effort: 'low' },
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '(no body)')
    throw new Error(
      `OpenRouter request failed (${res.status}): ${text}`
    )
  }

  const data = await res.json()

  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error(
      'OpenRouter response did not contain a message. Full response: ' +
        JSON.stringify(data).slice(0, 500)
    )
  }

  try {
    return JSON.parse(content)
  } catch {
    throw new Error(
      'OpenRouter returned non-JSON content: ' + content.slice(0, 500)
    )
  }
}

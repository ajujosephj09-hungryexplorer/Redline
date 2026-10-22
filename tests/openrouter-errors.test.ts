import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Do NOT mock callOpenRouter — we test the real function with a mocked fetch
import { callOpenRouter } from '@/lib/analysis/openrouter'

const LEAKED_PATTERNS = [
  /openrouter/i,
  /Bearer/,
  /WWW-Authenticate/,
  /invalid_token/,
  /API key expired/,
  /"error":\s*\{/,
  /sk-or-/,
]

describe('openrouter error sanitization', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test-key'
    process.env.OPENROUTER_MODEL = 'test/model'
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env.OPENROUTER_API_KEY = originalEnv.OPENROUTER_API_KEY
    process.env.OPENROUTER_MODEL = originalEnv.OPENROUTER_MODEL
    vi.restoreAllMocks()
  })

  it('does not leak upstream details on HTTP 401', async () => {
    const upstreamBody = JSON.stringify({
      error: {
        message: 'API key expired.',
        code: 401,
        metadata: {
          headers: {
            'WWW-Authenticate':
              'Bearer error="invalid_token", error_description="API key expired"',
          },
        },
      },
    })

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve(upstreamBody),
    })

    await expect(
      callOpenRouter([{ role: 'user', content: 'test' }], {})
    ).rejects.toThrow('analysis service')

    try {
      await callOpenRouter([{ role: 'user', content: 'test' }], {})
    } catch (err) {
      // Already caught above — this branch won't run, but the first
      // assertion covers it
    }

    // Verify the thrown message doesn't contain any upstream detail
    let thrownMessage = ''
    try {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(upstreamBody),
      })
      await callOpenRouter([{ role: 'user', content: 'test' }], {})
    } catch (err) {
      thrownMessage = (err as Error).message
    }

    for (const pattern of LEAKED_PATTERNS) {
      expect(thrownMessage).not.toMatch(pattern)
    }
  })

  it('does not leak upstream details on HTTP 500', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () =>
        Promise.resolve('Internal Server Error: upstream model crashed'),
    })

    let thrownMessage = ''
    try {
      await callOpenRouter([{ role: 'user', content: 'test' }], {})
    } catch (err) {
      thrownMessage = (err as Error).message
    }

    for (const pattern of LEAKED_PATTERNS) {
      expect(thrownMessage).not.toMatch(pattern)
    }
    expect(thrownMessage).not.toContain('upstream model crashed')
  })

  it('does not leak response body when message content is missing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: {} }] }),
    })

    let thrownMessage = ''
    try {
      await callOpenRouter([{ role: 'user', content: 'test' }], {})
    } catch (err) {
      thrownMessage = (err as Error).message
    }

    expect(thrownMessage).toContain('analysis service')
    expect(thrownMessage).not.toContain('choices')
  })

  it('does not leak raw content when response is not valid JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'not json at all {{{' } }],
        }),
    })

    let thrownMessage = ''
    try {
      await callOpenRouter([{ role: 'user', content: 'test' }], {})
    } catch (err) {
      thrownMessage = (err as Error).message
    }

    expect(thrownMessage).toContain('analysis service')
    expect(thrownMessage).not.toContain('not json at all')
  })
})

// -------------------------------------------------------------------------
// F-021: 25-second AbortController timeout on OpenRouter fetch
// -------------------------------------------------------------------------

describe('openrouter timeout', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test-key'
    process.env.OPENROUTER_MODEL = 'test/model'
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env.OPENROUTER_API_KEY = originalEnv.OPENROUTER_API_KEY
    process.env.OPENROUTER_MODEL = originalEnv.OPENROUTER_MODEL
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('throws when the fetch hangs past 25 seconds', async () => {
    // Fails before fix: no AbortController, fetch hangs indefinitely
    vi.useFakeTimers()

    globalThis.fetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
      })
    })

    const promise = callOpenRouter([{ role: 'user', content: 'test' }], {})
    // Suppress unhandled-rejection before expect catches it
    promise.catch(() => {})
    await vi.advanceTimersByTimeAsync(25_001)
    await expect(promise).rejects.toThrow()
  })

  it('does not abort before 25 seconds', async () => {
    vi.useFakeTimers()

    let aborted = false
    globalThis.fetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          aborted = true
          reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
      })
    })

    // Do not await — we only want to advance time partway, then cancel
    const promise = callOpenRouter([{ role: 'user', content: 'test' }], {})
    promise.catch(() => {}) // suppress unhandled rejection when timer fires in cleanup
    await vi.advanceTimersByTimeAsync(24_999)
    expect(aborted).toBe(false)
  })
})

// -------------------------------------------------------------------------
// F-032: Retry on transient OpenRouter errors (429, 502, 503, 504)
// -------------------------------------------------------------------------

describe('openrouter retry on transient errors', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = { ...process.env }

  const successResponse = {
    ok: true,
    json: () =>
      Promise.resolve({
        choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
      }),
  }

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test-key'
    process.env.OPENROUTER_MODEL = 'test/model'
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env.OPENROUTER_API_KEY = originalEnv.OPENROUTER_API_KEY
    process.env.OPENROUTER_MODEL = originalEnv.OPENROUTER_MODEL
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('retries on 429 and succeeds on second attempt', async () => {
    // Fails before fix: 429 throws immediately without retry
    vi.useFakeTimers()

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 429, text: () => Promise.resolve('rate limited') })
      .mockResolvedValueOnce(successResponse)

    const promise = callOpenRouter([{ role: 'user', content: 'test' }], {})
    promise.catch(() => {})
    await vi.advanceTimersByTimeAsync(2_000)
    const result = await promise
    expect(result).toEqual({ ok: true })
    expect(globalThis.fetch as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(2)
  })

  it('gives up after 3 attempts on 502', async () => {
    // Fails before fix: no retry, only 1 attempt total
    vi.useFakeTimers()

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve('bad gateway'),
    })

    const promise = callOpenRouter([{ role: 'user', content: 'test' }], {})
    promise.catch(() => {})
    await vi.advanceTimersByTimeAsync(10_000)
    await expect(promise).rejects.toThrow('analysis service')
    expect(globalThis.fetch as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(3)
  })

  it('does not retry on 401 (non-transient)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('unauthorized'),
    })

    await expect(
      callOpenRouter([{ role: 'user', content: 'test' }], {})
    ).rejects.toThrow('analysis service')
    expect(globalThis.fetch as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1)
  })
})

import { describe, it, expect } from 'vitest'
import { RateLimiter } from '@/lib/rate-limit'

describe('RateLimiter', () => {
  it('allows requests up to the limit', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, maxRequests: 3 })

    expect(limiter.check('1.2.3.4')).toBe(true)
    expect(limiter.check('1.2.3.4')).toBe(true)
    expect(limiter.check('1.2.3.4')).toBe(true)
  })

  it('rejects requests beyond the limit', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, maxRequests: 3 })

    limiter.check('1.2.3.4')
    limiter.check('1.2.3.4')
    limiter.check('1.2.3.4')
    expect(limiter.check('1.2.3.4')).toBe(false)
    expect(limiter.check('1.2.3.4')).toBe(false)
  })

  it('tracks keys independently', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, maxRequests: 1 })

    expect(limiter.check('1.1.1.1')).toBe(true)
    expect(limiter.check('2.2.2.2')).toBe(true)
    expect(limiter.check('1.1.1.1')).toBe(false)
    expect(limiter.check('2.2.2.2')).toBe(false)
  })

  it('resets after the window expires', () => {
    const limiter = new RateLimiter({ windowMs: 1, maxRequests: 1 })

    expect(limiter.check('1.2.3.4')).toBe(true)
    expect(limiter.check('1.2.3.4')).toBe(false)

    // Wait for the 1ms window to expire
    const start = Date.now()
    while (Date.now() - start < 2) {
      // busy-wait
    }

    expect(limiter.check('1.2.3.4')).toBe(true)
  })
})

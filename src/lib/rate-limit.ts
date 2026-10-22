/**
 * Simple in-memory sliding-window rate limiter.
 * Each instance tracks request counts per key (typically IP address).
 * The Map persists while the serverless function is warm.
 *
 * Limitation: state is per-process. Multiple serverless instances (e.g.
 * on Vercel) each maintain their own store, so the effective per-IP limit
 * across all instances is maxRequests × number-of-instances. This is
 * acceptable for a soft-limit defence; a shared store (Redis) would be
 * required for a hard limit.
 */

interface Entry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private windowMs: number
  private maxRequests: number
  private store = new Map<string, Entry>()

  constructor(opts: { windowMs: number; maxRequests: number }) {
    this.windowMs = opts.windowMs
    this.maxRequests = opts.maxRequests
  }

  /** Number of keys currently tracked — exposed for testing. */
  get storeSize(): number {
    return this.store.size
  }

  /**
   * Returns true if the request should be allowed, false if rate-limited.
   * Prunes all expired entries on every call to keep the Map bounded.
   */
  check(key: string): boolean {
    const now = Date.now()

    // Prune expired entries so the Map doesn't grow indefinitely
    this.store.forEach((e, k) => {
      if (now >= e.resetAt) this.store.delete(k)
    })

    const entry = this.store.get(key)

    if (!entry) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    entry.count += 1
    if (entry.count > this.maxRequests) {
      return false
    }
    return true
  }
}

/**
 * Shared limiter for API routes that call OpenRouter.
 * 10 requests per IP per 60-second window.
 */
export const apiLimiter = new RateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
})

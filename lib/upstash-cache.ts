import { Redis } from "@upstash/redis"

export class IntelligentCache {
  public redis: Redis | null = null
  private isEnabled = false

  constructor() {
    try {
      const url = process.env.UPSTASH_REDIS_REST_URL
      const token = process.env.UPSTASH_REDIS_REST_TOKEN

      // Check if we have valid Redis credentials
      if (
        url &&
        token &&
        url.startsWith("https://") &&
        !url.includes("your_upstash") &&
        !token.includes("your_upstash")
      ) {
        this.redis = new Redis({
          url: url,
          token: token,
        })
        this.isEnabled = true
        console.log("✅ Upstash Redis cache enabled")
      } else {
        console.log("⚠️ Upstash Redis not configured - caching disabled")
        this.isEnabled = false
      }
    } catch (error) {
      console.warn("⚠️ Failed to initialize Redis cache:", error)
      this.isEnabled = false
    }
  }

  // Cache OpenAI responses with intelligent expiration
  async cacheAIResponse(key: string, response: any, ttlHours = 4) {
    if (!this.isEnabled || !this.redis) return

    try {
      const cacheKey = `ai:${key}`
      await this.redis.setex(
        cacheKey,
        ttlHours * 3600,
        JSON.stringify({
          response,
          timestamp: Date.now(),
          model: response.modelUsed || "unknown",
        }),
      )
    } catch (error) {
      console.warn("Cache write failed:", error)
    }
  }

  async getAIResponse(key: string): Promise<any | null> {
    if (!this.isEnabled || !this.redis) return null

    try {
      const cacheKey = `ai:${key}`
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached as string)
        // Add cache hit metadata
        parsed.response.fromCache = true
        parsed.response.cachedAt = parsed.timestamp
        return parsed.response
      }
    } catch (error) {
      console.warn("Cache read failed:", error)
    }
    return null
  }

  // Cache market data with shorter expiration
  async cacheMarketData(ticker: string, data: any, ttlMinutes = 15) {
    if (!this.isEnabled || !this.redis) return

    try {
      const cacheKey = `market:${ticker}`
      await this.redis.setex(
        cacheKey,
        ttlMinutes * 60,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          source: "live-api",
        }),
      )
    } catch (error) {
      console.warn("Market data cache write failed:", error)
    }
  }

  async getMarketData(ticker: string): Promise<any | null> {
    if (!this.isEnabled || !this.redis) return null

    try {
      const cacheKey = `market:${ticker}`
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached as string)
        // Check if data is still fresh (within 15 minutes)
        const age = Date.now() - parsed.timestamp
        if (age < 15 * 60 * 1000) {
          return parsed.data
        }
      }
    } catch (error) {
      console.warn("Market data cache read failed:", error)
    }
    return null
  }

  // Store successful analysis patterns for AI learning
  async storeSuccessPattern(criteria: any, results: any) {
    if (!this.isEnabled || !this.redis) return

    try {
      const patternKey = `pattern:${criteria.riskAppetite}:${criteria.discoveryMethod}:${criteria.timeframe}`
      const pattern = {
        criteria,
        results: results.map((r: any) => ({
          ticker: r.ticker,
          sector: r.sector || "unknown",
          marketCap: r.marketCapBillion,
          targetGain: ((r.targetPrice / r.entryPrice - 1) * 100).toFixed(1),
          riskReward: r.riskRewardRatio,
          confidence: r.probabilityOfSuccess,
        })),
        timestamp: Date.now(),
        marketRegime: await this.getCurrentMarketRegime(),
      }

      // Store with 30-day expiration
      await this.redis.setex(patternKey, 30 * 24 * 3600, JSON.stringify(pattern))

      // Also add to success patterns list
      await this.redis.lpush("success_patterns", JSON.stringify(pattern))
      await this.redis.ltrim("success_patterns", 0, 99) // Keep last 100
    } catch (error) {
      console.warn("Success pattern storage failed:", error)
    }
  }

  // Get historical success patterns for AI context
  async getSuccessPatterns(criteria: any): Promise<any[]> {
    if (!this.isEnabled || !this.redis) return []

    try {
      const patterns = await this.redis.lrange("success_patterns", 0, 20)
      return patterns
        .map((p) => JSON.parse(p as string))
        .filter(
          (pattern) =>
            pattern.criteria.riskAppetite === criteria.riskAppetite &&
            pattern.criteria.discoveryMethod === criteria.discoveryMethod,
        )
    } catch (error) {
      console.warn("Success patterns retrieval failed:", error)
      return []
    }
  }

  // Track market regime for context
  async updateMarketRegime(regime: string, indicators: any) {
    if (!this.isEnabled || !this.redis) return

    try {
      await this.redis.setex(
        "market_regime",
        24 * 3600,
        JSON.stringify({
          regime,
          indicators,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.warn("Market regime update failed:", error)
    }
  }

  async getCurrentMarketRegime(): Promise<string> {
    if (!this.isEnabled || !this.redis) return "unknown"

    try {
      const cached = await this.redis.get("market_regime")
      if (cached) {
        const parsed = JSON.parse(cached as string)
        return parsed.regime
      }
    } catch (error) {
      console.warn("Market regime retrieval failed:", error)
    }
    return "unknown"
  }

  // Store user preferences and history
  async storeUserSearch(sessionId: string, criteria: any, results: any) {
    if (!this.isEnabled || !this.redis) return

    try {
      const searchKey = `user:${sessionId}:searches`
      const search = {
        criteria,
        resultCount: results.length,
        timestamp: Date.now(),
      }

      await this.redis.lpush(searchKey, JSON.stringify(search))
      await this.redis.ltrim(searchKey, 0, 49) // Keep last 50 searches
      await this.redis.expire(searchKey, 7 * 24 * 3600) // 7 days
    } catch (error) {
      console.warn("User search storage failed:", error)
    }
  }

  // Performance tracking for recommendations
  async trackRecommendationPerformance(ticker: string, analysis: any, actualPerformance?: any) {
    if (!this.isEnabled || !this.redis) return

    try {
      const trackingKey = `performance:${ticker}:${Date.now()}`
      const tracking = {
        ticker,
        analysis: {
          entryPrice: analysis.entryPrice,
          targetPrice: analysis.targetPrice,
          stopLossPrice: analysis.stopLossPrice,
          timeframe: analysis.timeframe,
          confidence: analysis.probabilityOfSuccess,
        },
        actualPerformance,
        timestamp: Date.now(),
      }

      await this.redis.setex(trackingKey, 90 * 24 * 3600, JSON.stringify(tracking)) // 90 days
    } catch (error) {
      console.warn("Performance tracking failed:", error)
    }
  }

  // Generate cache key for AI requests
  generateAIKey(criteria: any, type: "discovery" | "analysis", ticker?: string): string {
    const base = `${type}:${criteria.riskAppetite}:${criteria.discoveryMethod}:${criteria.timeframe}`
    return ticker ? `${base}:${ticker}` : base
  }

  // Intelligent cache warming for popular requests
  async warmCache(popularCriteria: any[]) {
    if (!this.isEnabled || !this.redis) return

    console.log("🔥 Warming cache for popular criteria...")
    // This could be called during off-peak hours
    for (const criteria of popularCriteria) {
      const key = this.generateAIKey(criteria, "discovery")
      const cached = await this.getAIResponse(key)
      if (!cached) {
        console.log(`Cache miss for ${key} - could pre-generate`)
      }
    }
  }

  // Check if caching is enabled
  get enabled(): boolean {
    return this.isEnabled
  }
}

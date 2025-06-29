import { Redis } from "@upstash/redis"

export class IntelligentCache {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  // Cache OpenAI responses with intelligent expiration
  async cacheAIResponse(key: string, response: any, ttlHours = 4) {
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
  }

  async getAIResponse(key: string): Promise<any | null> {
    const cacheKey = `ai:${key}`
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached as string)
      // Add cache hit metadata
      parsed.response.fromCache = true
      parsed.response.cachedAt = parsed.timestamp
      return parsed.response
    }
    return null
  }

  // Cache market data with shorter expiration
  async cacheMarketData(ticker: string, data: any, ttlMinutes = 15) {
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
  }

  async getMarketData(ticker: string): Promise<any | null> {
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
    return null
  }

  // Store successful analysis patterns for AI learning
  async storeSuccessPattern(criteria: any, results: any) {
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
  }

  // Get historical success patterns for AI context
  async getSuccessPatterns(criteria: any): Promise<any[]> {
    const patterns = await this.redis.lrange("success_patterns", 0, 20)
    return patterns
      .map((p) => JSON.parse(p as string))
      .filter(
        (pattern) =>
          pattern.criteria.riskAppetite === criteria.riskAppetite &&
          pattern.criteria.discoveryMethod === criteria.discoveryMethod,
      )
  }

  // Track market regime for context
  async updateMarketRegime(regime: string, indicators: any) {
    await this.redis.setex(
      "market_regime",
      24 * 3600,
      JSON.stringify({
        regime,
        indicators,
        timestamp: Date.now(),
      }),
    )
  }

  async getCurrentMarketRegime(): Promise<string> {
    const cached = await this.redis.get("market_regime")
    if (cached) {
      const parsed = JSON.parse(cached as string)
      return parsed.regime
    }
    return "unknown"
  }

  // Store user preferences and history
  async storeUserSearch(sessionId: string, criteria: any, results: any) {
    const searchKey = `user:${sessionId}:searches`
    const search = {
      criteria,
      resultCount: results.length,
      timestamp: Date.now(),
    }

    await this.redis.lpush(searchKey, JSON.stringify(search))
    await this.redis.ltrim(searchKey, 0, 49) // Keep last 50 searches
    await this.redis.expire(searchKey, 7 * 24 * 3600) // 7 days
  }

  // Performance tracking for recommendations
  async trackRecommendationPerformance(ticker: string, analysis: any, actualPerformance?: any) {
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
  }

  // Generate cache key for AI requests
  generateAIKey(criteria: any, type: "discovery" | "analysis", ticker?: string): string {
    const base = `${type}:${criteria.riskAppetite}:${criteria.discoveryMethod}:${criteria.timeframe}`
    return ticker ? `${base}:${ticker}` : base
  }

  // Intelligent cache warming for popular requests
  async warmCache(popularCriteria: any[]) {
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
}

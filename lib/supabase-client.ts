import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Database operations
export class DatabaseService {
  // Store recommendation
  async storeRecommendation(userId: string, recommendation: any, criteria: any) {
    const { data, error } = await supabaseAdmin
      .from("recommendations")
      .insert({
        user_id: userId,
        ticker: recommendation.ticker,
        company_name: recommendation.companyName,
        entry_price: recommendation.entryPrice,
        target_price: recommendation.targetPrice,
        stop_loss_price: recommendation.stopLossPrice,
        risk_reward_ratio: recommendation.riskRewardRatio,
        timeframe: recommendation.timeframe,
        rationale: recommendation.rationale,
        tags: recommendation.tags,
        probability_of_success: recommendation.probabilityOfSuccess,
        volatility_profile: recommendation.volatilityProfile,
        discovery_method: criteria.discoveryMethod,
        catalyst_type: criteria.catalystType,
        risk_appetite: criteria.riskAppetite,
        model_used: criteria.model || "gpt-4-turbo",
      })
      .select()

    if (error) throw error
    return data[0]
  }

  // Get user's recommendation history
  async getUserRecommendations(userId: string, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from("recommendations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Update recommendation performance
  async updateRecommendationPerformance(recommendationId: string, currentPrice: number, status: string) {
    const { data: recommendation } = await supabaseAdmin
      .from("recommendations")
      .select("entry_price, target_price, stop_loss_price")
      .eq("id", recommendationId)
      .single()

    if (recommendation) {
      const currentReturn = ((currentPrice - recommendation.entry_price) / recommendation.entry_price) * 100

      // Update recommendation status
      await supabaseAdmin
        .from("recommendations")
        .update({
          status,
          actual_performance: {
            current_price: currentPrice,
            current_return_pct: currentReturn,
            last_updated: new Date().toISOString(),
          },
        })
        .eq("id", recommendationId)

      // Add performance tracking record
      await supabaseAdmin.from("performance_tracking").insert({
        recommendation_id: recommendationId,
        current_price: currentPrice,
        current_return_pct: currentReturn,
        status: currentReturn > 0 ? "winning" : currentReturn < -5 ? "losing" : "neutral",
        check_date: new Date().toISOString().split("T")[0],
      })
    }
  }

  // Get performance analytics
  async getPerformanceAnalytics(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("recommendations")
      .select(`
        *,
        performance_tracking(*)
      `)
      .eq("user_id", userId)

    if (error) throw error

    // Calculate analytics
    const totalRecommendations = data.length
    const activeRecommendations = data.filter((r) => r.status === "active").length
    const winners = data.filter((r) => r.status === "hit_target").length
    const losers = data.filter((r) => r.status === "hit_stop").length

    const winRate = totalRecommendations > 0 ? (winners / (winners + losers)) * 100 : 0

    return {
      totalRecommendations,
      activeRecommendations,
      winners,
      losers,
      winRate: winRate.toFixed(1),
      data,
    }
  }

  // Store user watchlist
  async createWatchlist(userId: string, name: string, tickers: string[]) {
    const { data, error } = await supabaseAdmin
      .from("watchlists")
      .insert({
        user_id: userId,
        name,
        tickers,
      })
      .select()

    if (error) throw error
    return data[0]
  }

  // Get user watchlists
  async getUserWatchlists(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("watchlists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }
}

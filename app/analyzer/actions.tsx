"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { MarketDataAggregator } from "@/lib/data-providers"
import { IntelligentCache } from "@/lib/upstash-cache"

interface StockPick {
  ticker: string
  companyName: string
  entryPrice: number
  target?: number
  targetPrice?: number
  stopLoss?: number
  stopLossPrice?: number
  riskRewardRatio: number
  timeframe: string
  rationale: string
  tags: string[]
  probabilityOfSuccess?: number
  marketCapBillion?: number
  sector?: string
  catalysts?: string[]
  technicalSignals?: string[]
  riskFactors?: string[]
}

interface AnalysisResult {
  ticker: string
  companyName: string
  currentPrice: number
  recommendation: "BUY" | "SELL" | "HOLD"
  targetPrice: number
  stopLoss: number
  confidence: number
  rationale: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  timeframe: string
  keyMetrics: {
    peRatio: number
    marketCap: string
    volume: string
    volatility: number
  }
  dataSource?: string
  timestamp?: string
}

// Enhanced quantitative trading engine with Upstash caching
class QuantitativeTradingEngine {
  private cache: IntelligentCache
  private dataProvider: MarketDataAggregator

  constructor() {
    try {
      this.cache = new IntelligentCache()
      this.dataProvider = new MarketDataAggregator()
      console.log("✅ QuantitativeTradingEngine initialized with Upstash caching")
    } catch (error) {
      console.error("❌ Failed to initialize QuantitativeTradingEngine:", error)
      throw error
    }
  }

  async generateAdvancedPicks(criteria: any, model: string): Promise<StockPick[]> {
    console.log(`🚀 Starting advanced stock discovery with ${model}...`)

    // Generate intelligent cache key based on criteria and model
    const cacheKey = this.cache.generateAIKey(criteria, "discovery") + `:${model}`

    // Check Upstash cache first for cost optimization
    const cachedResult = await this.cache.getAIResponse(cacheKey)
    if (cachedResult) {
      console.log("⚡ Using cached analysis result from Upstash - saving OpenAI costs!")
      return cachedResult.picks || []
    }

    try {
      // Get market context for enhanced analysis
      const marketContext = await this.getMarketContext()

      // Build comprehensive analysis prompt
      const analysisPrompt = this.buildAdvancedAnalysisPrompt(criteria, marketContext)

      console.log(`🤖 Generating fresh analysis with ${model}...`)

      const result = await generateText({
        model: openai(model),
        prompt: analysisPrompt,
        temperature: 0.3,
        maxTokens: 4000,
      })

      console.log("✅ AI analysis completed")

      // Parse and validate the response
      const picks = await this.parseAndValidateResponse(result.text, criteria)

      // Cache the successful result in Upstash for 4 hours
      await this.cache.cacheAIResponse(
        cacheKey,
        {
          picks,
          modelUsed: model,
          criteria,
          generatedAt: new Date().toISOString(),
        },
        4,
      )

      // Store success pattern for AI learning
      await this.cache.storeSuccessPattern(criteria, picks)

      console.log(`💾 Cached result in Upstash for future cost optimization`)

      return picks
    } catch (error) {
      console.error("❌ Advanced picks generation failed:", error)
      throw error
    }
  }

  private async getMarketContext() {
    try {
      console.log("📊 Gathering market context...")
      const overview = await this.dataProvider.getMarketOverview()
      return {
        governmentTrades: overview.governmentTrades.slice(0, 10),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.warn("⚠️ Market context gathering failed:", error)
      return {
        governmentTrades: [],
        timestamp: new Date().toISOString(),
        error: "Market context unavailable",
      }
    }
  }

  private buildAdvancedAnalysisPrompt(criteria: any, marketContext: any): string {
    const discoveryPrompts = {
      all: "Comprehensive analysis across all discovery methods",
      momentum: "Focus on momentum and technical breakouts",
      value: "Focus on undervalued opportunities with strong fundamentals",
      growth: "Focus on high-growth companies with expansion potential",
      contrarian: "Focus on contrarian plays and turnaround stories",
    }

    const catalystPrompts = {
      all: "Consider all catalyst types: technical, fundamental, government activity, and sector dynamics",
      technical: "Focus on technical analysis signals: breakouts, momentum, volume patterns",
      earnings: "Focus on earnings-related catalysts: upcoming reports, guidance revisions",
      government: "Focus on government trading activity: congressional purchases, insider activity",
      sector: "Focus on sector momentum: relative strength, rotation patterns",
    }

    const sectorPrompts = {
      all: "Diversified across all major sectors for balanced exposure",
      technology: "Technology sector focus: software, semiconductors, cloud computing, AI/ML",
      healthcare: "Healthcare focus: pharmaceuticals, biotechnology, medical devices",
      finance: "Financial sector focus: banks, insurance, fintech, payment processors",
      energy: "Energy sector focus: oil & gas, renewables, utilities, infrastructure",
      consumer: "Consumer focus: retail, restaurants, consumer goods, e-commerce",
    }

    const discoveryPrompt =
      discoveryPrompts[criteria.discoveryMethod as keyof typeof discoveryPrompts] || discoveryPrompts.all
    const catalystPrompt = catalystPrompts[criteria.catalystType as keyof typeof catalystPrompts] || catalystPrompts.all
    const sectorPrompt = sectorPrompts[criteria.sectorPreference as keyof typeof sectorPrompts] || sectorPrompts.all

    const govTradesContext =
      marketContext.governmentTrades.length > 0
        ? `Recent Government Trading Activity:\n${marketContext.governmentTrades
            .map(
              (trade: any) =>
                `- ${trade.representative}: ${trade.transactionType.toUpperCase()} ${trade.ticker} (${trade.amount})`,
            )
            .join("\n")}\n\n`
        : "Government trading data unavailable.\n\n"

    return `You are a professional quantitative analyst with 15+ years of experience. Perform a comprehensive multi-step stock analysis.

ANALYSIS CRITERIA:
- Timeframe: ${criteria.timeframe}
- Risk Appetite: ${criteria.riskAppetite}
- Discovery Method: ${discoveryPrompt}
- Catalyst Focus: ${catalystPrompt}
- Sector Focus: ${sectorPrompt}

${govTradesContext}ANALYSIS REQUIREMENTS:

1. STOCK DISCOVERY PROCESS:
   - Screen 2000+ stocks across major indices (S&P 500, NASDAQ, Russell 2000)
   - Apply quantitative filters based on the discovery method
   - Consider market cap ranges: small ($300M-2B), mid ($2B-10B), large ($10B+)

2. MULTI-STEP VALIDATION:
   - Fundamental analysis: revenue growth, profitability, balance sheet strength
   - Technical analysis: price action, volume, momentum indicators
   - Catalyst validation: upcoming events, news flow, insider activity
   - Risk assessment: volatility, liquidity, sector headwinds

3. POSITION SIZING & RISK MANAGEMENT:
   - Calculate appropriate entry, target, and stop-loss levels
   - Ensure risk-reward ratios of at least 2:1 for aggressive, 1.5:1 for moderate, 1.2:1 for conservative
   - Consider position correlation and portfolio impact

4. PROBABILITY ASSESSMENT:
   - Assign probability of success (0-100%) based on confluence of factors
   - Higher probabilities require multiple confirming signals

RESPONSE FORMAT (JSON):
{
  "picks": [
    {
      "ticker": "SYMBOL",
      "companyName": "Full Company Name",
      "entryPrice": 0.00,
      "targetPrice": 0.00,
      "stopLossPrice": 0.00,
      "riskRewardRatio": 0.0,
      "timeframe": "${criteria.timeframe}",
      "rationale": "Detailed analysis explaining the investment thesis, key catalysts, technical setup, and risk factors",
      "tags": ["sector", "catalyst-type", "market-cap", "risk-level"],
      "probabilityOfSuccess": 0,
      "marketCapBillion": 0.0,
      "sector": "Sector Name",
      "catalysts": ["catalyst1", "catalyst2", "catalyst3"],
      "technicalSignals": ["signal1", "signal2"],
      "riskFactors": ["risk1", "risk2"]
    }
  ]
}

QUALITY STANDARDS:
- Maximum 3-4 high-conviction picks (quality over quantity)
- Each pick must have a detailed, professional rationale (minimum 150 words)
- All prices must be realistic and based on current market conditions
- Risk-reward ratios must meet the specified criteria
- Probability assessments must be conservative and well-justified

Focus on actionable, high-probability opportunities with clear catalysts and well-defined risk parameters.`
  }

  private async parseAndValidateResponse(responseText: string, criteria: any): Promise<StockPick[]> {
    try {
      console.log("🔍 Parsing AI response...")

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const parsed = JSON.parse(jsonMatch[0])

      if (!parsed.picks || !Array.isArray(parsed.picks)) {
        throw new Error("Invalid response format: missing picks array")
      }

      console.log(`📋 Found ${parsed.picks.length} picks to validate...`)

      // Validate and enrich each pick
      const validatedPicks: StockPick[] = []

      for (const pick of parsed.picks) {
        try {
          // Basic validation
          if (!pick.ticker || !pick.companyName || !pick.entryPrice || !pick.targetPrice) {
            console.warn(`⚠️ Skipping ${pick.ticker}: missing required fields`)
            continue
          }

          // Validate stock exists and get real market data
          const isValid = await this.dataProvider.validateStock(pick.ticker)
          if (!isValid) {
            console.warn(`⚠️ Skipping ${pick.ticker}: failed stock validation`)
            continue
          }

          // Get current market data for price validation
          let currentPrice = pick.entryPrice
          try {
            const quickQuote = await this.dataProvider.getQuickQuote(pick.ticker)
            currentPrice = quickQuote.price

            if (quickQuote.companyName && quickQuote.companyName !== `${pick.ticker} Corporation`) {
              pick.companyName = quickQuote.companyName
            }
          } catch (error) {
            console.warn(`⚠️ Could not get current price for ${pick.ticker}, using AI estimate`)
          }

          // Validate price relationships and risk-reward ratios
          if (pick.targetPrice <= pick.entryPrice) {
            pick.targetPrice = pick.entryPrice * 1.15 // 15% minimum target
          }

          if (pick.stopLossPrice >= pick.entryPrice) {
            pick.stopLossPrice = pick.entryPrice * 0.92 // 8% maximum loss
          }

          const potentialGain = pick.targetPrice - pick.entryPrice
          const potentialLoss = pick.entryPrice - pick.stopLossPrice
          pick.riskRewardRatio = Math.round((potentialGain / potentialLoss) * 100) / 100

          // Update entry price to current market price
          pick.entryPrice = currentPrice

          // Ensure required fields have defaults
          pick.probabilityOfSuccess = pick.probabilityOfSuccess || 65
          pick.marketCapBillion = pick.marketCapBillion || 5.0
          pick.sector = pick.sector || "Technology"
          pick.catalysts = pick.catalysts || ["Technical breakout", "Sector momentum"]
          pick.technicalSignals = pick.technicalSignals || ["Volume surge", "Moving average cross"]
          pick.riskFactors = pick.riskFactors || ["Market volatility", "Sector rotation"]
          pick.tags = pick.tags || [pick.sector.toLowerCase(), criteria.riskAppetite, "mid-cap"]

          validatedPicks.push(pick)
          console.log(`✅ ${pick.ticker} validated successfully`)
        } catch (error) {
          console.warn(`⚠️ Validation failed for ${pick.ticker}:`, error)
          continue
        }
      }

      if (validatedPicks.length === 0) {
        throw new Error("No valid picks after validation")
      }

      console.log(`✅ Validation complete: ${validatedPicks.length} valid picks`)
      return validatedPicks
    } catch (error) {
      console.error("❌ Response parsing failed:", error)
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

export async function generateStockPicks(criteria: {
  timeframe: string
  riskAppetite: string
  catalystType: string
  sectorPreference: string
  discoveryMethod: string
  numberOfPicks: number
  model: string
}): Promise<StockPick[]> {
  console.log("🚀 Generate picks server action called")

  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your_")) {
      throw new Error("OpenAI API key not configured. Please add your API key to continue.")
    }

    console.log("📋 Request criteria:", criteria)

    const { timeframe, riskAppetite, catalystType, sectorPreference, discoveryMethod, model } = criteria

    // Validate required fields
    if (!timeframe || !riskAppetite || !catalystType || !sectorPreference || !discoveryMethod) {
      throw new Error("Missing required fields")
    }

    // Initialize the trading engine with Upstash caching
    const engine = new QuantitativeTradingEngine()

    // Generate advanced picks with intelligent caching
    const picks = await engine.generateAdvancedPicks(
      {
        timeframe,
        riskAppetite,
        catalystType,
        sectorPreference,
        discoveryMethod,
      },
      model || "gpt-4o",
    )

    console.log(`✅ Successfully generated ${picks.length} picks using ${model}`)

    return picks
  } catch (error) {
    console.error("❌ Generate picks server action error:", error)
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
  }
}

export async function analyzeStock(ticker: string, model = "gpt-4o"): Promise<AnalysisResult> {
  console.log("🚀 Analyze stock server action called")

  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your_")) {
      throw new Error("OpenAI API key not configured. Please add your API key to continue.")
    }

    console.log(`📋 Analyzing ${ticker} with ${model}...`)

    // Initialize cache and data provider
    const cache = new IntelligentCache()
    const dataProvider = new MarketDataAggregator()

    // Check cache first for cost optimization
    const cacheKey = `analysis:${ticker}:${model}`
    const cachedResult = await cache.getAIResponse(cacheKey)

    if (cachedResult) {
      console.log("⚡ Using cached analysis from Upstash - saving OpenAI costs!")
      return cachedResult
    }

    // Get comprehensive stock data
    const stockData = await dataProvider.getComprehensiveStockData(ticker)

    // Generate AI analysis
    const analysisPrompt = `Analyze ${ticker} (${stockData.profile.name}) and provide a comprehensive investment recommendation.

CURRENT DATA:
- Current Price: $${stockData.quote.price}
- Market Cap: $${(stockData.profile.marketCap / 1000000000).toFixed(1)}B
- Sector: ${stockData.profile.sector}
- Exchange: ${stockData.profile.exchange}

ANALYSIS REQUIREMENTS:
1. Buy/Sell/Hold recommendation with confidence level (0-100%)
2. Specific target price and stop loss levels
3. Detailed rationale including:
   - Technical analysis (price action, momentum)
   - Fundamental analysis (valuation, growth prospects)
   - Risk assessment and key risk factors
4. Investment timeframe recommendation
5. Key metrics and volatility assessment

RESPONSE FORMAT (JSON):
{
  "recommendation": "BUY|SELL|HOLD",
  "targetPrice": 0.00,
  "stopLoss": 0.00,
  "confidence": 0,
  "rationale": "Detailed analysis explaining the recommendation",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "timeframe": "timeframe recommendation",
  "keyMetrics": {
    "peRatio": 0.0,
    "marketCap": "market cap string",
    "volume": "volume string",
    "volatility": 0.0
  }
}`

    const result = await generateText({
      model: openai(model),
      prompt: analysisPrompt,
      temperature: 0.3,
      maxTokens: 2000,
    })

    // Parse the AI response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response")
    }

    const analysis = JSON.parse(jsonMatch[0])

    // Create structured analysis result
    const analysisResult: AnalysisResult = {
      ticker: ticker.toUpperCase(),
      companyName: stockData.profile.name,
      currentPrice: stockData.quote.price,
      recommendation: analysis.recommendation || "HOLD",
      targetPrice: analysis.targetPrice || stockData.quote.price * 1.1,
      stopLoss: analysis.stopLoss || stockData.quote.price * 0.9,
      confidence: analysis.confidence || 75,
      rationale: analysis.rationale || "Analysis based on current market conditions and company fundamentals.",
      riskLevel: analysis.riskLevel || "MEDIUM",
      timeframe: analysis.timeframe || "2-4 weeks",
      keyMetrics: {
        peRatio: analysis.keyMetrics?.peRatio || 25.0,
        marketCap: `$${(stockData.profile.marketCap / 1000000000).toFixed(1)}B`,
        volume: stockData.quote.volume?.toLocaleString() || "N/A",
        volatility: analysis.keyMetrics?.volatility || 0.25,
      },
      dataSource: "live",
      timestamp: new Date().toISOString(),
    }

    // Cache the result for 15 minutes
    await cache.cacheAIResponse(cacheKey, analysisResult, 0.25)

    console.log(`✅ Successfully analyzed ${ticker} with ${model} and cached result`)
    return analysisResult
  } catch (error) {
    console.error("❌ Analyze stock server action error:", error)
    throw new Error(error instanceof Error ? error.message : `Failed to analyze ${ticker}`)
  }
}

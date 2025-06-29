import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { MarketDataAggregator } from "@/lib/data-providers"
import { IntelligentCache } from "@/lib/upstash-cache"

// Enhanced stock discovery with comprehensive analysis
const DISCOVERY_PROMPTS = {
  "emerging-growth": `Focus on emerging growth companies with:
- Revenue growth >25% YoY
- Market cap $500M-$10B
- Strong competitive moats
- Expanding addressable markets
- Recent positive catalysts`,

  "international-plays": `Focus on international opportunities:
- ADRs of strong foreign companies
- Currency-advantaged plays
- Emerging market leaders
- Global expansion stories
- Geopolitical beneficiaries`,

  "sector-rotation": `Focus on sector rotation opportunities:
- Sectors showing relative strength
- Cyclical turning points
- Policy beneficiaries
- Supply/demand imbalances
- Institutional rotation patterns`,

  "thematic-plays": `Focus on thematic investment opportunities:
- AI/ML transformation
- Energy transition
- Demographics shifts
- Infrastructure modernization
- Digital transformation`,

  "undervalued-gems": `Focus on undervalued opportunities:
- P/E ratios below sector average
- Strong balance sheets
- Hidden assets or catalysts
- Temporary headwinds resolving
- Management changes or activism`,

  all: `Comprehensive analysis across all discovery methods:
- Emerging growth opportunities
- International plays and ADRs
- Sector rotation beneficiaries
- Thematic investment trends
- Undervalued gems with catalysts`,
}

const CATALYST_PROMPTS = {
  technical: "Focus on technical analysis signals: breakouts, momentum, volume patterns, support/resistance levels",
  earnings: "Focus on earnings-related catalysts: upcoming reports, guidance revisions, estimate changes",
  "gov-trades": "Focus on government trading activity: congressional purchases, insider activity, regulatory changes",
  "sector-momentum": "Focus on sector momentum: relative strength, rotation patterns, industry trends",
  all: "Consider all catalyst types: technical, fundamental, government activity, and sector dynamics",
}

const SECTOR_PROMPTS = {
  tech: "Technology sector focus: software, semiconductors, cloud computing, AI/ML",
  energy: "Energy sector focus: oil & gas, renewables, utilities, energy infrastructure",
  financials: "Financial sector focus: banks, insurance, fintech, payment processors",
  biotech: "Biotechnology focus: pharmaceuticals, medical devices, healthcare innovation",
  healthcare: "Healthcare focus: hospitals, managed care, medical technology, services",
  consumer: "Consumer focus: retail, restaurants, consumer goods, e-commerce",
  industrials: "Industrial focus: manufacturing, aerospace, defense, infrastructure",
  all: "Diversified across all major sectors for balanced exposure",
}

interface StockPick {
  ticker: string
  companyName: string
  entryPrice: number
  targetPrice: number
  stopLossPrice: number
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

// Enhanced quantitative trading engine
class QuantitativeTradingEngine {
  private cache: IntelligentCache
  private dataProvider: MarketDataAggregator

  constructor() {
    try {
      this.cache = new IntelligentCache()
      this.dataProvider = new MarketDataAggregator()
      console.log("✅ QuantitativeTradingEngine initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize QuantitativeTradingEngine:", error)
      throw error
    }
  }

  async generateAdvancedPicks(criteria: any, model: string): Promise<StockPick[]> {
    console.log("🚀 Starting advanced stock discovery process...")

    // Check cache first
    const cacheKey = this.cache.generateAIKey(criteria, "discovery")
    const cachedResult = await this.cache.getAIResponse(cacheKey)

    if (cachedResult) {
      console.log("⚡ Using cached analysis result")
      return cachedResult.picks || []
    }

    try {
      // Get market context
      const marketContext = await this.getMarketContext()

      // Generate comprehensive analysis prompt
      const analysisPrompt = this.buildAdvancedAnalysisPrompt(criteria, marketContext)

      console.log(`🤖 Generating analysis with ${model}...`)

      const result = await generateText({
        model: openai(model),
        prompt: analysisPrompt,
        temperature: 0.3,
        maxTokens: 4000,
      })

      console.log("✅ AI analysis completed")

      // Parse and validate the response
      const picks = await this.parseAndValidateResponse(result.text, criteria)

      // Cache the successful result
      await this.cache.cacheAIResponse(cacheKey, { picks, modelUsed: model })

      // Store success pattern for learning
      await this.cache.storeSuccessPattern(criteria, picks)

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
    const discoveryPrompt =
      DISCOVERY_PROMPTS[criteria.discoveryMethod as keyof typeof DISCOVERY_PROMPTS] || DISCOVERY_PROMPTS.all
    const catalystPrompt =
      CATALYST_PROMPTS[criteria.catalystType as keyof typeof CATALYST_PROMPTS] || CATALYST_PROMPTS.all
    const sectorPrompt = SECTOR_PROMPTS[criteria.sectorPreference as keyof typeof SECTOR_PROMPTS] || SECTOR_PROMPTS.all

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
   - Include international ADRs and emerging market leaders
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
   - Account for market regime and macro environment

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
      "rationale": "Detailed multi-paragraph analysis explaining the investment thesis, key catalysts, technical setup, and risk factors",
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

Focus on actionable, high-probability opportunities with clear catalysts and well-defined risk parameters. Prioritize stocks with strong fundamentals, technical confirmation, and upcoming catalysts that align with the specified criteria.`
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
          console.log(`🔍 Validating ${pick.ticker}...`)

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

            // Update company name if we got a better one
            if (quickQuote.companyName && quickQuote.companyName !== `${pick.ticker} Corporation`) {
              pick.companyName = quickQuote.companyName
            }
          } catch (error) {
            console.warn(`⚠️ Could not get current price for ${pick.ticker}, using AI estimate`)
          }

          // Validate price relationships
          if (pick.targetPrice <= pick.entryPrice) {
            console.warn(`⚠️ Adjusting target price for ${pick.ticker}: target must be > entry`)
            pick.targetPrice = pick.entryPrice * 1.15 // 15% minimum target
          }

          if (pick.stopLossPrice >= pick.entryPrice) {
            console.warn(`⚠️ Adjusting stop loss for ${pick.ticker}: stop must be < entry`)
            pick.stopLossPrice = pick.entryPrice * 0.92 // 8% maximum loss
          }

          // Calculate and validate risk-reward ratio
          const potentialGain = pick.targetPrice - pick.entryPrice
          const potentialLoss = pick.entryPrice - pick.stopLossPrice
          const calculatedRR = potentialGain / potentialLoss

          pick.riskRewardRatio = Math.round(calculatedRR * 100) / 100

          // Validate risk-reward meets criteria
          const minRR = criteria.riskAppetite === "aggressive" ? 2.0 : criteria.riskAppetite === "moderate" ? 1.5 : 1.2

          if (pick.riskRewardRatio < minRR) {
            console.warn(
              `⚠️ Adjusting prices for ${pick.ticker}: R/R ratio too low (${pick.riskRewardRatio} < ${minRR})`,
            )
            // Adjust target price to meet minimum R/R
            pick.targetPrice = pick.entryPrice + potentialLoss * minRR
            pick.riskRewardRatio = minRR
          }

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

export async function POST(request: NextRequest) {
  console.log("🚀 Generate picks API called")

  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your_")) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured. Please add your API key to continue.",
        picks: [],
      })
    }

    const body = await request.json()
    console.log("📋 Request body:", body)

    const { timeframe, riskAppetite, catalystType, sectorPreference, discoveryMethod, model = "gpt-4-turbo" } = body

    // Validate required fields
    if (!timeframe || !riskAppetite || !catalystType || !sectorPreference || !discoveryMethod) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        picks: [],
      })
    }

    // Initialize the trading engine
    const engine = new QuantitativeTradingEngine()

    // Generate advanced picks
    const picks = await engine.generateAdvancedPicks(
      {
        timeframe,
        riskAppetite,
        catalystType,
        sectorPreference,
        discoveryMethod,
      },
      model,
    )

    console.log(`✅ Successfully generated ${picks.length} picks`)

    return NextResponse.json({
      success: true,
      picks,
      generatedAt: new Date().toISOString(),
      criteria: {
        timeframe,
        riskAppetite,
        catalystType,
        sectorPreference,
        discoveryMethod,
      },
      modelUsed: model,
    })
  } catch (error) {
    console.error("❌ Generate picks API error:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      picks: [],
    })
  }
}

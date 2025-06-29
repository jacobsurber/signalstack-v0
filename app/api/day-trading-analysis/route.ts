import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { IntradayDataProvider } from "@/lib/intraday-data-provider"
import { DAY_TRADING_STRATEGIES, MARKET_SESSIONS, DAY_TRADING_RISK_RULES } from "@/lib/day-trading-strategies"

// Day Trading Analysis Schema
const DayTradingAnalysisSchema = z.object({
  ticker: z.string(),
  strategy: z.string(),
  entryTime: z.string(),
  entryPrice: z.number(),
  targetPrice: z.number(),
  stopLoss: z.number(),
  exitTime: z.string(),
  riskReward: z.number(),
  confidence: z.number().min(60).max(95),
  timeframe: z.string(),
  reasoning: z.string(),
  technicalSetup: z.string(),
  volumeConfirmation: z.boolean(),
  marketConditions: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  positionSize: z.number(),
  maxHoldTime: z.string(),
})

const RequestSchema = z.object({
  ticker: z.string(),
  strategy: z.string().optional(),
  timeframe: z.enum(["1min", "5min", "15min"]).optional().default("5min"),
  riskAppetite: z.enum(["conservative", "moderate", "aggressive"]).optional().default("moderate"),
  model: z.string().optional().default("gpt-4o"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== DAY TRADING TECHNICAL ANALYSIS ===")

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured", success: false }, { status: 500 })
    }

    const body = await request.json()
    const validatedData = RequestSchema.parse(body)

    const ticker = validatedData.ticker.toUpperCase()
    console.log(`📊 Analyzing ${ticker} for day trading...`)

    // Get real-time intraday data
    const dataProvider = new IntradayDataProvider()
    const intradayData = await dataProvider.getIntradayData(ticker, validatedData.timeframe)

    if (!intradayData.minuteData || intradayData.minuteData.length < 20) {
      throw new Error(`Insufficient intraday data for ${ticker} - need at least 20 minutes of data`)
    }

    // Calculate technical signals
    const technicalSignals = await dataProvider.calculateTechnicalSignals(ticker, intradayData.minuteData)

    // Get current market session
    const currentSession = dataProvider.getCurrentMarketSession()
    const sessionInfo = MARKET_SESSIONS[currentSession as keyof typeof MARKET_SESSIONS]

    // Create comprehensive prompt for AI analysis
    const systemPrompt = `You are an expert day trader and technical analyst providing precise intraday trading recommendations.

CRITICAL REQUIREMENTS:
- Provide EXACT entry and exit times (e.g., "10:45 AM EST", "2:30 PM EST")
- Use REAL-TIME technical data provided
- Consider current market session characteristics
- Focus on high-probability setups with proper risk management
- Provide specific position sizing based on risk appetite

DAY TRADING STRATEGIES AVAILABLE:
${Object.entries(DAY_TRADING_STRATEGIES)
  .map(
    ([key, strategy]) =>
      `${key}: ${strategy.description} (${strategy.timeframe}, R/R: ${strategy.riskReward}, Success: ${strategy.successRate})`,
  )
  .join("\n")}

CURRENT MARKET SESSION: ${currentSession}
Session Characteristics: ${sessionInfo?.characteristics}
Recommended Strategies: ${sessionInfo?.strategies.join(", ")}
Risk Level: ${sessionInfo?.riskLevel}

RISK MANAGEMENT RULES:
- Max risk per trade: ${DAY_TRADING_RISK_RULES.POSITION_SIZING.maxRiskPerTrade * 100}%
- Max daily risk: ${DAY_TRADING_RISK_RULES.POSITION_SIZING.maxDailyRisk * 100}%
- End of day exit: ${DAY_TRADING_RISK_RULES.TIME_STOPS.endOfDayExit}

Focus on providing actionable, time-specific trading recommendations with precise entry/exit points.`

    const userPrompt = `Analyze ${ticker} for day trading opportunities using this REAL-TIME DATA:

CURRENT MARKET DATA:
- Current Price: $${intradayData.price}
- Bid/Ask: $${intradayData.bid}/$${intradayData.ask} (Spread: $${intradayData.spread.toFixed(3)})
- Volume: ${intradayData.volume.toLocaleString()}
- VWAP: $${intradayData.vwap.toFixed(2)}
- Day Range: $${intradayData.low} - $${intradayData.high}

TECHNICAL SIGNALS:
- RSI: ${technicalSignals.rsi.toFixed(1)} ${technicalSignals.rsi > 70 ? "(Overbought)" : technicalSignals.rsi < 30 ? "(Oversold)" : "(Neutral)"}
- MACD: ${technicalSignals.macd.macd.toFixed(3)} (Signal: ${technicalSignals.macd.signal.toFixed(3)}, Histogram: ${technicalSignals.macd.histogram.toFixed(3)})
- Bollinger Bands: Upper $${technicalSignals.bollingerBands.upper.toFixed(2)}, Middle $${technicalSignals.bollingerBands.middle.toFixed(2)}, Lower $${technicalSignals.bollingerBands.lower.toFixed(2)}
- Price Position: ${technicalSignals.bollingerBands.position}
- Moving Averages: SMA5 $${technicalSignals.movingAverages.sma5.toFixed(2)}, SMA10 $${technicalSignals.movingAverages.sma10.toFixed(2)}, SMA20 $${technicalSignals.movingAverages.sma20.toFixed(2)}
- Trend: ${technicalSignals.movingAverages.trend}

VOLUME ANALYSIS:
- Current Volume: ${technicalSignals.volumeProfile.currentVolume.toLocaleString()}
- Average Volume: ${technicalSignals.volumeProfile.averageVolume.toLocaleString()}
- Volume Ratio: ${technicalSignals.volumeProfile.volumeRatio.toFixed(2)}x
- Volume Spike: ${technicalSignals.volumeProfile.volumeSpike ? "YES" : "NO"}

MOMENTUM INDICATORS:
- Price Change: $${technicalSignals.momentum.priceChange.toFixed(3)} (${technicalSignals.momentum.priceChangePercent.toFixed(2)}%)
- Velocity: ${technicalSignals.momentum.velocity.toFixed(3)}
- Acceleration: ${technicalSignals.momentum.acceleration.toFixed(3)}

MARKET SESSION: ${currentSession}
Time: ${new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York" })} EST

ANALYSIS REQUIREMENTS:
- Strategy: ${validatedData.strategy || "Best strategy for current conditions"}
- Timeframe: ${validatedData.timeframe}
- Risk Appetite: ${validatedData.riskAppetite}
- Provide EXACT entry time (within next 30 minutes)
- Provide EXACT exit time (same day)
- Use current price $${intradayData.price} as reference
- Consider spread and liquidity
- Account for current market session

Provide a specific, actionable day trading recommendation with precise timing.`

    // Generate AI analysis
    const result = await generateObject({
      model: openai(validatedData.model),
      system: systemPrompt,
      prompt: userPrompt,
      schema: DayTradingAnalysisSchema,
      temperature: 0.3, // Lower temperature for more precise analysis
      maxRetries: 2,
    })

    const analysis = result.object

    // Validate and adjust analysis
    analysis.entryPrice = Number.parseFloat(intradayData.price.toFixed(2))

    // Ensure proper risk/reward ratio
    if (analysis.riskReward < 1) {
      const risk = analysis.entryPrice - analysis.stopLoss
      analysis.targetPrice = analysis.entryPrice + risk * 1.5 // Minimum 1.5:1 R/R
      analysis.riskReward = 1.5
    }

    // Calculate position size based on risk
    const riskPerShare = Math.abs(analysis.entryPrice - analysis.stopLoss)
    const maxRiskAmount = 10000 * DAY_TRADING_RISK_RULES.POSITION_SIZING.maxRiskPerTrade // Assuming $10k account
    analysis.positionSize = Math.floor(maxRiskAmount / riskPerShare)

    const response = {
      analysis,
      marketData: {
        ticker,
        currentPrice: intradayData.price,
        bid: intradayData.bid,
        ask: intradayData.ask,
        spread: intradayData.spread,
        volume: intradayData.volume,
        vwap: intradayData.vwap,
        dayRange: `$${intradayData.low} - $${intradayData.high}`,
      },
      technicalSignals,
      marketSession: {
        current: currentSession,
        characteristics: sessionInfo?.characteristics,
        recommendedStrategies: sessionInfo?.strategies,
        riskLevel: sessionInfo?.riskLevel,
      },
      riskManagement: {
        positionSize: analysis.positionSize,
        riskPerShare: riskPerShare.toFixed(3),
        maxRiskAmount: maxRiskAmount.toFixed(2),
        riskRewardRatio: analysis.riskReward,
        maxHoldTime: analysis.maxHoldTime,
      },
      timing: {
        analysisTime: new Date().toISOString(),
        marketTime: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
        entryTime: analysis.entryTime,
        exitTime: analysis.exitTime,
      },
      dataQuality: {
        minutesOfData: intradayData.minuteData.length,
        dataSource: "real-time",
        lastUpdate: intradayData.timestamp,
      },
      success: true,
    }

    console.log(`✅ Day trading analysis complete for ${ticker}`)
    console.log(`   Strategy: ${analysis.strategy}`)
    console.log(`   Entry: $${analysis.entryPrice} at ${analysis.entryTime}`)
    console.log(`   Target: $${analysis.targetPrice} at ${analysis.exitTime}`)
    console.log(`   Stop: $${analysis.stopLoss}`)
    console.log(`   R/R: ${analysis.riskReward}:1`)
    console.log(`   Position Size: ${analysis.positionSize} shares`)

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Day trading analysis error:", error)

    return NextResponse.json(
      {
        error: "Day trading analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed", success: false }, { status: 405 })
}

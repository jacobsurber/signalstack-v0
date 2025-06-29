import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { MarketDataAggregator } from "@/lib/data-providers"

// Request body schema
const RequestSchema = z.object({
  ticker: z.string(),
  timeframe: z.string().optional(),
  riskAppetite: z.string().optional(),
  discoveryMethod: z.string().optional(),
  model: z.string().optional().default("gpt-4o"),
})

// Individual stock analysis schema
const StockAnalysisSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  entryPrice: z.number(),
  targetPrice: z.number(),
  stopLossPrice: z.number(),
  riskRewardRatio: z.number(),
  timeframe: z.string(),
  rationale: z.string(),
  tags: z.array(z.string()),
})

export async function POST(request: NextRequest) {
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required")
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = RequestSchema.parse(body)

    const ticker = validatedData.ticker.toUpperCase()

    // Get live data for the specific stock
    const dataAggregator = new MarketDataAggregator()

    // Validate stock first
    const isValid = await dataAggregator.validateStock(ticker)
    if (!isValid) {
      return NextResponse.json(
        {
          error: `Invalid or inactive stock symbol: ${ticker}`,
          success: false,
        },
        { status: 400 },
      )
    }

    // Get comprehensive live data
    const stockData = await dataAggregator.getComprehensiveStockData(ticker)

    // System prompt for individual stock analysis - NO CONSTRAINTS
    const systemPrompt = `You are a professional trader analyzing a specific stock with full freedom to provide realistic analysis.

ANALYSIS APPROACH:
- Use your professional judgment based on the stock's characteristics
- Consider the company's market cap, sector, volatility, and current market conditions
- Generate realistic price targets based on the stock's trading patterns
- Provide detailed technical and fundamental analysis
- Each analysis should be unique and tailored to the specific stock

Focus on providing actionable insights with realistic entry, target, and stop levels based on current market data.`

    // Generate analysis prompt for the specific stock with live data
    const userPrompt = `Analyze ${ticker} for trading opportunities using this LIVE DATA:

LIVE STOCK DATA:
- Current Price: $${stockData.quote.price}
- Daily Change: ${stockData.quote.changePercent.toFixed(2)}%
- Volume: ${stockData.quote.volume.toLocaleString()}
- Company: ${stockData.profile?.name || "Unknown"}
- Market Cap: ${stockData.profile?.marketCap ? `$${(stockData.profile.marketCap / 1000000000).toFixed(1)}B` : "Unknown"}
- Sector: ${stockData.profile?.finnhubIndustry || stockData.profile?.sector || "Unknown"}

TECHNICAL INDICATORS:
${
  stockData.technicals
    ? `- RSI: ${stockData.technicals.rsi?.toFixed(1) || "N/A"}
- SMA 20: $${stockData.technicals.sma20?.toFixed(2) || "N/A"}`
    : "- Technical indicators unavailable"
}

GOVERNMENT TRADES:
${
  stockData.governmentTrades.length > 0
    ? stockData.governmentTrades
        .slice(0, 3)
        .map(
          (trade) =>
            `- ${trade.representative}: ${trade.transactionType.toUpperCase()} ${trade.amount} on ${trade.transactionDate}`,
        )
        .join("\n")
    : "- No recent government trades"
}

ANALYSIS REQUIREMENTS:
- Use current price $${stockData.quote.price} as entry point
- Generate realistic targets based on the stock's volatility and market cap
- Consider the timeframe: ${validatedData.timeframe || "2-weeks"}
- Risk appetite: ${validatedData.riskAppetite || "moderate"}
- Discovery method: ${validatedData.discoveryMethod || "all"}
- Provide detailed rationale explaining the trade setup
- Include relevant tags based on the analysis type and discovery method

Focus the analysis through the lens of: ${validatedData.discoveryMethod || "general market analysis"}
`

    // Generate structured response using selected OpenAI model
    const result = await generateObject({
      model: openai(validatedData.model),
      system: systemPrompt,
      prompt: userPrompt,
      schema: StockAnalysisSchema,
      temperature: 0.7,
    })

    // Minimal validation - ensure basic logic
    const analysis = result.object
    const currentPrice = stockData.quote.price

    // Use live data
    analysis.entryPrice = Number.parseFloat(currentPrice.toFixed(2))
    analysis.companyName = stockData.profile?.name || ticker
    analysis.timeframe = validatedData.timeframe || "2-weeks"

    // Basic logic validation only
    if (analysis.targetPrice <= analysis.entryPrice) {
      analysis.targetPrice = Number.parseFloat((analysis.entryPrice * 1.03).toFixed(2))
    }

    if (analysis.stopLossPrice >= analysis.entryPrice) {
      analysis.stopLossPrice = Number.parseFloat((analysis.entryPrice * 0.97).toFixed(2))
    }

    // Recalculate risk/reward ratio
    analysis.riskRewardRatio = Number.parseFloat(
      ((analysis.targetPrice - analysis.entryPrice) / (analysis.entryPrice - analysis.stopLossPrice)).toFixed(2),
    )

    // Structure the final response
    const response = {
      analysis,
      liveData: {
        currentPrice: stockData.quote.price,
        volume: stockData.quote.volume,
        change: stockData.quote.change,
        changePercent: stockData.quote.changePercent,
        technicals: stockData.technicals,
        governmentTrades: stockData.governmentTrades.slice(0, 3),
        profile: stockData.profile,
      },
      modelUsed: validatedData.model,
      analyzedAt: new Date().toISOString(),
      dataTimestamp: stockData.lastUpdated,
      success: true,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error analyzing stock:", error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
          success: false,
        },
        { status: 400 },
      )
    }

    // Handle data provider errors
    if (error instanceof Error && error.message.includes("API")) {
      return NextResponse.json(
        {
          error: "Market data service temporarily unavailable",
          message: "Please try again in a moment",
          success: false,
        },
        { status: 503 },
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to analyze stock",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        success: false,
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed", message: "Use POST to analyze stocks" }, { status: 405 })
}

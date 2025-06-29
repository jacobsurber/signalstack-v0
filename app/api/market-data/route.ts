import { type NextRequest, NextResponse } from "next/server"
import { MarketDataAggregator } from "@/lib/data-providers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const type = searchParams.get("type") || "overview"

    // Validate required environment variables first
    const requiredEnvVars = ["POLYGON_API_KEY", "ALPHA_VANTAGE_API_KEY", "QUIVER_QUANT_API_KEY", "FINNHUB_API_KEY"]
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required environment variables: ${missingVars.join(", ")}`,
        },
        { status: 500 },
      )
    }

    const dataAggregator = new MarketDataAggregator()

    if (symbol && type === "stock") {
      // Get comprehensive data for a specific stock
      try {
        const stockData = await dataAggregator.getComprehensiveStockData(symbol.toUpperCase())

        return NextResponse.json({
          success: true,
          data: stockData,
        })
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch stock data",
          },
          { status: 400 },
        )
      }
    } else if (type === "overview") {
      // Get market overview data
      try {
        const marketData = await dataAggregator.getMarketOverview()

        return NextResponse.json({
          success: true,
          data: marketData,
        })
      } catch (error) {
        console.error("Error fetching market overview:", error)
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch market data",
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid request parameters",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Market data API error:", error)

    // Ensure we always return valid JSON
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Market data service unavailable",
      },
      { status: 500 },
    )
  }
}

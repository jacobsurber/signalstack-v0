import { type NextRequest, NextResponse } from "next/server"
import { MarketDataAggregator } from "@/lib/data-providers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const type = searchParams.get("type") || "overview"

    // Check if we have any API keys configured
    const apiKeys = {
      polygon: process.env.POLYGON_API_KEY,
      alphaVantage: process.env.ALPHA_VANTAGE_API_KEY,
      quiverQuant: process.env.QUIVER_QUANT_API_KEY,
      finnhub: process.env.FINNHUB_API_KEY,
    }

    const hasAnyApiKey = Object.values(apiKeys).some(
      (key) => key && key.trim() !== "" && !key.includes("your_") && !key.includes("_here"),
    )

    if (!hasAnyApiKey) {
      console.log("No valid API keys configured, returning demo data")

      if (type === "overview") {
        return NextResponse.json({
          success: true,
          data: {
            governmentTrades: [
              {
                representative: "Nancy Pelosi",
                ticker: "NVDA",
                transactionType: "buy",
                amount: "$1M - $5M",
                transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                representative: "Dan Crenshaw",
                ticker: "TSLA",
                transactionType: "sell",
                amount: "$15K - $50K",
                transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                representative: "Austin Scott",
                ticker: "AAPL",
                transactionType: "buy",
                amount: "$1K - $15K",
                transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                representative: "Josh Gottheimer",
                ticker: "MSFT",
                transactionType: "buy",
                amount: "$50K - $100K",
                transactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                representative: "Ro Khanna",
                ticker: "GOOGL",
                transactionType: "sell",
                amount: "$15K - $50K",
                transactionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              },
            ],
            lastUpdated: new Date().toISOString(),
            isDemo: true,
          },
        })
      }

      if (symbol && type === "stock") {
        return NextResponse.json({
          success: true,
          data: {
            quote: {
              symbol: symbol.toUpperCase(),
              price: 150.0 + Math.random() * 100,
              change: (Math.random() - 0.5) * 10,
              changePercent: (Math.random() - 0.5) * 5,
              volume: Math.floor(Math.random() * 1000000),
              lastUpdated: new Date().toISOString(),
            },
            profile: {
              name: `${symbol.toUpperCase()} Corporation`,
              marketCap: Math.floor(Math.random() * 100000000000),
              sector: "Technology",
              exchange: "NASDAQ",
            },
            technicals: null,
            governmentTrades: [],
            lastUpdated: new Date().toISOString(),
            isDemo: true,
          },
        })
      }
    }

    // If we have API keys, try to use the real data aggregator
    try {
      const dataAggregator = new MarketDataAggregator()

      if (symbol && type === "stock") {
        const stockData = await dataAggregator.getComprehensiveStockData(symbol.toUpperCase())
        return NextResponse.json({
          success: true,
          data: stockData,
        })
      } else if (type === "overview") {
        const marketData = await dataAggregator.getMarketOverview()
        return NextResponse.json({
          success: true,
          data: marketData,
        })
      }
    } catch (error) {
      console.error("Data aggregator error:", error)

      // Fall back to demo data if real APIs fail
      if (type === "overview") {
        return NextResponse.json({
          success: true,
          data: {
            governmentTrades: [
              {
                representative: "Demo User",
                ticker: "DEMO",
                transactionType: "buy",
                amount: "$1K - $15K",
                transactionDate: new Date().toISOString(),
              },
            ],
            lastUpdated: new Date().toISOString(),
            isDemo: true,
            error: "Live data temporarily unavailable - using demo data",
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch data",
          details: "API keys may be invalid or rate limited",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid request parameters",
        details: "Please provide valid symbol and type parameters",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Market data API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Market data service unavailable",
        details: "Internal server error occurred while processing market data request",
      },
      { status: 500 },
    )
  }
}

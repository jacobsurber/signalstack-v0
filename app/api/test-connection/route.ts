import { NextResponse } from "next/server"

interface ConnectionTest {
  service: string
  status: "connected" | "disconnected" | "error"
  lastChecked: string
  responseTime?: number
  error?: string
}

async function testOpenAI(): Promise<ConnectionTest> {
  const startTime = Date.now()
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your_")) {
      return {
        service: "OpenAI GPT-4",
        status: "disconnected",
        lastChecked: new Date().toISOString(),
        error: "API key not configured",
      }
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        service: "OpenAI GPT-4",
        status: "connected",
        lastChecked: new Date().toISOString(),
        responseTime,
      }
    } else {
      return {
        service: "OpenAI GPT-4",
        status: "error",
        lastChecked: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    return {
      service: "OpenAI GPT-4",
      status: "error",
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

async function testFinnhub(): Promise<ConnectionTest> {
  const startTime = Date.now()
  try {
    if (!process.env.FINNHUB_API_KEY || process.env.FINNHUB_API_KEY.includes("your_")) {
      return {
        service: "Finnhub Market Data",
        status: "disconnected",
        lastChecked: new Date().toISOString(),
        error: "API key not configured",
      }
    }

    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`, {
      signal: AbortSignal.timeout(5000),
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      if (data.c && data.c > 0) {
        return {
          service: "Finnhub Market Data",
          status: "connected",
          lastChecked: new Date().toISOString(),
          responseTime,
        }
      } else {
        return {
          service: "Finnhub Market Data",
          status: "error",
          lastChecked: new Date().toISOString(),
          responseTime,
          error: "Invalid response data",
        }
      }
    } else {
      return {
        service: "Finnhub Market Data",
        status: "error",
        lastChecked: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    return {
      service: "Finnhub Market Data",
      status: "error",
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

async function testAlphaVantage(): Promise<ConnectionTest> {
  const startTime = Date.now()
  try {
    if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY.includes("your_")) {
      return {
        service: "Alpha Vantage",
        status: "disconnected",
        lastChecked: new Date().toISOString(),
        error: "API key not configured",
      }
    }

    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
      {
        signal: AbortSignal.timeout(5000),
      },
    )

    const responseTime = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        return {
          service: "Alpha Vantage",
          status: "connected",
          lastChecked: new Date().toISOString(),
          responseTime,
        }
      } else {
        return {
          service: "Alpha Vantage",
          status: "error",
          lastChecked: new Date().toISOString(),
          responseTime,
          error: "Invalid response data",
        }
      }
    } else {
      return {
        service: "Alpha Vantage",
        status: "error",
        lastChecked: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    return {
      service: "Alpha Vantage",
      status: "error",
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

async function testUpstash(): Promise<ConnectionTest> {
  const startTime = Date.now()
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        service: "Upstash Redis Cache",
        status: "disconnected",
        lastChecked: new Date().toISOString(),
        error: "Redis credentials not configured",
      }
    }

    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      if (data.result === "PONG") {
        return {
          service: "Upstash Redis Cache",
          status: "connected",
          lastChecked: new Date().toISOString(),
          responseTime,
        }
      } else {
        return {
          service: "Upstash Redis Cache",
          status: "error",
          lastChecked: new Date().toISOString(),
          responseTime,
          error: "Invalid ping response",
        }
      }
    } else {
      return {
        service: "Upstash Redis Cache",
        status: "error",
        lastChecked: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    return {
      service: "Upstash Redis Cache",
      status: "error",
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

async function testQuiverQuant(): Promise<ConnectionTest> {
  const startTime = Date.now()
  try {
    if (!process.env.QUIVER_QUANT_API_KEY || process.env.QUIVER_QUANT_API_KEY.includes("your_")) {
      return {
        service: "Quiver Quant",
        status: "disconnected",
        lastChecked: new Date().toISOString(),
        error: "API key not configured",
      }
    }

    // Test with a simple endpoint
    const response = await fetch("https://api.quiverquant.com/beta/live/congresstrading", {
      headers: {
        Authorization: `Bearer ${process.env.QUIVER_QUANT_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        service: "Quiver Quant",
        status: "connected",
        lastChecked: new Date().toISOString(),
        responseTime,
      }
    } else {
      return {
        service: "Quiver Quant",
        status: "error",
        lastChecked: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    return {
      service: "Quiver Quant",
      status: "error",
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

export async function GET() {
  try {
    console.log("🔍 Testing API connections...")

    // Test all connections in parallel
    const [openai, finnhub, alphaVantage, upstash, quiverQuant] = await Promise.all([
      testOpenAI(),
      testAlphaVantage(),
      testFinnhub(),
      testUpstash(),
      testQuiverQuant(),
    ])

    const connections = [openai, finnhub, alphaVantage, upstash, quiverQuant]
    const connectedCount = connections.filter((conn) => conn.status === "connected").length
    const totalCount = connections.length

    let overallStatus: "LIVE" | "PARTIAL" | "OFFLINE"
    if (connectedCount === totalCount) {
      overallStatus = "LIVE"
    } else if (connectedCount > 0) {
      overallStatus = "PARTIAL"
    } else {
      overallStatus = "OFFLINE"
    }

    console.log(`✅ Connection test complete: ${connectedCount}/${totalCount} services connected (${overallStatus})`)

    return NextResponse.json({
      success: true,
      connections,
      overallStatus,
      summary: {
        connected: connectedCount,
        total: totalCount,
        status: overallStatus.toLowerCase(),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test connections",
        connections: [],
        overallStatus: "OFFLINE",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

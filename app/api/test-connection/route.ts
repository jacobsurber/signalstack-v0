import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get("service")

    if (!service) {
      return NextResponse.json({ connected: false, error: "No service specified" })
    }

    // Check if environment variable exists
    const apiKey = process.env[service]
    if (!apiKey || apiKey.includes("your_") || apiKey.includes("_here")) {
      return NextResponse.json({
        connected: false,
        error: "API key not configured or still contains placeholder text",
      })
    }

    // Test actual API connections
    let testResult = { connected: false, error: "Unknown error" }

    switch (service) {
      case "OPENAI_API_KEY":
        try {
          const response = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          })
          testResult = {
            connected: response.ok,
            error: response.ok ? undefined : `HTTP ${response.status}`,
          }
        } catch (error) {
          testResult = { connected: false, error: "Connection failed" }
        }
        break

      case "POLYGON_API_KEY":
        try {
          const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apikey=${apiKey}`)
          testResult = {
            connected: response.ok,
            error: response.ok ? undefined : `HTTP ${response.status}`,
          }
        } catch (error) {
          testResult = { connected: false, error: "Connection failed" }
        }
        break

      case "FINNHUB_API_KEY":
        try {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`)
          testResult = {
            connected: response.ok,
            error: response.ok ? undefined : `HTTP ${response.status}`,
          }
        } catch (error) {
          testResult = { connected: false, error: "Connection failed" }
        }
        break

      case "ALPHA_VANTAGE_API_KEY":
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`,
          )
          const data = await response.json()
          testResult = {
            connected: !data["Error Message"] && !data["Note"],
            error: data["Error Message"] || data["Note"] || (response.ok ? undefined : `HTTP ${response.status}`),
          }
        } catch (error) {
          testResult = { connected: false, error: "Connection failed" }
        }
        break

      case "QUIVER_QUANT_API_KEY":
        try {
          const response = await fetch("https://api.quiverquant.com/beta/live/congresstrading", {
            headers: { Authorization: `Bearer ${apiKey}` },
          })
          testResult = {
            connected: response.ok,
            error: response.ok ? undefined : `HTTP ${response.status}`,
          }
        } catch (error) {
          testResult = { connected: false, error: "Connection failed" }
        }
        break

      default:
        testResult = { connected: false, error: "Unknown service" }
    }

    return NextResponse.json(testResult)
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Test failed",
    })
  }
}

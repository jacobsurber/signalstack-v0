import { NextResponse } from "next/server"

export async function GET() {
  try {
    const connections = {
      openai: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_"),
      finnhub: !!process.env.FINNHUB_API_KEY && !process.env.FINNHUB_API_KEY.includes("your_"),
      alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY && !process.env.ALPHA_VANTAGE_API_KEY.includes("your_"),
      quiverQuant: !!process.env.QUIVER_QUANT_API_KEY && !process.env.QUIVER_QUANT_API_KEY.includes("your_"),
      upstash: !!process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes("your_"),
    }

    console.log("Connection status:", connections)

    return NextResponse.json(connections)
  } catch (error) {
    console.error("Test connection error:", error)
    return NextResponse.json(
      {
        openai: false,
        finnhub: false,
        alphaVantage: false,
        quiverQuant: false,
        upstash: false,
        error: "Failed to check connections",
      },
      { status: 500 },
    )
  }
}

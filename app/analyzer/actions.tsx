"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const StockPickSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  entryPrice: z.number(),
  target: z.number(),
  stopLoss: z.number(),
  riskRewardRatio: z.string(),
  timeframe: z.string(),
  rationale: z.string(),
  tags: z.array(z.string()),
})

const StockPicksResponseSchema = z.object({
  picks: z.array(StockPickSchema),
})

interface FormData {
  timeframe: string
  riskAppetite: string
  catalystType: string
  sectorPreference: string
}

export async function generateStockPicks(formData: FormData) {
  const prompt = `You are an expert stock analyst and swing trader. Generate 3-4 realistic stock trade recommendations based on the following criteria:

Timeframe: ${formData.timeframe}
Risk Appetite: ${formData.riskAppetite}
Catalyst Type: ${formData.catalystType}
Sector Preference: ${formData.sectorPreference}

For each stock pick, provide:
- A real ticker symbol and company name
- Realistic entry price, target price, and stop loss based on current market conditions
- Risk/reward ratio (e.g., "1:2.5", "1:3")
- Timeframe that matches the user's selection
- A clear, concise rationale (1-2 sentences) explaining why this is a good trade
- Relevant tags based on the setup type (e.g., "Breakout Setup", "Gov Trade Signal", "Earnings Play", "Technical Bounce", "Sector Rotation")

Make the recommendations specific to the catalyst type:
- Technical: Focus on chart patterns, support/resistance, momentum
- Earnings: Focus on upcoming earnings plays and historical patterns
- Gov Trades: Focus on stocks with recent government/insider activity
- Sector Momentum: Focus on sector rotation and relative strength

Adjust risk levels based on appetite:
- Conservative: Lower volatility stocks, tighter stops, modest targets
- Moderate: Balanced risk/reward, established companies
- Aggressive: Higher volatility, wider stops, ambitious targets

Use realistic current market prices and make sure the math works for risk/reward ratios.`

  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      prompt,
      schema: StockPicksResponseSchema,
    })

    return result.object.picks
  } catch (error) {
    console.error("Error generating stock picks:", error)
    throw new Error("Failed to generate stock picks")
  }
}

import { z } from "zod"

export const RiskCalculationSchema = z.object({
  entryPrice: z.number(),
  targetPrice: z.number(),
  stopLossPrice: z.number(),
  probabilityOfSuccess: z.number().min(0).max(100),
  volatilityProfile: z.enum(["low", "medium", "high"]),
  supportingFactors: z.array(z.string()),
  technicalSetup: z.string(),
  riskRewardRatio: z.number(),
})

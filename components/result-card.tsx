import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Target, Shield, Clock, TrendingUp, Zap, BarChart3 } from "lucide-react"
import { LiveDataIndicator } from "./live-data-indicator"

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
  volatilityProfile?: string
}

interface ResultCardProps {
  pick: StockPick
  className?: string
  isLiveData?: boolean
  dataTimestamp?: string
  configuration?: {
    timeframe: string
    riskAppetite: string
    catalystType: string
    sectorPreference: string
  }
}

export function ResultCard({ pick, className = "", isLiveData, dataTimestamp, configuration }: ResultCardProps) {
  // Calculate percentage gains for visual context
  const potentialGain = ((pick.targetPrice - pick.entryPrice) / pick.entryPrice) * 100
  const maxLoss = ((pick.entryPrice - pick.stopLossPrice) / pick.entryPrice) * 100

  // Determine confidence level based on probability and R/R ratio
  const confidenceLevel = pick.probabilityOfSuccess
    ? pick.probabilityOfSuccess >= 70
      ? "high"
      : pick.probabilityOfSuccess >= 50
        ? "medium"
        : "low"
    : pick.riskRewardRatio >= 2.5
      ? "medium"
      : "low"

  const confidenceColor = {
    high: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-red-50 text-red-700 border-red-200",
  }[confidenceLevel]

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {pick.ticker}
              {pick.probabilityOfSuccess && (
                <Badge variant="outline" className={`text-xs ${confidenceColor}`}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {pick.probabilityOfSuccess}% Success
                </Badge>
              )}
            </CardTitle>
            <p className="text-muted-foreground text-sm font-medium">{pick.companyName}</p>
          </div>
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {pick.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <LiveDataIndicator isLiveData={isLiveData ?? true} timestamp={dataTimestamp} />
          <div className="flex items-center gap-2">
            {pick.volatilityProfile && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="h-3 w-3 mr-1" />
                {pick.volatilityProfile} Vol
              </Badge>
            )}
            {isLiveData && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                AI Risk Calculated
              </Badge>
            )}
          </div>
        </div>
        {/* Configuration Used */}
        {configuration && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {configuration.timeframe}
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {configuration.riskAppetite}
            </Badge>
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              {configuration.catalystType}
            </Badge>
            {configuration.sectorPreference !== "all" && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {configuration.sectorPreference}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                Entry
              </span>
            </div>
            <p className="text-lg font-bold text-green-800 dark:text-green-300">${pick.entryPrice.toFixed(2)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Live Price</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                Target
              </span>
            </div>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-300">${pick.targetPrice.toFixed(2)}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+{potentialGain.toFixed(1)}%</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                Stop Loss
              </span>
            </div>
            <p className="text-lg font-bold text-red-800 dark:text-red-300">${pick.stopLossPrice.toFixed(2)}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">-{maxLoss.toFixed(1)}%</p>
          </div>
        </div>

        {/* Enhanced Risk/Reward and Probability */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-foreground">Risk/Reward</span>
            </div>
            <Badge variant="outline" className="font-mono text-sm px-3 py-1">
              1:{pick.riskRewardRatio.toFixed(2)}
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            {pick.probabilityOfSuccess && (
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{pick.probabilityOfSuccess}%</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{pick.timeframe}</span>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">AI Analysis</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-3 border-l-2 border-muted">{pick.rationale}</p>
        </div>

        {/* Enhanced Stats Footer */}
        <div className="pt-4 border-t border-muted/50">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span>
              Potential Return: <span className="font-semibold text-green-600">+{potentialGain.toFixed(1)}%</span>
            </span>
            <span>
              Max Risk: <span className="font-semibold text-red-600">-{maxLoss.toFixed(1)}%</span>
            </span>
          </div>
          {pick.probabilityOfSuccess && (
            <div className="text-center">
              <Badge variant="outline" className={`text-xs ${confidenceColor}`}>
                {confidenceLevel.toUpperCase()} Confidence - {pick.probabilityOfSuccess}% Success Probability
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

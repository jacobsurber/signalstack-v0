"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  Target,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
  AlertTriangle,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface StockPick {
  ticker: string
  companyName: string
  entryPrice: number
  target?: number
  targetPrice?: number
  stopLoss?: number
  stopLossPrice?: number
  riskRewardRatio: number | string
  timeframe: string
  rationale: string
  tags: string[]
  probabilityOfSuccess?: number
  volatilityProfile?: string
  marketCapBillion?: number
  sector?: string
  catalysts?: string[]
  technicalSignals?: string[]
  riskFactors?: string[]
}

interface ResultCardProps {
  pick: StockPick
  isLiveData?: boolean
  dataTimestamp?: string
  configuration?: any
}

export function ResultCard({ pick, isLiveData = false, dataTimestamp, configuration }: ResultCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isLearningMore, setIsLearningMore] = useState(false)

  // Calculate key metrics
  const potentialGain = (pick.targetPrice || pick.target || 0) - pick.entryPrice
  const potentialLoss = pick.entryPrice - (pick.stopLossPrice || pick.stopLoss || 0)
  const gainPercentage = ((potentialGain / pick.entryPrice) * 100).toFixed(1)
  const lossPercentage = ((potentialLoss / pick.entryPrice) * 100).toFixed(1)
  const riskReward =
    typeof pick.riskRewardRatio === "number"
      ? pick.riskRewardRatio
      : Number.parseFloat(pick.riskRewardRatio.toString()) || 0

  // Get risk level color
  const getRiskColor = (ratio: number) => {
    if (ratio >= 3) return "text-green-600 bg-green-50 border-green-200"
    if (ratio >= 2) return "text-blue-600 bg-blue-50 border-blue-200"
    if (ratio >= 1.5) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 65) return "text-blue-600"
    if (confidence >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const handleLearnMore = async () => {
    setIsLearningMore(true)
    // Simulate learning more action
    setTimeout(() => {
      setIsLearningMore(false)
      window.open(`https://finance.yahoo.com/quote/${pick.ticker}`, "_blank")
    }, 1000)
  }

  const handleBuyAction = () => {
    // Simulate buy action - could integrate with brokerage APIs
    window.open(`https://robinhood.com/stocks/${pick.ticker}`, "_blank")
  }

  return (
    <Card className="relative overflow-hidden">
      {isLiveData && (
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            LIVE
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">{pick.ticker}</CardTitle>
            <p className="text-sm text-muted-foreground">{pick.companyName}</p>
            <div className="flex items-center gap-2">
              {pick.sector && (
                <Badge variant="secondary" className="text-xs">
                  {pick.sector}
                </Badge>
              )}
              {pick.marketCapBillion && (
                <Badge variant="outline" className="text-xs">
                  ${pick.marketCapBillion.toFixed(1)}B
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${pick.entryPrice.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Entry Price</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Target</span>
            </div>
            <div className="text-lg font-bold text-green-600">${(pick.targetPrice || pick.target || 0).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">+{gainPercentage}% upside</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Stop Loss</span>
            </div>
            <div className="text-lg font-bold text-red-600">
              ${(pick.stopLossPrice || pick.stopLoss || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">-{lossPercentage}% risk</div>
          </div>
        </div>

        {/* Risk/Reward and Confidence */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">Risk/Reward</span>
            </div>
            <Badge className={`${getRiskColor(riskReward)} border font-bold`}>{riskReward.toFixed(1)}:1</Badge>
          </div>

          {pick.probabilityOfSuccess && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Confidence</span>
              </div>
              <div className={`text-lg font-bold ${getConfidenceColor(pick.probabilityOfSuccess)}`}>
                {pick.probabilityOfSuccess}%
              </div>
            </div>
          )}
        </div>

        {/* Timeframe */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">Timeframe:</span> {pick.timeframe}
          </span>
        </div>

        {/* Tags */}
        {pick.tags && pick.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pick.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {pick.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{pick.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Rationale Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Investment Thesis</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pick.rationale.length > 150 ? `${pick.rationale.substring(0, 150)}...` : pick.rationale}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Info className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {pick.ticker} - Detailed Analysis
                </DialogTitle>
                <DialogDescription>{pick.companyName}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Price Targets */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Entry</div>
                    <div className="text-lg font-bold">${pick.entryPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-green-50">
                    <div className="text-sm text-muted-foreground">Target</div>
                    <div className="text-lg font-bold text-green-600">
                      ${(pick.targetPrice || pick.target || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600">+{gainPercentage}%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-red-50">
                    <div className="text-sm text-muted-foreground">Stop Loss</div>
                    <div className="text-lg font-bold text-red-600">
                      ${(pick.stopLossPrice || pick.stopLoss || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-red-600">-{lossPercentage}%</div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Risk Assessment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Risk/Reward Ratio</div>
                      <Badge className={`${getRiskColor(riskReward)} border font-bold`}>
                        {riskReward.toFixed(1)}:1
                      </Badge>
                    </div>
                    {pick.probabilityOfSuccess && (
                      <div>
                        <div className="text-sm text-muted-foreground">Success Probability</div>
                        <div className="flex items-center gap-2">
                          <Progress value={pick.probabilityOfSuccess} className="flex-1" />
                          <span className={`text-sm font-bold ${getConfidenceColor(pick.probabilityOfSuccess)}`}>
                            {pick.probabilityOfSuccess}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Rationale */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Investment Thesis</h4>
                  <p className="text-sm leading-relaxed">{pick.rationale}</p>
                </div>

                {/* Catalysts */}
                {pick.catalysts && pick.catalysts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Key Catalysts
                    </h4>
                    <div className="space-y-2">
                      {pick.catalysts.map((catalyst, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{catalyst}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Signals */}
                {pick.technicalSignals && pick.technicalSignals.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Technical Signals
                    </h4>
                    <div className="space-y-2">
                      {pick.technicalSignals.map((signal, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {pick.riskFactors && pick.riskFactors.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Factors
                    </h4>
                    <div className="space-y-2">
                      {pick.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configuration Used */}
                {configuration && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Analysis Configuration</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <span className="ml-1 font-medium">{configuration.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk:</span>
                        <span className="ml-1 font-medium">{configuration.riskAppetite}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Method:</span>
                        <span className="ml-1 font-medium">{configuration.discoveryMethod}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <span className="ml-1 font-medium">{configuration.model || "gpt-4o"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Source */}
                {isLiveData && dataTimestamp && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Analysis generated with live market data at {new Date(dataTimestamp).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                {/* External Links */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://finance.yahoo.com/quote/${pick.ticker}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Yahoo Finance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://finviz.com/quote.ashx?t=${pick.ticker}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Finviz
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleBuyAction} className="flex-1">
            <DollarSign className="h-4 w-4 mr-2" />
            Buy Stock
          </Button>
        </div>

        {/* Data Source Indicator */}
        {isLiveData && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live data • Updated {dataTimestamp ? new Date(dataTimestamp).toLocaleTimeString() : "now"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

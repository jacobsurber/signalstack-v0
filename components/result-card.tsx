"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Target,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  Info,
  ExternalLink,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  BookOpen,
  ShoppingCart,
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
  configuration?: {
    timeframe: string
    riskAppetite: string
    catalystType: string
    sectorPreference: string
    discoveryMethod: string
  }
}

export function ResultCard({ pick, isLiveData = false, dataTimestamp, configuration }: ResultCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Normalize price fields
  const targetPrice = pick.targetPrice || pick.target || 0
  const stopLossPrice = pick.stopLossPrice || pick.stopLoss || 0
  const entryPrice = pick.entryPrice || 0

  // Calculate metrics
  const potentialGain = targetPrice - entryPrice
  const potentialLoss = entryPrice - stopLossPrice
  const gainPercentage = entryPrice > 0 ? ((potentialGain / entryPrice) * 100).toFixed(1) : "0.0"
  const lossPercentage = entryPrice > 0 ? ((potentialLoss / entryPrice) * 100).toFixed(1) : "0.0"

  // Risk level based on probability and R/R ratio
  const getRiskLevel = () => {
    const probability = pick.probabilityOfSuccess || 50
    const rrRatio =
      typeof pick.riskRewardRatio === "number"
        ? pick.riskRewardRatio
        : Number.parseFloat(pick.riskRewardRatio.toString()) || 1

    if (probability >= 75 && rrRatio >= 2) return { level: "LOW", color: "text-green-600", bg: "bg-green-50" }
    if (probability >= 60 && rrRatio >= 1.5) return { level: "MEDIUM", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { level: "HIGH", color: "text-red-600", bg: "bg-red-50" }
  }

  const riskLevel = getRiskLevel()

  // Format market cap
  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return "N/A"
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}T`
    if (marketCap >= 1) return `$${marketCap.toFixed(1)}B`
    return `$${(marketCap * 1000).toFixed(0)}M`
  }

  const handleLearnMore = () => {
    setIsModalOpen(true)
  }

  const handleBuyAction = () => {
    // In a real app, this would integrate with a brokerage API
    window.open(`https://finance.yahoo.com/quote/${pick.ticker}`, "_blank")
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {pick.ticker}
                {isLiveData && (
                  <Badge variant="outline" className="text-xs">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-1">{pick.companyName}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">${entryPrice.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Entry Price</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium text-green-600">+{gainPercentage}%</span>
              </div>
              <div className="text-xs text-muted-foreground">Target</div>
              <div className="text-sm font-bold">${targetPrice.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Shield className="h-3 w-3 text-red-600" />
                <span className="text-sm font-medium text-red-600">-{lossPercentage}%</span>
              </div>
              <div className="text-xs text-muted-foreground">Stop Loss</div>
              <div className="text-sm font-bold">${stopLossPrice.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <BarChart3 className="h-3 w-3 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {typeof pick.riskRewardRatio === "number" ? pick.riskRewardRatio.toFixed(1) : pick.riskRewardRatio}:1
                </span>
              </div>
              <div className="text-xs text-muted-foreground">R/R Ratio</div>
            </div>
          </div>

          <Separator />

          {/* Success Probability */}
          {pick.probabilityOfSuccess && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Success Probability
                </span>
                <span className="font-medium">{pick.probabilityOfSuccess}%</span>
              </div>
              <Progress value={pick.probabilityOfSuccess} className="h-2" />
            </div>
          )}

          {/* Tags and Risk Level */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {pick.tags?.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {pick.tags && pick.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{pick.tags.length - 3}
                </Badge>
              )}
            </div>
            <Badge className={`${riskLevel.color} ${riskLevel.bg} border-0`}>{riskLevel.level} RISK</Badge>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{pick.timeframe}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{formatMarketCap(pick.marketCapBillion)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleLearnMore} className="flex-1 bg-transparent">
              <BookOpen className="h-3 w-3 mr-1" />
              Learn More
            </Button>
            <Button size="sm" onClick={handleBuyAction} className="flex-1">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Buy
            </Button>
          </div>

          {/* Data Source Indicator */}
          {isLiveData && dataTimestamp && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Live data • {new Date(dataTimestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {pick.ticker} - Detailed Analysis
            </DialogTitle>
            <DialogDescription>{pick.companyName}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="catalysts">Catalysts</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">${entryPrice.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Entry Price</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">${targetPrice.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Target Price</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">${stopLossPrice.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Stop Loss</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {typeof pick.riskRewardRatio === "number"
                        ? pick.riskRewardRatio.toFixed(1)
                        : pick.riskRewardRatio}
                      :1
                    </div>
                    <div className="text-xs text-muted-foreground">Risk/Reward</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Company Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sector:</span>
                      <span>{pick.sector || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap:</span>
                      <span>{formatMarketCap(pick.marketCapBillion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeframe:</span>
                      <span>{pick.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span>{pick.probabilityOfSuccess || "N/A"}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Configuration Used</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {configuration && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Risk Appetite:</span>
                          <span className="capitalize">{configuration.riskAppetite}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Catalyst Type:</span>
                          <span className="capitalize">{configuration.catalystType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sector Pref:</span>
                          <span className="capitalize">{configuration.sectorPreference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discovery:</span>
                          <span className="capitalize">{configuration.discoveryMethod}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Investment Rationale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{pick.rationale}</p>
                </CardContent>
              </Card>

              {pick.technicalSignals && pick.technicalSignals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Technical Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pick.technicalSignals.map((signal, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="catalysts" className="space-y-4">
              {pick.catalysts && pick.catalysts.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Key Catalysts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pick.catalysts.map((catalyst, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{catalyst}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>No specific catalysts identified for this recommendation.</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Investment Risk Warning:</strong> All investments carry risk of loss. Past performance does
                  not guarantee future results. This is not financial advice.
                </AlertDescription>
              </Alert>

              {pick.riskFactors && pick.riskFactors.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pick.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    General market risks apply. Consider your risk tolerance before investing.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Risk Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maximum Loss:</span>
                    <span className="text-red-600 font-medium">-{lossPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Gain:</span>
                    <span className="text-green-600 font-medium">+{gainPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <Badge className={`${riskLevel.color} ${riskLevel.bg} border-0 text-xs`}>{riskLevel.level}</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Close
            </Button>
            <Button onClick={handleBuyAction} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Yahoo Finance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

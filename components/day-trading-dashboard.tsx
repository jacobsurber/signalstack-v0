"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Target, Shield, BarChart3, Volume2, Zap, Timer, DollarSign, AlertTriangle } from "lucide-react"

interface DayTradingAnalysis {
  analysis: {
    ticker: string
    strategy: string
    entryTime: string
    entryPrice: number
    targetPrice: number
    stopLoss: number
    exitTime: string
    riskReward: number
    confidence: number
    timeframe: string
    reasoning: string
    technicalSetup: string
    volumeConfirmation: boolean
    marketConditions: string
    riskLevel: string
    positionSize: number
    maxHoldTime: string
  }
  marketData: any
  technicalSignals: any
  marketSession: any
  riskManagement: any
  timing: any
}

export function DayTradingDashboard() {
  const [ticker, setTicker] = useState("")
  const [strategy, setStrategy] = useState("Auto-select Best")
  const [timeframe, setTimeframe] = useState("5min")
  const [riskAppetite, setRiskAppetite] = useState("moderate")
  const [analysis, setAnalysis] = useState<DayTradingAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!ticker.trim()) return

    setIsLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/day-trading-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          strategy: strategy || undefined,
          timeframe,
          riskAppetite,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Analysis failed")
      }

      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-50 text-green-700 border-green-200"
    if (confidence >= 70) return "bg-yellow-50 text-yellow-700 border-yellow-200"
    return "bg-red-50 text-red-700 border-red-200"
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-50 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Day Trading Technical Analysis</span>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Real-Time Data
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Get precise entry/exit times with comprehensive technical analysis for intraday trading
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Ticker</label>
              <Input
                placeholder="e.g., AAPL, TSLA, SPY"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Strategy</label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto-select Best">Auto-select Best</SelectItem>
                  <SelectItem value="MOMENTUM_BREAKOUT">Momentum Breakout</SelectItem>
                  <SelectItem value="SCALPING">Scalping</SelectItem>
                  <SelectItem value="MEAN_REVERSION">Mean Reversion</SelectItem>
                  <SelectItem value="GAP_TRADING">Gap Trading</SelectItem>
                  <SelectItem value="VWAP_STRATEGY">VWAP Strategy</SelectItem>
                  <SelectItem value="NEWS_MOMENTUM">News Momentum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1min">1 Minute</SelectItem>
                  <SelectItem value="5min">5 Minutes</SelectItem>
                  <SelectItem value="15min">15 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Appetite</label>
              <Select value={riskAppetite} onValueChange={setRiskAppetite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAnalyze} disabled={!ticker.trim() || isLoading} className="w-full">
                {isLoading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trade Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>{analysis.analysis.ticker} Trade Setup</span>
                </div>
                <Badge variant="outline" className={getConfidenceColor(analysis.analysis.confidence)}>
                  {analysis.analysis.confidence}% Confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strategy & Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Strategy</p>
                  <p className="font-semibold">{analysis.analysis.strategy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeframe</p>
                  <p className="font-semibold">{analysis.analysis.timeframe}</p>
                </div>
              </div>

              {/* Entry/Exit Times */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase">Entry Time</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">{analysis.analysis.entryTime}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase">Exit Time</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">{analysis.analysis.exitTime}</p>
                </div>
              </div>

              {/* Price Levels */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700 uppercase">Entry</span>
                  </div>
                  <p className="text-lg font-bold text-green-800">${analysis.analysis.entryPrice}</p>
                </div>

                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase">Target</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">${analysis.analysis.targetPrice}</p>
                </div>

                <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-700 uppercase">Stop</span>
                  </div>
                  <p className="text-lg font-bold text-red-800">${analysis.analysis.stopLoss}</p>
                </div>
              </div>

              {/* Risk Management */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Risk/Reward:</span>
                    <span className="font-semibold ml-2">1:{analysis.analysis.riskReward}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Position Size:</span>
                    <span className="font-semibold ml-2">{analysis.analysis.positionSize} shares</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Hold:</span>
                    <span className="font-semibold ml-2">{analysis.analysis.maxHoldTime}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Level:</span>
                    <Badge variant="outline" className={`ml-2 text-xs ${getRiskColor(analysis.analysis.riskLevel)}`}>
                      {analysis.analysis.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Technical Setup */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Technical Setup</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{analysis.analysis.technicalSetup}</p>
              </div>

              {/* Reasoning */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Analysis Reasoning</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{analysis.analysis.reasoning}</p>
              </div>
            </CardContent>
          </Card>

          {/* Technical Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Technical Indicators</span>
                <Badge variant="outline" className="text-xs">
                  {analysis.timing.marketTime}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Market Data */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="font-semibold">${analysis.marketData.currentPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bid/Ask</p>
                  <p className="font-semibold">
                    ${analysis.marketData.bid}/${analysis.marketData.ask}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">VWAP</p>
                  <p className="font-semibold">${analysis.marketData.vwap.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Day Range</p>
                  <p className="font-semibold">{analysis.marketData.dayRange}</p>
                </div>
              </div>

              {/* Technical Signals */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">RSI (14)</span>
                  <Badge
                    variant="outline"
                    className={
                      analysis.technicalSignals.rsi > 70
                        ? "bg-red-50 text-red-700"
                        : analysis.technicalSignals.rsi < 30
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-50 text-gray-700"
                    }
                  >
                    {analysis.technicalSignals.rsi.toFixed(1)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">MACD</span>
                  <Badge
                    variant="outline"
                    className={
                      analysis.technicalSignals.macd.histogram > 0
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }
                  >
                    {analysis.technicalSignals.macd.macd.toFixed(3)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Trend</span>
                  <Badge
                    variant="outline"
                    className={
                      analysis.technicalSignals.movingAverages.trend === "bullish"
                        ? "bg-green-50 text-green-700"
                        : analysis.technicalSignals.movingAverages.trend === "bearish"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                    }
                  >
                    {analysis.technicalSignals.movingAverages.trend.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <Volume2 className="h-4 w-4 mr-1" />
                    Volume Spike
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      analysis.technicalSignals.volumeProfile.volumeSpike
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-700"
                    }
                  >
                    {analysis.technicalSignals.volumeProfile.volumeSpike ? "YES" : "NO"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Volume Ratio</span>
                  <Badge variant="outline">{analysis.technicalSignals.volumeProfile.volumeRatio.toFixed(2)}x</Badge>
                </div>
              </div>

              {/* Market Session */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Market Session</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    {analysis.marketSession.current.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-blue-600">{analysis.marketSession.characteristics}</p>
                <p className="text-xs text-blue-600 mt-1">
                  <strong>Strategies:</strong> {analysis.marketSession.recommendedStrategies?.join(", ")}
                </p>
              </div>

              {/* Volume Confirmation */}
              {analysis.analysis.volumeConfirmation && (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Volume Confirmation: Strong</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

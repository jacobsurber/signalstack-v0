"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Activity, Target, AlertTriangle, Clock, BarChart3, Zap, RefreshCw } from "lucide-react"

interface TradingSignal {
  ticker: string
  signal: "BUY" | "SELL" | "HOLD"
  strength: number
  timeframe: string
  entry: number
  target: number
  stopLoss: number
  confidence: number
  strategy: string
}

interface MarketCondition {
  trend: "BULLISH" | "BEARISH" | "NEUTRAL"
  volatility: "LOW" | "MEDIUM" | "HIGH"
  volume: "LOW" | "MEDIUM" | "HIGH"
  sentiment: number
}

export function DayTradingDashboard() {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [marketConditions, setMarketConditions] = useState<MarketCondition>({
    trend: "NEUTRAL",
    volatility: "MEDIUM",
    volume: "MEDIUM",
    sentiment: 50,
  })
  const [selectedStrategy, setSelectedStrategy] = useState("scalping")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const strategies = [
    { value: "scalping", label: "Scalping (1-5 min)" },
    { value: "momentum", label: "Momentum (15-30 min)" },
    { value: "breakout", label: "Breakout (1-4 hours)" },
    { value: "reversal", label: "Mean Reversion" },
  ]

  const generateSignals = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockSignals: TradingSignal[] = [
        {
          ticker: "SPY",
          signal: "BUY",
          strength: 85,
          timeframe: "15m",
          entry: 485.5,
          target: 487.2,
          stopLoss: 484.8,
          confidence: 78,
          strategy: "Momentum Breakout",
        },
        {
          ticker: "QQQ",
          signal: "SELL",
          strength: 72,
          timeframe: "5m",
          entry: 395.8,
          target: 394.1,
          stopLoss: 396.5,
          confidence: 65,
          strategy: "RSI Overbought",
        },
        {
          ticker: "TSLA",
          signal: "BUY",
          strength: 90,
          timeframe: "30m",
          entry: 248.75,
          target: 252.3,
          stopLoss: 246.9,
          confidence: 82,
          strategy: "Volume Surge",
        },
      ]

      setSignals(mockSignals)
      setLastUpdate(new Date())

      // Update market conditions
      setMarketConditions({
        trend: Math.random() > 0.5 ? "BULLISH" : "BEARISH",
        volatility: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as any,
        volume: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as any,
        sentiment: Math.floor(Math.random() * 100),
      })
    } catch (error) {
      console.error("Error generating signals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateSignals()
    const interval = setInterval(generateSignals, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [selectedStrategy])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "bg-green-50 text-green-700 border-green-200"
      case "SELL":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "BULLISH":
        return "text-green-600"
      case "BEARISH":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor(marketConditions.trend)}`}>
              {marketConditions.trend}
            </div>
            <p className="text-xs text-muted-foreground">Current market direction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketConditions.volatility}</div>
            <p className="text-xs text-muted-foreground">Price movement intensity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketConditions.volume}</div>
            <p className="text-xs text-muted-foreground">Trading activity level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketConditions.sentiment}%</div>
            <Progress value={marketConditions.sentiment} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Market sentiment score</p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Signals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Trading Signals
              </CardTitle>
              <CardDescription>Real-time intraday trading opportunities</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={generateSignals} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Scanning..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signals" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signals">Active Signals</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="signals" className="space-y-4">
              {signals.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No active signals found. Market conditions may not be favorable for the selected strategy.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{signals.length} active signals</span>
                    <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                  </div>
                  {signals.map((signal, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{signal.ticker}</h3>
                            <Badge variant="outline" className={getSignalColor(signal.signal)}>
                              {signal.signal}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {signal.timeframe}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Strength</div>
                            <div className="text-lg font-bold">{signal.strength}%</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Entry</div>
                            <div className="font-medium">${signal.entry.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Target</div>
                            <div className="font-medium text-green-600">${signal.target.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Stop Loss</div>
                            <div className="font-medium text-red-600">${signal.stopLoss.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Confidence</div>
                            <div className="font-medium">{signal.confidence}%</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Strategy: {signal.strategy}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Add to Watchlist
                            </Button>
                            <Button size="sm">Execute Trade</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Watchlist feature coming soon. Add stocks to monitor for trading opportunities.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  Performance tracking coming soon. View your trading statistics and P&L here.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ResultCard } from "@/components/result-card"
import { LiveDataIndicator } from "@/components/live-data-indicator"
import { generateStockPicks, analyzeStock } from "./analyzer/actions"
import { TrendingUp, Target, BarChart3, Search, Sparkles, AlertCircle, CheckCircle, Clock, Brain } from "lucide-react"

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

interface AnalysisResult {
  ticker: string
  companyName: string
  currentPrice: number
  recommendation: "BUY" | "SELL" | "HOLD"
  targetPrice: number
  stopLoss: number
  confidence: number
  rationale: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  timeframe: string
  keyMetrics: {
    peRatio: number
    marketCap: string
    volume: string
    volatility: number
  }
  dataSource?: string
  timestamp?: string
}

export default function StockPickerPage() {
  // Set default values as requested
  const [timeframe, setTimeframe] = useState("3-days")
  const [riskAppetite, setRiskAppetite] = useState("aggressive")
  const [catalystType, setCatalystType] = useState("all")
  const [sectorPreference, setSectorPreference] = useState("all")
  const [discoveryMethod, setDiscoveryMethod] = useState("all")
  const [numberOfPicks, setNumberOfPicks] = useState("4")
  const [selectedModel, setSelectedModel] = useState("gpt-4o")

  const [stockPicks, setStockPicks] = useState<StockPick[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  // Individual stock analyzer
  const [analyzerTicker, setAnalyzerTicker] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const configuration = {
    timeframe,
    riskAppetite,
    catalystType,
    sectorPreference,
    discoveryMethod,
    model: selectedModel,
  }

  const handleGeneratePicks = async () => {
    setIsGenerating(true)
    setError(null)
    setStockPicks([])

    try {
      const formData = {
        timeframe,
        riskAppetite,
        catalystType,
        sectorPreference,
        discoveryMethod,
        numberOfPicks: Number.parseInt(numberOfPicks),
        model: selectedModel,
      }

      console.log("Generating picks with configuration:", formData)
      const picks = await generateStockPicks(formData)
      console.log("Received picks:", picks)

      setStockPicks(picks)
      setLastGenerated(new Date())
    } catch (err) {
      console.error("Error generating picks:", err)
      setError(err instanceof Error ? err.message : "Failed to generate stock picks")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnalyzeStock = async () => {
    if (!analyzerTicker.trim()) {
      setAnalysisError("Please enter a stock ticker")
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)

    try {
      console.log("Analyzing stock:", analyzerTicker.toUpperCase())
      const result = await analyzeStock(analyzerTicker.toUpperCase(), selectedModel)
      console.log("Analysis result:", result)
      setAnalysisResult(result)
    } catch (err) {
      console.error("Error analyzing stock:", err)
      setAnalysisError(err instanceof Error ? err.message : "Failed to analyze stock")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">AI Stock Picker</h1>
          </div>
          <div className="ml-auto">
            <LiveDataIndicator />
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Stock Picker</h2>
            <p className="text-muted-foreground">
              Generate personalized stock recommendations using advanced AI analysis and live market data.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Picks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockPicks.length}</div>
              <p className="text-xs text-muted-foreground">Generated recommendations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockPicks.length > 0
                  ? Math.round(
                      stockPicks.reduce((acc, pick) => acc + (pick.probabilityOfSuccess || 0), 0) / stockPicks.length,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">AI confidence level</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk/Reward</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockPicks.length > 0
                  ? (
                      stockPicks.reduce(
                        (acc, pick) => acc + (typeof pick.riskRewardRatio === "number" ? pick.riskRewardRatio : 0),
                        0,
                      ) / stockPicks.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">Risk to reward ratio</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastGenerated ? lastGenerated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </div>
              <p className="text-xs text-muted-foreground">Live data refresh</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Stock Discovery
                </CardTitle>
                <CardDescription>Configure your trading preferences and risk parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Latest, Fastest)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Balanced)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4 (Most Accurate)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {selectedModel === "gpt-4o" && "Latest model with enhanced reasoning and speed"}
                    {selectedModel === "gpt-4-turbo" && "Balanced performance and cost efficiency"}
                    {selectedModel === "gpt-4" && "Most accurate analysis with detailed insights"}
                    {selectedModel === "gpt-3.5-turbo" && "Cost-effective option for basic analysis"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Investment Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-day">1 Day (Day Trading)</SelectItem>
                      <SelectItem value="3-days">3 Days (Swing)</SelectItem>
                      <SelectItem value="1-week">1 Week (Short-term)</SelectItem>
                      <SelectItem value="1-month">1 Month (Medium-term)</SelectItem>
                      <SelectItem value="3-months">3 Months (Long-term)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk">Risk Appetite</Label>
                  <Select value={riskAppetite} onValueChange={setRiskAppetite}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (Lower Risk)</SelectItem>
                      <SelectItem value="moderate">Moderate (Balanced)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Higher Risk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="catalyst">Catalyst Type</Label>
                  <Select value={catalystType} onValueChange={setCatalystType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select catalyst" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Catalysts</SelectItem>
                      <SelectItem value="technical">Technical Breakouts</SelectItem>
                      <SelectItem value="earnings">Earnings Plays</SelectItem>
                      <SelectItem value="government">Government Trades</SelectItem>
                      <SelectItem value="sector">Sector Momentum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector Preference</Label>
                  <Select value={sectorPreference} onValueChange={setSectorPreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discovery">Discovery Method</Label>
                  <Select value={discoveryMethod} onValueChange={setDiscoveryMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="momentum">Momentum Scanning</SelectItem>
                      <SelectItem value="value">Value Screening</SelectItem>
                      <SelectItem value="growth">Growth Analysis</SelectItem>
                      <SelectItem value="contrarian">Contrarian Plays</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="picks">Number of Picks</Label>
                  <Select value={numberOfPicks} onValueChange={setNumberOfPicks}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Picks</SelectItem>
                      <SelectItem value="4">4 Picks</SelectItem>
                      <SelectItem value="6">6 Picks</SelectItem>
                      <SelectItem value="8">8 Picks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleGeneratePicks} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating AI Picks...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate AI Stock Picks ({selectedModel})
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Individual Stock Analyzer
                </CardTitle>
                <CardDescription>Analyze any stock with AI-powered insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">Stock Ticker</Label>
                  <Input
                    id="ticker"
                    placeholder="Enter ticker (e.g., AAPL)"
                    value={analyzerTicker}
                    onChange={(e) => setAnalyzerTicker(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && handleAnalyzeStock()}
                  />
                </div>

                <Button onClick={handleAnalyzeStock} disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analyze Stock ({selectedModel})
                    </>
                  )}
                </Button>

                {analysisError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{analysisError}</AlertDescription>
                  </Alert>
                )}

                {analysisResult && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{analysisResult.ticker}</h4>
                      <Badge
                        variant={
                          analysisResult.recommendation === "BUY"
                            ? "default"
                            : analysisResult.recommendation === "SELL"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {analysisResult.recommendation}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysisResult.companyName}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-medium ml-1">${analysisResult.currentPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-medium ml-1">${analysisResult.targetPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stop Loss:</span>
                        <span className="font-medium ml-1">${analysisResult.stopLoss.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-medium ml-1">{analysisResult.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{analysisResult.rationale}</p>
                    {analysisResult.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(analysisResult.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI-Generated Stock Recommendations
                </CardTitle>
                <CardDescription>
                  {stockPicks.length > 0
                    ? `${stockPicks.length} personalized recommendations based on your criteria`
                    : "Configure your preferences and generate AI-powered stock picks"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating && (
                  <div className="space-y-4">
                    {[...Array(Number.parseInt(numberOfPicks))].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </div>
                )}

                {!isGenerating && stockPicks.length === 0 && !error && (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">No stock picks yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure your preferences and click "Generate AI Stock Picks" to get started.
                    </p>
                  </div>
                )}

                {stockPicks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{stockPicks.length} picks generated with live data</span>
                      </div>
                      {lastGenerated && (
                        <span className="text-xs text-muted-foreground">{lastGenerated.toLocaleString()}</span>
                      )}
                    </div>
                    <Separator />
                    <div className="grid gap-4">
                      {stockPicks.map((pick, index) => (
                        <ResultCard
                          key={`${pick.ticker}-${index}`}
                          pick={pick}
                          isLiveData={true}
                          dataTimestamp={lastGenerated?.toISOString()}
                          configuration={configuration}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}

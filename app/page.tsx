"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, TrendingUp, Target, Moon, Sun, User, CheckCircle, Search, Cpu } from "lucide-react"
import { useTheme } from "next-themes"
import { ResultCard } from "@/components/result-card"
import { GovernmentTradesPanel } from "@/components/market-data-panel"
import { DayTradingDashboard } from "@/components/day-trading-dashboard"

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
}

interface FormData {
  timeframe: string
  riskAppetite: string
  catalystType: string
  sectorPreference: string
  discoveryMethod: string
}

interface ApiResponse {
  picks: StockPick[]
  generatedAt: string
  criteria: FormData
  marketContext?: {
    governmentTrades: any[]
    newsHeadlines: any[]
  }
  success: boolean
  error?: string
  message?: string
}

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo")
  const [formData, setFormData] = useState<FormData>({
    timeframe: "1-week",
    riskAppetite: "aggressive",
    catalystType: "all",
    sectorPreference: "all",
    discoveryMethod: "all",
  })
  const [picks, setPicks] = useState<StockPick[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stockTicker, setStockTicker] = useState("")
  const [isAnalyzingStock, setIsAnalyzingStock] = useState(false)
  const [stockAnalysis, setStockAnalysis] = useState<StockPick | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<{
    connected: number
    total: number
    status: "checking" | "connected" | "partial" | "error"
  }>({
    connected: 0,
    total: 5,
    status: "checking",
  })

  const checkConnectionStatus = async () => {
    const services = [
      "OPENAI_API_KEY",
      "POLYGON_API_KEY",
      "FINNHUB_API_KEY",
      "ALPHA_VANTAGE_API_KEY",
      "QUIVER_QUANT_API_KEY",
    ]

    const results = await Promise.allSettled(
      services.map((service) =>
        fetch(`/api/test-connection?service=${service}`)
          .then((res) => res.json())
          .then((data) => data.connected)
          .catch(() => false),
      ),
    )

    const connected = results.filter((result) => result.status === "fulfilled" && result.value).length

    setConnectionStatus({
      connected,
      total: services.length,
      status:
        connected === services.length ? "connected" : connected > 2 ? "partial" : connected > 0 ? "partial" : "error",
    })
  }

  useEffect(() => {
    checkConnectionStatus()
    // Check every 5 minutes
    const interval = setInterval(checkConnectionStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGeneratePicks = async () => {
    if (
      !formData.timeframe ||
      !formData.riskAppetite ||
      !formData.catalystType ||
      !formData.sectorPreference ||
      !formData.discoveryMethod
    ) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError(null)
    setPicks([]) // Clear previous picks

    try {
      console.log("Sending request to generate picks:", { ...formData, model: selectedModel })

      const response = await fetch("/api/generate-picks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, model: selectedModel }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error(`Expected JSON response, got: ${contentType}`)
      }

      const data: ApiResponse = await response.json()
      console.log("API response data:", data)

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to generate picks")
      }

      if (!data.picks || data.picks.length === 0) {
        throw new Error("No picks were generated")
      }

      setPicks(data.picks)
      console.log("Successfully set picks:", data.picks.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate picks. Please try again."
      console.error("Error generating picks:", err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeStock = async () => {
    if (!stockTicker.trim()) {
      return
    }

    setIsAnalyzingStock(true)
    setStockAnalysis(null)

    try {
      const response = await fetch("/api/analyze-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: stockTicker.toUpperCase(),
          timeframe: formData.timeframe || "2-weeks",
          riskAppetite: formData.riskAppetite || "moderate",
          discoveryMethod: formData.discoveryMethod || "all",
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze stock")
      }

      setStockAnalysis(data.analysis)
    } catch (err) {
      console.error("Error analyzing stock:", err)
      // Handle error silently or show notification
    } finally {
      setIsAnalyzingStock(false)
    }
  }

  const isFormValid =
    formData.timeframe &&
    formData.riskAppetite &&
    formData.catalystType &&
    formData.sectorPreference &&
    formData.discoveryMethod

  const availableModels = [
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Advanced reasoning (Default)" },
    { id: "gpt-4o", name: "GPT-4o", description: "Latest and most capable" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" },
    { id: "gpt-4", name: "GPT-4", description: "Reliable and consistent" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">Enhanced AI</span>
                <p className="text-xs text-muted-foreground">Multi-step analysis • Global market coverage</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* AI Model Selector */}
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Badge
                variant="outline"
                className={`text-xs ${
                  connectionStatus.status === "connected"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : connectionStatus.status === "partial"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : connectionStatus.status === "error"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {connectionStatus.status === "checking" && "Checking Connections..."}
                {connectionStatus.status === "connected" && "Live Data Active"}
                {connectionStatus.status === "partial" &&
                  `${connectionStatus.connected}/${connectionStatus.total} APIs Connected`}
                {connectionStatus.status === "error" && "Connection Issues"}
              </Badge>

              <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">trader_pro</span>
                  <span className="text-muted-foreground ml-2">3 trades • Today</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Professional Trader AI Analysis Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Advanced Multi-Step Market Analysis
              </h1>
              <p className="text-muted-foreground mt-2">
                S&P 500 • DJIA • NASDAQ • Russell 2000 • International ADRs • Small/Mid/Large Cap • Powered by{" "}
                {availableModels.find((m) => m.id === selectedModel)?.name}
              </p>
            </div>
          </div>

          {/* Individual Stock Analysis - Moved to Top */}
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                <Search className="h-5 w-5" />
                <span>Analyze Specific Stock</span>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {availableModels.find((m) => m.id === selectedModel)?.name}
                </Badge>
              </CardTitle>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Deep multi-step analysis for any publicly traded stock across global markets
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter stock ticker (e.g., AAPL, MSFT, TSLA, NVDA, SNOW)"
                  value={stockTicker}
                  onChange={(e) => setStockTicker(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAnalyzeStock()}
                  className="flex-1"
                />
                <Button
                  onClick={handleAnalyzeStock}
                  disabled={!stockTicker.trim() || isAnalyzingStock}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isAnalyzingStock ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deep Analysis...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {/* Individual Stock Analysis Result */}
              {stockAnalysis && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
                    Advanced Stock Analysis
                  </h3>
                  <ResultCard
                    pick={stockAnalysis}
                    isLiveData={true}
                    dataTimestamp={new Date().toISOString()}
                    configuration={formData}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Form with Generate Button and Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Configure Global Market Analysis</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {availableModels.find((m) => m.id === selectedModel)?.name}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced reasoning across 2000+ stocks • Quality over speed • Multi-step analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeframe</label>
                  <Select value={formData.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-day">Short Term (1 Day)</SelectItem>
                      <SelectItem value="3-days">Quick Swing (3 Days)</SelectItem>
                      <SelectItem value="1-week">Short Hold (1 Week)</SelectItem>
                      <SelectItem value="2-weeks">Medium Hold (2 Weeks)</SelectItem>
                      <SelectItem value="1-month">Extended Hold (1 Month)</SelectItem>
                      <SelectItem value="2-months">Long Hold (2 Months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Appetite</label>
                  <Select
                    value={formData.riskAppetite}
                    onValueChange={(value) => handleInputChange("riskAppetite", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Catalyst Type</label>
                  <Select
                    value={formData.catalystType}
                    onValueChange={(value) => handleInputChange("catalystType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select catalyst" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Catalysts</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="earnings">Earnings</SelectItem>
                      <SelectItem value="gov-trades">Gov Trades</SelectItem>
                      <SelectItem value="sector-momentum">Sector Momentum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sector Preference</label>
                  <Select
                    value={formData.sectorPreference}
                    onValueChange={(value) => handleInputChange("sectorPreference", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="financials">Financials</SelectItem>
                      <SelectItem value="biotech">Biotech</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="industrials">Industrials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Discovery Method</label>
                  <Select
                    value={formData.discoveryMethod}
                    onValueChange={(value) => handleInputChange("discoveryMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discovery method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="emerging-growth">Emerging Growth</SelectItem>
                      <SelectItem value="international-plays">International Plays</SelectItem>
                      <SelectItem value="sector-rotation">Sector Rotation</SelectItem>
                      <SelectItem value="thematic-plays">Thematic Plays</SelectItem>
                      <SelectItem value="undervalued-gems">Undervalued Gems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGeneratePicks}
                  disabled={!isFormValid || isLoading}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deep Market Analysis in Progress...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Generate Advanced Picks
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Picks Results - Inside Configuration Card */}
              {picks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-muted/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground">Advanced Market Analysis Results</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {picks.length} high-conviction pick{picks.length !== 1 ? "s" : ""} • Multi-step analysis
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {availableModels.find((m) => m.id === selectedModel)?.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {picks.map((pick, index) => (
                      <ResultCard
                        key={`${pick.ticker}-${index}`}
                        pick={pick}
                        isLiveData={true}
                        dataTimestamp={new Date().toISOString()}
                        configuration={formData}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Day Trading Dashboard */}
          <DayTradingDashboard />

          {/* Government Trades Panel */}
          <GovernmentTradesPanel />

          {/* Professional Guarantee */}
          <Card className="bg-muted/50">
            <CardContent className="py-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Advanced Analysis Guarantee:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Multi-step reasoning across 2000+ stocks from S&P 500, DJIA, NASDAQ, Russell 2000, and international
                    markets. Advanced GPT-4 Turbo analysis with comprehensive technical, fundamental, and government
                    trading data integration. Quality-focused approach prioritizing deep analysis over speed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

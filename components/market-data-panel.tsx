"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, RefreshCw, Users, AlertCircle } from "lucide-react"

interface MarketData {
  governmentTrades: Array<{
    representative: string
    ticker: string
    transactionType: "buy" | "sell"
    amount: string
    transactionDate: string
  }>
  lastUpdated: string
}

export function GovernmentTradesPanel() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchMarketData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/market-data?type=overview")

      // Check if response is ok first
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(`Expected JSON response, got: ${contentType}. Response: ${text.substring(0, 100)}...`)
      }

      const data = await response.json()

      if (data.success) {
        setMarketData(data.data)
        setLastRefresh(new Date())
      } else {
        throw new Error(data.error || "Failed to fetch market data")
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch market data"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    // Refresh every 10 minutes for live data
    const interval = setInterval(fetchMarketData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Recent Government Trades</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            Live Data
          </Badge>
          <Button variant="ghost" size="sm" onClick={fetchMarketData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {marketData?.governmentTrades.length ? (
          marketData.governmentTrades.slice(0, 8).map((trade, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {trade.ticker}
                  </Badge>
                  <Badge variant={trade.transactionType === "buy" ? "default" : "secondary"} className="text-xs">
                    {trade.transactionType === "buy" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {trade.transactionType.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trade.representative} • {trade.amount}
                </p>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {new Date(trade.transactionDate).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading live government trades...</span>
              </div>
            ) : error ? (
              "Unable to load government trades"
            ) : (
              "No government trades available"
            )}
          </div>
        )}

        {lastRefresh && !error && (
          <div className="pt-3 border-t border-muted/50">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

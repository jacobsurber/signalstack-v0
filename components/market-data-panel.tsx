"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react"

interface ConnectionStatus {
  service: string
  status: "connected" | "disconnected" | "error"
  lastChecked: Date
  responseTime?: number
  errorMessage?: string
}

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
}

export function MarketDataPanel() {
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    {
      service: "OpenAI GPT-4",
      status: "disconnected",
      lastChecked: new Date(),
    },
    {
      service: "Finnhub",
      status: "disconnected",
      lastChecked: new Date(),
    },
    {
      service: "Alpha Vantage",
      status: "disconnected",
      lastChecked: new Date(),
    },
    {
      service: "Upstash Redis",
      status: "disconnected",
      lastChecked: new Date(),
    },
  ])

  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const checkConnections = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/test-connection")
      const data = await response.json()

      const updatedConnections = connections.map((conn) => {
        let status: "connected" | "disconnected" | "error" = "disconnected"
        let responseTime: number | undefined
        let errorMessage: string | undefined

        switch (conn.service) {
          case "OpenAI GPT-4":
            status = data.openai ? "connected" : "disconnected"
            responseTime = data.openaiResponseTime
            errorMessage = data.openaiError
            break
          case "Finnhub":
            status = data.finnhub ? "connected" : "disconnected"
            responseTime = data.finnhubResponseTime
            errorMessage = data.finnhubError
            break
          case "Alpha Vantage":
            status = data.alphaVantage ? "connected" : "disconnected"
            responseTime = data.alphaVantageResponseTime
            errorMessage = data.alphaVantageError
            break
          case "Upstash Redis":
            status = data.upstash ? "connected" : "disconnected"
            responseTime = data.upstashResponseTime
            errorMessage = data.upstashError
            break
        }

        return {
          ...conn,
          status,
          responseTime,
          errorMessage,
          lastChecked: new Date(),
        }
      })

      setConnections(updatedConnections)
      setLastUpdate(new Date())

      // Simulate market data if we have connections
      if (updatedConnections.some((conn) => conn.status === "connected")) {
        const mockMarketData: MarketData[] = [
          {
            symbol: "SPY",
            price: 485.67,
            change: 2.34,
            changePercent: 0.48,
            volume: 45678900,
            marketCap: "485.2B",
          },
          {
            symbol: "QQQ",
            price: 395.23,
            change: -1.87,
            changePercent: -0.47,
            volume: 32456780,
            marketCap: "195.8B",
          },
          {
            symbol: "AAPL",
            price: 178.45,
            change: 0.89,
            changePercent: 0.5,
            volume: 67890123,
            marketCap: "2.8T",
          },
        ]
        setMarketData(mockMarketData)
      }
    } catch (error) {
      console.error("Error checking connections:", error)
      setConnections((prev) =>
        prev.map((conn) => ({
          ...conn,
          status: "error",
          errorMessage: "Connection failed",
          lastChecked: new Date(),
        })),
      )
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnections()
    const interval = setInterval(checkConnections, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-50 text-green-700 border-green-200"
      case "disconnected":
        return "bg-red-50 text-red-700 border-red-200"
      case "error":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const connectedCount = connections.filter((conn) => conn.status === "connected").length
  const totalConnections = connections.length

  return (
    <div className="space-y-6">
      {/* Connection Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            {connectedCount === totalConnections ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : connectedCount > 0 ? (
              <Database className="h-4 w-4 text-yellow-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectedCount}/{totalConnections}
            </div>
            <p className="text-xs text-muted-foreground">APIs connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectedCount > 0 ? Math.round((connectedCount / totalConnections) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Live data coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastUpdate.toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">System refresh</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Provider Status</CardTitle>
              <CardDescription>Monitor the health of all connected data sources</CardDescription>
            </div>
            <Button onClick={checkConnections} disabled={isChecking} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="status">Connection Status</TabsTrigger>
              <TabsTrigger value="data">Live Data</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="space-y-3">
                {connections.map((connection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(connection.status)}
                      <div>
                        <div className="font-medium">{connection.service}</div>
                        <div className="text-sm text-muted-foreground">
                          Last checked: {connection.lastChecked.toLocaleTimeString()}
                          {connection.responseTime && ` • ${connection.responseTime}ms`}
                        </div>
                        {connection.errorMessage && (
                          <div className="text-xs text-red-600">{connection.errorMessage}</div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(connection.status)}>
                      {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>

              {connectedCount === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No data providers are currently connected. Add your API keys to the environment variables to enable
                    live data features.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              {marketData.length > 0 ? (
                <div className="space-y-3">
                  {marketData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{data.symbol}</div>
                          <div className="text-sm text-muted-foreground">Market Cap: {data.marketCap}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${data.price.toFixed(2)}</div>
                        <div
                          className={`text-sm flex items-center ${
                            data.change >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {data.change >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {data.change >= 0 ? "+" : ""}
                          {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No live market data available. Connect to data providers to see real-time market information.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

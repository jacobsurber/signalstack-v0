"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Brain,
  TrendingUp,
  Shield,
  RefreshCw,
  Wifi,
} from "lucide-react"

interface ConnectionStatus {
  service: string
  status: "connected" | "partial" | "disconnected" | "error"
  responseTime?: number
  lastChecked: string
  error?: string
}

interface ConnectionResponse {
  success: boolean
  connections: ConnectionStatus[]
  overallStatus: "LIVE" | "PARTIAL" | "OFFLINE"
  summary: {
    connected: number
    total: number
    status: string
  }
  timestamp: string
}

export function LiveDataIndicator() {
  const [overallStatus, setOverallStatus] = useState<"LIVE" | "PARTIAL" | "OFFLINE" | "UNKNOWN">("UNKNOWN")
  const [connections, setConnections] = useState<ConnectionStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const checkConnections = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Checking API connections...")
      const response = await fetch("/api/test-connection", {
        method: "GET",
        cache: "no-cache",
      })

      if (response.ok) {
        const data: ConnectionResponse = await response.json()
        console.log("✅ Connection check response:", data)

        setConnections(data.connections || [])
        setOverallStatus(data.overallStatus || "UNKNOWN")
        setLastUpdate(new Date())
      } else {
        console.error("❌ Connection check failed:", response.status)
        setOverallStatus("OFFLINE")
        setConnections([])
      }
    } catch (error) {
      console.error("❌ Connection check error:", error)
      setOverallStatus("UNKNOWN")
      setConnections([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnections()
    const interval = setInterval(checkConnections, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE":
      case "connected":
        return "bg-green-500 hover:bg-green-600"
      case "PARTIAL":
      case "partial":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "OFFLINE":
      case "disconnected":
      case "error":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "LIVE":
      case "connected":
        return <Wifi className="w-4 h-4" />
      case "PARTIAL":
      case "partial":
        return <Activity className="w-4 h-4" />
      case "OFFLINE":
      case "disconnected":
      case "error":
        return <WifiOff className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes("OpenAI")) return Brain
    if (serviceName.includes("Finnhub")) return TrendingUp
    if (serviceName.includes("Alpha")) return Activity
    if (serviceName.includes("Upstash")) return Database
    if (serviceName.includes("Quiver")) return Shield
    return Activity
  }

  const connectedServices = connections.filter((c) => c.status === "connected").length
  const totalServices = connections.length
  const connectionPercentage = totalServices > 0 ? (connectedServices / totalServices) * 100 : 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative ${getStatusColor(overallStatus)} text-white border-0 hover:opacity-90 transition-all`}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <>
              {getStatusIcon(overallStatus)}
              <span className="ml-2 font-medium">{overallStatus}</span>
              {overallStatus === "LIVE" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Data Connection Status
          </DialogTitle>
          <DialogDescription>Monitor your API connections and data provider status in real-time</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Overall Status</CardTitle>
                <Badge className={`${getStatusColor(overallStatus)} text-white border-0`}>{overallStatus}</Badge>
              </div>
              <CardDescription>
                {connectedServices} of {totalServices} services connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Connection Health</span>
                  <span>{Math.round(connectionPercentage)}%</span>
                </div>
                <Progress value={connectionPercentage} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            </CardContent>
          </Card>

          {/* Individual Service Status */}
          <div className="space-y-3">
            <h4 className="font-semibold">Service Details</h4>
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Checking connections...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {connections.map((connection, index) => {
                  const IconComponent = getServiceIcon(connection.service)
                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getStatusColor(connection.status)} text-white`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{connection.service}</p>
                            <p className="text-sm text-muted-foreground">
                              {connection.service.includes("OpenAI") && "AI-powered stock analysis and recommendations"}
                              {connection.service.includes("Finnhub") && "Real-time stock prices and company data"}
                              {connection.service.includes("Alpha") && "Technical indicators and historical data"}
                              {connection.service.includes("Upstash") && "Intelligent caching for cost optimization"}
                              {connection.service.includes("Quiver") && "Government trading activity data"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(connection.status)} text-white border-0`}
                          >
                            {connection.status.toUpperCase()}
                          </Badge>
                          {connection.responseTime && (
                            <p className="text-xs text-muted-foreground mt-1">{connection.responseTime}ms</p>
                          )}
                        </div>
                      </div>
                      {connection.error && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{connection.error}</AlertDescription>
                        </Alert>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Status Messages */}
          <div className="space-y-3">
            {overallStatus === "LIVE" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🎉 All systems operational! You're receiving live market data and AI analysis with intelligent
                  caching.
                </AlertDescription>
              </Alert>
            )}

            {overallStatus === "PARTIAL" && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  ⚠️ Some services are unavailable. The system will use cached data and fallback providers where
                  possible.
                </AlertDescription>
              </Alert>
            )}

            {overallStatus === "OFFLINE" && (
              <Alert className="border-red-200 bg-red-50">
                <WifiOff className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  🔴 Data sources are offline. Please check your API configuration in the .env.local file.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Benefits of Live Data */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              System Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Real-time Analysis</p>
                  <p className="text-muted-foreground">Current market prices and live data</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">AI-Powered Insights</p>
                  <p className="text-muted-foreground">Advanced GPT-4 analysis with model selection</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Cost Optimization</p>
                  <p className="text-muted-foreground">Intelligent caching with Upstash Redis</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Technical Indicators</p>
                  <p className="text-muted-foreground">Professional-grade analysis tools</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={checkConnections} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Status
            </Button>
            <p className="text-xs text-muted-foreground">Auto-refresh every 30 seconds</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

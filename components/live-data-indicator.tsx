"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle, Activity, Database, Zap } from "lucide-react"

interface ConnectionStatus {
  service: string
  status: "connected" | "disconnected" | "error"
  lastChecked: string
  responseTime?: number
  error?: string
}

export function LiveDataIndicator() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const checkConnections = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-connection", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConnectionStatus(data.connections || [])
        setLastUpdate(new Date())
      } else {
        console.error("Failed to check connections:", response.status)
        setConnectionStatus([
          {
            service: "API Connection",
            status: "error",
            lastChecked: new Date().toISOString(),
            error: `HTTP ${response.status}`,
          },
        ])
      }
    } catch (error) {
      console.error("Connection check failed:", error)
      setConnectionStatus([
        {
          service: "API Connection",
          status: "error",
          lastChecked: new Date().toISOString(),
          error: "Network error",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnections()
    // Check connections every 5 minutes
    const interval = setInterval(checkConnections, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getOverallStatus = () => {
    if (connectionStatus.length === 0) return "unknown"
    if (connectionStatus.every((conn) => conn.status === "connected")) return "connected"
    if (connectionStatus.some((conn) => conn.status === "connected")) return "partial"
    return "disconnected"
  }

  const overallStatus = getOverallStatus()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "disconnected":
        return <XCircle className="h-3 w-3 text-red-600" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-600" />
      default:
        return <AlertCircle className="h-3 w-3 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600 bg-green-50 border-green-200"
      case "partial":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "disconnected":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getMainIcon = () => {
    switch (overallStatus) {
      case "connected":
        return <Wifi className="h-3 w-3" />
      case "partial":
        return <Activity className="h-3 w-3" />
      case "disconnected":
        return <WifiOff className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getStatusText = () => {
    switch (overallStatus) {
      case "connected":
        return "LIVE"
      case "partial":
        return "PARTIAL"
      case "disconnected":
        return "OFFLINE"
      default:
        return "UNKNOWN"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={`${getStatusColor(overallStatus)} border`}>
          {getMainIcon()}
          <span className="ml-1 text-xs font-medium">{getStatusText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Connection Status
                </CardTitle>
                <CardDescription className="text-xs">
                  {lastUpdate ? `Last checked: ${lastUpdate.toLocaleTimeString()}` : "Checking connections..."}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={checkConnections} disabled={isLoading} className="h-8 w-8 p-0">
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectionStatus.length === 0 ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">Checking connections...</p>
              </div>
            ) : (
              <>
                {connectionStatus.map((connection, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        <span className="text-sm font-medium">{connection.service}</span>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            connection.status === "connected"
                              ? "text-green-600 border-green-200"
                              : connection.status === "error"
                                ? "text-red-600 border-red-200"
                                : "text-yellow-600 border-yellow-200"
                          }`}
                        >
                          {connection.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {connection.responseTime && (
                      <div className="text-xs text-muted-foreground ml-5">
                        Response time: {connection.responseTime}ms
                      </div>
                    )}
                    {connection.error && <div className="text-xs text-red-600 ml-5">Error: {connection.error}</div>}
                    {index < connectionStatus.length - 1 && <Separator />}
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Overall Status:</span>
                    <Badge className={getStatusColor(overallStatus)}>{getStatusText()}</Badge>
                  </div>

                  {overallStatus === "connected" && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 text-xs">
                        All data sources are connected. You're receiving live market data.
                      </AlertDescription>
                    </Alert>
                  )}

                  {overallStatus === "partial" && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 text-xs">
                        Some data sources are unavailable. Analysis may use cached or fallback data.
                      </AlertDescription>
                    </Alert>
                  )}

                  {overallStatus === "disconnected" && (
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 text-xs">
                        Data sources are offline. Please check your API configuration.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>Live data updates every 15 minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    <span>Cached data used when APIs are unavailable</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

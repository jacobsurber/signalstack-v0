"use client"

import { useEffect, useState } from "react"
import { Dot } from "lucide-react"

interface LiveDataIndicatorProps {
  isLiveData: boolean
  timestamp?: string
}

export function LiveDataIndicator({ isLiveData, timestamp }: LiveDataIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null)

  useEffect(() => {
    if (timestamp) {
      const interval = setInterval(() => {
        const then = new Date(timestamp).getTime()
        const now = new Date().getTime()
        const seconds = Math.floor((now - then) / 1000)
        if (seconds < 60) {
          setTimeAgo(`${seconds} seconds ago`)
        } else if (seconds < 3600) {
          setTimeAgo(`${Math.floor(seconds / 60)} minutes ago`)
        } else {
          setTimeAgo(`${Math.floor(seconds / 3600)} hours ago`)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
    return () => {}
  }, [timestamp])

  return (
    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
      {isLiveData ? (
        <>
          <Dot className="h-3 w-3 animate-pulse text-green-500" />
          <span>Live Data</span>
          {timeAgo && <span>• Updated {timeAgo}</span>}
        </>
      ) : (
        <span>Historical Data</span>
      )}
    </div>
  )
}

import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const db = new DatabaseService()
    const analytics = await db.getPerformanceAnalytics(userId)

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

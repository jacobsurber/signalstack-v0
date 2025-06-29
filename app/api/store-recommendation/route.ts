import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { userId, recommendation, criteria } = await request.json()

    if (!userId || !recommendation || !criteria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = new DatabaseService()
    const stored = await db.storeRecommendation(userId, recommendation, criteria)

    return NextResponse.json({
      success: true,
      recommendation: stored,
    })
  } catch (error) {
    console.error("Error storing recommendation:", error)
    return NextResponse.json({ error: "Failed to store recommendation" }, { status: 500 })
  }
}

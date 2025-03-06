import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the userId from the query parameters
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const secretKey = searchParams.get("secretKey")

  // Check if the secret key matches (basic security)
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // Update the user's role to admin
    await db.update(user).set({ role: "admin" }).where(eq(user.id, userId))

    return NextResponse.json({
      success: true,
      message: `User ${userId} has been set as admin. Please log out and log back in.`,
    })
  } catch (error) {
    console.error("Error setting admin role:", error)
    return NextResponse.json({ error: "Failed to set admin role" }, { status: 500 })
  }
}



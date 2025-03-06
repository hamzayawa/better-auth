import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the userId and secretKey from the query parameters
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const secretKey = searchParams.get("secretKey")

  // Check if the secret key matches (basic security)
  if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized. Invalid or missing secret key." }, { status: 401 })
  }

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // First, check if the user exists
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update the user's role to admin
    await db.update(user).set({ role: "admin" }).where(eq(user.id, userId))

    // Verify the update
    const updatedUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    return NextResponse.json({
      success: true,
      previousRole: userRecord.role,
      currentRole: updatedUser?.role,
      message: `User ${userId} has been set as admin. Please log out and log back in.`,
    })
  } catch (error) {
    console.error("Error setting admin role:", error)
    return NextResponse.json({ error: "Failed to set admin role", details: error }, { status: 500 })
  }
}



import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secretKey = searchParams.get("secretKey")

  // Check if the secret key matches (basic security)
  if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized. Invalid or missing secret key." }, { status: 401 })
  }

  try {
    // Get all users from the database
    const users = await db.query.user.findMany({
      orderBy: (user, { desc }) => [desc(user.createdAt)],
    })

    // Return a sanitized version without sensitive data
    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
    }))

    return NextResponse.json({
      users: sanitizedUsers,
      adminUserId: process.env.ADMIN_USER_ID,
    })
  } catch (error) {
    console.error("Error listing users:", error)
    return NextResponse.json({ error: "Failed to list users", details: error }, { status: 500 })
  }
}



import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()

    // Validate the request body
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.format(),
        },
        { status: 400 },
      )
    }

    const { name, email, phoneNumber } = result.data

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)

      if (existingUser.length > 0) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 })
      }
    }

    // Update the user profile
    await db
      .update(user)
      .set({
        name,
        email,
        phoneNumber,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}



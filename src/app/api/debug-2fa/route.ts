import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { twoFactorTable } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get the user's 2FA settings from the database
    const twoFactorSettings = await db.select().from(twoFactorTable).where(eq(twoFactorTable.userId, session.user.id))

    return NextResponse.json({
      userId: session.user.id,
      email: session.user.email,
      twoFactorEnabled: session.user.twoFactorEnabled,
      twoFactorSettings: twoFactorSettings,
    })
  } catch (error) {
    console.error("Debug 2FA error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}



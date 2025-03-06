import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the current user's session
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id
    const adminUserId = process.env.ADMIN_USER_ID

    // Check if the user exists in the database
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    // Check if the ADMIN_USER_ID matches the current user's ID
    const isAdminUserIdMatch = userId === adminUserId

    // Diagnostic information
    const diagnosticInfo = {
      currentUserId: userId,
      adminUserId: adminUserId,
      isAdminUserIdMatch,
      userExists: !!userRecord,
      currentRole: userRecord?.role || "unknown",
      sessionRole: session.user.role,
      exactMatch: `'${userId}' === '${adminUserId}'`,
      adminUserIdLength: adminUserId?.length,
      userIdLength: userId?.length,
      // Check for whitespace or special characters
      adminUserIdHasWhitespace: adminUserId?.includes(" "),
      userIdHasWhitespace: userId?.includes(" "),
    }

    // Try to update the user's role to admin
    if (userRecord && isAdminUserIdMatch) {
      await db.update(user).set({ role: "admin" }).where(eq(user.id, userId))

      // Fetch the updated user record
      const updatedUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      })

      return NextResponse.json({
        diagnosticInfo,
        updateAttempted: true,
        updatedRole: updatedUser?.role,
        message: "User role has been updated to admin. Please log out and log back in for changes to take effect.",
      })
    }

    return NextResponse.json({
      diagnosticInfo,
      updateAttempted: false,
      message: "No update attempted. User ID doesn't match ADMIN_USER_ID or user doesn't exist.",
    })
  } catch (error) {
    console.error("Error in admin diagnostic:", error)
    return NextResponse.json({ error: "Diagnostic failed", details: error }, { status: 500 })
  }
}



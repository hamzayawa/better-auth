import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    message: "Copy this userId and set it as ADMIN_USER_ID in your .env file",
  })
}



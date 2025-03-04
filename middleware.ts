import { type NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const sessionCookie = getSessionCookie(request)

  // Protected routes pattern
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/profile")

  // Auth routes pattern
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth") && !request.nextUrl.pathname.startsWith("/auth/verify")

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth routes with a session, redirect to dashboard
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    // Auth routes
    "/auth/:path*",
  ],
}


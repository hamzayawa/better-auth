import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"
import { phoneNumberClient } from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import { adminClient } from "better-auth/client/plugins"
import type { auth } from "@/lib/auth"
import { ac, adminRole, userRole } from "@/lib/permissions"

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      twoFactorPage: "/auth/two-factor",
      onTwoFactorRedirect() {
        window.location.href = "/auth/two-factor"
      },
      methods: ["totp", "email"], // Explicitly enable both TOTP and email methods
    }),
    phoneNumberClient(),
    emailOTPClient(),
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),
  ],
})

// Export type-safe session
export type AuthSession = typeof auth.$Infer.Session

// Export commonly used methods
export const { signIn, signUp, signOut, useSession, getSession } = authClient



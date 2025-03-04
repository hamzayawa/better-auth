import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { twoFactor } from "better-auth/plugins"
import { phoneNumber } from "better-auth/plugins"
import { emailOTP } from "better-auth/plugins"
import { admin } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/lib/db"
import { user, sessions, accounts, verifications, twoFactorTable } from "@/lib/schema" // Import specific tables
import { sendEmail } from "@/lib/email"
import { ac, adminRole, userRole } from "@/lib/permissions"

export const auth = betterAuth({
  // Base configuration
  appName: "NextAuth App",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session: sessions,
      account: accounts,
      verification: verifications,
      twoFactor: twoFactorTable,
    }, // Pass specific tables with the expected names
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
        html: `
          <div>
            <h1>Reset your password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${url}">Reset Password</a>
          </div>
        `,
      })
    },
  },

  // Email verification
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
        html: `
          <div>
            <h1>Verify your email address</h1>
            <p>Click the link below to verify your email:</p>
            <a href="${url}">Verify Email</a>
          </div>
        `,
      })
    },
  },

  // Rate limiting
  rateLimit: {
    window: 60, // 60 seconds
    max: 10, // 10 requests per minute
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5, // 5 login attempts per minute
      },
      "/two-factor/*": {
        window: 60,
        max: 3, // 3 2FA attempts per minute
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // User configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },

  // Plugins
  plugins: [
    // Two-factor authentication
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }, request) {
          await sendEmail({
            to: user.email,
            subject: "Your verification code",
            text: `Your verification code is: ${otp}`,
            html: `
              <div>
                <h1>Your verification code</h1>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 5 minutes.</p>
              </div>
            `,
          })
        },
      },
    }),

    // Phone number authentication
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        // In a real app, you would integrate with an SMS service like Twilio
        console.log(`Sending code ${code} to ${phoneNumber}`)
        // Example with Twilio:
        // await twilioClient.messages.create({
        //   body: `Your verification code is: ${code}`,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: phoneNumber
        // });
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber.replace(/[^0-9]/g, "")}@phone.example.com`
        },
      },
    }),

    // Email OTP for passwordless login
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subjects = {
          "sign-in": "Your login code",
          "email-verification": "Verify your email",
          "forget-password": "Reset your password",
        }

        await sendEmail({
          to: email,
          subject: subjects[type] || "Your verification code",
          text: `Your verification code is: ${otp}`,
          html: `
            <div>
              <h1>${subjects[type] || "Your verification code"}</h1>
              <p>Your verification code is: <strong>${otp}</strong></p>
              <p>This code will expire in 5 minutes.</p>
            </div>
          `,
        })
      },
    }),

    // Admin plugin
    admin({
      defaultRole: "user",
      adminUserIds: [process.env.ADMIN_USER_ID], // Set this in your .env file
      defaultBanReason: "Violation of terms of service",
      defaultBanExpiresIn: 60 * 60 * 24 * 30, // 30 days
      impersonationSessionDuration: 60 * 60, // 1 hour
      ac, // Access control from permissions.ts
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),

    // Next.js cookies helper (must be last)
    nextCookies(),
  ],
})

// Export type-safe auth types
export type AuthSession = typeof auth.$Infer.Session



"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
})

type PhoneFormValues = z.infer<typeof phoneSchema>

const otpSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters").max(6, "Code must be at most 6 characters"),
})

type OtpFormValues = z.infer<typeof otpSchema>

export function PhoneLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onPhoneSubmit(data: PhoneFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.phoneNumber.sendOtp(
        {
          phoneNumber: data.phoneNumber,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message)
          },
        },
      )

      if (result.error) {
        setError(result.error.message)
      } else {
        setPhoneNumber(data.phoneNumber)
        setStep("otp")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function onOtpSubmit(data: OtpFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.phoneNumber.verify(
        {
          phoneNumber,
          code: data.code,
          callbackURL: callbackUrl,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message)
          },
          onSuccess: () => {
            router.push(callbackUrl)
          },
        },
      )

      if (result.error) {
        setError(result.error.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {step === "phone" ? "Sign in with phone" : "Enter verification code"}
        </CardTitle>
        <CardDescription>
          {step === "phone"
            ? "Enter your phone number to receive a verification code"
            : `We've sent a code to ${phoneNumber}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="+1234567890"
                {...phoneForm.register("phoneNumber")}
                disabled={isLoading}
              />
              {phoneForm.formState.errors.phoneNumber && (
                <p className="text-sm text-red-500">{phoneForm.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send verification code"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input id="code" placeholder="123456" {...otpForm.register("code")} disabled={isLoading} maxLength={6} />
              {otpForm.formState.errors.code && (
                <p className="text-sm text-red-500">{otpForm.formState.errors.code.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <Button
              variant="link"
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={() => {
                setStep("phone")
                setError(null)
              }}
            >
              Change phone number
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => router.push("/auth/login")}>
          Back to login
        </Button>
      </CardFooter>
    </Card>
  )
}


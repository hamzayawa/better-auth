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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const twoFactorSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters").max(6, "Code must be at most 6 characters"),
  trustDevice: z.boolean().default(false),
})

type TwoFactorFormValues = z.infer<typeof twoFactorSchema>

export function TwoFactorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const form = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
      trustDevice: false,
    },
  })

  async function onSubmit(data: TwoFactorFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      // First try to verify with TOTP
      const result = await authClient.twoFactor.verifyTotp(
        {
          code: data.code,
          trustDevice: data.trustDevice,
          callbackURL: callbackUrl,
        },
        {
          onError: (ctx) => {
            console.log("TOTP verification error:", ctx.error.message)
            // Don't set error here, we'll try email verification next
          },
          onSuccess: () => {
            toast.success("Two-factor authentication successful")
            router.push(callbackUrl)
            return
          },
        },
      )

      if (result.error) {
        // If TOTP verification fails, try email verification
        console.log("Trying email verification instead")
        const emailResult = await authClient.twoFactor.verifyOtp(
          {
            code: data.code,
            trustDevice: data.trustDevice,
            callbackURL: callbackUrl,
          },
          {
            onError: (ctx) => {
              console.log("Email OTP verification error:", ctx.error.message)
              setError(ctx.error.message)
              toast.error(ctx.error.message)
            },
            onSuccess: () => {
              toast.success("Two-factor authentication successful")
              router.push(callbackUrl)
            },
          },
        )

        if (emailResult.error) {
          setError(emailResult.error.message)
          toast.error(emailResult.error.message)
        }
      }
    } catch (err) {
      console.error("2FA verification error:", err)
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Send OTP if user prefers that method
  const sendOtp = async () => {
    setIsSendingOtp(true)
    setError(null)

    try {
      console.log("Sending email OTP")
      const result = await authClient.twoFactor.sendOtp({
        method: "email", // Explicitly specify email as the method
      })

      console.log("Send OTP result:", result)

      if (result.error) {
        setError(result.error.message)
        toast.error(result.error.message)
      } else {
        toast.success("Verification code sent to your email")
      }
    } catch (err) {
      console.error("Send OTP error:", err)
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSendingOtp(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>Enter the verification code from your authenticator app or email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input id="code" placeholder="123456" {...form.register("code")} disabled={isLoading} maxLength={6} />
            {form.formState.errors.code && <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="trustDevice"
              checked={form.watch("trustDevice")}
              onCheckedChange={(checked) => {
                form.setValue("trustDevice", checked as boolean)
              }}
            />
            <Label htmlFor="trustDevice" className="text-sm font-normal">
              Trust this device for 60 days
            </Label>
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
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Button variant="outline" type="button" disabled={isLoading || isSendingOtp} onClick={sendOtp}>
              {isSendingOtp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send code via email"
              )}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => {
                router.push("/auth/backup-code")
              }}
            >
              Use backup code
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => router.push("/auth/login")}>
          Back to login
        </Button>
      </CardFooter>
    </Card>
  )
}



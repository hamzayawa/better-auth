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
      const result = await authClient.twoFactor.verifyTotp(
        {
          code: data.code,
          trustDevice: data.trustDevice,
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

  // Send OTP if user prefers that method
  const sendOtp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.twoFactor.sendOtp()

      if (result.error) {
        setError(result.error.message)
      } else {
        setError(null)
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
            <Button variant="outline" type="button" disabled={isLoading} onClick={sendOtp}>
              Send code via email
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


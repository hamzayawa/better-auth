"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import QRCode from "react-qr-code"
import { toast } from "sonner"

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

type PasswordFormValues = z.infer<typeof passwordSchema>

const verifySchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters").max(6, "Code must be at most 6 characters"),
})

type VerifyFormValues = z.infer<typeof verifySchema>

export function Enable2FAForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"password" | "qrcode" | "verify" | "backupCodes">("password")
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  })

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  })

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.twoFactor.enable(
        {
          password: data.password,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message)
            toast.error(ctx.error.message)
          },
        },
      )

      if (result.error) {
        setError(result.error.message)
        toast.error(result.error.message)
      } else {
        setTotpUri(result.data.totpURI)
        setBackupCodes(result.data.backupCodes)
        setStep("qrcode")
        toast.success("Two-factor authentication setup started")
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  async function onVerifySubmit(data: VerifyFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.twoFactor.verifyTotp(
        {
          code: data.code,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message)
            toast.error(ctx.error.message)
          },
        },
      )

      if (result.error) {
        setError(result.error.message)
        toast.error(result.error.message)
      } else {
        setStep("backupCodes")
        toast.success("Two-factor authentication enabled successfully")
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Send OTP if user prefers that method
  const sendOtp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.twoFactor.sendOtp({
        method: "email", // Explicitly specify email as the method
      })

      if (result.error) {
        setError(result.error.message)
        toast.error(result.error.message)
      } else {
        toast.success("Verification code sent to your email")
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {step === "password" && "Enable Two-Factor Authentication"}
          {step === "qrcode" && "Scan QR Code"}
          {step === "verify" && "Verify Code"}
          {step === "backupCodes" && "Backup Codes"}
        </CardTitle>
        <CardDescription>
          {step === "password" && "Enter your password to enable two-factor authentication"}
          {step === "qrcode" && "Scan this QR code with your authenticator app"}
          {step === "verify" && "Enter the verification code from your authenticator app"}
          {step === "backupCodes" && "Save these backup codes in a secure place"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "password" && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...passwordForm.register("password")}
                disabled={isLoading}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors.password.message}</p>
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
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        )}

        {step === "qrcode" && totpUri && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCode value={totpUri} size={200} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Scan the QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft
                Authenticator).
              </p>
              <p className="text-sm text-muted-foreground">
                If you can't scan the QR code, you can manually enter this code:
              </p>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all">
                {totpUri.split("?")[0].split("/").pop()}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("password")} disabled={isLoading}>
                Back
              </Button>
              <Button onClick={() => setStep("verify")} disabled={isLoading}>
                Next
              </Button>
            </div>

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
              </div>
            </div>
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="123456"
                {...verifyForm.register("code")}
                disabled={isLoading}
                maxLength={6}
              />
              {verifyForm.formState.errors.code && (
                <p className="text-sm text-red-500">{verifyForm.formState.errors.code.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("qrcode")} disabled={isLoading}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "backupCodes" && backupCodes && (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Save these backup codes in a secure place. You can use them to access your account if you lose your
                authenticator device.
              </p>
              <p className="text-sm text-muted-foreground">Each code can only be used once.</p>
            </div>

            <Button onClick={() => router.push("/profile")} className="w-full">
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



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

const backupCodeSchema = z.object({
  code: z.string().min(1, "Backup code is required"),
})

type BackupCodeFormValues = z.infer<typeof backupCodeSchema>

export function BackupCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BackupCodeFormValues>({
    resolver: zodResolver(backupCodeSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onSubmit(data: BackupCodeFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.twoFactor.verifyBackupCode(
        {
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
        <CardTitle className="text-2xl">Use Backup Code</CardTitle>
        <CardDescription>Enter one of your backup codes to sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Backup Code</Label>
            <Input id="code" placeholder="Enter your backup code" {...form.register("code")} disabled={isLoading} />
            {form.formState.errors.code && <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>}
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
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => router.push("/auth/two-factor")}>
          Back to two-factor authentication
        </Button>
      </CardFooter>
    </Card>
  )
}


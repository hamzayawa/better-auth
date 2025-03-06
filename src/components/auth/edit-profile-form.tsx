"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"

// Remove email field from the form and schema
const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
})

type EditProfileFormValues = z.infer<typeof editProfileSchema>

export function EditProfileForm() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: session?.user.name || "",
      phoneNumber: session?.user.phoneNumber || "",
    },
  })

  async function onSubmit(data: EditProfileFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          phoneNumber: data.phoneNumber || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to update profile")
        toast.error(result.error || "Failed to update profile")
      } else {
        // The response is successful
        toast.success("Profile updated successfully")

        try {
          // Update the session to reflect the changes
          await update()
          router.push("/profile")
        } catch (updateError) {
          console.error("Error updating session:", updateError)
          // Even if session update fails, the profile was updated successfully
          // so we should still redirect
          router.push("/profile")
        }
      }
    } catch (err) {
      console.error("Profile update error:", err)
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
        <CardTitle className="text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" {...form.register("name")} disabled={isLoading} />
            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={session?.user.email || ""} disabled={true} className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
            <Input id="phoneNumber" placeholder="+1234567890" {...form.register("phoneNumber")} disabled={isLoading} />
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-red-500">{form.formState.errors.phoneNumber.message}</p>
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
                Updating profile...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => router.push("/profile")} disabled={isLoading}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}



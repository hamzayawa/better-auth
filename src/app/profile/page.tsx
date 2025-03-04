import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  // Await the headers() function before using it
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-lg">{session.user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-lg">{session.user.email}</p>
                {!session.user.emailVerified && <p className="text-sm text-yellow-500">Email not verified</p>}
              </div>
              {session.user.phoneNumber && (
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-lg">{session.user.phoneNumber}</p>
                  {!session.user.phoneNumberVerified && (
                    <p className="text-sm text-yellow-500">Phone number not verified</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/profile/edit">
              <Button>Edit Profile</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-lg">••••••••</p>
              </div>
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-lg">{session.user.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/profile/change-password">
              <Button variant="outline">Change Password</Button>
            </Link>
            <Link href="/profile/security">
              <Button>{session.user.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}



import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminLink } from "@/components/dashboard/admin-link"

export default async function DashboardPage() {
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <AdminLink />
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
          <form
            action={async () => {
              "use server"
              // Also await headers here
              const headersList = await headers()
              await auth.api.signOut({
                headers: headersList,
              })
              redirect("/auth/login")
            }}
          >
            <Button type="submit" variant="destructive">
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session.user.name}</h2>
          <p className="text-muted-foreground">
            You are now signed in with your {session.user.emailVerified ? "verified" : "unverified"} email.
          </p>
          {session.user.role && (
            <p className="text-muted-foreground mt-2">
              Your role: <span className="font-medium">{session.user.role}</span>
            </p>
          )}
        </div>

        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Account Security</h2>
          <p className="text-muted-foreground mb-4">
            {session.user.twoFactorEnabled
              ? "Two-factor authentication is enabled."
              : "Two-factor authentication is not enabled."}
          </p>
          <Link href="/profile/security">
            <Button variant="outline" size="sm">
              {session.user.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
            </Button>
          </Link>
        </div>

        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Session Info</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Session expires: {new Date(session.session.expiresAt).toLocaleString()}</p>
            <p>IP Address: {session.session.ipAddress}</p>
            {session.session.impersonatedBy && (
              <p className="text-red-500 font-medium">This session is being impersonated by an admin</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



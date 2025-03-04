import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Enable2FAForm } from "@/components/auth/enable-2fa-form"

export default async function SecurityPage() {
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
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Account Security</h1>
        <Enable2FAForm />
      </div>
    </div>
  )
}



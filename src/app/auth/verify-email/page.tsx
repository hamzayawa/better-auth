import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function VerifyEmailPage() {
  // Await the headers() function before using it
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>We've sent a verification link to your email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please check your email and click the verification link to complete your registration.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <form
              action={async () => {
                "use server"
                const headersList = await headers()
                if (session) {
                  await auth.api.sendVerificationEmail({
                    body: {
                      email: session.user.email,
                      callbackURL: "/dashboard",
                    },
                    headers: headersList,
                  })
                }
              }}
            >
              <Button type="submit" className="w-full">
                Resend verification email
              </Button>
            </form>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full">
                Back to login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}



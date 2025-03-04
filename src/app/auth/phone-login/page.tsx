import { PhoneLoginForm } from "@/components/auth/phone-login-form"

export default function PhoneLoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Phone Login</h1>
          <p className="text-sm text-muted-foreground">Sign in with your phone number</p>
        </div>
        <PhoneLoginForm />
      </div>
    </div>
  )
}


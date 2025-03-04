import { TwoFactorForm } from "@/components/auth/two-factor-form"

export default function TwoFactorPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground">Enter the verification code to continue</p>
        </div>
        <TwoFactorForm />
      </div>
    </div>
  )
}


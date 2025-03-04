"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Shield, Settings, Activity, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

export function AdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isImpersonating = session?.session.impersonatedBy !== undefined

  const stopImpersonating = async () => {
    try {
      await authClient.admin.stopImpersonating()
      toast.success("Stopped impersonating user")
      window.location.href = "/admin"
    } catch (error) {
      toast.error("Failed to stop impersonating")
    }
  }

  return (
    <nav className="flex flex-col space-y-1">
      <Link href="/admin/users">
        <Button variant={pathname === "/admin/users" ? "default" : "ghost"} className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Users
        </Button>
      </Link>
      <Link href="/admin/create-user">
        <Button variant={pathname === "/admin/create-user" ? "default" : "ghost"} className="w-full justify-start">
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </Link>
      <Link href="/admin/roles">
        <Button variant={pathname === "/admin/roles" ? "default" : "ghost"} className="w-full justify-start">
          <Shield className="mr-2 h-4 w-4" />
          Roles & Permissions
        </Button>
      </Link>
      <Link href="/admin/settings">
        <Button variant={pathname === "/admin/settings" ? "default" : "ghost"} className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </Link>
      <Link href="/admin/activity">
        <Button variant={pathname === "/admin/activity" ? "default" : "ghost"} className="w-full justify-start">
          <Activity className="mr-2 h-4 w-4" />
          Activity Log
        </Button>
      </Link>

      {isImpersonating && (
        <Button variant="destructive" className="w-full justify-start mt-4" onClick={stopImpersonating}>
          <LogOut className="mr-2 h-4 w-4" />
          Stop Impersonating
        </Button>
      )}
    </nav>
  )
}


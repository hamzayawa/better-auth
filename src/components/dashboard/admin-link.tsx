"use client"

import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function AdminLink() {
  const { data: session } = useSession()

  if (!session || session.user.role !== "admin") {
    return null
  }

  return (
    <Link href="/admin">
      <Button variant="outline" size="sm" className="gap-2">
        <Shield className="h-4 w-4" />
        Admin Panel
      </Button>
    </Link>
  )
}


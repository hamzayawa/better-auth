import { UserTable } from "@/components/admin/user-table"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">User Management</h3>
        <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
      </div>
      <UserTable />
    </div>
  )
}


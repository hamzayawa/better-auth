import { UserTable } from "@/components/admin/user-table"
import { getRoles } from "@/lib/actions/role-actions"

export default async function UsersPage() {
  // Fetch all roles for the dropdown
  const { data: roles = [] } = await getRoles()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">User Management</h3>
        <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
      </div>
      <UserTable availableRoles={roles} />
    </div>
  )
}



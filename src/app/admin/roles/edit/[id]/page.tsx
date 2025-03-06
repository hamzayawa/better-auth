import { getRole } from "@/lib/actions/role-actions"
import { RoleForm } from "@/components/admin/role-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

interface EditRolePageProps {
  params: {
    id: string
  }
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = params
  const { success, data: role, error } = await getRole(id)

  if (!success || !role) {
    notFound()
  }

  // Don't allow editing system roles
  if (role.isSystem) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Edit Role</h3>
          <p className="text-sm text-muted-foreground">Edit role permissions</p>
        </div>

        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">System roles cannot be modified</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Role</h3>
        <p className="text-sm text-muted-foreground">Edit role permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {role.name}</CardTitle>
          <CardDescription>Update the role name and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm role={role} />
        </CardContent>
      </Card>
    </div>
  )
}



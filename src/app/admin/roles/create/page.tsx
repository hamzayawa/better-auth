import { RoleForm } from "@/components/admin/role-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateRolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Role</h3>
        <p className="text-sm text-muted-foreground">Create a new role with custom permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Role</CardTitle>
          <CardDescription>Define the role name and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm />
        </CardContent>
      </Card>
    </div>
  )
}



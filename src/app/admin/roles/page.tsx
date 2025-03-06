import { getRoles, initializeDefaultRoles } from "@/lib/actions/role-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { RoleActions } from "@/components/admin/role-actions"

export default async function RolesPage() {
  // Initialize default roles if they don't exist
  await initializeDefaultRoles()

  // Fetch all roles
  const { success, data: roles = [], error } = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Roles & Permissions</h3>
          <p className="text-sm text-muted-foreground">Manage roles and their associated permissions</p>
        </div>
        <Link href="/admin/roles/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="capitalize">{role.name}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </div>
              <RoleActions role={role} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Permissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.permissions.map((permission, index) => (
                    <TableRow key={`${role.id}-${permission.resource}-${index}`}>
                      <TableCell className="font-medium capitalize">{permission.resource}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {permission.actions.map((action) => (
                            <Badge key={action} variant="outline" className="capitalize">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function RolesPage() {
  // This would typically come from your permissions system
  const roles = [
    {
      name: "admin",
      description: "Full access to all resources",
      permissions: [
        { resource: "user", actions: ["create", "read", "update", "delete", "ban", "impersonate"] },
        { resource: "session", actions: ["read", "revoke"] },
        { resource: "project", actions: ["create", "read", "update", "delete", "share"] },
        { resource: "content", actions: ["create", "read", "update", "delete", "publish"] },
        { resource: "settings", actions: ["read", "update"] },
      ],
    },
    {
      name: "user",
      description: "Regular user with limited access",
      permissions: [
        { resource: "project", actions: ["create", "read", "update"] },
        { resource: "content", actions: ["create", "read", "update"] },
        { resource: "settings", actions: ["read"] },
      ],
    },
    {
      name: "editor",
      description: "Can manage content but not users",
      permissions: [
        { resource: "project", actions: ["read"] },
        { resource: "content", actions: ["create", "read", "update", "publish"] },
        { resource: "settings", actions: ["read"] },
      ],
    },
    {
      name: "moderator",
      description: "Can moderate content and ban users",
      permissions: [
        { resource: "user", actions: ["ban"] },
        { resource: "content", actions: ["read", "update", "delete"] },
        { resource: "settings", actions: ["read"] },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Roles & Permissions</h3>
        <p className="text-sm text-muted-foreground">View and manage roles and their associated permissions</p>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <CardTitle className="capitalize">{role.name}</CardTitle>
              <CardDescription>{role.description}</CardDescription>
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
                  {role.permissions.map((permission) => (
                    <TableRow key={permission.resource}>
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


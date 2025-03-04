import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ActivityPage() {
  // This would typically come from your database or activity log
  const activities = [
    {
      id: "1",
      action: "user.login",
      description: "User logged in",
      user: "john@example.com",
      ipAddress: "192.168.1.1",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      action: "user.create",
      description: "Admin created a new user",
      user: "admin@example.com",
      ipAddress: "192.168.1.2",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      action: "user.role.update",
      description: "User role updated to editor",
      user: "admin@example.com",
      ipAddress: "192.168.1.2",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      action: "user.ban",
      description: "User was banned",
      user: "admin@example.com",
      ipAddress: "192.168.1.2",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "5",
      action: "user.login.failed",
      description: "Failed login attempt",
      user: "unknown",
      ipAddress: "192.168.1.3",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("login.failed") || action.includes("ban")) {
      return "destructive"
    }
    if (action.includes("create")) {
      return "success"
    }
    if (action.includes("update")) {
      return "warning"
    }
    return "default"
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Activity Log</h3>
        <p className="text-sm text-muted-foreground">View recent activity and system events</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>System events and user actions from the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(activity.action)}>{activity.action}</Badge>
                  </TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>{activity.ipAddress}</TableCell>
                  <TableCell>{formatTimestamp(activity.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


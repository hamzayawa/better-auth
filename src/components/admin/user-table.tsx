"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, UserCog, Ban, Trash2, Eye, UserCheck, LogOut } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { RoleWithPermissions } from "@/lib/schema"

interface UserTableProps {
  availableRoles: RoleWithPermissions[]
}

export function UserTable({ availableRoles }: UserTableProps) {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState<"email" | "name">("email")
  const [searchOperator, setSearchOperator] = useState<"contains" | "starts_with" | "ends_with">("contains")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterRole, setFilterRole] = useState<string | null>(null)

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("30")
  const [newRole, setNewRole] = useState("")

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const query: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        sortBy,
        sortDirection,
      }

      if (searchTerm) {
        query.searchField = searchField
        query.searchOperator = searchOperator
        query.searchValue = searchTerm
      }

      if (filterRole) {
        query.filterField = "role"
        query.filterOperator = "eq"
        query.filterValue = filterRole
      }

      const result = await authClient.admin.listUsers({ query })

      if (result.error) {
        toast.error(result.error.message)
      } else {
        setUsers(result.data.users)
        setTotalUsers(result.data.total)
      }
    } catch (error) {
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, searchField, searchOperator, sortBy, sortDirection, filterRole])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const totalPages = Math.ceil(totalUsers / pageSize)

  const handleBanUser = async () => {
    if (!selectedUser) return

    try {
      const result = await authClient.admin.banUser({
        userId: selectedUser.id,
        banReason,
        banExpiresIn: Number.parseInt(banDuration) * 24 * 60 * 60, // Convert days to seconds
      })

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success(`User ${selectedUser.email} has been banned`)
        fetchUsers()
      }
    } catch (error) {
      toast.error("Failed to ban user")
    } finally {
      setShowBanDialog(false)
      setSelectedUser(null)
      setBanReason("")
      setBanDuration("30")
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const result = await authClient.admin.unbanUser({
        userId,
      })

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success("User has been unbanned")
        fetchUsers()
      }
    } catch (error) {
      toast.error("Failed to unban user")
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const result = await authClient.admin.removeUser({
        userId: selectedUser.id,
      })

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success(`User ${selectedUser.email} has been deleted`)
        fetchUsers()
      }
    } catch (error) {
      toast.error("Failed to delete user")
    } finally {
      setShowDeleteDialog(false)
      setSelectedUser(null)
    }
  }

  const handleSetRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const result = await authClient.admin.setRole({
        userId: selectedUser.id,
        role: newRole,
      })

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success(`User role updated to ${newRole}`)
        fetchUsers()
      }
    } catch (error) {
      toast.error("Failed to update user role")
    } finally {
      setShowRoleDialog(false)
      setSelectedUser(null)
      setNewRole("")
    }
  }

  const handleImpersonateUser = async (userId: string) => {
    try {
      const result = await authClient.admin.impersonateUser({
        userId,
      })

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success("Now impersonating user")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("Failed to impersonate user")
    }
  }

  const handleRevokeUserSessions = async (userId: string) => {
    try {
      const result = await authClient.admin.revokeUserSessions({
        userId,
      })

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success("All user sessions have been revoked")
      }
    } catch (error) {
      toast.error("Failed to revoke user sessions")
    }
  }

  // Get available role options for filter and role change
  const roleOptions = [
    { value: "all", label: "All Roles" },
    ...availableRoles.map((role) => ({
      value: role.name,
      label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
    })),
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={searchField} onValueChange={(value: "email" | "name") => setSearchField(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchOperator}
            onValueChange={(value: "contains" | "starts_with" | "ends_with") => setSearchOperator(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="starts_with">Starts with</SelectItem>
              <SelectItem value="ends_with">Ends with</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setSearchTerm("")}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filterRole || "all"} onValueChange={(value) => setFilterRole(value === "all" ? null : value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "destructive" : "default"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : user.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                            setShowRoleDialog(true)
                          }}
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleImpersonateUser(user.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Impersonate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.banned ? (
                          <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setShowBanDialog(true)
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleRevokeUserSessions(user.id)}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Revoke Sessions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number.parseInt(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <PaginationItem key={i}>
                  <PaginationLink isActive={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              This will prevent the user from signing in and revoke all their existing sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="banReason">Ban Reason</Label>
              <Input
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for banning this user"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banDuration">Ban Duration (days)</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="0">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.email}</span>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update the role for user {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



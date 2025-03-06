"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { RoleWithPermissions, Permission } from "@/lib/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createRole, updateRole } from "@/lib/actions/role-actions"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface RoleFormProps {
  role?: RoleWithPermissions
}

// Available resources and actions
const availableResources = ["user", "session", "project", "content", "settings", "role"]

const availableActions = ["create", "read", "update", "delete", "ban", "impersonate", "revoke", "share", "publish"]

export function RoleForm({ role }: RoleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(role?.name || "")
  const [description, setDescription] = useState(role?.description || "")
  const [permissions, setPermissions] = useState<Permission[]>(role?.permissions || [])
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  // Add a new empty permission
  const addPermission = useCallback(() => {
    setPermissions([...permissions, { resource: "", actions: [] }])
  }, [permissions])

  // Remove a permission
  const removePermission = (index: number) => {
    const newPermissions = [...permissions]
    newPermissions.splice(index, 1)
    setPermissions(newPermissions)
  }

  // Update a permission's resource
  const updateResource = (index: number, resource: string) => {
    const newPermissions = [...permissions]
    newPermissions[index].resource = resource
    setPermissions(newPermissions)
  }

  // Toggle an action for a permission
  const toggleAction = (permissionIndex: number, action: string) => {
    const newPermissions = [...permissions]
    const actionIndex = newPermissions[permissionIndex].actions.indexOf(action)

    if (actionIndex === -1) {
      newPermissions[permissionIndex].actions.push(action)
    } else {
      newPermissions[permissionIndex].actions.splice(actionIndex, 1)
    }

    setPermissions(newPermissions)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    // Basic validation
    const validationErrors: Record<string, string[]> = {}

    if (!name.trim()) {
      validationErrors.name = ["Role name is required"]
    }

    if (permissions.length === 0) {
      validationErrors.permissions = ["At least one permission is required"]
    } else {
      permissions.forEach((permission, index) => {
        if (!permission.resource) {
          validationErrors[`permissions.${index}.resource`] = ["Resource is required"]
        }
        if (permission.actions.length === 0) {
          validationErrors[`permissions.${index}.actions`] = ["At least one action is required"]
        }
      })
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("permissions", JSON.stringify(permissions))

      let result
      if (role) {
        // Update existing role
        result = await updateRole(role.id, formData)
      } else {
        // Create new role
        result = await createRole(formData)
      }

      if (result.success) {
        toast.success(role ? "Role updated successfully" : "Role created successfully")
        router.push("/admin/roles")
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        } else {
          toast.error(result.error || "An error occurred")
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add an initial empty permission if none exist
  useEffect(() => {
    if (permissions.length === 0) {
      addPermission()
    }
  }, [permissions.length, addPermission])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Role Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Content Manager"
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this role is for"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Permissions</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPermission} disabled={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </Button>
        </div>

        {errors.permissions && <p className="text-sm text-destructive">{errors.permissions[0]}</p>}

        {permissions.map((permission, index) => (
          <Card key={index} className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removePermission(index)}
              disabled={isSubmitting || permissions.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>

            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`resource-${index}`}>Resource</Label>
                <Select
                  value={permission.resource}
                  onValueChange={(value) => updateResource(index, value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id={`resource-${index}`}>
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableResources.map((resource) => (
                      <SelectItem key={resource} value={resource}>
                        {resource.charAt(0).toUpperCase() + resource.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`permissions.${index}.resource`] && (
                  <p className="text-sm text-destructive">{errors[`permissions.${index}.resource`][0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableActions.map((action) => (
                    <div key={action} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${index}-${action}`}
                        checked={permission.actions.includes(action)}
                        onCheckedChange={() => toggleAction(index, action)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`${index}-${action}`} className="text-sm font-normal capitalize">
                        {action}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors[`permissions.${index}.actions`] && (
                  <p className="text-sm text-destructive">{errors[`permissions.${index}.actions`][0]}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {role ? "Update Role" : "Create Role"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/roles")} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}



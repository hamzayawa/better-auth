"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { roles, type Permission, user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"
import { z } from "zod"
import { nanoid } from "nanoid"

// Validation schemas
const permissionSchema = z.object({
  resource: z.string().min(1, "Resource name is required"),
  actions: z.array(z.string().min(1, "Action name is required")).min(1, "At least one action is required"),
})

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z.array(permissionSchema).min(1, "At least one permission is required"),
})

// Check if user is admin
async function checkAdmin() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || session.user.role !== "admin") {
    unauthorized()
  }

  return session
}

// Get all roles
export async function getRoles() {
  await checkAdmin()

  try {
    const allRoles = await db.query.roles.findMany({
      orderBy: (roles, { asc }) => [asc(roles.name)],
    })

    return { success: true, data: allRoles }
  } catch (error) {
    console.error("Error fetching roles:", error)
    return { success: false, error: "Failed to fetch roles" }
  }
}

// Get a single role by ID
export async function getRole(id: string) {
  await checkAdmin()

  try {
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    })

    if (!role) {
      return { success: false, error: "Role not found" }
    }

    return { success: true, data: role }
  } catch (error) {
    console.error("Error fetching role:", error)
    return { success: false, error: "Failed to fetch role" }
  }
}

// Create a new role
export async function createRole(formData: FormData) {
  await checkAdmin()

  try {
    // Parse and validate the form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const permissionsJson = formData.get("permissions") as string

    let permissions: Permission[] = []
    try {
      permissions = JSON.parse(permissionsJson)
    } catch (e) {
      return { success: false, error: "Invalid permissions format" }
    }

    // Validate with zod
    const validationResult = roleSchema.safeParse({
      name,
      description,
      permissions,
    })

    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Check if role with this name already exists
    const existingRole = await db.query.roles.findFirst({
      where: eq(roles.name, name),
    })

    if (existingRole) {
      return { success: false, error: "A role with this name already exists" }
    }

    // Create the role
    const newRole = await db
      .insert(roles)
      .values({
        id: nanoid(),
        name,
        description,
        permissions,
        isSystem: false,
      })
      .returning()

    revalidatePath("/admin/roles")
    return { success: true, data: newRole[0] }
  } catch (error) {
    console.error("Error creating role:", error)
    return { success: false, error: "Failed to create role" }
  }
}

// Update a role
export async function updateRole(id: string, formData: FormData) {
  await checkAdmin()

  try {
    // Check if role exists
    const existingRole = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    })

    if (!existingRole) {
      return { success: false, error: "Role not found" }
    }

    // Don't allow updating system roles
    if (existingRole.isSystem) {
      return { success: false, error: "System roles cannot be modified" }
    }

    // Parse and validate the form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const permissionsJson = formData.get("permissions") as string

    let permissions: Permission[] = []
    try {
      permissions = JSON.parse(permissionsJson)
    } catch (e) {
      return { success: false, error: "Invalid permissions format" }
    }

    // Validate with zod
    const validationResult = roleSchema.safeParse({
      name,
      description,
      permissions,
    })

    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Check if another role with this name exists
    const nameConflict = await db.query.roles.findFirst({
      where: (roles, { and, eq, ne }) => and(eq(roles.name, name), ne(roles.id, id)),
    })

    if (nameConflict) {
      return { success: false, error: "Another role with this name already exists" }
    }

    // Update the role
    const updatedRole = await db
      .update(roles)
      .set({
        name,
        description,
        permissions,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning()

    revalidatePath("/admin/roles")
    return { success: true, data: updatedRole[0] }
  } catch (error) {
    console.error("Error updating role:", error)
    return { success: false, error: "Failed to update role" }
  }
}

// Delete a role
export async function deleteRole(id: string) {
  await checkAdmin()

  try {
    // Check if role exists
    const existingRole = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    })

    if (!existingRole) {
      return { success: false, error: "Role not found" }
    }

    // Don't allow deleting system roles
    if (existingRole.isSystem) {
      return { success: false, error: "System roles cannot be deleted" }
    }

    // Check if any users are using this role
    const usersWithRole = await db.query.user.findFirst({
      where: eq(user.role, existingRole.name),
    })

    if (usersWithRole) {
      return { success: false, error: "Cannot delete a role that is assigned to users" }
    }

    // Delete the role
    await db.delete(roles).where(eq(roles.id, id))

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    console.error("Error deleting role:", error)
    return { success: false, error: "Failed to delete role" }
  }
}

// Initialize default roles if they don't exist
export async function initializeDefaultRoles() {
  try {
    // Check if default roles already exist
    const adminRole = await db.query.roles.findFirst({
      where: eq(roles.name, "admin"),
    })

    if (adminRole) {
      // Roles already initialized
      return { success: true }
    }

    // Create default roles
    const defaultRoles = [
      {
        id: nanoid(),
        name: "admin",
        description: "Full access to all resources",
        isSystem: true,
        permissions: [
          { resource: "user", actions: ["create", "read", "update", "delete", "ban", "impersonate"] },
          { resource: "session", actions: ["read", "revoke"] },
          { resource: "project", actions: ["create", "read", "update", "delete", "share"] },
          { resource: "content", actions: ["create", "read", "update", "delete", "publish"] },
          { resource: "settings", actions: ["read", "update"] },
          { resource: "role", actions: ["create", "read", "update", "delete"] },
        ],
      },
      {
        id: nanoid(),
        name: "user",
        description: "Regular user with limited access",
        isSystem: true,
        permissions: [
          { resource: "project", actions: ["create", "read", "update"] },
          { resource: "content", actions: ["create", "read", "update"] },
          { resource: "settings", actions: ["read"] },
        ],
      },
      {
        id: nanoid(),
        name: "editor",
        description: "Can manage content but not users",
        isSystem: true,
        permissions: [
          { resource: "project", actions: ["read"] },
          { resource: "content", actions: ["create", "read", "update", "publish"] },
          { resource: "settings", actions: ["read"] },
        ],
      },
      {
        id: nanoid(),
        name: "moderator",
        description: "Can moderate content and ban users",
        isSystem: true,
        permissions: [
          { resource: "user", actions: ["ban"] },
          { resource: "content", actions: ["read", "update", "delete"] },
          { resource: "settings", actions: ["read"] },
        ],
      },
    ]

    // Insert default roles
    await db.insert(roles).values(defaultRoles)

    return { success: true }
  } catch (error) {
    console.error("Error initializing default roles:", error)
    return { success: false, error: "Failed to initialize default roles" }
  }
}



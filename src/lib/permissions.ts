import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"

// Define custom permissions for your application
const statement = {
  ...defaultStatements,
  project: ["create", "read", "update", "delete", "share"],
  content: ["create", "read", "update", "delete", "publish"],
  settings: ["read", "update"],
} as const

// Create access control instance
export const ac = createAccessControl(statement)

// Define roles with their permissions
export const adminRole = ac.newRole({
  ...adminAc.statements, // Include all default admin permissions
  project: ["create", "read", "update", "delete", "share"],
  content: ["create", "read", "update", "delete", "publish"],
  settings: ["read", "update"],
})

export const userRole = ac.newRole({
  project: ["create", "read", "update"],
  content: ["create", "read", "update"],
  settings: ["read"],
})

export const editorRole = ac.newRole({
  project: ["read"],
  content: ["create", "read", "update", "publish"],
  settings: ["read"],
})

export const moderatorRole = ac.newRole({
  user: ["ban"],
  content: ["read", "update", "delete"],
  settings: ["read"],
})


import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core"

// Rename the export to match what Better Auth is looking for
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").default(false),
  image: text("image"),
  phoneNumber: text("phoneNumber"),
  phoneNumberVerified: boolean("phoneNumberVerified").default(false),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Keep the rest of the tables as they are
export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  activeOrganizationId: text("activeOrganizationId"),
  impersonatedBy: text("impersonatedBy"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  accountId: text("accountId"),
  providerId: text("providerId"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Update the twoFactorTable schema to match Better Auth's expectations
export const twoFactorTable = pgTable("twoFactor", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  secret: text("secret"),
  backupCodes: text("backupCodes"),
  method: text("method"), // Add method field to specify the 2FA method (totp, email, etc.)
  verified: boolean("verified").default(false), // Add verified field to track if 2FA is verified
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// New tables for roles and permissions
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: boolean("isSystem").default(false), // To mark system roles that shouldn't be deleted
  permissions: jsonb("permissions").notNull(), // Store permissions as JSON
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Define the types for permissions
export type Permission = {
  resource: string
  actions: string[]
}

export type RoleWithPermissions = {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: Permission[]
  createdAt: Date
  updatedAt: Date
}



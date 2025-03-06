"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().optional(),
});

export async function updateUserProfile(formData: FormData) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // 🔹 Log form data to debug
    console.log("Raw Form Data:", Object.fromEntries(formData.entries()));

    // Parse and validate form data
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const phoneNumber = formData.get("phoneNumber") as string | undefined;

    const validationResult = updateProfileSchema.safeParse({
      name,
      email,
      phoneNumber,
    });

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validationResult.error.flatten().fieldErrors, // 🔹 Return detailed errors
      };
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await db.query.user.findFirst({
        where: (user, { and, eq, ne }) => and(eq(user.email, email), ne(user.id, session.user.id)),
      });

      if (existingUser) {
        return { success: false, error: "Email is already in use" };
      }
    }

    // Update user profile
    await db
      .update(user)
      .set({
        name,
        email: email !== session.user.email ? email : undefined,
        phoneNumber: phoneNumber !== session.user.phoneNumber ? phoneNumber : undefined,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    // Revalidate the profile page to show updated data
    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}


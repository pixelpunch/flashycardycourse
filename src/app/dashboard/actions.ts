"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, decks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const CreateDeckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100, "Deck name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  try {
    // 1. Validate input
    const validatedData = CreateDeckSchema.parse(input);
    
    // 2. Authentication and feature access check
    const { userId: clerkUserId, has } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Get user's database ID
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    if (!user.length) {
      return { success: false, error: "User not found" };
    }
    const dbUserId = user[0].id;

    // 4. Check deck limit for free users
    const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
    
    if (!hasUnlimitedDecks) {
      // Count existing decks
      const existingDecks = await db.select().from(decks).where(eq(decks.userId, dbUserId));
      
      if (existingDecks.length >= 3) {
        return { 
          success: false, 
          error: "Deck limit reached. Upgrade to Pro for unlimited decks.",
          limitReached: true 
        };
      }
    }

    // 5. Create deck
    const newDeck = await db.insert(decks).values({
      userId: dbUserId,
      name: validatedData.name,
      description: validatedData.description || null,
    }).returning();

    // 6. Revalidate dashboard page
    revalidatePath("/dashboard");

    return { success: true, data: newDeck[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", details: error.issues };
    }
    
    console.error("Create deck error:", error);
    return { success: false, error: "Failed to create deck" };
  }
}


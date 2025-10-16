"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, studySessions, decks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const SaveSessionSchema = z.object({
  deckId: z.string().uuid(),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
  totalCards: z.number().int().min(1),
  accuracyPercentage: z.number().int().min(0).max(100),
});

type SaveSessionInput = z.infer<typeof SaveSessionSchema>;

export async function saveStudySession(input: SaveSessionInput) {
  try {
    // 1. Validate input
    const validatedData = SaveSessionSchema.parse(input);

    // 2. Authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      throw new Error("Unauthorized");
    }

    // 3. Get user's database ID
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    if (!user.length) {
      throw new Error("User not found");
    }
    const dbUserId = user[0].id;

    // 4. Verify deck ownership before saving session
    const deck = await db
      .select()
      .from(decks)
      .where(and(
        eq(decks.id, validatedData.deckId),
        eq(decks.userId, dbUserId)
      ));

    if (!deck.length) {
      throw new Error("Deck not found or access denied");
    }

    // 5. Save study session
    const newSession = await db.insert(studySessions).values({
      userId: dbUserId,
      deckId: validatedData.deckId,
      correctCount: validatedData.correctCount,
      incorrectCount: validatedData.incorrectCount,
      totalCards: validatedData.totalCards,
      accuracyPercentage: validatedData.accuracyPercentage,
    }).returning();

    return { success: true, data: newSession[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", details: error.issues };
    }

    console.error("Failed to save study session:", error);
    return { success: false, error: "Failed to save study session" };
  }
}


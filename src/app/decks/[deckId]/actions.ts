"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, cards, decks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const CreateCardSchema = z.object({
  front: z.string().min(1, "Front content is required").max(1000, "Front content is too long"),
  back: z.string().min(1, "Back content is required").max(1000, "Back content is too long"),
});

type CreateCardInput = z.infer<typeof CreateCardSchema>;

const UpdateCardSchema = z.object({
  id: z.string().uuid(),
  front: z.string().min(1, "Front content is required").max(1000, "Front content is too long"),
  back: z.string().min(1, "Back content is required").max(1000, "Back content is too long"),
});

type UpdateCardInput = z.infer<typeof UpdateCardSchema>;

const UpdateDeckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100, "Deck name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

export async function createCard(deckId: string, input: CreateCardInput) {
  try {
    // 1. Validate input
    const validatedData = CreateCardSchema.parse(input);
    
    // 2. Authentication check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Get user's database ID
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    if (!user.length) {
      return { success: false, error: "User not found" };
    }
    const dbUserId = user[0].id;

    // 4. Verify deck ownership
    const deck = await db
      .select()
      .from(decks)
      .where(and(
        eq(decks.id, deckId),
        eq(decks.userId, dbUserId)
      ));

    if (!deck.length) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // 5. Create the card
    const newCard = await db
      .insert(cards)
      .values({
        deckId: deckId,
        front: validatedData.front,
        back: validatedData.back,
      })
      .returning();

    // 6. Revalidate the page to show the new card
    revalidatePath(`/decks/${deckId}`);

    return { success: true, data: newCard[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: error.errors 
      };
    }
    
    console.error("Create card error:", error);
    return { success: false, error: "Failed to create card" };
  }
}

export async function updateCard(deckId: string, input: UpdateCardInput) {
  try {
    // 1. Validate input
    const validatedData = UpdateCardSchema.parse(input);
    
    // 2. Authentication check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Get user's database ID
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    if (!user.length) {
      return { success: false, error: "User not found" };
    }
    const dbUserId = user[0].id;

    // 4. Verify deck ownership
    const deck = await db
      .select()
      .from(decks)
      .where(and(
        eq(decks.id, deckId),
        eq(decks.userId, dbUserId)
      ));

    if (!deck.length) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // 5. Verify card belongs to the deck
    const existingCard = await db
      .select()
      .from(cards)
      .where(and(
        eq(cards.id, validatedData.id),
        eq(cards.deckId, deckId)
      ));

    if (!existingCard.length) {
      return { success: false, error: "Card not found or access denied" };
    }

    // 6. Update the card
    const updatedCard = await db
      .update(cards)
      .set({
        front: validatedData.front,
        back: validatedData.back,
        updatedAt: new Date(),
      })
      .where(eq(cards.id, validatedData.id))
      .returning();

    // 7. Revalidate the page to show updated data
    revalidatePath(`/decks/${deckId}`);

    return { success: true, data: updatedCard[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: error.errors 
      };
    }
    
    console.error("Update card error:", error);
    return { success: false, error: "Failed to update card" };
  }
}

export async function updateDeck(deckId: string, input: UpdateDeckInput) {
  try {
    // 1. Validate input
    const validatedData = UpdateDeckSchema.parse(input);
    
    // 2. Authentication check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Get user's database ID
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    if (!user.length) {
      return { success: false, error: "User not found" };
    }
    const dbUserId = user[0].id;

    // 4. Verify deck ownership
    const existingDeck = await db
      .select()
      .from(decks)
      .where(and(
        eq(decks.id, deckId),
        eq(decks.userId, dbUserId)
      ));

    if (!existingDeck.length) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // 5. Update the deck
    const updatedDeck = await db
      .update(decks)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        updatedAt: new Date(),
      })
      .where(and(
        eq(decks.id, deckId),
        eq(decks.userId, dbUserId)
      ))
      .returning();

    // 6. Revalidate the page to show updated data
    revalidatePath(`/decks/${deckId}`);

    return { success: true, data: updatedDeck[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: error.errors 
      };
    }
    
    console.error("Update deck error:", error);
    return { success: false, error: "Failed to update deck" };
  }
}

export async function deleteCard(deckId: string, cardId: string) {
  try {
    // 1. Authentication check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Get user's database ID
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    if (!user.length) {
      return { success: false, error: "User not found" };
    }
    const dbUserId = user[0].id;

    // 3. Verify deck ownership
    const deck = await db
      .select()
      .from(decks)
      .where(and(
        eq(decks.id, deckId),
        eq(decks.userId, dbUserId)
      ));

    if (!deck.length) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // 4. Verify card belongs to the deck
    const existingCard = await db
      .select()
      .from(cards)
      .where(and(
        eq(cards.id, cardId),
        eq(cards.deckId, deckId)
      ));

    if (!existingCard.length) {
      return { success: false, error: "Card not found or access denied" };
    }

    // 5. Delete the card
    await db
      .delete(cards)
      .where(eq(cards.id, cardId));

    // 6. Revalidate the page to show updated data
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete card error:", error);
    return { success: false, error: "Failed to delete card" };
  }
}


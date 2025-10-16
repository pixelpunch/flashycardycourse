"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, cards, decks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

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
        details: error.issues 
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
        details: error.issues 
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
        details: error.issues 
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

export async function deleteDeck(deckId: string) {
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

    // 3. Verify deck ownership before deletion
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

    // 4. Delete the deck (associated cards will be automatically deleted via cascade)
    await db
      .delete(decks)
      .where(and(
        eq(decks.id, deckId),
        eq(decks.userId, dbUserId)
      ));

    // 5. Revalidate the dashboard page to show updated deck list
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete deck error:", error);
    return { success: false, error: "Failed to delete deck" };
  }
}

// AI Flashcard Generation Schema
const FlashcardGenerationSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
    })
  ),
});

export async function generateCardsWithAI(deckId: string) {
  try {
    // 1. Authentication check
    const { userId: clerkUserId, has } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Feature gate check - AI requires Pro plan
    const canUseAI = has({ feature: 'ai_flashcard_generation' });
    if (!canUseAI) {
      return { 
        success: false, 
        error: "AI flashcard generation requires a Pro subscription",
        requiresUpgrade: true 
      };
    }

    // 3. Get user's database ID
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    if (!user.length) {
      return { success: false, error: "User not found" };
    }
    const dbUserId = user[0].id;

    // 4. Verify deck ownership and get deck details
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

    const deckData = deck[0];

    // 5. Check if deck has a description (required for AI generation)
    if (!deckData.description || deckData.description.trim() === "") {
      return { 
        success: false, 
        error: "Please add a description to your deck before generating cards. The description helps the AI create relevant flashcards tailored to your specific needs.",
        requiresDescription: true
      };
    }

    // 6. Generate flashcards using Vercel AI SDK
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: FlashcardGenerationSchema,
      prompt: `Generate exactly 20 educational flashcards for a deck titled: "${deckData.name}"

Deck Description: ${deckData.description}

CRITICAL INSTRUCTIONS:

1. ANALYZE THE DECK DESCRIPTION to understand what type of learning this is (language learning, history, science, vocabulary, etc.)

2. CHOOSE THE APPROPRIATE CARD FORMAT:

   FOR LANGUAGE LEARNING (e.g., learning German, Spanish, French, etc.):
   - Front: A word, phrase, or sentence in the SOURCE language (e.g., English)
   - Back: The direct translation in the TARGET language (e.g., German)
   - Keep it simple and direct - NO questions, NO explanations, just translations
   - Example for English to German:
     Front: "Hello"
     Back: "Hallo"
   - Example for sentences:
     Front: "How are you?"
     Back: "Wie geht es dir?"

   FOR OTHER SUBJECTS (history, science, vocabulary, concepts, etc.):
   - Front: A clear, concise question
   - Back: A complete but concise answer
   - Example:
     Front: "What year did World War II end?"
     Back: "1945"

3. ENSURE QUALITY:
   - Make cards concise and focused on one concept each
   - Use proper grammar and spelling
   - Ensure each card tests a unique item
   - Align all cards with the deck description's learning objectives
   - For language cards: include a variety of common words, phrases, and useful sentences
   - For concept cards: cover different aspects of the topic

Generate cards that will actually help someone learn effectively based on the deck description above.`,
    });

    // 7. Insert generated cards into database
    if (!object.cards || object.cards.length === 0) {
      return { success: false, error: "No cards were generated. Please try again." };
    }

    const newCards = await db.insert(cards).values(
      object.cards.map(card => ({
        deckId: deckId,
        front: card.front,
        back: card.back,
      }))
    ).returning();

    // 8. Revalidate the page to show new cards
    revalidatePath(`/decks/${deckId}`);

    return { success: true, cards: newCards, count: newCards.length };
  } catch (error) {
    console.error("AI generation error:", error);
    return { success: false, error: "Failed to generate flashcards. Please try again." };
  }
}


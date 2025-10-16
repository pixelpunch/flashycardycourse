import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users, decks, cards } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { StudySession } from "@/components/study-session";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StudyPageProps {
  params: {
    deckId: string;
  };
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { deckId } = await params;

  // 1. Check authentication
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/");
  }

  // 2. Get user's database ID or create user if doesn't exist
  let user = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
  
  // If user doesn't exist in database, create them (Just-In-Time provisioning)
  if (!user.length) {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      redirect("/");
    }
    
    const newUser = await db.insert(users).values({
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
    }).returning();
    
    user = newUser;
  }
  
  const dbUserId = user[0].id;

  // 3. Fetch the deck with ownership verification
  const userDeck = await db
    .select()
    .from(decks)
    .where(and(
      eq(decks.id, deckId),
      eq(decks.userId, dbUserId)
    ));

  // If deck doesn't exist or user doesn't own it, show 404
  if (!userDeck.length) {
    notFound();
  }

  const deck = userDeck[0];

  // 4. Fetch all cards for this deck
  const deckCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId));

  // If no cards, redirect back to deck page
  if (!deckCards.length) {
    redirect(`/decks/${deckId}`);
  }

  // 5. Serialize cards data for client components (convert Date objects to strings)
  const serializedCards = deckCards.map(card => ({
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href={`/decks/${deckId}`}>
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Deck
            </Link>
          </Button>
        </div>

        {/* Deck Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {deck.name}
          </h1>
          <p className="text-muted-foreground">
            Study Session
          </p>
        </div>

        {/* Study Session Component */}
        <StudySession cards={serializedCards} deckId={deckId} />
      </div>
    </div>
  );
}


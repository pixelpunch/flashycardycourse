import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users, decks, cards } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardList } from "@/components/card-list";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { AddCardModal } from "@/components/add-card-modal";
import Link from "next/link";

interface DeckPageProps {
  params: {
    deckId: string;
  };
}

export default async function DeckPage({ params }: DeckPageProps) {
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

  // 4. Fetch all cards for this deck (sorted by latest updated first)
  const deckCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(desc(cards.updatedAt));

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
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
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Deck Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {deck.name}
                </h1>
                <Badge variant="secondary" className="text-sm">
                  {deckCards.length} {deckCards.length === 1 ? 'card' : 'cards'}
                </Badge>
              </div>
              {deck.description && (
                <p className="text-lg text-muted-foreground mt-2">
                  {deck.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {new Date(deck.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <EditDeckDialog deck={deck} />
              {deckCards.length > 0 && (
                <Button asChild>
                  <Link href={`/decks/${deckId}/study`}>
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Start Studying
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <AddCardModal deckId={deckId} />
        </div>

        {/* Cards Display */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Flashcards ({deckCards.length})
          </h2>

          {deckCards.length > 0 ? (
            <CardList cards={serializedCards} deckId={deckId} />
          ) : (
            <Card className="text-center py-12">
              <CardContent className="py-6">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No cards yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get started by adding your first flashcard to this deck
                </p>
                <AddCardModal 
                  deckId={deckId}
                  trigger={
                    <Button>
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Your First Card
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Deck Statistics */}
        {deckCards.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Deck Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Cards
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {deckCards.length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Created
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {new Date(deck.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {new Date(deck.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-accent-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


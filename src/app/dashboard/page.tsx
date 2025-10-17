import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, decks, cards, studySessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeckCard } from "@/components/deck-card";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { StatsModal } from "@/components/stats-modal";
import { QuickStudyModal } from "@/components/quick-study-modal";
import Link from "next/link";

export default async function DashboardPage() {
  // 1. Check authentication and feature access
  const { userId: clerkUserId, has } = await auth();
  if (!clerkUserId) {
    redirect("/");
  }

  // Check if user has unlimited decks feature (Pro plan)
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const hasDeckLimit = has({ feature: '3-deck_limit' });

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

  // 3. Fetch user's decks with card counts
  const userDecks = await db
    .select({
      id: decks.id,
      name: decks.name,
      description: decks.description,
      createdAt: decks.createdAt,
      updatedAt: decks.updatedAt,
    })
    .from(decks)
    .where(eq(decks.userId, dbUserId));

  // 4. Get total card count for the user
  const userCards = await db
    .select({
      count: cards.id,
      deckId: cards.deckId,
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, dbUserId));

  // 5. Fetch user's study sessions (last 10 sessions)
  const userStudySessions = await db
    .select({
      id: studySessions.id,
      deckId: studySessions.deckId,
      correctCount: studySessions.correctCount,
      incorrectCount: studySessions.incorrectCount,
      totalCards: studySessions.totalCards,
      accuracyPercentage: studySessions.accuracyPercentage,
      completedAt: studySessions.completedAt,
      deckName: decks.name,
    })
    .from(studySessions)
    .innerJoin(decks, eq(studySessions.deckId, decks.id))
    .where(eq(studySessions.userId, dbUserId))
    .orderBy(desc(studySessions.completedAt))
    .limit(10);

  // Serialize study sessions for client component
  const serializedSessions = userStudySessions.map(session => ({
    id: session.id,
    deckId: session.deckId,
    deckName: session.deckName,
    correctCount: session.correctCount,
    incorrectCount: session.incorrectCount,
    totalCards: session.totalCards,
    accuracyPercentage: session.accuracyPercentage,
    completedAt: session.completedAt.toISOString(),
  }));

  // Calculate statistics
  const totalDecks = userDecks.length;
  const totalCards = userCards.length;
  const decksWithCards = [...new Set(userCards.map(card => card.deckId))].length;

  // Create card count mapping for Quick Study modal
  const deckCardCounts = userCards.reduce((acc, card) => {
    acc[card.deckId] = (acc[card.deckId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user[0].firstName || "Student"}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Here&apos;s your flashcard learning progress
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Decks</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-foreground">{totalDecks}</p>
                    {hasDeckLimit && (
                      <span className="text-sm font-medium text-muted-foreground">/ 3</span>
                    )}
                  </div>
                  {hasDeckLimit && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              totalDecks >= 3 ? 'bg-destructive' : 
                              totalDecks >= 2 ? 'bg-yellow-500' : 
                              'bg-primary'
                            }`}
                            style={{ width: `${(totalDecks / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {totalDecks >= 3 ? 'Limit reached' : `${3 - totalDecks} remaining`}
                      </p>
                    </div>
                  )}
                  {hasUnlimitedDecks && (
                    <p className="text-xs text-primary mt-1 font-medium">Unlimited</p>
                  )}
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
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
                  <p className="text-sm font-medium text-muted-foreground">Total Cards</p>
                  <p className="text-3xl font-bold text-foreground">{totalCards}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Decks</p>
                  <p className="text-3xl font-bold text-foreground">{decksWithCards}</p>
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deck Limit Warning for Free Users */}
        {hasDeckLimit && totalDecks >= 2 && totalDecks < 3 && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    You&apos;re approaching your deck limit ({totalDecks}/3)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upgrade to Pro for unlimited decks.{" "}
                    <Link href="/pricing" className="font-medium text-primary hover:underline">
                      View Plans
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deck Limit Reached Warning for Free Users */}
        {hasDeckLimit && totalDecks >= 3 && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-destructive mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Deck limit reached (3/3)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You&apos;ve reached the maximum number of decks on the free plan.{" "}
                    <Link href="/pricing" className="font-medium text-primary hover:underline">
                      Upgrade to Pro
                    </Link>{" "}
                    for unlimited decks and AI flashcard generation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Decks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Your Decks</h2>
            {hasUnlimitedDecks || totalDecks < 3 ? (
              <CreateDeckDialog>
                <Button>Create New Deck</Button>
              </CreateDeckDialog>
            ) : (
              <Link href="/pricing">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Upgrade to Create More
                </Button>
              </Link>
            )}
          </div>

          {userDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDecks.slice(0, 6).map((deck) => {
                const deckCardCount = userCards.filter(card => card.deckId === deck.id).length;
                return (
                  <DeckCard 
                    key={deck.id} 
                    deck={deck} 
                    cardCount={deckCardCount}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent className="py-6">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No decks yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first flashcard deck
                </p>
                <CreateDeckDialog>
                  <Button>Create Your First Deck</Button>
                </CreateDeckDialog>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickStudyModal 
              decks={userDecks}
              deckCardCounts={deckCardCounts}
              studySessions={serializedSessions}
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-medium">Quick Study</span>
                  </div>
                </CardContent>
              </Card>
            </QuickStudyModal>
            
            <StatsModal
              totalDecks={totalDecks}
              totalCards={totalCards}
              decksWithCards={decksWithCards}
              hasUnlimitedDecks={hasUnlimitedDecks}
              hasDeckLimit={hasDeckLimit}
              studySessions={serializedSessions}
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium">Statistics</span>
                  </div>
                </CardContent>
              </Card>
            </StatsModal>
          </div>
        </div>
      </div>
    </div>
  );
}

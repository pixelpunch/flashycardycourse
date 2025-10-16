import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, decks, cards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeckCard } from "@/components/deck-card";
import Link from "next/link";

export default async function DashboardPage() {
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

  // Calculate statistics
  const totalDecks = userDecks.length;
  const totalCards = userCards.length;
  const decksWithCards = [...new Set(userCards.map(card => card.deckId))].length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user[0].firstName || "Student"}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Here's your flashcard learning progress
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Decks</p>
                  <p className="text-3xl font-bold text-foreground">{totalDecks}</p>
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

        {/* Recent Decks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Your Decks</h2>
            <Button asChild>
              <Link href="/decks/new">Create New Deck</Link>
            </Button>
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
                <Button asChild>
                  <Link href="/decks/new">Create Your First Deck</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <Link href="/decks" className="flex flex-col items-center space-y-2 text-center">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-medium">All Decks</span>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <Link href="/study" className="flex flex-col items-center space-y-2 text-center">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium">Quick Study</span>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <Link href="/stats" className="flex flex-col items-center space-y-2 text-center">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium">Statistics</span>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <Link href="/settings" className="flex flex-col items-center space-y-2 text-center">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

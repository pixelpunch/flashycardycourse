"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface StudySession {
  id: string;
  deckId: string;
  deckName: string;
  correctCount: number;
  incorrectCount: number;
  totalCards: number;
  accuracyPercentage: number;
  completedAt: string;
}

interface QuickStudyModalProps {
  children: React.ReactNode;
  decks: Deck[];
  deckCardCounts: Record<string, number>;
  studySessions: StudySession[];
}

export function QuickStudyModal({
  children,
  decks,
  deckCardCounts,
  studySessions,
}: QuickStudyModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [studyMode, setStudyMode] = useState<"all" | "quick">("all");
  const [randomizeCards, setRandomizeCards] = useState(true);
  const [quickReviewCount, setQuickReviewCount] = useState(10);

  // Filter decks that have cards
  const availableDecks = decks.filter(deck => deckCardCounts[deck.id] > 0);
  
  // Sort decks by recent activity, then by name
  const sortedDecks = availableDecks.sort((a, b) => {
    const aSession = studySessions.find(session => session.deckId === a.id);
    const bSession = studySessions.find(session => session.deckId === b.id);
    
    // If both have sessions, sort by most recent
    if (aSession && bSession) {
      return new Date(bSession.completedAt).getTime() - new Date(aSession.completedAt).getTime();
    }
    
    // If only one has sessions, prioritize it
    if (aSession && !bSession) return -1;
    if (!aSession && bSession) return 1;
    
    // If neither have sessions, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  // Format date helper
  const formatLastStudied = (deckId: string) => {
    const session = studySessions.find(session => session.deckId === deckId);
    if (!session) return "Never studied";
    
    const date = new Date(session.completedAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLastAccuracy = (deckId: string) => {
    const session = studySessions.find(session => session.deckId === deckId);
    return session ? session.accuracyPercentage : null;
  };

  const handleStartStudy = () => {
    if (!selectedDeck) return;
    
    setOpen(false);
    
    // Construct URL with study parameters
    const params = new URLSearchParams();
    if (studyMode === "quick") {
      params.set("limit", quickReviewCount.toString());
    }
    if (randomizeCards) {
      params.set("shuffle", "true");
    }
    
    const url = `/decks/${selectedDeck.id}/study${params.toString() ? `?${params.toString()}` : ""}`;
    window.location.href = url;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Study
          </DialogTitle>
          <DialogDescription>
            Choose a deck and study options to start learning
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* No Available Decks */}
          {availableDecks.length === 0 && (
            <Card className="text-center py-8">
              <CardContent className="py-6">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No decks ready for study</h3>
                <p className="text-muted-foreground mb-4">
                  Create a deck and add some cards to get started
                </p>
                <Button asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Deck Selection */}
          {availableDecks.length > 0 && (
            <>
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Select a Deck ({availableDecks.length} available)
                </Label>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                  {sortedDecks.map((deck) => {
                    const cardCount = deckCardCounts[deck.id] || 0;
                    const lastStudied = formatLastStudied(deck.id);
                    const lastAccuracy = getLastAccuracy(deck.id);
                    const isRecent = studySessions.some(session => 
                      session.deckId === deck.id && 
                      new Date(session.completedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
                    );

                    return (
                      <Card
                        key={deck.id}
                        className={`cursor-pointer transition-all hover:bg-accent/50 ${
                          selectedDeck?.id === deck.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => setSelectedDeck(deck)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground text-sm truncate">
                                  {deck.name}
                                </h4>
                                {isRecent && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    Recent
                                  </Badge>
                                )}
                              </div>
                              {deck.description && (
                                <p className="text-xs text-muted-foreground mb-2 overflow-hidden" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: '1.2em',
                                  maxHeight: '2.4em'
                                }}>
                                  {deck.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 shrink-0">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {cardCount} card{cardCount !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1 shrink-0">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {lastStudied}
                                </span>
                                {lastAccuracy !== null && (
                                  <Badge 
                                    variant={lastAccuracy >= 80 ? "default" : lastAccuracy >= 60 ? "secondary" : "destructive"}
                                    className="text-xs shrink-0"
                                  >
                                    {lastAccuracy}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0">
                              {selectedDeck?.id === deck.id ? (
                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                  <svg className="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Study Options */}
              {selectedDeck && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold block">
                    Study Options
                  </Label>
                  
                  {/* Study Mode */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Study Mode
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Card
                        className={`cursor-pointer transition-all hover:bg-accent/50 ${
                          studyMode === "all" ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setStudyMode("all")}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <div>
                              <p className="text-xs font-medium">Review All</p>
                              <p className="text-xs text-muted-foreground">
                                {deckCardCounts[selectedDeck.id]} cards
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all hover:bg-accent/50 ${
                          studyMode === "quick" ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setStudyMode("quick")}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div>
                              <p className="text-xs font-medium">Quick Review</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.min(quickReviewCount, deckCardCounts[selectedDeck.id])} cards
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Quick Review Settings */}
                  {studyMode === "quick" && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Number of Cards to Review
                      </Label>
                      <div className="flex gap-2">
                        {[5, 10, 15, 20].map((count) => (
                          <Button
                            key={count}
                            variant={quickReviewCount === count ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuickReviewCount(count)}
                            disabled={count > deckCardCounts[selectedDeck.id]}
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Options */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Additional Options
                    </Label>
                    <Card
                      className={`cursor-pointer transition-all hover:bg-accent/50 ${
                        randomizeCards ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setRandomizeCards(!randomizeCards)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <div className="min-w-0">
                              <p className="text-xs font-medium">Randomize Card Order</p>
                              <p className="text-xs text-muted-foreground truncate">
                                Shuffle cards for better learning
                              </p>
                            </div>
                          </div>
                          <div className={`h-4 w-4 rounded border-2 shrink-0 ${
                            randomizeCards 
                              ? "bg-primary border-primary" 
                              : "border-muted-foreground/30"
                          }`}>
                            {randomizeCards && (
                              <svg className="h-full w-full text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Start Study Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={handleStartStudy}
                      size="lg"
                      className="w-full"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-7 0V8a3 3 0 013-3h4a3 3 0 013 3v8a3 3 0 01-3 3H9a3 3 0 01-3-3v-2z" />
                      </svg>
                      Start Studying {selectedDeck.name}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

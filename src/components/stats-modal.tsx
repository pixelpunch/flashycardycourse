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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface StatsModalProps {
  children: React.ReactNode;
  totalDecks: number;
  totalCards: number;
  decksWithCards: number;
  hasUnlimitedDecks: boolean;
  hasDeckLimit: boolean;
  studySessions: StudySession[];
}

export function StatsModal({
  children,
  totalDecks,
  totalCards,
  decksWithCards,
  hasUnlimitedDecks,
  hasDeckLimit,
  studySessions,
}: StatsModalProps) {
  const [open, setOpen] = useState(false);

  const averageCardsPerDeck = totalDecks > 0 ? (totalCards / totalDecks).toFixed(1) : 0;
  const emptyDecks = totalDecks - decksWithCards;
  const completionRate = totalDecks > 0 ? ((decksWithCards / totalDecks) * 100).toFixed(0) : 0;

  // Calculate session statistics
  const totalSessions = studySessions.length;
  const totalCorrect = studySessions.reduce((sum, session) => sum + session.correctCount, 0);
  const totalIncorrect = studySessions.reduce((sum, session) => sum + session.incorrectCount, 0);
  const averageAccuracy = totalSessions > 0
    ? Math.round(studySessions.reduce((sum, session) => sum + session.accuracyPercentage, 0) / totalSessions)
    : 0;

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Statistics</DialogTitle>
          <DialogDescription>
            Overview of your flashcard learning progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Statistics */}
          {totalSessions > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Session Statistics</h3>
              
              {/* Overall Session Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                      <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <p className="text-sm text-muted-foreground mb-1">Correct Answers</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCorrect}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <p className="text-sm text-muted-foreground mb-1">Incorrect Answers</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalIncorrect}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                      <p className="text-2xl font-bold text-primary">{averageAccuracy}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sessions List */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {studySessions.map((session) => (
                      <div 
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {session.deckName}
                            </p>
                            <Badge 
                              variant={session.accuracyPercentage >= 80 ? "default" : session.accuracyPercentage >= 60 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {session.accuracyPercentage}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {session.correctCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              {session.incorrectCount}
                            </span>
                            <span>•</span>
                            <span>{session.totalCards} cards</span>
                          </div>
                        </div>
                        <div className="ml-3 text-right">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(session.completedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Deck Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Deck Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">Total Decks</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-foreground">{totalDecks}</p>
                      {hasDeckLimit && (
                        <span className="text-sm text-muted-foreground">/ 3</span>
                      )}
                      {hasUnlimitedDecks && (
                        <span className="text-xs text-primary font-medium">∞</span>
                      )}
                    </div>
                    {hasDeckLimit && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              totalDecks >= 3 ? 'bg-destructive' : 
                              totalDecks >= 2 ? 'bg-yellow-500' : 
                              'bg-primary'
                            }`}
                            style={{ width: `${(totalDecks / 3) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalDecks >= 3 ? 'Limit reached' : `${3 - totalDecks} remaining`}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">Active Decks</p>
                    <p className="text-2xl font-bold text-foreground">{decksWithCards}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completionRate}% of total decks
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">Empty Decks</p>
                    <p className="text-2xl font-bold text-foreground">{emptyDecks}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting cards
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">Avg Cards/Deck</p>
                    <p className="text-2xl font-bold text-foreground">{averageCardsPerDeck}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per active deck
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Card Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Card Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Cards</p>
                      <p className="text-2xl font-bold text-foreground">{totalCards}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Ready to Study</p>
                      <p className="text-2xl font-bold text-foreground">{totalCards}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Account Status</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                    <p className="text-xl font-bold text-foreground">
                      {hasUnlimitedDecks ? "Pro" : "Free"}
                    </p>
                    {hasUnlimitedDecks ? (
                      <p className="text-xs text-primary mt-1">
                        ✓ Unlimited decks • ✓ AI generation
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Limited to 3 decks
                      </p>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-full ${hasUnlimitedDecks ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center`}>
                    {hasUnlimitedDecks ? (
                      <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Tips */}
          {totalDecks > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Insights</h3>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {emptyDecks > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <p className="text-sm text-foreground">
                          You have {emptyDecks} empty {emptyDecks === 1 ? 'deck' : 'decks'}. Add cards to start studying!
                        </p>
                      </div>
                    )}
                    {totalCards > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <p className="text-sm text-foreground">
                          You have {totalCards} cards ready for review. Keep up the great work!
                        </p>
                      </div>
                    )}
                    {!hasUnlimitedDecks && totalDecks >= 2 && (
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <p className="text-sm text-foreground">
                          Consider upgrading to Pro for unlimited decks and AI-powered flashcard generation.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


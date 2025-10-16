"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { saveStudySession } from "@/app/decks/[deckId]/study/actions";

interface CardData {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
}

interface StudySessionProps {
  cards: CardData[];
  deckId: string;
}

interface CardResult {
  cardId: string;
  result: 'correct' | 'incorrect' | null;
}

export function StudySession({ cards, deckId }: StudySessionProps) {
  const [shuffledCards, setShuffledCards] = useState<CardData[]>(cards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardResults, setCardResults] = useState<CardResult[]>(
    cards.map(card => ({ cardId: card.id, result: null }))
  );

  const currentCard = shuffledCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / shuffledCards.length) * 100;
  
  // Calculate statistics
  const correctCount = cardResults.filter(r => r.result === 'correct').length;
  const incorrectCount = cardResults.filter(r => r.result === 'incorrect').length;

  const handlePrevious = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const saveSessionData = useCallback(async () => {
    const correctCount = cardResults.filter(r => r.result === 'correct').length;
    const incorrectCount = cardResults.filter(r => r.result === 'incorrect').length;
    const accuracyPercentage = shuffledCards.length > 0
      ? Math.round((correctCount / shuffledCards.length) * 100)
      : 0;

    const result = await saveStudySession({
      deckId,
      correctCount,
      incorrectCount,
      totalCards: shuffledCards.length,
      accuracyPercentage,
    });

    if (!result.success) {
      console.error("Failed to save study session:", result.error);
    }
  }, [cardResults, shuffledCards.length, deckId]);

  const handleCorrect = useCallback(async () => {
    // Mark current card as correct
    const updatedResults = cardResults.map(result =>
      result.cardId === currentCard.id
        ? { ...result, result: 'correct' as const }
        : result
    );
    setCardResults(updatedResults);
    
    // Move to next card
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      // Save session when completed
      await saveSessionData();
    }
  }, [cardResults, currentCard.id, currentCardIndex, shuffledCards.length, saveSessionData]);

  const handleIncorrect = useCallback(async () => {
    // Mark current card as incorrect
    const updatedResults = cardResults.map(result =>
      result.cardId === currentCard.id
        ? { ...result, result: 'incorrect' as const }
        : result
    );
    setCardResults(updatedResults);
    
    // Move to next card
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      // Save session when completed
      await saveSessionData();
    }
  }, [cardResults, currentCard.id, currentCardIndex, shuffledCards.length, saveSessionData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for arrow keys, spacebar, and number keys
      if (['ArrowLeft', 'ArrowRight', ' ', '1', '2'].includes(event.key)) {
        event.preventDefault();
      }

      // Don't handle keyboard events if study session is completed
      if (isCompleted) return;

      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          if (!isFlipped) {
            handleFlip();
          }
          break;
        case ' ':
          handleFlip();
          break;
        case '1':
          if (isFlipped) {
            handleIncorrect();
          }
          break;
        case '2':
          if (isFlipped) {
            handleCorrect();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCardIndex, isFlipped, isCompleted, shuffledCards.length, handlePrevious, handleFlip, handleCorrect, handleIncorrect]);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: CardData[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(cards);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setCardResults(shuffled.map(card => ({ cardId: card.id, result: null })));
  };

  const handleNext = async () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      // Save session when completed
      await saveSessionData();
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setCardResults(shuffledCards.map(card => ({ cardId: card.id, result: null })));
  };

  // Completion Screen
  if (isCompleted) {
    const accuracyPercentage = shuffledCards.length > 0
      ? Math.round((correctCount / shuffledCards.length) * 100)
      : 0;

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg
                  className="h-10 w-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Congratulations!
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                You&apos;ve completed this study session
              </p>
              <p className="text-muted-foreground">
                You reviewed {shuffledCards.length} {shuffledCards.length === 1 ? 'card' : 'cards'}
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {correctCount}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {incorrectCount}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">
                  {accuracyPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button onClick={handleRestart} size="lg">
                <svg
                  className="h-5 w-5 mr-2"
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
                Study Again
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`/decks/${deckId}`}>
                  <svg
                    className="h-5 w-5 mr-2"
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Progress
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              className="flex items-center gap-2"
            >
              <svg
                className="h-4 w-4"
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
              Shuffle
            </Button>
            <Badge variant="secondary">
              {currentCardIndex + 1} / {shuffledCards.length}
            </Badge>
          </div>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8 perspective-1000">
        <div
          className={`relative w-full min-h-[400px] transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of Card */}
          <Card
            className={`absolute inset-0 w-full backface-hidden min-h-[400px] flex items-center justify-center ${
              isFlipped ? 'invisible' : 'visible'
            }`}
            style={{
              backfaceVisibility: 'hidden',
            }}
          >
            <CardContent className="p-12 w-full">
              <div className="text-center">
                <Badge variant="outline" className="mb-6">
                  Question
                </Badge>
                <p className="text-2xl font-medium text-foreground whitespace-pre-wrap break-words">
                  {currentCard.front}
                </p>
                <p className="text-sm text-muted-foreground mt-8">
                  Click to reveal answer
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back of Card */}
          <Card
            className={`absolute inset-0 w-full backface-hidden min-h-[400px] flex items-center justify-center ${
              !isFlipped ? 'invisible' : 'visible'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="p-12 w-full">
              <div className="text-center">
                <Badge variant="outline" className="mb-6">
                  Answer
                </Badge>
                <p className="text-2xl font-medium text-foreground whitespace-pre-wrap break-words">
                  {currentCard.back}
                </p>
                <p className="text-sm text-muted-foreground mt-8">
                  Click to flip back
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="space-y-4">
        {/* Rating Buttons - Only visible when card is flipped */}
        {isFlipped && (
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Did you get it right?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleIncorrect}
                className="border-red-500/20 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="hidden sm:inline">Incorrect</span>
                <span className="sm:hidden">✗</span>
              </Button>

              <Button
                size="lg"
                onClick={handleCorrect}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="hidden sm:inline">Correct</span>
                <span className="sm:hidden">✓</span>
              </Button>
            </div>
          </div>
        )}

        {/* Main Navigation - Always visible with 3 buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="w-full"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <Button
            variant={isFlipped ? "outline" : "default"}
            size="lg"
            onClick={handleFlip}
            className="w-full"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2"
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
            <span className="hidden sm:inline">{isFlipped ? "Hide" : "Show"}</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentCardIndex === shuffledCards.length - 1}
            className="w-full"
          >
            <span className="hidden sm:inline">Next</span>
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 sm:ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium">Keyboard Shortcuts:</span> 
          {!isFlipped ? (
            <>
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono mx-1">←</kbd> Previous, 
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono mx-1">→</kbd> or <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono mx-1">Space</kbd> Show Answer
            </>
          ) : (
            <>
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono mx-1">1</kbd> Incorrect, 
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono mx-1">2</kbd> Correct
            </>
          )}
        </p>
      </div>
    </div>
  );
}


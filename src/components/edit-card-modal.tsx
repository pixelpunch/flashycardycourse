"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateCard } from "@/app/decks/[deckId]/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: string;
  updatedAt: string;
}

interface EditCardModalProps {
  card: Card;
  deckId: string;
  trigger?: React.ReactNode;
}

export function EditCardModal({ card, deckId, trigger }: EditCardModalProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await updateCard(deckId, {
      id: card.id,
      front,
      back,
    });

    setIsSubmitting(false);

    if (result.success) {
      setOpen(false);
      // Reset form state on successful update
      setFront(result.data!.front);
      setBack(result.data!.back);
      toast.success("Card updated successfully!");
    } else {
      setError(result.error || "Failed to update card");
      toast.error(result.error || "Failed to update card");
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFront(card.front);
    setBack(card.back);
    setError(null);
    setOpen(false);
  };

  const modalContent = open && mounted ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
      />
      
      {/* Modal Content */}
      <div
        className="relative z-[9999] bg-background rounded-lg border shadow-lg w-[calc(100vw-2rem)] sm:w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          type="button"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold leading-none">Edit Flashcard</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Update the front and back content of your flashcard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="front">Front (Question)</Label>
                <Textarea
                  id="front"
                  name="front"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Enter the question or prompt"
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {front.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="back">Back (Answer)</Label>
                <Textarea
                  id="back"
                  name="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Enter the answer or explanation"
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {back.length}/1000 characters
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !front.trim() || !back.trim()}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          type="button"
          className="h-8 w-8 p-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Button>
      )}
      {mounted && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}


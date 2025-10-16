"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDeck } from "@/app/decks/[deckId]/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DeleteDeckDialogProps {
  deck: Deck;
  cardCount: number;
  trigger?: React.ReactNode;
}

export function DeleteDeckDialog({ deck, cardCount, trigger }: DeleteDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteDeck(deck.id);

      if (result.success) {
        toast.success("Deck deleted successfully");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete deck");
        setIsDeleting(false);
        setOpen(false);
      }
    } catch (error) {
      console.error("Delete deck error:", error);
      toast.error("An unexpected error occurred");
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="destructive">
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Deck
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <div>
                This action cannot be undone. This will permanently delete the deck{" "}
                <span className="font-semibold text-foreground">&quot;{deck.name}&quot;</span>
                {cardCount > 0 && (
                  <>
                    {" "}and all <span className="font-semibold text-foreground">{cardCount}</span>{" "}
                    {cardCount === 1 ? "card" : "cards"} associated with it
                  </>
                )}
                .
              </div>
              {cardCount > 0 && (
                <div className="text-destructive font-medium">
                  Warning: All {cardCount} {cardCount === 1 ? "card" : "cards"} will be permanently deleted!
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Deck"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


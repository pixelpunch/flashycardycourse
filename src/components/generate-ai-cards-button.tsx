"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateCardsWithAI } from "@/app/decks/[deckId]/actions";
import { toast } from "sonner";

interface GenerateAICardsButtonProps {
  deckId: string;
  hasAIFeature: boolean;
  hasDescription: boolean;
}

export function GenerateAICardsButton({ deckId, hasAIFeature, hasDescription }: GenerateAICardsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    // If user doesn't have AI feature, redirect to pricing
    if (!hasAIFeature) {
      router.push("/pricing");
      return;
    }

    // If deck doesn't have a description, show warning
    if (!hasDescription) {
      toast.error("Please add a description to your deck before generating cards with AI");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCardsWithAI(deckId);

      if (result.success && result.count) {
        toast.success(`Successfully generated ${result.count} flashcards!`);
        router.refresh();
      } else if (result.requiresUpgrade) {
        toast.error(result.error || "This feature requires a Pro subscription");
        router.push("/pricing");
      } else if (result.requiresDescription) {
        toast.error(result.error || "Please add a description to your deck first");
      } else {
        toast.error(result.error || "Failed to generate cards");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Generate cards error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const button = (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating || (!hasAIFeature && hasDescription) || (hasAIFeature && !hasDescription)}
      variant={hasAIFeature && hasDescription ? "default" : "secondary"}
      className={!hasAIFeature || !hasDescription ? "cursor-pointer" : ""}
    >
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      {isGenerating ? "Generating..." : "Generate Cards with AI"}
    </Button>
  );

  // Determine tooltip message based on conditions
  let tooltipMessage = "";
  if (!hasAIFeature) {
    tooltipMessage = "This is a Pro feature. Click to view pricing plans.";
  } else if (!hasDescription) {
    tooltipMessage = "Please add a description to your deck first. The AI uses the description to generate relevant flashcards.";
  }

  // If there's a tooltip message to show, wrap button in tooltip
  if (tooltipMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If user has AI feature and deck has description, return button without tooltip
  return button;
}


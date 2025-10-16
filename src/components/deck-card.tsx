"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DeckCardProps {
  deck: {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
  };
  cardCount: number;
}

export function DeckCard({ deck, cardCount }: DeckCardProps) {
  return (
    <Link href={`/decks/${deck.id}`}>
      <Card className="hover:bg-card/80 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg truncate">
              {deck.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {cardCount} cards
            </Badge>
          </div>
          {deck.description && (
            <CardDescription className="line-clamp-2">
              {deck.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardFooter className="pt-0 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Updated {new Date(deck.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/decks/${deck.id}/study`;
            }}
          >
            <span>Study</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}


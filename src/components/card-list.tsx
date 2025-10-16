"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditCardModal } from "@/components/edit-card-modal";
import { DeleteCardDialog } from "@/components/delete-card-dialog";

interface CardData {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
}

interface CardListProps {
  cards: CardData[];
  deckId: string;
}

export function CardList({ cards, deckId }: CardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card key={card.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-end gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
              <div className="relative z-10 flex items-center gap-1">
                <EditCardModal card={card} deckId={deckId} />
                <DeleteCardDialog cardId={card.id} deckId={deckId} />
              </div>
            </div>
            <CardTitle className="text-lg">Front</CardTitle>
            <CardDescription className="mt-2 text-foreground line-clamp-3">
              {card.front}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Back
              </p>
              <p className="text-sm text-foreground line-clamp-3">
                {card.back}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


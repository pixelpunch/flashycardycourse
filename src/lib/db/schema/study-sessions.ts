import { pgTable, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { decks } from "./decks";

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  deckId: uuid("deck_id").references(() => decks.id, { onDelete: "cascade" }).notNull(),
  correctCount: integer("correct_count").notNull().default(0),
  incorrectCount: integer("incorrect_count").notNull().default(0),
  totalCards: integer("total_cards").notNull(),
  accuracyPercentage: integer("accuracy_percentage").notNull().default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});


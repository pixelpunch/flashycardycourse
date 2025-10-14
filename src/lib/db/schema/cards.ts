import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { decks } from "./decks";

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  deckId: uuid("deck_id").references(() => decks.id, { onDelete: "cascade" }).notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

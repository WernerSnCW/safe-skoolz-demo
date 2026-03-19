import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schoolsTable } from "./schools";
import { usersTable } from "./users";

export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schoolsTable.id).notNull(),
  senderId: uuid("sender_id").references(() => usersTable.id).notNull(),
  recipientId: uuid("recipient_id").references(() => usersTable.id).notNull(),
  senderRole: varchar("sender_role", { length: 30 }).notNull(),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(),
  type: varchar("type", { length: 30 }).default("message").notNull(),
  body: text("body").notNull(),
  location: varchar("location", { length: 100 }),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  parentMessageId: uuid("parent_message_id"),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true, readAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageRecord = typeof messagesTable.$inferSelect;

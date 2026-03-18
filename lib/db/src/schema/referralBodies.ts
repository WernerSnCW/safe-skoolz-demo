import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schoolsTable } from "./schools";

export const referralBodiesTable = pgTable("referral_bodies", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schoolsTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  bodyType: varchar("body_type", { length: 50 }).notNull(),
  island: varchar("island", { length: 50 }),
  municipality: varchar("municipality", { length: 100 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 30 }),
  address: text("address"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReferralBodySchema = createInsertSchema(referralBodiesTable).omit({ id: true, createdAt: true });
export type InsertReferralBody = z.infer<typeof insertReferralBodySchema>;
export type ReferralBodyRecord = typeof referralBodiesTable.$inferSelect;

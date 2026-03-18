import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const annexTemplatesTable = pgTable("annex_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  framework: varchar("framework", { length: 40 }).notNull(),
  annexCode: varchar("annex_code", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  templateUrl: text("template_url"),
  version: varchar("version", { length: 20 }).default("1.0").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAnnexTemplateSchema = createInsertSchema(annexTemplatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAnnexTemplate = z.infer<typeof insertAnnexTemplateSchema>;
export type AnnexTemplateRecord = typeof annexTemplatesTable.$inferSelect;

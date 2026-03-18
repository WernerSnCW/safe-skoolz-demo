import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schoolsTable } from "./schools";
import { protocolsTable } from "./protocols";
import { usersTable } from "./users";

export const caseTasksTable = pgTable("case_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schoolsTable.id).notNull(),
  protocolId: uuid("protocol_id").references(() => protocolsTable.id).notNull(),
  taskType: varchar("task_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assigneeId: uuid("assignee_id").references(() => usersTable.id),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  completedBy: uuid("completed_by").references(() => usersTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCaseTaskSchema = createInsertSchema(caseTasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCaseTask = z.infer<typeof insertCaseTaskSchema>;
export type CaseTaskRecord = typeof caseTasksTable.$inferSelect;

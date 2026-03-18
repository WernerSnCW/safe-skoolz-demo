import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schoolsTable } from "./schools";
import { usersTable } from "./users";

export const delegatedRolesTable = pgTable("delegated_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schoolsTable.id).notNull(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  roleType: varchar("role_type", { length: 50 }).notNull(),
  mandateScope: varchar("mandate_scope", { length: 255 }),
  trainingDate: timestamp("training_date", { withTimezone: true }),
  trainingNotes: varchar("training_notes", { length: 500 }),
  appointedAt: timestamp("appointed_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDelegatedRoleSchema = createInsertSchema(delegatedRolesTable).omit({ id: true, createdAt: true });
export type InsertDelegatedRole = z.infer<typeof insertDelegatedRoleSchema>;
export type DelegatedRoleRecord = typeof delegatedRolesTable.$inferSelect;

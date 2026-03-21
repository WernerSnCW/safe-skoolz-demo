import { pgTable, uuid, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { schoolsTable } from "./schools";
import { usersTable } from "./users";

export const diagnosticSurveysTable = pgTable("diagnostic_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdBy: uuid("created_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (t) => [
  index("idx_diagnostic_surveys_school").on(t.schoolId),
  index("idx_diagnostic_surveys_status").on(t.status),
]);

export const diagnosticResponsesTable = pgTable("diagnostic_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  surveyId: uuid("survey_id").notNull().references(() => diagnosticSurveysTable.id),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  questionKey: varchar("question_key", { length: 100 }).notNull(),
  answer: integer("answer").notNull(),
  comment: text("comment"),
  respondedAt: timestamp("responded_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_diagnostic_responses_survey").on(t.surveyId),
  index("idx_diagnostic_responses_user").on(t.userId),
  index("idx_diagnostic_responses_question").on(t.surveyId, t.questionKey),
]);

export const diagnosticActionsTable = pgTable("diagnostic_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  surveyId: uuid("survey_id").notNull().references(() => diagnosticSurveysTable.id),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  action: text("action").notNull(),
  category: varchar("category", { length: 100 }),
  owner: varchar("owner", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("planned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
}, (t) => [
  index("idx_diagnostic_actions_survey").on(t.surveyId),
  index("idx_diagnostic_actions_school").on(t.schoolId),
]);

export type DiagnosticSurvey = typeof diagnosticSurveysTable.$inferSelect;
export type DiagnosticResponse = typeof diagnosticResponsesTable.$inferSelect;
export type DiagnosticAction = typeof diagnosticActionsTable.$inferSelect;

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

export type DiagnosticSurvey = typeof diagnosticSurveysTable.$inferSelect;
export type DiagnosticResponse = typeof diagnosticResponsesTable.$inferSelect;

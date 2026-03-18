import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, caseTasksTable, usersTable } from "@workspace/db";
import { authMiddleware, requireRole, type JwtPayload } from "../lib/auth";
import { writeAudit } from "../lib/auditHelper";

const router: IRouter = Router();

router.get("/case-tasks", authMiddleware, requireRole("coordinator", "head_teacher", "senco"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const protocolId = req.query.protocolId as string | undefined;
  const status = req.query.status as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  let conditions: any[] = [eq(caseTasksTable.schoolId, user.schoolId)];
  if (protocolId) conditions.push(eq(caseTasksTable.protocolId, protocolId));
  if (status) conditions.push(eq(caseTasksTable.status, status));

  const [tasks, countResult] = await Promise.all([
    db
      .select({
        id: caseTasksTable.id,
        schoolId: caseTasksTable.schoolId,
        protocolId: caseTasksTable.protocolId,
        taskType: caseTasksTable.taskType,
        title: caseTasksTable.title,
        description: caseTasksTable.description,
        assigneeId: caseTasksTable.assigneeId,
        priority: caseTasksTable.priority,
        status: caseTasksTable.status,
        dueAt: caseTasksTable.dueAt,
        completedAt: caseTasksTable.completedAt,
        notes: caseTasksTable.notes,
        createdAt: caseTasksTable.createdAt,
        assigneeFirstName: usersTable.firstName,
        assigneeLastName: usersTable.lastName,
      })
      .from(caseTasksTable)
      .leftJoin(usersTable, eq(caseTasksTable.assigneeId, usersTable.id))
      .where(and(...conditions))
      .orderBy(desc(caseTasksTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(caseTasksTable).where(and(...conditions)),
  ]);

  res.json({ data: tasks, total: Number(countResult[0]?.count || 0), limit, offset });
});

router.post("/case-tasks", authMiddleware, requireRole("coordinator", "head_teacher", "senco"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const { protocolId, taskType, title, description, assigneeId, priority, dueAt } = req.body;

  if (!protocolId || !taskType || !title) {
    res.status(400).json({ error: "protocolId, taskType, and title are required" });
    return;
  }

  const validTaskTypes = [
    "interview_victim", "interview_perpetrator", "interview_witness",
    "parent_notification", "external_referral", "risk_assessment",
    "protective_measure", "follow_up", "documentation", "review_meeting", "other"
  ];
  if (!validTaskTypes.includes(taskType)) {
    res.status(400).json({ error: `taskType must be one of: ${validTaskTypes.join(", ")}` });
    return;
  }

  const [created] = await db.insert(caseTasksTable).values({
    schoolId: user.schoolId,
    protocolId,
    taskType,
    title,
    description,
    assigneeId,
    priority: priority || "normal",
    dueAt: dueAt ? new Date(dueAt) : undefined,
  }).returning();

  await writeAudit({ schoolId: user.schoolId, eventType: "case_task_created", actor: user, targetType: "case_tasks", targetId: created.id, details: created as any, req });
  res.status(201).json(created);
});

router.patch("/case-tasks/:id", authMiddleware, requireRole("coordinator", "head_teacher", "senco"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const id = req.params.id as string;
  const { status, notes, completedAt } = req.body;

  const updateData: any = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  if (status === "completed") {
    updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
    updateData.completedBy = user.userId;
  }

  const [updated] = await db
    .update(caseTasksTable)
    .set(updateData)
    .where(and(eq(caseTasksTable.id, id), eq(caseTasksTable.schoolId, user.schoolId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Case task not found" });
    return;
  }

  await writeAudit({ schoolId: user.schoolId, eventType: "case_task_updated", actor: user, targetType: "case_tasks", targetId: id, details: updated as any, req });
  res.json(updated);
});

export default router;

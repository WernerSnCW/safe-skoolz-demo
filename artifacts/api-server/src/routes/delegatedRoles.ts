import { Router, type IRouter } from "express";
import { eq, and, isNull } from "drizzle-orm";
import { db, delegatedRolesTable, usersTable } from "@workspace/db";
import { authMiddleware, requireRole, type JwtPayload } from "../lib/auth";
import { writeAudit } from "../lib/auditHelper";

const router: IRouter = Router();

router.get("/delegated-roles", authMiddleware, requireRole("coordinator", "head_teacher"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;

  const roles = await db
    .select({
      id: delegatedRolesTable.id,
      schoolId: delegatedRolesTable.schoolId,
      userId: delegatedRolesTable.userId,
      roleType: delegatedRolesTable.roleType,
      mandateScope: delegatedRolesTable.mandateScope,
      trainingDate: delegatedRolesTable.trainingDate,
      trainingNotes: delegatedRolesTable.trainingNotes,
      appointedAt: delegatedRolesTable.appointedAt,
      expiresAt: delegatedRolesTable.expiresAt,
      revokedAt: delegatedRolesTable.revokedAt,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      userRole: usersTable.role,
    })
    .from(delegatedRolesTable)
    .leftJoin(usersTable, eq(delegatedRolesTable.userId, usersTable.id))
    .where(and(
      eq(delegatedRolesTable.schoolId, user.schoolId),
      isNull(delegatedRolesTable.revokedAt)
    ));

  res.json(roles);
});

router.post("/delegated-roles", authMiddleware, requireRole("coordinator", "head_teacher"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const { userId, roleType, mandateScope, trainingDate, trainingNotes, expiresAt } = req.body;

  if (!userId || !roleType) {
    res.status(400).json({ error: "userId and roleType are required" });
    return;
  }

  const validRoleTypes = ["lopivi_delegate", "convivexit_coordinator", "machista_protocol_lead", "safeguarding_governor", "senco_lead"];
  if (!validRoleTypes.includes(roleType)) {
    res.status(400).json({ error: `roleType must be one of: ${validRoleTypes.join(", ")}` });
    return;
  }

  const [created] = await db.insert(delegatedRolesTable).values({
    schoolId: user.schoolId,
    userId,
    roleType,
    mandateScope,
    trainingDate: trainingDate ? new Date(trainingDate) : undefined,
    trainingNotes,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  }).returning();

  await writeAudit({ schoolId: user.schoolId, eventType: "delegated_role_created", actor: user, targetType: "delegated_roles", targetId: created.id, details: created as any, req });
  res.status(201).json(created);
});

router.patch("/delegated-roles/:id/revoke", authMiddleware, requireRole("coordinator", "head_teacher"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const id = req.params.id as string;

  const [updated] = await db
    .update(delegatedRolesTable)
    .set({ revokedAt: new Date() })
    .where(and(eq(delegatedRolesTable.id, id), eq(delegatedRolesTable.schoolId, user.schoolId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Delegated role not found" });
    return;
  }

  await writeAudit({ schoolId: user.schoolId, eventType: "delegated_role_revoked", actor: user, targetType: "delegated_roles", targetId: id, details: updated as any, req });
  res.json(updated);
});

export default router;

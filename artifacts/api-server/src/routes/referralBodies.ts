import { Router, type IRouter } from "express";
import { eq, and, or, isNull } from "drizzle-orm";
import { db, referralBodiesTable } from "@workspace/db";
import { authMiddleware, requireRole, type JwtPayload } from "../lib/auth";
import { writeAudit } from "../lib/auditHelper";

const router: IRouter = Router();

router.get("/referral-bodies", authMiddleware, async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;

  const bodies = await db
    .select()
    .from(referralBodiesTable)
    .where(and(
      eq(referralBodiesTable.active, true),
      or(
        eq(referralBodiesTable.schoolId, user.schoolId),
        isNull(referralBodiesTable.schoolId)
      )
    ));

  res.json(bodies);
});

router.post("/referral-bodies", authMiddleware, requireRole("coordinator", "head_teacher"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const { name, bodyType, island, municipality, contactName, contactEmail, contactPhone, address, notes } = req.body;

  if (!name || !bodyType) {
    res.status(400).json({ error: "name and bodyType are required" });
    return;
  }

  const validBodyTypes = ["ib_dona", "municipal_services", "policia_nacional", "guardia_civil", "fiscalia_menores", "servicios_sociales", "salud_mental", "caib_education", "other"];
  if (!validBodyTypes.includes(bodyType)) {
    res.status(400).json({ error: `bodyType must be one of: ${validBodyTypes.join(", ")}` });
    return;
  }

  const [created] = await db.insert(referralBodiesTable).values({
    schoolId: user.schoolId,
    name,
    bodyType,
    island,
    municipality,
    contactName,
    contactEmail,
    contactPhone,
    address,
    notes,
  }).returning();

  await writeAudit({ schoolId: user.schoolId, eventType: "referral_body_created", actor: user, targetType: "referral_bodies", targetId: created.id, details: created as any, req });
  res.status(201).json(created);
});

router.patch("/referral-bodies/:id", authMiddleware, requireRole("coordinator", "head_teacher"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const id = req.params.id as string;
  const updates = req.body;

  const [updated] = await db
    .update(referralBodiesTable)
    .set(updates)
    .where(and(eq(referralBodiesTable.id, id), eq(referralBodiesTable.schoolId, user.schoolId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Referral body not found" });
    return;
  }

  await writeAudit({ schoolId: user.schoolId, eventType: "referral_body_updated", actor: user, targetType: "referral_bodies", targetId: id, details: updated as any, req });
  res.json(updated);
});

export default router;

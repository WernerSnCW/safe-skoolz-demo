import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, annexTemplatesTable } from "@workspace/db";
import { authMiddleware, requireRole, type JwtPayload } from "../lib/auth";
import { writeAudit } from "../lib/auditHelper";

const router: IRouter = Router();

router.get("/annex-templates", authMiddleware, async (_req, res): Promise<void> => {
  const templates = await db
    .select()
    .from(annexTemplatesTable)
    .where(eq(annexTemplatesTable.active, true));

  res.json(templates);
});

router.get("/annex-templates/:framework", authMiddleware, async (req, res): Promise<void> => {
  const framework = req.params.framework as string;

  const templates = await db
    .select()
    .from(annexTemplatesTable)
    .where(eq(annexTemplatesTable.framework, framework));

  res.json(templates);
});

router.post("/annex-templates", authMiddleware, requireRole("coordinator", "head_teacher"), async (req, res): Promise<void> => {
  const user = (req as any).user as JwtPayload;
  const { framework, annexCode, title, description, templateUrl, version } = req.body;

  if (!framework || !annexCode || !title) {
    res.status(400).json({ error: "framework, annexCode, and title are required" });
    return;
  }

  const [created] = await db.insert(annexTemplatesTable).values({
    framework,
    annexCode,
    title,
    description,
    templateUrl,
    version,
  }).returning();

  await writeAudit({ schoolId: user.schoolId, eventType: "annex_template_created", actor: user, targetType: "annex_templates", targetId: created.id, details: created as any, req });
  res.status(201).json(created);
});

export default router;

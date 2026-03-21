import { Router, type IRouter, type Request, type Response } from "express";
import { authMiddleware, requireRole, type JwtPayload } from "../lib/auth";
import { db, pupilDiaryTable, usersTable } from "@workspace/db";
import { eq, desc, and, inArray } from "drizzle-orm";

const router: IRouter = Router();

router.get(
  "/diary/entries",
  authMiddleware,
  requireRole("pupil"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user as JwtPayload;
    const entries = await db
      .select()
      .from(pupilDiaryTable)
      .where(eq(pupilDiaryTable.pupilId, user.userId))
      .orderBy(desc(pupilDiaryTable.createdAt))
      .limit(100);
    res.json(entries);
  }
);

router.post(
  "/diary/entries",
  authMiddleware,
  requireRole("pupil"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user as JwtPayload;
    const { mood, note } = req.body;

    if (typeof mood !== "number" || mood < 1 || mood > 5) {
      res.status(400).json({ error: "Mood must be a number between 1 and 5" });
      return;
    }

    const trimmedNote = typeof note === "string" ? note.trim().slice(0, 1000) : null;

    const [entry] = await db
      .insert(pupilDiaryTable)
      .values({
        pupilId: user.userId,
        schoolId: user.schoolId,
        mood,
        note: trimmedNote || null,
      })
      .returning();

    res.status(201).json(entry);
  }
);

router.delete(
  "/diary/entries/:id",
  authMiddleware,
  requireRole("pupil"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user as JwtPayload;
    const { id } = req.params;

    const [entry] = await db
      .select()
      .from(pupilDiaryTable)
      .where(and(eq(pupilDiaryTable.id, id), eq(pupilDiaryTable.pupilId, user.userId)));

    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    await db
      .delete(pupilDiaryTable)
      .where(and(eq(pupilDiaryTable.id, id), eq(pupilDiaryTable.pupilId, user.userId)));

    res.json({ success: true });
  }
);

router.get(
  "/diary/child/:childId",
  authMiddleware,
  requireRole("parent"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user as JwtPayload;
    const { childId } = req.params;

    const [parent] = await db
      .select({ parentOf: usersTable.parentOf })
      .from(usersTable)
      .where(eq(usersTable.id, user.userId));

    if (!parent?.parentOf || !parent.parentOf.includes(childId)) {
      res.status(403).json({ error: "You can only view your own child's diary" });
      return;
    }

    const entries = await db
      .select()
      .from(pupilDiaryTable)
      .where(eq(pupilDiaryTable.pupilId, childId))
      .orderBy(desc(pupilDiaryTable.createdAt))
      .limit(100);

    res.json(entries);
  }
);

export default router;

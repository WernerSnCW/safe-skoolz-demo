import { Router } from "express";
import { resetDemoData } from "../lib/seed";

const router = Router();

router.post("/demo/reset", async (_req, res) => {
  if (process.env.DEMO_MODE !== "true") {
    return res.status(403).json({ error: "Demo mode is not enabled" });
  }

  try {
    await resetDemoData();
    res.json({ success: true, message: "Demo data has been reset successfully" });
  } catch (err) {
    console.error("[demo] Reset failed:", err);
    res.status(500).json({ error: "Failed to reset demo data" });
  }
});

export default router;

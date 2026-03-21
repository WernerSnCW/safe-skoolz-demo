import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { diagnosticSurveysTable, diagnosticResponsesTable, usersTable } from "@workspace/db/schema";
import { eq, and, count, avg, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

type QuestionDef = {
  key: string;
  category: string;
  roles: string[];
  text: Record<string, string>;
  scale: { low: string; high: string };
};

const QUESTION_BANK: QuestionDef[] = [
  {
    key: "aware_bullying_exists",
    category: "Awareness & Prevalence",
    roles: ["pupil", "teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher", "parent", "pta"],
    text: {
      pupil: "Do you think bullying happens at your school?",
      staff: "How prevalent do you believe bullying is in this school?",
      parent: "How much of a problem do you believe bullying is at your child's school?",
    },
    scale: { low: "Not at all", high: "A lot" },
  },
  {
    key: "aware_types",
    category: "Awareness & Prevalence",
    roles: ["pupil", "teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher", "parent", "pta"],
    text: {
      pupil: "Do you know what counts as bullying? (e.g. name-calling, leaving people out, online meanness)",
      staff: "How well do staff understand the different forms bullying can take (verbal, physical, relational, online)?",
      parent: "How well do you understand the different types of bullying that can happen?",
    },
    scale: { low: "Not well", high: "Very well" },
  },
  {
    key: "aware_online",
    category: "Awareness & Prevalence",
    roles: ["pupil", "teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher", "parent", "pta"],
    text: {
      pupil: "Do you know what cyberbullying is and how to stay safe online?",
      staff: "How confident is the school in addressing cyberbullying and online safety?",
      parent: "How aware are you of online bullying risks your child may face?",
    },
    scale: { low: "Not at all", high: "Very aware" },
  },

  {
    key: "trust_tell_adult",
    category: "Trust & Reporting",
    roles: ["pupil", "parent", "pta"],
    text: {
      pupil: "If something bad happened, would you feel safe telling a grown-up at school?",
      parent: "Do you believe your child would feel comfortable reporting an incident to school staff?",
    },
    scale: { low: "Definitely not", high: "Definitely yes" },
  },
  {
    key: "trust_taken_seriously",
    category: "Trust & Reporting",
    roles: ["pupil", "teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher", "parent", "pta"],
    text: {
      pupil: "When someone tells a teacher about bullying, do they take it seriously?",
      staff: "How confident are you that reported incidents are taken seriously and followed up?",
      parent: "How confident are you that the school takes bullying reports seriously?",
    },
    scale: { low: "Not at all", high: "Very confident" },
  },
  {
    key: "trust_know_how_report",
    category: "Trust & Reporting",
    roles: ["pupil", "parent", "pta"],
    text: {
      pupil: "Do you know how to report bullying at your school?",
      parent: "Do you know how to report a concern about bullying to the school?",
    },
    scale: { low: "No idea", high: "I know exactly how" },
  },
  {
    key: "trust_staff_respond",
    category: "Trust & Reporting",
    roles: ["teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher"],
    text: {
      staff: "How confident are you in the school's process for handling bullying reports?",
    },
    scale: { low: "Not confident", high: "Very confident" },
  },

  {
    key: "culture_feel_safe",
    category: "Culture & Wellbeing",
    roles: ["pupil", "parent", "pta"],
    text: {
      pupil: "Do you feel safe and happy at school most of the time?",
      parent: "Do you believe your child feels safe and happy at school?",
    },
    scale: { low: "Not at all", high: "Very much" },
  },
  {
    key: "culture_kind_school",
    category: "Culture & Wellbeing",
    roles: ["pupil", "teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher", "parent", "pta"],
    text: {
      pupil: "Are most people kind to each other at your school?",
      staff: "How would you rate the overall kindness and respect culture among pupils?",
      parent: "How would you describe the overall culture of kindness at the school?",
    },
    scale: { low: "Not kind", high: "Very kind" },
  },
  {
    key: "culture_included",
    category: "Culture & Wellbeing",
    roles: ["pupil", "parent", "pta"],
    text: {
      pupil: "Do you feel included and like you belong at school?",
      parent: "Do you believe your child feels included and a sense of belonging at school?",
    },
    scale: { low: "Not at all", high: "Very much" },
  },
  {
    key: "culture_staff_wellbeing",
    category: "Culture & Wellbeing",
    roles: ["teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher"],
    text: {
      staff: "How supported do you feel by the school in managing pupil wellbeing and safeguarding?",
    },
    scale: { low: "Not supported", high: "Very supported" },
  },

  {
    key: "safeguard_know_policy",
    category: "Safeguarding Knowledge",
    roles: ["teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher", "parent", "pta"],
    text: {
      staff: "How familiar are you with the school's anti-bullying and safeguarding policies?",
      parent: "How familiar are you with the school's anti-bullying policy?",
    },
    scale: { low: "Not at all", high: "Very familiar" },
  },
  {
    key: "safeguard_training",
    category: "Safeguarding Knowledge",
    roles: ["teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher"],
    text: {
      staff: "How adequate is the safeguarding and anti-bullying training you receive?",
    },
    scale: { low: "Inadequate", high: "Excellent" },
  },
  {
    key: "safeguard_escalation",
    category: "Safeguarding Knowledge",
    roles: ["teacher", "head_of_year", "support_staff", "senco", "coordinator", "head_teacher"],
    text: {
      staff: "How clear are you on when and how to escalate a safeguarding concern?",
    },
    scale: { low: "Not clear", high: "Very clear" },
  },
  {
    key: "safeguard_parent_informed",
    category: "Safeguarding Knowledge",
    roles: ["parent", "pta"],
    text: {
      parent: "How well does the school communicate about safeguarding measures and incidents (where appropriate)?",
    },
    scale: { low: "Poorly", high: "Very well" },
  },

  {
    key: "ready_dsl_appointed",
    category: "System Readiness",
    roles: ["coordinator", "head_teacher"],
    text: {
      staff: "Is there a Designated Safeguarding Lead (DSL) clearly appointed and known to all staff?",
    },
    scale: { low: "No", high: "Yes, fully" },
  },
  {
    key: "ready_policy_current",
    category: "System Readiness",
    roles: ["coordinator", "head_teacher"],
    text: {
      staff: "Is the school's anti-bullying/safeguarding policy up to date and compliant with current legislation?",
    },
    scale: { low: "Outdated", high: "Fully current" },
  },
  {
    key: "ready_reporting_system",
    category: "System Readiness",
    roles: ["coordinator", "head_teacher"],
    text: {
      staff: "Is there a clear, accessible reporting system in place for pupils, staff, and parents?",
    },
    scale: { low: "No system", high: "Fully operational" },
  },
  {
    key: "ready_staff_trained",
    category: "System Readiness",
    roles: ["coordinator", "head_teacher"],
    text: {
      staff: "Have all staff received up-to-date safeguarding training?",
    },
    scale: { low: "None trained", high: "All trained" },
  },
  {
    key: "ready_parent_channels",
    category: "System Readiness",
    roles: ["coordinator", "head_teacher"],
    text: {
      staff: "Are there clear channels for parents to raise safeguarding concerns?",
    },
    scale: { low: "No channels", high: "Fully established" },
  },
];

function getRoleGroup(role: string): string {
  if (role === "pupil") return "pupil";
  if (role === "parent" || role === "pta") return "parent";
  return "staff";
}

function getQuestionsForRole(role: string): Array<QuestionDef & { displayText: string }> {
  const group = getRoleGroup(role);
  return QUESTION_BANK
    .filter(q => q.roles.includes(role))
    .map(q => ({
      ...q,
      displayText: q.text[group] || q.text.staff || q.text.pupil || q.text.parent || "",
    }));
}

router.post("/diagnostics", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["coordinator", "head_teacher"].includes(user.role)) {
    res.status(403).json({ error: "Only coordinators and head teachers can create diagnostics" });
    return;
  }

  const { title } = req.body;
  const [survey] = await db.insert(diagnosticSurveysTable).values({
    schoolId: user.schoolId,
    title: title || "School Onboarding Diagnostic",
    status: "active",
    createdBy: user.userId,
  }).returning();

  res.status(201).json(survey);
});

router.get("/diagnostics/active", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;

  const [survey] = await db.select()
    .from(diagnosticSurveysTable)
    .where(and(
      eq(diagnosticSurveysTable.schoolId, user.schoolId),
      eq(diagnosticSurveysTable.status, "active"),
    ))
    .orderBy(sql`${diagnosticSurveysTable.createdAt} desc`)
    .limit(1);

  if (!survey) {
    res.json({ survey: null, questions: [], alreadyCompleted: false });
    return;
  }

  const existingResponses = await db.select({ questionKey: diagnosticResponsesTable.questionKey })
    .from(diagnosticResponsesTable)
    .where(and(
      eq(diagnosticResponsesTable.surveyId, survey.id),
      eq(diagnosticResponsesTable.userId, user.userId),
    ));

  const alreadyCompleted = existingResponses.length > 0;
  const questions = getQuestionsForRole(user.role);

  res.json({
    survey,
    questions: questions.map(q => ({
      key: q.key,
      category: q.category,
      text: q.displayText,
      scale: q.scale,
    })),
    alreadyCompleted,
    previousAnswers: alreadyCompleted ? existingResponses : undefined,
  });
});

router.get("/diagnostics", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;

  const surveys = await db.select()
    .from(diagnosticSurveysTable)
    .where(eq(diagnosticSurveysTable.schoolId, user.schoolId))
    .orderBy(sql`${diagnosticSurveysTable.createdAt} desc`);

  res.json(surveys);
});

router.post("/diagnostics/:id/respond", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const surveyId = req.params.id;

  const [survey] = await db.select()
    .from(diagnosticSurveysTable)
    .where(and(
      eq(diagnosticSurveysTable.id, surveyId),
      eq(diagnosticSurveysTable.schoolId, user.schoolId),
      eq(diagnosticSurveysTable.status, "active"),
    ));

  if (!survey) {
    res.status(404).json({ error: "Survey not found or not active" });
    return;
  }

  const existing = await db.select({ id: diagnosticResponsesTable.id })
    .from(diagnosticResponsesTable)
    .where(and(
      eq(diagnosticResponsesTable.surveyId, surveyId),
      eq(diagnosticResponsesTable.userId, user.userId),
    ))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "You have already completed this diagnostic" });
    return;
  }

  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    res.status(400).json({ error: "Answers array required" });
    return;
  }

  const validQuestions = getQuestionsForRole(user.role);
  const validKeys = new Set(validQuestions.map(q => q.key));

  const rows = answers
    .filter((a: any) => validKeys.has(a.key) && typeof a.answer === "number" && a.answer >= 1 && a.answer <= 5)
    .map((a: any) => ({
      surveyId,
      userId: user.userId,
      questionKey: a.key,
      answer: a.answer,
      comment: a.comment || null,
    }));

  if (rows.length === 0) {
    res.status(400).json({ error: "No valid answers provided" });
    return;
  }

  await db.insert(diagnosticResponsesTable).values(rows);

  res.json({ success: true, answersRecorded: rows.length });
});

router.get("/diagnostics/:id/results", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["coordinator", "head_teacher", "senco"].includes(user.role)) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const surveyId = req.params.id;

  const [survey] = await db.select()
    .from(diagnosticSurveysTable)
    .where(and(
      eq(diagnosticSurveysTable.id, surveyId),
      eq(diagnosticSurveysTable.schoolId, user.schoolId),
    ));

  if (!survey) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  const responses = await db.select({
    questionKey: diagnosticResponsesTable.questionKey,
    answer: diagnosticResponsesTable.answer,
    userId: diagnosticResponsesTable.userId,
  })
    .from(diagnosticResponsesTable)
    .where(eq(diagnosticResponsesTable.surveyId, surveyId));

  const userIds = [...new Set(responses.map(r => r.userId))];
  const usersData = userIds.length > 0 ? await db.select({
    id: usersTable.id,
    role: usersTable.role,
  })
    .from(usersTable)
    .where(sql`${usersTable.id} IN ${userIds}`) : [];

  const userRoleMap = new Map(usersData.map(u => [u.id, u.role]));

  const participationByGroup: Record<string, Set<string>> = { pupil: new Set(), staff: new Set(), parent: new Set() };
  const categoryScores: Record<string, Record<string, { sum: number; count: number }>> = {};

  for (const r of responses) {
    const role = userRoleMap.get(r.userId) || "staff";
    const group = getRoleGroup(role);
    participationByGroup[group].add(r.userId);

    const qDef = QUESTION_BANK.find(q => q.key === r.questionKey);
    if (!qDef) continue;

    const cat = qDef.category;
    if (!categoryScores[cat]) categoryScores[cat] = {};
    if (!categoryScores[cat][group]) categoryScores[cat][group] = { sum: 0, count: 0 };
    categoryScores[cat][group].sum += r.answer;
    categoryScores[cat][group].count += 1;
  }

  const totalUsers = await db.select({ cnt: count() })
    .from(usersTable)
    .where(eq(usersTable.schoolId, user.schoolId));

  const usersByRole = await db.select({
    role: usersTable.role,
    cnt: count(),
  })
    .from(usersTable)
    .where(eq(usersTable.schoolId, user.schoolId))
    .groupBy(usersTable.role);

  const roleCounts: Record<string, number> = {};
  for (const r of usersByRole) {
    const group = getRoleGroup(r.role);
    roleCounts[group] = (roleCounts[group] || 0) + Number(r.cnt);
  }

  const participation = {
    pupil: { responded: participationByGroup.pupil.size, total: roleCounts.pupil || 0 },
    staff: { responded: participationByGroup.staff.size, total: roleCounts.staff || 0 },
    parent: { responded: participationByGroup.parent.size, total: roleCounts.parent || 0 },
  };

  const categories = Object.entries(categoryScores).map(([cat, groups]) => {
    const groupAverages: Record<string, number> = {};
    for (const [g, data] of Object.entries(groups)) {
      groupAverages[g] = Math.round((data.sum / data.count) * 10) / 10;
    }
    return { category: cat, averages: groupAverages };
  });

  const insights: string[] = [];
  for (const c of categories) {
    const groups = Object.keys(c.averages);
    if (groups.includes("pupil") && groups.includes("staff")) {
      const gap = Math.abs(c.averages.pupil - c.averages.staff);
      if (gap >= 1.5) {
        const who = c.averages.pupil < c.averages.staff ? "Pupils" : "Staff";
        insights.push(`${who} rate "${c.category}" significantly lower than ${c.averages.pupil < c.averages.staff ? "staff" : "pupils"} (gap: ${gap.toFixed(1)} points). This suggests a perception mismatch worth investigating.`);
      }
    }
    if (groups.includes("parent") && groups.includes("staff")) {
      const gap = Math.abs(c.averages.parent - c.averages.staff);
      if (gap >= 1.5) {
        const who = c.averages.parent < c.averages.staff ? "Parents" : "Staff";
        insights.push(`${who} rate "${c.category}" significantly lower than ${c.averages.parent < c.averages.staff ? "staff" : "parents"} (gap: ${gap.toFixed(1)} points). Better communication may help bridge this gap.`);
      }
    }
    for (const [g, avg] of Object.entries(c.averages)) {
      if (avg <= 2.5) {
        insights.push(`"${c.category}" scores low among ${g}s (avg: ${avg.toFixed(1)}/5). This area needs attention.`);
      }
    }
  }

  if (participation.pupil.responded === 0) {
    insights.push("No pupils have completed the diagnostic yet. Pupil voice is essential for an accurate picture.");
  }
  if (participation.parent.responded === 0) {
    insights.push("No parents have completed the diagnostic yet. Parent perspectives help identify blind spots.");
  }

  res.json({
    survey,
    participation,
    categories,
    insights,
    totalResponses: responses.length,
    questionBank: QUESTION_BANK.map(q => ({ key: q.key, category: q.category })),
  });
});

router.patch("/diagnostics/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["coordinator", "head_teacher"].includes(user.role)) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { status } = req.body;
  if (!["active", "closed"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db.update(diagnosticSurveysTable)
    .set({
      status,
      ...(status === "closed" ? { closedAt: new Date() } : {}),
    })
    .where(and(
      eq(diagnosticSurveysTable.id, req.params.id),
      eq(diagnosticSurveysTable.schoolId, user.schoolId),
    ))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  res.json(updated);
});

export default router;

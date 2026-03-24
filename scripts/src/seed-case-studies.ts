import { db, incidentsTable, behaviourPointsTable, patternAlertsTable, pupilDiaryTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { usersTable, schoolsTable } from "@workspace/db";

async function seedCaseStudies() {
  console.log("Seeding case study demo data...");

  const [school] = await db.select().from(schoolsTable);
  if (!school) { console.error("No school found"); process.exit(1); }
  const schoolId = school.id;

  const allUsers = await db.select().from(usersTable).where(eq(usersTable.schoolId, schoolId));
  const findPupil = (first: string, last: string) => allUsers.find(u => u.firstName === first && u.lastName === last && u.role === "pupil");
  const findByRole = (role: string) => allUsers.filter(u => u.role === role);

  const teachers = findByRole("teacher");
  const coordinators = findByRole("coordinator");
  const teacherId = teachers[0]?.id;
  const coordinatorId = coordinators[0]?.id;

  if (!teacherId || !coordinatorId) {
    console.error("Need at least one teacher and one coordinator");
    process.exit(1);
  }

  const boyA = findPupil("Boy", "A");
  const boyB = findPupil("Boy", "B");
  const boyC = findPupil("Boy", "C");
  const girlD = findPupil("Girl", "D");
  const luna = findPupil("Luna", "Martinez");
  const oliver = findPupil("Oliver", "Smith");
  const sofia = findPupil("Sofia", "Garcia");
  const ethan = findPupil("Ethan", "Davies");
  const emily = findPupil("Emily", "Green");
  const liam = findPupil("Liam", "Cooper");
  const alice = findPupil("Alice", "Walker");
  const noah = findPupil("Noah", "King");
  const freya = findPupil("Freya", "Anderson");
  const jack = findPupil("Jack", "Wright");
  const james = findPupil("James", "Wilson");
  const mia = findPupil("Mia", "Williams");
  const charlotte = findPupil("Charlotte", "Roberts");
  const george = findPupil("George", "Martin");
  const isla = findPupil("Isla", "Johnson");

  if (!boyA || !boyB || !boyC || !girlD || !luna || !oliver || !sofia || !ethan || !emily ||
      !liam || !alice || !noah || !freya || !jack || !james || !mia || !charlotte || !george || !isla) {
    console.error("Missing required pupils for case studies");
    process.exit(1);
  }

  const existing = await db.select().from(incidentsTable).where(
    and(eq(incidentsTable.schoolId, schoolId), eq(incidentsTable.referenceNumber, "CS1-001"))
  );
  if (existing.length > 0) {
    console.log("Case study data already seeded. Skipping.");
    process.exit(0);
  }

  const baseDate = new Date("2025-10-01");
  const d = (daysOffset: number) => new Date(baseDate.getTime() + daysOffset * 86400000);

  // =========================================
  // CASE STUDY 1: "Child A creates new bullies"
  // Boy A = ringleader, Boy B + Boy C = recruited, Girl D = victim
  // =========================================
  console.log("  Seeding Case Study 1: Child A creates new bullies...");

  const cs1Incidents = [
    {
      referenceNumber: "CS1-001",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(0).toISOString().split("T")[0],
      location: "Playground", description: "Boy A pushed Girl D and called her names during break time. No other children were involved at this stage.",
      victimIds: [girlD.id], perpetratorIds: [boyA.id], witnessIds: [],
      status: "reviewed", parentVisible: true, addedToFile: true,
      emotionalState: "upset", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS1-002",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(7).toISOString().split("T")[0],
      location: "Classroom", description: "Boy A excluded Girl D from group work and told others not to sit near her. Boy B was observed laughing along.",
      victimIds: [girlD.id], perpetratorIds: [boyA.id, boyB.id], witnessIds: [],
      status: "reviewed", parentVisible: true, addedToFile: true,
      emotionalState: "sad", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS1-003",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 2, safeguardingTrigger: false,
      incidentDate: d(14).toISOString().split("T")[0],
      location: "Playground", description: "Boy A, Boy B, and Boy C surrounded Girl D at lunch and mocked her appearance. Girl D was visibly distressed and crying.",
      victimIds: [girlD.id], perpetratorIds: [boyA.id, boyB.id, boyC.id], witnessIds: [],
      status: "reviewed", parentVisible: true, addedToFile: true,
      emotionalState: "distressed", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: true,
    },
    {
      referenceNumber: "CS1-004",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 2, safeguardingTrigger: false,
      incidentDate: d(21).toISOString().split("T")[0],
      location: "Corridor", description: "Boy A directed Boy B and Boy C to block Girl D from entering the classroom. In interviews, Boy B and Boy C said they joined in because they are scared of Boy A and 'don't want to be next'.",
      victimIds: [girlD.id], perpetratorIds: [boyA.id, boyB.id, boyC.id], witnessIds: [],
      status: "reviewed", parentVisible: true, addedToFile: true,
      emotionalState: "frightened", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: true,
      staffNotes: "Interviews revealed B and C are acting out of fear of A. They say they 'don't want to be next'. This is a coercion dynamic, not willing participation.",
    },
  ];

  const cs1InsertedIncidents = [];
  for (const inc of cs1Incidents) {
    const [inserted] = await db.insert(incidentsTable).values(inc as any).returning();
    cs1InsertedIncidents.push(inserted);
  }

  await db.insert(behaviourPointsTable).values([
    { schoolId, pupilId: boyA.id, points: 3, reason: "Bullying - pushing and name-calling", category: "bullying", incidentId: cs1InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(0) },
    { schoolId, pupilId: boyA.id, points: 3, reason: "Bullying - exclusion and orchestrating group behaviour", category: "bullying", incidentId: cs1InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(7) },
    { schoolId, pupilId: boyB.id, points: 2, reason: "Participating in bullying behaviour", category: "bullying", incidentId: cs1InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(7) },
    { schoolId, pupilId: boyA.id, points: 3, reason: "Bullying - group targeting", category: "bullying", incidentId: cs1InsertedIncidents[2].id, issuedBy: teacherId, issuedAt: d(14) },
    { schoolId, pupilId: boyB.id, points: 2, reason: "Participating in group targeting", category: "bullying", incidentId: cs1InsertedIncidents[2].id, issuedBy: teacherId, issuedAt: d(14) },
    { schoolId, pupilId: boyC.id, points: 2, reason: "Participating in group targeting", category: "bullying", incidentId: cs1InsertedIncidents[2].id, issuedBy: teacherId, issuedAt: d(14) },
    { schoolId, pupilId: boyA.id, points: 3, reason: "Orchestrating group intimidation", category: "bullying", incidentId: cs1InsertedIncidents[3].id, issuedBy: teacherId, issuedAt: d(21) },
  ]);

  await db.insert(patternAlertsTable).values([
    {
      schoolId, ruleId: "same_victim_3_incidents", ruleLabel: "Same victim in 3+ incidents",
      alertLevel: "red", victimId: girlD.id, perpetratorIds: [boyA.id, boyB.id, boyC.id],
      linkedIncidentIds: cs1InsertedIncidents.map(i => i.id), triggeredAt: d(14), status: "open",
    },
    {
      schoolId, ruleId: "group_targeting", ruleLabel: "Group targeting detected",
      alertLevel: "red", victimId: girlD.id, perpetratorIds: [boyA.id, boyB.id, boyC.id],
      linkedIncidentIds: cs1InsertedIncidents.slice(1).map(i => i.id), triggeredAt: d(21), status: "open",
    },
    {
      schoolId, ruleId: "repeat_perpetrator", ruleLabel: "Repeat perpetrator",
      alertLevel: "amber", victimId: null, perpetratorIds: [boyA.id],
      linkedIncidentIds: cs1InsertedIncidents.map(i => i.id), triggeredAt: d(7), status: "open",
    },
  ]);

  await db.insert(pupilDiaryTable).values([
    { pupilId: girlD.id, schoolId, mood: 4, note: "Good day today, played with friends at break.", createdAt: d(-3) },
    { pupilId: girlD.id, schoolId, mood: 3, note: "Boy A was mean to me but I tried to ignore it.", createdAt: d(1) },
    { pupilId: girlD.id, schoolId, mood: 2, note: "They won't let me join in. I sat alone at lunch.", createdAt: d(8) },
    { pupilId: girlD.id, schoolId, mood: 1, note: "Three of them surrounded me. I don't want to go to school.", createdAt: d(15) },
    { pupilId: girlD.id, schoolId, mood: 1, note: "They blocked the door. I'm scared every day now.", createdAt: d(22) },
  ]);

  // =========================================
  // CASE STUDY 2: "Retaliation kills reporting"
  // Luna = X (reporter/victim), Oliver + Sofia = Y+Z (bullies), Ethan = E (retaliator), Emily = F
  // =========================================
  console.log("  Seeding Case Study 2: Retaliation kills reporting...");

  const cs2Incidents = [
    {
      referenceNumber: "CS2-001",
      schoolId, reporterId: luna.id, reporterRole: "pupil",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(5).toISOString().split("T")[0],
      location: "Playground", description: "Oliver and Sofia were calling me names and pushing me out of the games at break.",
      victimIds: [luna.id], perpetratorIds: [oliver.id, sofia.id], witnessIds: [emily.id],
      status: "reviewed", parentVisible: true, happeningToMe: true,
      emotionalState: "upset", childrenSeparated: true, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS2-002",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 2, safeguardingTrigger: false,
      incidentDate: d(12).toISOString().split("T")[0],
      location: "Corridor", description: "Oliver and Sofia were calling Luna a 'snitch' in the corridor and encouraging others to avoid her. Word has clearly got out about her earlier report.",
      victimIds: [luna.id], perpetratorIds: [oliver.id, sofia.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "scared", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: true,
      staffNotes: "Clear retaliation following Luna's initial report. The word 'snitch' was used repeatedly.",
    },
    {
      referenceNumber: "CS2-003",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 2, safeguardingTrigger: false,
      incidentDate: d(15).toISOString().split("T")[0],
      location: "Classroom", description: "Ethan was bullying Emily for staying friends with Luna. Told her she'd be 'next' if she kept sitting with Luna at lunch.",
      victimIds: [emily.id], perpetratorIds: [ethan.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "frightened", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: true,
      staffNotes: "Retaliation is spreading. New victims appearing linked to original reporter.",
    },
    {
      referenceNumber: "CS2-004",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 2, safeguardingTrigger: false,
      incidentDate: d(20).toISOString().split("T")[0],
      location: "Playground", description: "Group of children excluding Luna and Emily at break. Oliver, Sofia and Ethan all observed orchestrating. Other children afraid to associate with Luna.",
      victimIds: [luna.id, emily.id], perpetratorIds: [oliver.id, sofia.id, ethan.id], witnessIds: [],
      status: "open", parentVisible: true,
      emotionalState: "distressed", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: true,
      staffNotes: "Reporting from other pupils has dropped significantly since this started. Fear of retaliation is clearly a factor.",
    },
  ];

  const cs2InsertedIncidents = [];
  for (const inc of cs2Incidents) {
    const [inserted] = await db.insert(incidentsTable).values(inc as any).returning();
    cs2InsertedIncidents.push(inserted);
  }

  await db.insert(patternAlertsTable).values([
    {
      schoolId, ruleId: "group_targeting", ruleLabel: "Group targeting detected",
      alertLevel: "red", victimId: luna.id, perpetratorIds: [oliver.id, sofia.id, ethan.id],
      linkedIncidentIds: cs2InsertedIncidents.map(i => i.id), triggeredAt: d(20), status: "open",
    },
    {
      schoolId, ruleId: "repeat_perpetrator", ruleLabel: "Repeat perpetrator",
      alertLevel: "amber", victimId: null, perpetratorIds: [oliver.id],
      linkedIncidentIds: cs2InsertedIncidents.filter((_, i) => i !== 2).map(i => i.id), triggeredAt: d(12), status: "open",
    },
    {
      schoolId, ruleId: "repeat_perpetrator", ruleLabel: "Repeat perpetrator",
      alertLevel: "amber", victimId: null, perpetratorIds: [sofia.id],
      linkedIncidentIds: cs2InsertedIncidents.filter((_, i) => i !== 2).map(i => i.id), triggeredAt: d(12), status: "open",
    },
  ]);

  await db.insert(behaviourPointsTable).values([
    { schoolId, pupilId: oliver.id, points: 3, reason: "Bullying - name-calling and exclusion", category: "bullying", incidentId: cs2InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(5) },
    { schoolId, pupilId: sofia.id, points: 3, reason: "Bullying - name-calling and exclusion", category: "bullying", incidentId: cs2InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(5) },
    { schoolId, pupilId: oliver.id, points: 3, reason: "Retaliation - calling victim a snitch", category: "bullying", incidentId: cs2InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(12) },
    { schoolId, pupilId: sofia.id, points: 3, reason: "Retaliation - calling victim a snitch", category: "bullying", incidentId: cs2InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(12) },
    { schoolId, pupilId: ethan.id, points: 3, reason: "Retaliation - threatening victim's friend", category: "bullying", incidentId: cs2InsertedIncidents[2].id, issuedBy: teacherId, issuedAt: d(15) },
  ]);

  await db.insert(pupilDiaryTable).values([
    { pupilId: luna.id, schoolId, mood: 4, note: "Told my teacher what happened. Glad I did.", createdAt: d(5) },
    { pupilId: luna.id, schoolId, mood: 2, note: "Everyone calls me a snitch now. I wish I hadn't said anything.", createdAt: d(13) },
    { pupilId: luna.id, schoolId, mood: 1, note: "Even my friends are scared to talk to me. I feel so alone.", createdAt: d(18) },
    { pupilId: luna.id, schoolId, mood: 1, note: "I'll never report anything again. It just makes everything worse.", createdAt: d(21) },
    { pupilId: emily.id, schoolId, mood: 3, note: "I want to be Luna's friend but Ethan says bad things will happen if I do.", createdAt: d(16) },
  ]);

  // =========================================
  // CASE STUDY 3: "Child Q's material bullying"
  // Liam = Q (perpetrator), Alice/Noah/Freya = victims
  // =========================================
  console.log("  Seeding Case Study 3: Material bullying...");

  const cs3Incidents = [
    {
      referenceNumber: "CS3-001",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(3).toISOString().split("T")[0],
      location: "Classroom", description: "Liam made fun of Alice's phone, calling it 'ancient' and 'poor people phone' in front of the class. Alice looked embarrassed and went quiet.",
      victimIds: [alice.id], perpetratorIds: [liam.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "embarrassed", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: false, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS3-002",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(10).toISOString().split("T")[0],
      location: "Playground", description: "Liam asked Noah where he went on holiday, then laughed and said 'that doesn't count as a proper holiday'. Noah was visibly upset.",
      victimIds: [noah.id], perpetratorIds: [liam.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "upset", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: false, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS3-003",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(17).toISOString().split("T")[0],
      location: "Classroom", description: "Liam commented loudly on Freya's shoes, saying they were 'cheap' and 'from a charity shop'. Several children laughed. Freya asked to go to the toilet and was found crying.",
      victimIds: [freya.id], perpetratorIds: [liam.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "distressed", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: false, coordinatorNotified: true,
      staffNotes: "Third incident involving Liam mocking material possessions. Pattern is becoming clear - always targets what others have or don't have.",
    },
    {
      referenceNumber: "CS3-004",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 2, safeguardingTrigger: false,
      incidentDate: d(24).toISOString().split("T")[0],
      location: "Canteen", description: "Liam mocked Alice's packed lunch, saying 'my family eats better than that for breakfast'. Alice threw her lunch away. Noah and Freya now avoid Liam but several children in the class report feeling 'poor' and 'left out'.",
      victimIds: [alice.id], perpetratorIds: [liam.id], witnessIds: [noah.id, freya.id],
      status: "open", parentVisible: true,
      emotionalState: "upset", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: true,
      staffNotes: "Material/socio-economic bullying pattern now well established. Class diagnostic survey shows low 'I feel respected' and 'People don't judge me for what I have' scores.",
    },
  ];

  const cs3InsertedIncidents = [];
  for (const inc of cs3Incidents) {
    const [inserted] = await db.insert(incidentsTable).values(inc as any).returning();
    cs3InsertedIncidents.push(inserted);
  }

  await db.insert(patternAlertsTable).values([
    {
      schoolId, ruleId: "repeat_perpetrator", ruleLabel: "Repeat perpetrator",
      alertLevel: "amber", victimId: null, perpetratorIds: [liam.id],
      linkedIncidentIds: cs3InsertedIncidents.map(i => i.id), triggeredAt: d(17), status: "open",
    },
  ]);

  await db.insert(behaviourPointsTable).values([
    { schoolId, pupilId: liam.id, points: 2, reason: "Disrespect - mocking classmate's belongings", category: "disrespect", incidentId: cs3InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(3) },
    { schoolId, pupilId: liam.id, points: 2, reason: "Disrespect - mocking classmate's holiday", category: "disrespect", incidentId: cs3InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(10) },
    { schoolId, pupilId: liam.id, points: 3, reason: "Bullying - material/socio-economic mocking", category: "bullying", incidentId: cs3InsertedIncidents[2].id, issuedBy: teacherId, issuedAt: d(17) },
    { schoolId, pupilId: liam.id, points: 3, reason: "Bullying - repeated material status targeting", category: "bullying", incidentId: cs3InsertedIncidents[3].id, issuedBy: teacherId, issuedAt: d(24) },
  ]);

  // =========================================
  // CASE STUDY 4: "Classroom volatility: P and T together"
  // Jack = P, James = T
  // =========================================
  console.log("  Seeding Case Study 4: Classroom volatility...");

  const cs4Incidents = [
    {
      referenceNumber: "CS4-001",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "disruption", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(2).toISOString().split("T")[0],
      location: "Classroom - Maths", description: "Jack and James were seated together and became increasingly disruptive. Talking over the teacher, throwing paper, distracting others. Class could not continue for 10 minutes.",
      victimIds: [], perpetratorIds: [jack.id, james.id], witnessIds: [],
      status: "reviewed", parentVisible: false,
      emotionalState: "agitated", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS4-002",
      schoolId, reporterId: teachers[1]?.id || teacherId, reporterRole: "teacher",
      category: "disruption", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(4).toISOString().split("T")[0],
      location: "Classroom - English", description: "Jack and James in same group for project work. Escalated from giggling to shouting within 15 minutes. Other pupils complained they couldn't concentrate.",
      victimIds: [], perpetratorIds: [jack.id, james.id], witnessIds: [],
      status: "reviewed", parentVisible: false,
      emotionalState: "agitated", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS4-003",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "disruption", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(9).toISOString().split("T")[0],
      location: "Classroom - Science", description: "Another disruptive session with Jack and James together. This time Jack knocked over equipment. Neither pupil is like this individually.",
      victimIds: [], perpetratorIds: [jack.id, james.id], witnessIds: [],
      status: "reviewed", parentVisible: false,
      emotionalState: "calm", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: false,
      staffNotes: "Pattern noted: both boys are fine in other lessons where they are separated. The combination is the trigger.",
    },
    {
      referenceNumber: "CS4-004",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "disruption", escalationTier: 2, safeguardingTrigger: false,
      incidentDate: d(16).toISOString().split("T")[0],
      location: "Classroom - Art", description: "Jack and James seated at same table in Art. Within 5 minutes, both were throwing paint at each other. Other pupils' work was damaged. Severity is escalating each time they are together.",
      victimIds: [], perpetratorIds: [jack.id, james.id], witnessIds: [],
      status: "open", parentVisible: false,
      emotionalState: "agitated", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: true, coordinatorNotified: true,
      staffNotes: "Recommend structural separation: different seating, different groups in all lessons. Data clearly shows co-occurrence pattern.",
    },
  ];

  const cs4InsertedIncidents = [];
  for (const inc of cs4Incidents) {
    const [inserted] = await db.insert(incidentsTable).values(inc as any).returning();
    cs4InsertedIncidents.push(inserted);
  }

  await db.insert(behaviourPointsTable).values([
    { schoolId, pupilId: jack.id, points: 1, reason: "Disruption in class (with James)", category: "disruption", incidentId: cs4InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(2) },
    { schoolId, pupilId: james.id, points: 1, reason: "Disruption in class (with Jack)", category: "disruption", incidentId: cs4InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(2) },
    { schoolId, pupilId: jack.id, points: 1, reason: "Disruption in class (with James)", category: "disruption", incidentId: cs4InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(4) },
    { schoolId, pupilId: james.id, points: 1, reason: "Disruption in class (with Jack)", category: "disruption", incidentId: cs4InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(4) },
    { schoolId, pupilId: jack.id, points: 2, reason: "Disruption + property damage (with James)", category: "disruption", incidentId: cs4InsertedIncidents[2].id, issuedBy: teacherId, issuedAt: d(9) },
    { schoolId, pupilId: james.id, points: 2, reason: "Disruption + property damage (with Jack)", category: "disruption", incidentId: cs4InsertedIncidents[2].id, issuedBy: teacherId, issuedAt: d(9) },
    { schoolId, pupilId: jack.id, points: 2, reason: "Throwing paint, damaging others' work", category: "property", incidentId: cs4InsertedIncidents[3].id, issuedBy: teacherId, issuedAt: d(16) },
    { schoolId, pupilId: james.id, points: 2, reason: "Throwing paint, damaging others' work", category: "property", incidentId: cs4InsertedIncidents[3].id, issuedBy: teacherId, issuedAt: d(16) },
  ]);

  await db.insert(patternAlertsTable).values([
    {
      schoolId, ruleId: "same_pair_escalating", ruleLabel: "Same pair escalating",
      alertLevel: "amber", victimId: null, perpetratorIds: [jack.id, james.id],
      linkedIncidentIds: cs4InsertedIncidents.map(i => i.id), triggeredAt: d(16), status: "open",
    },
  ]);

  // =========================================
  // CASE STUDY 5: "Slow collapse: Child M"
  // Mia = M, Charlotte/George/Isla = subtle perpetrators
  // =========================================
  console.log("  Seeding Case Study 5: Slow collapse (Child M)...");

  const cs5Incidents = [
    {
      referenceNumber: "CS5-001",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(6).toISOString().split("T")[0],
      location: "Playground", description: "Mia was excluded from a game at break. Charlotte and Isla told her 'there's no room'. Mia sat alone on the bench.",
      victimIds: [mia.id], perpetratorIds: [charlotte.id, isla.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "sad", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: false, coordinatorNotified: false,
    },
    {
      referenceNumber: "CS5-002",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(13).toISOString().split("T")[0],
      location: "Classroom", description: "Observed eye-rolling from Charlotte and George when Mia answered a question in class. Mia noticed and went very quiet for the rest of the lesson.",
      victimIds: [mia.id], perpetratorIds: [charlotte.id, george.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "withdrawn", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: false, coordinatorNotified: false,
      staffNotes: "Low-level but consistent. Each individual event seems minor but I'm seeing a pattern of Mia being subtly excluded and mocked.",
    },
    {
      referenceNumber: "CS5-003",
      schoolId, reporterId: teacherId, reporterRole: "teacher",
      category: "bullying", escalationTier: 1, safeguardingTrigger: false,
      incidentDate: d(20).toISOString().split("T")[0],
      location: "Canteen", description: "Mia was sitting alone at lunch again. Charlotte and George were whispering about her appearance. Mia looked down at herself and didn't eat her lunch.",
      victimIds: [mia.id], perpetratorIds: [charlotte.id, george.id], witnessIds: [],
      status: "reviewed", parentVisible: true,
      emotionalState: "distressed", happeningToSomeoneElse: true, iSawIt: true,
      childrenSeparated: false, coordinatorNotified: true,
      staffNotes: "Mia's mood has noticeably declined. She was a confident, settled pupil at start of term. Now withdrawn and isolated.",
    },
  ];

  const cs5InsertedIncidents = [];
  for (const inc of cs5Incidents) {
    const [inserted] = await db.insert(incidentsTable).values(inc as any).returning();
    cs5InsertedIncidents.push(inserted);
  }

  await db.insert(pupilDiaryTable).values([
    { pupilId: mia.id, schoolId, mood: 5, note: "Great day! I love school.", createdAt: d(-5) },
    { pupilId: mia.id, schoolId, mood: 4, note: "OK day. Some people were a bit mean at break.", createdAt: d(1) },
    { pupilId: mia.id, schoolId, mood: 4, note: "Answered a question in class and felt good about it.", createdAt: d(4) },
    { pupilId: mia.id, schoolId, mood: 3, note: "No one wanted me on their team today.", createdAt: d(7) },
    { pupilId: mia.id, schoolId, mood: 3, note: "Charlotte said my answer was stupid. I don't want to put my hand up any more.", createdAt: d(10) },
    { pupilId: mia.id, schoolId, mood: 2, note: "They laughed when I spoke. I just want to be invisible.", createdAt: d(13) },
    { pupilId: mia.id, schoolId, mood: 2, note: "Sat alone at lunch. Nobody came to sit with me.", createdAt: d(16) },
    { pupilId: mia.id, schoolId, mood: 1, note: "I don't want to go to school any more. Everything is horrible.", createdAt: d(20) },
    { pupilId: mia.id, schoolId, mood: 1, note: "I told Mum I felt sick so I didn't have to go in. I'm not really sick. I just can't face it.", createdAt: d(23) },
  ]);

  await db.insert(patternAlertsTable).values([
    {
      schoolId, ruleId: "mood_decline", ruleLabel: "Sustained mood decline",
      alertLevel: "amber", victimId: mia.id, perpetratorIds: [],
      linkedIncidentIds: cs5InsertedIncidents.map(i => i.id), triggeredAt: d(16), status: "open",
      notes: "Average mood dropped to 2 or below over 5+ entries in 14 days. Combined with minor bullying incidents.",
    },
    {
      schoolId, ruleId: "same_victim_3_incidents", ruleLabel: "Same victim in 3+ incidents",
      alertLevel: "amber", victimId: mia.id, perpetratorIds: [charlotte.id, george.id, isla.id],
      linkedIncidentIds: cs5InsertedIncidents.map(i => i.id), triggeredAt: d(20), status: "open",
    },
  ]);

  await db.insert(behaviourPointsTable).values([
    { schoolId, pupilId: charlotte.id, points: 1, reason: "Excluding classmate from games", category: "disrespect", incidentId: cs5InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(6) },
    { schoolId, pupilId: isla.id, points: 1, reason: "Excluding classmate from games", category: "disrespect", incidentId: cs5InsertedIncidents[0].id, issuedBy: teacherId, issuedAt: d(6) },
    { schoolId, pupilId: charlotte.id, points: 1, reason: "Eye-rolling and mocking classmate", category: "disrespect", incidentId: cs5InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(13) },
    { schoolId, pupilId: george.id, points: 1, reason: "Eye-rolling and mocking classmate", category: "disrespect", incidentId: cs5InsertedIncidents[1].id, issuedBy: teacherId, issuedAt: d(13) },
  ]);

  console.log("\nCase study demo data seeded successfully!");
  console.log("  - 5 case studies with incidents, behaviour points, diary entries, and pattern alerts");
  console.log("  - Reference numbers: CS1-001 to CS5-003");
  process.exit(0);
}

seedCaseStudies().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});

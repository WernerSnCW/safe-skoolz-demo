import { db, usersTable, incidentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

function refNum() {
  return `INC-${String(Math.floor(10000 + Math.random() * 90000))}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

async function seedDemo() {
  console.log("Seeding demo incidents...");

  const allUsers = await db.select().from(usersTable);
  const byName = (first: string, last: string) => {
    const u = allUsers.find((u) => u.firstName === first && u.lastName === last);
    if (!u) throw new Error(`User not found: ${first} ${last}`);
    return u;
  };

  const school = allUsers[0].schoolId;

  const boyA = byName("Boy", "A");
  const boyB = byName("Boy", "B");
  const boyC = byName("Boy", "C");
  const boyD = byName("Boy", "D");
  const girlA = byName("Girl", "A");
  const girlB = byName("Girl", "B");
  const girlC = byName("Girl", "C");
  const girlD = byName("Girl", "D");
  const teacherA = byName("Teacher", "A");
  const teacherB = byName("Teacher", "B");
  const coordinator = byName("Coordinator", "A");

  const existing = await db.select().from(incidentsTable);
  if (existing.length > 0) {
    console.log(`Already ${existing.length} incidents in DB. Skipping demo seed.`);
    process.exit(0);
  }

  const incidents = [
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: boyA.id,
      reporterRole: "pupil",
      anonymous: false,
      category: "verbal",
      escalationTier: 1,
      safeguardingTrigger: false,
      incidentDate: daysAgo(14),
      location: "playground",
      description: "Someone in my class keeps calling me unkind names at break time. It makes me feel really upset and I don't want to go outside anymore.",
      victimIds: [boyA.id],
      perpetratorIds: [boyB.id],
      personInvolvedText: "Boy B",
      witnessText: "Girl A was nearby",
      emotionalState: "sad,scared",
      happeningToMe: true,
      happeningToSomeoneElse: false,
      iSawIt: false,
      status: "open",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: girlA.id,
      reporterRole: "pupil",
      anonymous: false,
      category: "physical",
      escalationTier: 2,
      safeguardingTrigger: false,
      incidentDate: daysAgo(12),
      location: "corridor",
      description: "Someone bumped into me on purpose in the corridor and I fell over. My knee got a scrape and it really hurt.",
      victimIds: [girlA.id],
      perpetratorIds: [boyB.id],
      personInvolvedText: "Boy B",
      emotionalState: "scared,angry",
      happeningToMe: true,
      happeningToSomeoneElse: false,
      iSawIt: false,
      status: "open",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: teacherA.id,
      reporterRole: "head_of_year",
      anonymous: false,
      category: "verbal,psychological",
      escalationTier: 2,
      safeguardingTrigger: false,
      incidentDate: daysAgo(10),
      location: "classroom",
      description: "Observed Boy B leaving Boy A out of group work on purpose and saying unkind things to him. Boy A looked upset. This is the third time I have noticed this happening between them.",
      victimIds: [boyA.id],
      perpetratorIds: [boyB.id],
      childrenSeparated: true,
      coordinatorNotified: true,
      immediateActionTaken: "Moved pupils to different groups. Spoke with both children. Logged with coordinator.",
      partOfKnownPattern: true,
      status: "investigating",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: girlB.id,
      reporterRole: "pupil",
      anonymous: true,
      category: "online",
      escalationTier: 2,
      safeguardingTrigger: false,
      incidentDate: daysAgo(8),
      location: "online",
      description: "Someone made a group chat and they are writing unkind things about a girl in my class. They are sharing things to upset her and it is not fair.",
      victimIds: [girlA.id],
      personInvolvedText: "Some people in Y5",
      emotionalState: "worried,confused",
      happeningToMe: false,
      happeningToSomeoneElse: true,
      iSawIt: true,
      status: "submitted",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: boyC.id,
      reporterRole: "pupil",
      anonymous: false,
      category: "physical",
      escalationTier: 2,
      safeguardingTrigger: false,
      incidentDate: daysAgo(7),
      location: "playground",
      description: "An older child keeps taking my snack at break time and won't give it back. When I ask for it back they push me away.",
      victimIds: [boyC.id],
      perpetratorIds: [boyD.id],
      personInvolvedText: "Boy D",
      emotionalState: "scared,sad",
      happeningToMe: true,
      happeningToSomeoneElse: false,
      iSawIt: false,
      status: "open",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: teacherB.id,
      reporterRole: "teacher",
      anonymous: false,
      category: "neglect",
      escalationTier: 2,
      safeguardingTrigger: true,
      incidentDate: daysAgo(6),
      location: "classroom",
      description: "Girl B has arrived at school without a coat or warm clothes several times this term. She seemed tired and hungry this morning. I want to make sure she is getting the support she needs.",
      victimIds: [girlB.id],
      childrenSeparated: false,
      coordinatorNotified: true,
      immediateActionTaken: "Offered breakfast from the school kitchen. Notified coordinator so we can check in with the family.",
      toldByChild: false,
      status: "escalated",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: coordinator.id,
      reporterRole: "coordinator",
      anonymous: false,
      category: "safeguarding",
      escalationTier: 3,
      safeguardingTrigger: true,
      incidentDate: daysAgo(5),
      location: "other",
      description: "Following a referral from Teacher B, a safeguarding concern has been raised for Girl C. The school is following the correct steps to make sure she is safe and supported. LOPIVI protocol started. External support has been contacted.",
      victimIds: [girlC.id],
      childrenSeparated: true,
      coordinatorNotified: true,
      immediateActionTaken: "Made sure the child feels safe at school. Contacted the right people for help.",
      toldByChild: true,
      childConsentToShare: true,
      formalResponseRequested: true,
      requestExternalReferral: true,
      confidentialFlag: true,
      status: "escalated",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: girlD.id,
      reporterRole: "pupil",
      anonymous: false,
      category: "exclusion",
      escalationTier: 1,
      safeguardingTrigger: false,
      incidentDate: daysAgo(4),
      location: "classroom",
      description: "The other children won't let me join in their games at play time. They walk away when I come over. It happens nearly every day and it makes me feel lonely.",
      victimIds: [girlD.id],
      emotionalState: "sad,lonely",
      happeningToMe: true,
      happeningToSomeoneElse: false,
      iSawIt: false,
      status: "submitted",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: boyA.id,
      reporterRole: "pupil",
      anonymous: false,
      category: "verbal,physical",
      escalationTier: 2,
      safeguardingTrigger: false,
      incidentDate: daysAgo(3),
      location: "playground",
      description: "The same person pushed me again today at break. They told me not to tell anyone. I feel worried about coming to school.",
      victimIds: [boyA.id],
      perpetratorIds: [boyB.id],
      personInvolvedText: "Boy B",
      emotionalState: "scared,angry,sad",
      happeningToMe: true,
      happeningToSomeoneElse: false,
      iSawIt: false,
      status: "submitted",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: boyD.id,
      reporterRole: "pupil",
      anonymous: true,
      category: "psychological",
      escalationTier: 2,
      safeguardingTrigger: false,
      incidentDate: daysAgo(2),
      location: "classroom",
      description: "Some children keep laughing when I read out loud in class. They copy my voice afterwards. It makes me feel embarrassed and I don't want to read anymore.",
      victimIds: [boyD.id],
      emotionalState: "embarrassed,sad",
      happeningToMe: true,
      happeningToSomeoneElse: false,
      iSawIt: false,
      status: "submitted",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: teacherA.id,
      reporterRole: "head_of_year",
      anonymous: false,
      category: "physical,verbal",
      escalationTier: 2,
      safeguardingTrigger: false,
      incidentDate: daysAgo(1),
      location: "playground",
      description: "Pattern follow-up: Boy B was involved in another incident with Boy A at morning break. Boy B pushed Boy A. Other children saw it happen. This is the fourth time this has been reported in 2 weeks. Requesting that the Convivèxit process is started.",
      victimIds: [boyA.id],
      perpetratorIds: [boyB.id],
      childrenSeparated: true,
      coordinatorNotified: true,
      immediateActionTaken: "Children separated. Boy B given a different break area while we look into this.",
      partOfKnownPattern: true,
      formalResponseRequested: true,
      status: "investigating",
    },
  ];

  for (const inc of incidents) {
    await db.insert(incidentsTable).values(inc as any);
    console.log(`  Created: ${inc.referenceNumber} - ${inc.category} (${inc.status})`);
  }

  console.log(`\nSeeded ${incidents.length} demo incidents.`);
  console.log("\nKey patterns to observe:");
  console.log("  - Boy B appears in 4 incidents involving Boy A (repeated unkind behaviour)");
  console.log("  - Girl B: welfare concern (teacher noticed she needs extra support)");
  console.log("  - Girl C: tier 3 safeguarding case (LOPIVI protocol)");
  console.log("  - Girl D: feeling left out (exclusion)");
  console.log("  - Boy D: being made fun of in class (anonymous report)");
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error("Demo seed failed:", err);
  process.exit(1);
});

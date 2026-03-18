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
      description: "Someone in my class keeps calling me names at break time. They say horrible things about how I look.",
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
      description: "I was pushed really hard in the corridor between classes. I fell down and hurt my knee.",
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
      description: "Witnessed sustained verbal intimidation of Boy A by Boy B during group work. Boy B was excluding Boy A from the group and making derogatory comments. This is the third time I have observed this dynamic.",
      victimIds: [boyA.id],
      perpetratorIds: [boyB.id],
      childrenSeparated: true,
      coordinatorNotified: true,
      immediateActionTaken: "Separated pupils, spoke with both individually. Logged with coordinator.",
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
      description: "Someone made a group chat and they are saying really mean things about a girl in my class. They share bad pictures and videos to embarrass her.",
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
      description: "An older kid keeps taking my snack at break time and pushes me if I say no.",
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
      description: "Girl B has come to school without proper clothing for the third consecutive week. She appears not to have eaten breakfast and was visibly distressed during morning registration. Previous welfare checks have raised concerns about the home environment.",
      victimIds: [girlB.id],
      childrenSeparated: false,
      coordinatorNotified: true,
      immediateActionTaken: "Provided breakfast from pastoral care supplies. Notified coordinator for welfare follow-up.",
      toldByChild: false,
      status: "escalated",
    },
    {
      referenceNumber: refNum(),
      schoolId: school,
      reporterId: coordinator.id,
      reporterRole: "coordinator",
      anonymous: false,
      category: "sexual",
      escalationTier: 3,
      safeguardingTrigger: true,
      incidentDate: daysAgo(5),
      location: "other",
      description: "Following referral from Teacher B, formal safeguarding investigation opened. Child disclosed concerning behaviour by an adult known to the family during a supervised conversation. LOPIVI protocol activated. External referral to Fiscalía de Menores initiated.",
      victimIds: [girlC.id],
      childrenSeparated: true,
      coordinatorNotified: true,
      immediateActionTaken: "Immediate safe space provided. Parents notified per protocol. External referral submitted.",
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
      description: "Nobody will let me join in at play time. They run away when I come over. It happens every day.",
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
      description: "Boy B pushed me again today and said he would hurt me if I told anyone. I am really scared to come to school now.",
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
      description: "Some kids keep laughing at me when I read out loud. They copy my voice and make fun of me. It makes me not want to come to school.",
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
      description: "Pattern alert follow-up: Boy B involved in another physical altercation with Boy A at morning break. Boy B shoved Boy A against the wall. Multiple witnesses. This is the fourth recorded incident involving Boy B as perpetrator in 2 weeks. Requesting formal Convivèxit protocol activation.",
      victimIds: [boyA.id],
      perpetratorIds: [boyB.id],
      childrenSeparated: true,
      coordinatorNotified: true,
      immediateActionTaken: "Boys separated. Boy B moved to different break area pending investigation.",
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
  console.log("  - Boy B appears as perpetrator in 4 incidents (bullying pattern against Boy A)");
  console.log("  - Girl B: neglect/safeguarding concern");
  console.log("  - Girl C: tier 3 sexual safeguarding case (LOPIVI)");
  console.log("  - Girl D: social exclusion");
  console.log("  - Boy D: psychological bullying (anonymous report)");
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error("Demo seed failed:", err);
  process.exit(1);
});

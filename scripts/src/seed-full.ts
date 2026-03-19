import {
  db,
  usersTable,
  incidentsTable,
  protocolsTable,
  patternAlertsTable,
  notificationsTable,
  interviewsTable,
  caseTasksTable,
  messagesTable,
  auditLogTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

function protocolRef() {
  return `PRO-${String(Math.floor(10000 + Math.random() * 90000))}`;
}

async function seedFull() {
  console.log("Seeding full platform data (protocols, alerts, notifications, tasks, interviews, messages)...\n");

  const allUsers = await db.select().from(usersTable);
  const byEmail = (email: string) => {
    const u = allUsers.find((u) => u.email === email);
    if (!u) throw new Error(`User not found: ${email}`);
    return u;
  };
  const byName = (first: string, last: string) => {
    const u = allUsers.find((u) => u.firstName === first && u.lastName === last);
    if (!u) throw new Error(`User not found: ${first} ${last}`);
    return u;
  };

  const school = allUsers[0].schoolId;
  const coordinator = byEmail("coordinator@safeschool.dev");
  const headTeacher = byEmail("head@safeschool.dev");
  const senco = byEmail("senco@safeschool.dev");
  const teacherA = byName("Teacher", "A");
  const teacherB = byName("Teacher", "B");
  const supportStaff = byEmail("support@safeschool.dev");
  const boyA = byName("Boy", "A");
  const boyB = byName("Boy", "B");
  const girlB = byName("Girl", "B");
  const girlC = byName("Girl", "C");
  const girlA = byName("Girl", "A");
  const boyD = byName("Boy", "D");

  const incidents = await db.select().from(incidentsTable).where(eq(incidentsTable.schoolId, school));
  if (incidents.length === 0) {
    console.error("No incidents found. Run seed-demo first.");
    process.exit(1);
  }

  const existingProtocols = await db.select().from(protocolsTable).where(eq(protocolsTable.schoolId, school));
  if (existingProtocols.length > 0) {
    console.log("Full seed data already exists. Skipping.");
    process.exit(0);
  }

  const boyABoyBIncidents = incidents.filter(
    (i) => i.victimIds?.includes(boyA.id) && i.perpetratorIds?.includes(boyB.id)
  );
  const girlCIncident = incidents.find(
    (i) => i.victimIds?.includes(girlC.id) && i.escalationTier === 3
  );
  const girlBIncident = incidents.find(
    (i) => i.victimIds?.includes(girlB.id) && i.safeguardingTrigger === true
  );

  console.log("--- PROTOCOLS ---");

  const [convivexitProtocol] = await db.insert(protocolsTable).values({
    referenceNumber: protocolRef(),
    schoolId: school,
    openedBy: coordinator.id,
    openedAt: daysAgo(1),
    protocolType: "convivexit",
    protocolSource: "pattern_detection",
    genderBasedViolence: false,
    context: "Repeated incidents of physical and verbal aggression by Boy B towards Boy A over a 2-week period. Four separate reports received from pupils and staff. Convivèxit protocol initiated following Head of Year recommendation.",
    linkedIncidentIds: boyABoyBIncidents.map((i) => i.id),
    victimId: boyA.id,
    allegedPerpetratorIds: [boyB.id],
    parentNotificationSent: true,
    parentNotificationAt: daysAgo(1),
    interviewsRequired: true,
    riskLevel: "medium",
    riskFactors: ["repeated_behaviour", "physical_aggression", "victim_distress", "escalating_severity"],
    protectiveFactors: ["victim_has_friends", "school_awareness"],
    protectiveMeasures: ["separate_break_areas", "increased_supervision", "class_group_change"],
    externalReferralRequired: false,
    status: "open",
  }).returning();
  console.log(`  Created Convivèxit protocol: ${convivexitProtocol.referenceNumber}`);

  const [lopiviProtocol] = await db.insert(protocolsTable).values({
    referenceNumber: protocolRef(),
    schoolId: school,
    openedBy: coordinator.id,
    openedAt: daysAgo(4),
    protocolType: "lopivi",
    protocolSource: "staff_report",
    genderBasedViolence: false,
    context: "Safeguarding concern raised for Girl C following teacher referral. LOPIVI duty to report activated. Child has disclosed information that requires formal investigation and external support. Immediate protective measures implemented.",
    linkedIncidentIds: girlCIncident ? [girlCIncident.id] : [],
    victimId: girlC.id,
    allegedPerpetratorIds: [],
    parentNotificationSent: true,
    parentNotificationAt: daysAgo(3),
    interviewsRequired: true,
    riskLevel: "high",
    riskFactors: ["child_disclosure", "external_risk", "ongoing_concern", "emotional_impact"],
    protectiveFactors: ["child_trusts_school", "family_engagement"],
    protectiveMeasures: ["designated_safe_adult", "daily_check_in", "external_support_referral"],
    externalReferralRequired: true,
    externalReferralBody: "Fiscalía de Menores de Palma",
    externalReferralAt: daysAgo(3),
    status: "open",
  }).returning();
  console.log(`  Created LOPIVI protocol: ${lopiviProtocol.referenceNumber}`);

  for (const inc of boyABoyBIncidents) {
    await db.update(incidentsTable).set({ protocolId: convivexitProtocol.id }).where(eq(incidentsTable.id, inc.id));
  }
  if (girlCIncident) {
    await db.update(incidentsTable).set({ protocolId: lopiviProtocol.id }).where(eq(incidentsTable.id, girlCIncident.id));
  }
  console.log("  Linked incidents to protocols");

  console.log("\n--- PATTERN ALERTS ---");

  const alertValues = [
    {
      schoolId: school,
      ruleId: "repeated_perpetrator",
      ruleLabel: "Repeated Perpetrator — Same child involved in 4+ incidents",
      alertLevel: "red",
      victimId: boyA.id,
      perpetratorIds: [boyB.id],
      linkedIncidentIds: boyABoyBIncidents.map((i) => i.id),
      triggeredAt: daysAgo(1),
      status: "open",
      notes: "Boy B has been identified as the perpetrator in 4 incidents targeting Boy A over a 14-day period. Pattern escalating from verbal to physical aggression.",
    },
    {
      schoolId: school,
      ruleId: "welfare_concern",
      ruleLabel: "Welfare Concern — Safeguarding trigger flagged by staff",
      alertLevel: "amber",
      victimId: girlB.id,
      perpetratorIds: [] as string[],
      linkedIncidentIds: girlBIncident ? [girlBIncident.id] : [],
      triggeredAt: daysAgo(5),
      status: "open",
      notes: "Teacher B raised a welfare concern for Girl B — arriving without proper clothing, appearing tired and hungry. Possible neglect indicators.",
    },
    {
      schoolId: school,
      ruleId: "multi_victim_online",
      ruleLabel: "Online Bullying — Multiple pupils affected by group chat",
      alertLevel: "amber",
      victimId: girlA.id,
      perpetratorIds: [] as string[],
      linkedIncidentIds: incidents.filter((i) => i.category?.includes("online")).map((i) => i.id),
      triggeredAt: daysAgo(7),
      reviewedAt: daysAgo(6),
      reviewedBy: coordinator.id,
      status: "reviewed",
      notes: "Anonymous report of an unkind group chat targeting a Year 5 pupil. Coordinator reviewed and monitoring. Parents informed.",
    },
  ];

  await db.insert(patternAlertsTable).values(alertValues as any);
  console.log(`  Created ${alertValues.length} pattern alerts`);

  console.log("\n--- INTERVIEWS ---");

  const interviewValues = [
    {
      protocolId: convivexitProtocol.id,
      schoolId: school,
      intervieweeId: boyA.id,
      intervieweeRole: "victim",
      conductedBy: coordinator.id,
      interviewDate: daysAgo(1).toISOString().split("T")[0],
      summary: "Boy A described feeling scared and upset. He said Boy B has been calling him names and pushing him for about two weeks. He is worried about coming to school and doesn't want to go outside at break time. He feels safe with Teacher A and wants the behaviour to stop.",
      annexReference: "ANNEX-II",
    },
    {
      protocolId: convivexitProtocol.id,
      schoolId: school,
      intervieweeId: boyB.id,
      intervieweeRole: "perpetrator",
      conductedBy: coordinator.id,
      interviewDate: daysAgo(1).toISOString().split("T")[0],
      summary: "Boy B acknowledged pushing Boy A but said he was 'just playing'. When asked about the name-calling, he said 'everyone does it'. He was reminded of the school's kindness expectations. He agreed to try to be kinder but seemed reluctant.",
      annexReference: "ANNEX-II",
    },
    {
      protocolId: convivexitProtocol.id,
      schoolId: school,
      intervieweeId: girlA.id,
      intervieweeRole: "witness",
      conductedBy: teacherA.id,
      interviewDate: daysAgo(0).toISOString().split("T")[0],
      summary: "Girl A confirmed she saw Boy B push Boy A on the playground. She said it has happened several times and that Boy A looks upset afterwards. She also heard Boy B calling him names in the corridor.",
      annexReference: "ANNEX-II",
    },
    {
      protocolId: lopiviProtocol.id,
      schoolId: school,
      intervieweeId: girlC.id,
      intervieweeRole: "victim",
      conductedBy: coordinator.id,
      interviewDate: daysAgo(3).toISOString().split("T")[0],
      summary: "Confidential interview conducted with appropriate safeguards. Girl C felt safe to share her concerns. She was reassured that the school will help keep her safe. Notes filed under confidential protocol records.",
      annexReference: "LOP-I",
    },
  ];

  await db.insert(interviewsTable).values(interviewValues as any);
  console.log(`  Created ${interviewValues.length} interviews`);

  console.log("\n--- CASE TASKS ---");

  const taskValues = [
    {
      schoolId: school,
      protocolId: convivexitProtocol.id,
      taskType: "interview",
      title: "Interview Boy B's parents",
      description: "Arrange a meeting with Boy B's parents to discuss the pattern of behaviour and agree on next steps together.",
      assigneeId: coordinator.id,
      priority: "high",
      status: "pending",
      dueAt: daysAgo(0),
    },
    {
      schoolId: school,
      protocolId: convivexitProtocol.id,
      taskType: "protective_measure",
      title: "Implement separate break-time areas",
      description: "Ensure Boy A and Boy B have separate designated areas during break and lunch for at least 2 weeks.",
      assigneeId: teacherA.id,
      priority: "high",
      status: "completed",
      completedAt: daysAgo(0),
      completedBy: teacherA.id,
      notes: "Arrangements in place. Boy B assigned to the library area during morning break.",
    },
    {
      schoolId: school,
      protocolId: convivexitProtocol.id,
      taskType: "follow_up",
      title: "Check in with Boy A daily",
      description: "Daily wellbeing check-in with Boy A for the next two weeks to monitor his emotional state and ensure he feels safe.",
      assigneeId: teacherA.id,
      priority: "normal",
      status: "in_progress",
      dueAt: daysAgo(-14),
    },
    {
      schoolId: school,
      protocolId: lopiviProtocol.id,
      taskType: "external_referral",
      title: "Confirm receipt of referral to Fiscalía de Menores",
      description: "Follow up with Fiscalía de Menores de Palma to confirm they received the LOPIVI referral and obtain a case reference number.",
      assigneeId: coordinator.id,
      priority: "urgent",
      status: "pending",
      dueAt: daysAgo(-1),
    },
    {
      schoolId: school,
      protocolId: lopiviProtocol.id,
      taskType: "protective_measure",
      title: "Assign designated safe adult for Girl C",
      description: "SENCO to be Girl C's designated safe adult for daily check-ins and to provide a safe space if she feels overwhelmed.",
      assigneeId: senco.id,
      priority: "high",
      status: "completed",
      completedAt: daysAgo(2),
      completedBy: senco.id,
      notes: "Girl C knows she can come to SENCO office at any time. Morning check-in established.",
    },
    {
      schoolId: school,
      protocolId: convivexitProtocol.id,
      taskType: "documentation",
      title: "Complete Annex III conclusions report",
      description: "Write up the investigation conclusions report (Annex III) based on all interviews conducted and evidence gathered.",
      assigneeId: coordinator.id,
      priority: "normal",
      status: "pending",
      dueAt: daysAgo(-5),
    },
    {
      schoolId: school,
      protocolId: lopiviProtocol.id,
      taskType: "parent_notification",
      title: "Schedule follow-up meeting with Girl C's family",
      description: "Arrange a second meeting with Girl C's parents to update on progress and agree continued support measures.",
      assigneeId: headTeacher.id,
      priority: "normal",
      status: "pending",
      dueAt: daysAgo(-3),
    },
  ];

  await db.insert(caseTasksTable).values(taskValues as any);
  console.log(`  Created ${taskValues.length} case tasks`);

  console.log("\n--- NOTIFICATIONS ---");

  const notifValues = [
    {
      schoolId: school,
      recipientId: coordinator.id,
      trigger: "incident_escalated",
      subject: "Incident Escalated — Boy A (verbal/physical)",
      body: "An incident involving Boy A has been escalated to tier 2. This is the third report involving the same perpetrator. Please review and consider initiating a formal protocol.",
      reference: boyABoyBIncidents[0]?.referenceNumber,
      sentAt: daysAgo(10),
    },
    {
      schoolId: school,
      recipientId: coordinator.id,
      trigger: "pattern_detected",
      subject: "Pattern Alert: Boy B — Repeated Perpetrator",
      body: "The system has detected a pattern: Boy B has been involved as perpetrator in 4 incidents over the past 14 days, all targeting Boy A. Alert level: RED. Immediate review recommended.",
      sentAt: daysAgo(1),
    },
    {
      schoolId: school,
      recipientId: coordinator.id,
      trigger: "safeguarding_trigger",
      subject: "Safeguarding Trigger — Girl B (welfare concern)",
      body: "Teacher B has flagged a safeguarding concern for Girl B. The child has arrived at school without appropriate clothing on multiple occasions and appeared tired and hungry. Please review and consider appropriate support.",
      reference: girlBIncident?.referenceNumber,
      sentAt: daysAgo(6),
      acknowledgedAt: daysAgo(5),
    },
    {
      schoolId: school,
      recipientId: coordinator.id,
      trigger: "protocol_opened",
      subject: `Convivèxit Protocol Opened — ${convivexitProtocol.referenceNumber}`,
      body: `A Convivèxit protocol has been opened for the repeated incidents involving Boy A (victim) and Boy B (alleged perpetrator). Reference: ${convivexitProtocol.referenceNumber}. Interviews are required.`,
      reference: convivexitProtocol.referenceNumber,
      sentAt: daysAgo(1),
    },
    {
      schoolId: school,
      recipientId: headTeacher.id,
      trigger: "protocol_opened",
      subject: `LOPIVI Protocol Opened — ${lopiviProtocol.referenceNumber}`,
      body: `A LOPIVI safeguarding protocol has been opened for Girl C. External referral to Fiscalía de Menores has been initiated. Reference: ${lopiviProtocol.referenceNumber}.`,
      reference: lopiviProtocol.referenceNumber,
      sentAt: daysAgo(4),
      acknowledgedAt: daysAgo(4),
    },
    {
      schoolId: school,
      recipientId: teacherA.id,
      trigger: "task_assigned",
      subject: "Task Assigned: Check in with Boy A daily",
      body: "You have been assigned a new task related to the Convivèxit protocol. Please conduct daily wellbeing check-ins with Boy A for the next two weeks.",
      reference: convivexitProtocol.referenceNumber,
      sentAt: daysAgo(1),
    },
    {
      schoolId: school,
      recipientId: teacherA.id,
      trigger: "incident_reported",
      subject: "New Incident Report — Your class (Boy A)",
      body: "A new incident has been reported involving a pupil in your class (Boy A). The incident is categorised as verbal/physical and has been flagged as part of a known pattern.",
      sentAt: daysAgo(3),
      acknowledgedAt: daysAgo(3),
    },
    {
      schoolId: school,
      recipientId: senco.id,
      trigger: "task_assigned",
      subject: "Task Assigned: Designated safe adult for Girl C",
      body: "You have been assigned as the designated safe adult for Girl C under the LOPIVI protocol. Please establish daily check-ins and ensure she has access to a safe space.",
      reference: lopiviProtocol.referenceNumber,
      sentAt: daysAgo(4),
      acknowledgedAt: daysAgo(3),
    },
    {
      schoolId: school,
      recipientId: headTeacher.id,
      trigger: "pattern_detected",
      subject: "Pattern Alert: Welfare Concern — Girl B",
      body: "A welfare alert has been raised for Girl B. Staff have observed signs that may indicate a safeguarding concern. The alert has been raised to amber level for coordinator review.",
      sentAt: daysAgo(5),
    },
    {
      schoolId: school,
      recipientId: teacherB.id,
      trigger: "incident_acknowledged",
      subject: "Your Safeguarding Report Acknowledged",
      body: "Your safeguarding report regarding Girl B has been received and acknowledged by the Safeguarding Coordinator. Appropriate support measures are being put in place. Thank you for raising this concern.",
      sentAt: daysAgo(5),
      acknowledgedAt: daysAgo(5),
    },
    {
      schoolId: school,
      recipientId: coordinator.id,
      trigger: "incident_reported",
      subject: "New Anonymous Report — Online Bullying",
      body: "An anonymous report has been submitted regarding online bullying involving a group chat. The reporter states unkind messages are being shared about a Year 5 pupil. Please review.",
      sentAt: daysAgo(8),
      acknowledgedAt: daysAgo(7),
    },
    {
      schoolId: school,
      recipientId: headTeacher.id,
      trigger: "external_referral",
      subject: "External Referral Sent — Fiscalía de Menores",
      body: "An external referral has been sent to the Fiscalía de Menores de Palma regarding the safeguarding case for Girl C. Awaiting confirmation of receipt.",
      reference: lopiviProtocol.referenceNumber,
      sentAt: daysAgo(3),
    },
    {
      schoolId: school,
      recipientId: coordinator.id,
      trigger: "task_overdue",
      subject: "Overdue Task: Interview Boy B's parents",
      body: "The task 'Interview Boy B's parents' is now overdue. Originally due 2 days from now. Please schedule this meeting as soon as possible.",
      reference: convivexitProtocol.referenceNumber,
      sentAt: hoursAgo(6),
    },
    {
      schoolId: school,
      recipientId: teacherA.id,
      trigger: "protocol_update",
      subject: "Protocol Update — Convivèxit (Boy A / Boy B)",
      body: "The Convivèxit protocol for Boy A and Boy B has been updated. Interviews with the victim, perpetrator, and a witness have been completed. A conclusions report is being prepared.",
      reference: convivexitProtocol.referenceNumber,
      sentAt: hoursAgo(3),
    },
    {
      schoolId: school,
      recipientId: supportStaff.id,
      trigger: "alert_raised",
      subject: "New Alert: Repeated behaviour pattern detected",
      body: "A pattern of repeated behaviour has been detected involving pupils in your school. Boy B has been involved in multiple incidents. Please be aware and maintain increased supervision during unstructured times.",
      sentAt: daysAgo(1),
    },
  ];

  const parentA = allUsers.find((u) => u.email === "parent.a@safeschool.dev");
  if (parentA) {
    notifValues.push(
      {
        schoolId: school,
        recipientId: parentA.id,
        trigger: "parent_update",
        subject: "Update about your child's wellbeing",
        body: "The school has been monitoring a situation involving your child. We want to assure you that appropriate steps are being taken and your child is safe and supported. A summary has been added to your dashboard.",
        sentAt: daysAgo(2),
      },
      {
        schoolId: school,
        recipientId: parentA.id,
        trigger: "incident_shared",
        subject: "New information shared with you",
        body: "A staff member has shared an update about an incident involving your child. You can view the details on your dashboard. Please contact the school if you have any questions.",
        sentAt: daysAgo(1),
      },
    );
  }

  await db.insert(notificationsTable).values(notifValues as any);
  console.log(`  Created ${notifValues.length} notifications`);

  console.log("\n--- MESSAGES ---");

  const [msg1] = await db.insert(messagesTable).values({
    schoolId: school,
    senderId: boyA.id,
    recipientId: teacherA.id,
    senderRole: "pupil",
    priority: "important",
    type: "message",
    body: "I don't want to go outside at break time today. Can I stay inside please?",
    createdAt: daysAgo(3),
    readAt: daysAgo(3),
  }).returning();

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: teacherA.id,
    recipientId: boyA.id,
    senderRole: "head_of_year",
    priority: "normal",
    type: "message",
    body: "Of course you can. Come to the library at break time and I'll check in with you. You're doing the right thing by telling me.",
    parentMessageId: msg1.id,
    createdAt: daysAgo(3),
    readAt: daysAgo(3),
  });

  const [msg2] = await db.insert(messagesTable).values({
    schoolId: school,
    senderId: boyA.id,
    recipientId: teacherA.id,
    senderRole: "pupil",
    priority: "normal",
    type: "chat_request",
    body: "Can I talk to you about something? I'm feeling worried.",
    createdAt: daysAgo(2),
    readAt: daysAgo(2),
  }).returning();

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: teacherA.id,
    recipientId: boyA.id,
    senderRole: "head_of_year",
    priority: "normal",
    type: "message",
    body: "Yes, absolutely. Come find me at the start of lunch and we can have a chat in the quiet room. I'm here for you.",
    parentMessageId: msg2.id,
    createdAt: daysAgo(2),
    readAt: daysAgo(1),
  });

  const [msg3] = await db.insert(messagesTable).values({
    schoolId: school,
    senderId: girlC.id,
    recipientId: senco.id,
    senderRole: "pupil",
    priority: "urgent",
    type: "urgent_help",
    body: "I need to talk to someone right now please",
    location: "Classroom",
    createdAt: daysAgo(5),
    readAt: daysAgo(5),
  }).returning();

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: senco.id,
    recipientId: girlC.id,
    senderRole: "senco",
    priority: "normal",
    type: "message",
    body: "I'm coming to you right now. Stay where you are, I'll be there in 2 minutes. You're safe.",
    parentMessageId: msg3.id,
    createdAt: daysAgo(5),
    readAt: daysAgo(5),
  });

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: girlA.id,
    recipientId: teacherA.id,
    senderRole: "pupil",
    priority: "normal",
    type: "message",
    body: "I saw something unkind happening to Boy A again today. I wanted to tell you.",
    createdAt: daysAgo(1),
    readAt: daysAgo(1),
  });

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: boyD.id,
    recipientId: teacherB.id,
    senderRole: "pupil",
    priority: "important",
    type: "message",
    body: "Someone keeps taking my things and I don't know what to do.",
    createdAt: daysAgo(4),
  });

  const [msg4] = await db.insert(messagesTable).values({
    schoolId: school,
    senderId: girlB.id,
    recipientId: supportStaff.id,
    senderRole: "pupil",
    priority: "normal",
    type: "message",
    body: "I forgot my lunch again. Can I get some food from the kitchen?",
    createdAt: daysAgo(2),
    readAt: daysAgo(2),
  }).returning();

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: supportStaff.id,
    recipientId: girlB.id,
    senderRole: "support_staff",
    priority: "normal",
    type: "message",
    body: "Yes of course, come to the kitchen at lunch time and we'll sort you out. You don't need to worry about that.",
    parentMessageId: msg4.id,
    createdAt: daysAgo(2),
    readAt: daysAgo(1),
  });

  const [msg5] = await db.insert(messagesTable).values({
    schoolId: school,
    senderId: boyA.id,
    recipientId: coordinator.id,
    senderRole: "pupil",
    priority: "important",
    type: "message",
    body: "Are you the person who can help make things better? My teacher said I could talk to you.",
    createdAt: daysAgo(1),
    readAt: daysAgo(1),
  }).returning();

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: coordinator.id,
    recipientId: boyA.id,
    senderRole: "coordinator",
    priority: "normal",
    type: "message",
    body: "Yes, I'm here to help. Your teacher told me what's been happening and we're going to make sure things get better. You were very brave to speak up.",
    parentMessageId: msg5.id,
    createdAt: daysAgo(1),
    readAt: hoursAgo(12),
  });

  await db.insert(messagesTable).values({
    schoolId: school,
    senderId: teacherA.id,
    recipientId: coordinator.id,
    senderRole: "head_of_year",
    priority: "important",
    type: "message",
    body: "Just wanted to flag — Boy A was very upset at morning registration today. He said he doesn't want to go outside at all anymore. I think we need to move quickly on the Convivèxit process.",
    createdAt: daysAgo(1),
    readAt: daysAgo(1),
  });

  console.log("  Created 13 messages (6 conversations with replies)");

  console.log("\n--- AUDIT LOG ---");

  const auditValues = [
    {
      schoolId: school,
      eventType: "protocol_opened",
      actorRole: "coordinator",
      actorId: coordinator.id,
      targetType: "protocol",
      targetId: convivexitProtocol.id,
      details: { protocolType: "convivexit", victimName: "Boy A", referenceNumber: convivexitProtocol.referenceNumber },
    },
    {
      schoolId: school,
      eventType: "protocol_opened",
      actorRole: "coordinator",
      actorId: coordinator.id,
      targetType: "protocol",
      targetId: lopiviProtocol.id,
      details: { protocolType: "lopivi", victimName: "Girl C", referenceNumber: lopiviProtocol.referenceNumber },
    },
    {
      schoolId: school,
      eventType: "external_referral_sent",
      actorRole: "coordinator",
      actorId: coordinator.id,
      targetType: "protocol",
      targetId: lopiviProtocol.id,
      details: { referralBody: "Fiscalía de Menores de Palma", referenceNumber: lopiviProtocol.referenceNumber },
    },
    {
      schoolId: school,
      eventType: "interview_conducted",
      actorRole: "coordinator",
      actorId: coordinator.id,
      targetType: "protocol",
      targetId: convivexitProtocol.id,
      details: { intervieweeRole: "victim", intervieweeName: "Boy A" },
    },
    {
      schoolId: school,
      eventType: "alert_reviewed",
      actorRole: "coordinator",
      actorId: coordinator.id,
      targetType: "alert",
      details: { alertType: "online_bullying", victimName: "Girl A", status: "reviewed" },
    },
  ];

  await db.insert(auditLogTable).values(auditValues as any);
  console.log(`  Created ${auditValues.length} audit log entries`);

  const assessedIncidents = incidents.filter(
    (i) => i.status === "investigating" || i.status === "escalated"
  );
  for (const inc of assessedIncidents) {
    if (inc.status === "escalated" && inc.victimIds?.includes(girlB.id)) {
      await db.update(incidentsTable).set({
        assessedBy: teacherB.id,
        assessedAt: daysAgo(4),
        staffNotes: "Girl B has shown signs of neglect on several occasions this term. Arrived without a coat in cold weather, appeared tired. Offered breakfast. Reported to coordinator for further monitoring.",
        parentSummary: "The school has noticed that your child may need some extra support. We want to work with you to make sure she is happy and well looked after. Please don't hesitate to contact us.",
        parentVisible: true,
        addedToFile: true,
      }).where(eq(incidentsTable.id, inc.id));
    }
    if (inc.status === "investigating" && inc.victimIds?.includes(boyA.id)) {
      await db.update(incidentsTable).set({
        assessedBy: teacherA.id,
        assessedAt: daysAgo(0),
        staffNotes: "Observed repeated pattern of unkind behaviour from Boy B towards Boy A. I have personally witnessed two incidents. Boy A is becoming reluctant to come to school. Convivèxit protocol now in progress.",
        witnessStatements: [
          { witnessName: "Girl A", statement: "I saw Boy B push Boy A on the playground during break. Boy A fell over and looked really upset.", recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), recordedBy: "Teacher A" },
          { witnessName: "Unknown pupil", statement: "Another pupil (unnamed) reported seeing name-calling in the corridor between lessons.", recordedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), recordedBy: "Teacher A" },
        ],
        parentSummary: "We are aware of some difficulties your child has been having with another pupil. The school is taking this seriously and has started a formal process to make sure things improve. We will keep you updated.",
        parentVisible: true,
        addedToFile: true,
      }).where(eq(incidentsTable.id, inc.id));
    }
  }
  console.log("\n  Updated assessed incidents with staff notes and parent summaries");

  console.log("\n✅ Full seed complete!");
  console.log("\nData created:");
  console.log("  • 2 protocols (Convivèxit + LOPIVI)");
  console.log("  • 3 pattern alerts (1 red, 2 amber)");
  console.log("  • 4 interviews");
  console.log("  • 7 case tasks");
  console.log(`  • ${notifValues.length} notifications`);
  console.log("  • 10 messages (4 conversations)");
  console.log("  • 5 audit log entries");
  console.log("  • Assessed incidents with parent-visible summaries");

  process.exit(0);
}

seedFull().catch((err) => {
  console.error("Full seed failed:", err);
  process.exit(1);
});

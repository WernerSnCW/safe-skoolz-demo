import { db, schoolsTable, usersTable, annexTemplatesTable, referralBodiesTable, delegatedRolesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seedCompliance() {
  console.log("Seeding compliance reference data...");

  const schools = await db.select().from(schoolsTable);
  if (schools.length === 0) {
    console.error("No schools found. Run the main seed first.");
    process.exit(1);
  }
  const school = schools[0];

  const existingTemplates = await db.select().from(annexTemplatesTable);
  if (existingTemplates.length > 0) {
    console.log("Compliance data already seeded. Skipping.");
    process.exit(0);
  }

  await db.insert(annexTemplatesTable).values([
    { framework: "convivexit", annexCode: "ANNEX-I", title: "Comunicació inicial de situació d'assetjament", description: "Initial communication form for bullying situation report to the school management team" },
    { framework: "convivexit", annexCode: "ANNEX-II", title: "Full de recollida d'informació", description: "Information gathering form — interviews with victim, alleged perpetrator, and witnesses" },
    { framework: "convivexit", annexCode: "ANNEX-III", title: "Informe de conclusions", description: "Conclusions report summarizing investigation findings and proposed measures" },
    { framework: "convivexit", annexCode: "ANNEX-IV", title: "Pla d'intervenció", description: "Intervention plan with protective measures, corrective actions, and follow-up schedule" },
    { framework: "convivexit", annexCode: "ANNEX-V", title: "Seguiment del pla d'intervenció", description: "Follow-up monitoring form for the intervention plan effectiveness" },
    { framework: "convivexit", annexCode: "ANNEX-VI", title: "Comunicació a la família", description: "Family communication template for notifying parents/guardians of the situation" },
    { framework: "convivexit", annexCode: "ANNEX-VII", title: "Informe final de tancament", description: "Final closure report documenting resolution and lessons learned" },
    { framework: "machista_violence", annexCode: "MV-I", title: "Detecció i comunicació inicial", description: "Initial detection and communication form for gender-based violence cases per CAIB protocol" },
    { framework: "machista_violence", annexCode: "MV-II", title: "Valoració de risc i factors protectors", description: "Risk assessment and protective factors evaluation form" },
    { framework: "machista_violence", annexCode: "MV-III", title: "Derivació a serveis externs", description: "External referral form for specialist services (IB Dona, municipal services)" },
    { framework: "machista_violence", annexCode: "MV-IV", title: "Informe de seguiment", description: "Follow-up monitoring report for gender-based violence cases" },
    { framework: "lopivi", annexCode: "LOP-I", title: "Comunicació de situació de risc", description: "Risk situation communication form per LOPIVI Art. 15-16 duty to report" },
    { framework: "lopivi", annexCode: "LOP-II", title: "Designació de delegat de protecció", description: "Protection delegate designation and appointment record" },
    { framework: "lopivi", annexCode: "LOP-III", title: "Registre d'actuacions", description: "Action registry documenting all safeguarding interventions and their outcomes" },
    { framework: "lopivi", annexCode: "LOP-IV", title: "Avaluació d'entorn segur", description: "Safe environment assessment form aligned with LOPIVI secure environments framework" },
  ]);
  console.log("  Created 15 annex templates (Convivèxit, Machista Violence, LOPIVI)");

  await db.insert(referralBodiesTable).values([
    { name: "IB Dona — Institut Balear de la Dona", bodyType: "ib_dona", island: "Mallorca", municipality: "Palma", contactPhone: "900 848 900", contactEmail: "ibdona@caib.es", address: "C/ Jeroni Antich 5, Palma", notes: "24h helpline for gender-based violence" },
    { name: "Serveis Socials Municipals — Ajuntament de Palma", bodyType: "municipal_services", island: "Mallorca", municipality: "Palma", contactPhone: "971 225 900", contactEmail: "serveissocials@palma.cat" },
    { name: "Fiscalía de Menores de Palma", bodyType: "fiscalia_menores", island: "Mallorca", municipality: "Palma", contactPhone: "971 219 000", notes: "Juvenile prosecution office for child protection cases" },
    { name: "Policia Nacional — UFAM Palma", bodyType: "policia_nacional", island: "Mallorca", municipality: "Palma", contactPhone: "091", notes: "Unidad de Familia y Mujer — specialist child & family unit" },
    { name: "Guardia Civil — EMUME Balearic Islands", bodyType: "guardia_civil", island: "Mallorca", contactPhone: "062", notes: "Equipo de Mujer y Menor — specialist women & children team" },
    { name: "Salud Mental Infanto-Juvenil — IBSALUT", bodyType: "salud_mental", island: "Mallorca", municipality: "Palma", contactPhone: "971 212 000", notes: "Child and adolescent mental health services (CSMIJ)" },
    { name: "Conselleria d'Educació — Servei de Convivència", bodyType: "caib_education", island: "Mallorca", municipality: "Palma", contactPhone: "971 176 500", contactEmail: "convivencia@educaib.es", notes: "CAIB education department coexistence service for school guidance" },
    { name: "IB Dona — Menorca", bodyType: "ib_dona", island: "Menorca", municipality: "Maó", contactPhone: "900 848 900" },
    { name: "IB Dona — Eivissa", bodyType: "ib_dona", island: "Eivissa", municipality: "Eivissa", contactPhone: "900 848 900" },
    { name: "Serveis Socials — Calvià", bodyType: "municipal_services", island: "Mallorca", municipality: "Calvià", contactPhone: "971 139 100" },
  ]);
  console.log("  Created 10 referral bodies (Balearic Islands services)");

  const coordinator = await db.select().from(usersTable).where(eq(usersTable.email, "coordinator@safeschool.dev"));
  const headTeacher = await db.select().from(usersTable).where(eq(usersTable.email, "head@safeschool.dev"));
  const senco = await db.select().from(usersTable).where(eq(usersTable.email, "senco@safeschool.dev"));

  if (coordinator[0] && headTeacher[0] && senco[0]) {
    await db.insert(delegatedRolesTable).values([
      {
        schoolId: school.id,
        userId: coordinator[0].id,
        roleType: "lopivi_delegate",
        mandateScope: "Full safeguarding coordination including LOPIVI compliance, incident management, and external referrals",
        trainingDate: new Date("2025-09-15"),
        trainingNotes: "Completed CAIB Delegat de Protecció certification course (40h)",
        appointedAt: new Date("2025-09-01"),
        expiresAt: new Date("2027-08-31"),
      },
      {
        schoolId: school.id,
        userId: coordinator[0].id,
        roleType: "convivexit_coordinator",
        mandateScope: "Lead school coexistence and anti-bullying protocol implementation per Convivèxit 2024",
        trainingDate: new Date("2025-10-01"),
        trainingNotes: "Convivèxit protocol training — Conselleria d'Educació workshop",
        appointedAt: new Date("2025-09-01"),
        expiresAt: new Date("2027-08-31"),
      },
      {
        schoolId: school.id,
        userId: headTeacher[0].id,
        roleType: "machista_protocol_lead",
        mandateScope: "Oversight of machista violence protocol activation and external referral coordination",
        trainingDate: new Date("2025-11-10"),
        trainingNotes: "IB Dona training on educational centre protocol for machista violence",
        appointedAt: new Date("2025-09-01"),
        expiresAt: new Date("2027-08-31"),
      },
      {
        schoolId: school.id,
        userId: senco[0].id,
        roleType: "senco_lead",
        mandateScope: "Special educational needs coordination and safeguarding support for vulnerable students",
        appointedAt: new Date("2025-09-01"),
        expiresAt: new Date("2027-08-31"),
      },
    ]);
    console.log("  Created 4 delegated role appointments");
  }

  console.log("\nCompliance seed complete!");
  process.exit(0);
}

seedCompliance().catch((err) => {
  console.error("Compliance seed failed:", err);
  process.exit(1);
});

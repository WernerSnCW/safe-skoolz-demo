const TIER_3_CATEGORIES = ["sexual", "coercive"];
const TIER_2_CATEGORIES = ["physical", "psychological", "online"];

const MANDATORY_REFERRAL_CATEGORIES = ["sexual", "coercive"];

function parseCategories(category: string): string[] {
  return category.split(",").map(c => c.trim().toLowerCase()).filter(Boolean);
}

export function determineEscalationTier(category: string): number {
  const cats = parseCategories(category);
  if (cats.some(c => TIER_3_CATEGORIES.includes(c))) return 3;
  if (cats.some(c => TIER_2_CATEGORIES.includes(c))) return 2;
  return 1;
}

export function isSafeguardingTrigger(category: string): boolean {
  const cats = parseCategories(category);
  return cats.some(c => TIER_3_CATEGORIES.includes(c));
}

export interface MandatoryReferralResult {
  required: boolean;
  reasons: string[];
  suggestedBody: string | null;
}

export function checkMandatoryReferral(opts: {
  category: string;
  escalationTier: number;
  isRepeatRedAlert?: boolean;
}): MandatoryReferralResult {
  const reasons: string[] = [];
  const cats = parseCategories(opts.category);

  if (opts.escalationTier >= 3) {
    reasons.push("Tier 3 escalation requires mandatory external referral");
  }

  if (cats.some(c => MANDATORY_REFERRAL_CATEGORIES.includes(c))) {
    reasons.push(`Category "${cats.filter(c => MANDATORY_REFERRAL_CATEGORIES.includes(c)).join(", ")}" triggers mandatory referral`);
  }

  if (opts.isRepeatRedAlert) {
    reasons.push("Repeat red-level pattern alert triggers mandatory referral");
  }

  const required = reasons.length > 0;

  let suggestedBody: string | null = null;
  if (required) {
    if (cats.includes("sexual")) {
      suggestedBody = "Child Protection Services / Policía Nacional";
    } else if (cats.includes("coercive")) {
      suggestedBody = "Child Protection Services / Social Services";
    } else {
      suggestedBody = "Local Child Protection Authority";
    }
  }

  return { required, reasons, suggestedBody };
}

export interface ProtocolGuidance {
  tier: number;
  severity: "critical" | "serious" | "standard";
  protocol: string;
  protocolFullName: string;
  headline: string;
  immediateSteps: { step: number; action: string; detail: string }[];
  doNots: string[];
  whoToNotify: string[];
  timeframe: string;
  legalBasis: string;
  externalReferral: { required: boolean; body: string | null };
}

export function buildProtocolGuidance(
  categories: string[],
  escalationTier: number,
  safeguardingTrigger: boolean
): ProtocolGuidance | null {
  if (escalationTier <= 1 && !safeguardingTrigger) return null;

  const hasSexual = categories.includes("sexual");
  const hasCoercive = categories.includes("coercive");
  const hasPhysical = categories.includes("physical");
  const hasPsych = categories.includes("psychological");
  const hasOnline = categories.includes("online");

  if (hasSexual) {
    return {
      tier: 3,
      severity: "critical",
      protocol: "LOPIVI",
      protocolFullName: "Ley Orgánica de Protección Integral a la Infancia y la Adolescencia (LOPIVI)",
      headline: "This is a Tier 3 safeguarding incident. LOPIVI protocol must be followed immediately.",
      immediateSteps: [
        { step: 1, action: "Secure the child", detail: "Ensure the child is in a safe space with a trusted adult. Do not leave them alone." },
        { step: 2, action: "Do not investigate", detail: "Your role is to report, not to investigate. Do not question the child or ask for details beyond what they have voluntarily disclosed." },
        { step: 3, action: "Record exactly what was said", detail: "Write down the child's exact words as soon as possible. Do not interpret, summarise, or add your own observations at this stage." },
        { step: 4, action: "Notify the Safeguarding Coordinator immediately", detail: "The coordinator has been automatically notified via safeskoolz. Confirm verbally or in person within 15 minutes." },
        { step: 5, action: "Preserve any evidence", detail: "If there is physical evidence (messages, images, marks), do not attempt to collect it yourself. Note its existence for the coordinator." },
        { step: 6, action: "Mandatory external referral", detail: "The coordinator must refer to Fiscalía de Menores and/or Policía Nacional within 24 hours. This is a legal obligation under LOPIVI." },
      ],
      doNots: [
        "Do not promise the child that you will keep it secret",
        "Do not question the child further or ask leading questions",
        "Do not contact the alleged perpetrator or their family",
        "Do not discuss the disclosure with other staff who do not need to know",
        "Do not attempt to examine the child physically",
        "Do not delay reporting to the coordinator",
      ],
      whoToNotify: [
        "Safeguarding Coordinator (auto-notified)",
        "Head Teacher (auto-notified)",
        "Fiscalía de Menores (coordinator will refer)",
        "Policía Nacional if immediate danger (coordinator will refer)",
      ],
      timeframe: "Coordinator must be informed within 15 minutes. External referral within 24 hours.",
      legalBasis: "LOPIVI Art. 15 — Duty to report. Failure to report is a criminal offence under Spanish law.",
      externalReferral: { required: true, body: "Fiscalía de Menores / Policía Nacional" },
    };
  }

  if (hasCoercive) {
    return {
      tier: 3,
      severity: "critical",
      protocol: "LOPIVI",
      protocolFullName: "Ley Orgánica de Protección Integral a la Infancia y la Adolescencia (LOPIVI)",
      headline: "This is a Tier 3 coercive control incident. LOPIVI protocol applies.",
      immediateSteps: [
        { step: 1, action: "Separate the children involved", detail: "Ensure the victim is in a different space from the alleged perpetrator. Assign a trusted adult." },
        { step: 2, action: "Record the disclosure", detail: "Write down what was reported using the child's own words. Include dates, times, and any witnesses." },
        { step: 3, action: "Notify the Safeguarding Coordinator", detail: "The coordinator has been auto-notified. Confirm in person within 15 minutes." },
        { step: 4, action: "Assess immediate risk", detail: "Is the child safe to go home? Could the perpetrator access the child outside school? Raise these questions with the coordinator." },
        { step: 5, action: "External referral if needed", detail: "The coordinator will assess whether referral to Social Services is required under LOPIVI." },
      ],
      doNots: [
        "Do not confront the alleged perpetrator",
        "Do not inform the perpetrator's parents before the coordinator decides",
        "Do not minimise or dismiss the child's account",
        "Do not discuss the case with colleagues who are not involved",
      ],
      whoToNotify: [
        "Safeguarding Coordinator (auto-notified)",
        "Head Teacher (auto-notified)",
        "Social Services (coordinator will assess)",
      ],
      timeframe: "Coordinator within 15 minutes. Risk assessment within same school day.",
      legalBasis: "LOPIVI Art. 15 — Duty to report serious harm or risk to a minor.",
      externalReferral: { required: true, body: "Child Protection Services / Social Services" },
    };
  }

  if (hasPhysical) {
    return {
      tier: 2,
      severity: "serious",
      protocol: "Convivèxit",
      protocolFullName: "Convivèxit — School Coexistence and Anti-Bullying Protocol (Balearic Islands)",
      headline: "This is a Tier 2 physical incident. Follow the Convivèxit process.",
      immediateSteps: [
        { step: 1, action: "Separate the children", detail: "Ensure the children involved are in different spaces. Check for any injuries and administer first aid if needed." },
        { step: 2, action: "Check for injuries", detail: "If there are visible injuries, photograph them (with consent) and notify the school nurse or first aider." },
        { step: 3, action: "Speak to witnesses", detail: "Briefly ask any witnesses what they saw. Record their accounts separately." },
        { step: 4, action: "Record the incident fully", detail: "Complete the incident log with all details: who, what, when, where, and the child's emotional state." },
        { step: 5, action: "Notify the coordinator", detail: "The coordinator has been notified automatically. They will assess whether this is part of a pattern." },
        { step: 6, action: "Inform parents", detail: "The coordinator will decide when and how to inform the parents of all children involved." },
      ],
      doNots: [
        "Do not force the children to apologise to each other immediately",
        "Do not use physical restraint unless there is immediate danger",
        "Do not discuss the incident in front of other pupils",
        "Do not label the child as a 'bully' \u2014 address the behaviour, not the identity",
      ],
      whoToNotify: [
        "Safeguarding Coordinator (auto-notified for Tier 2+)",
        "Head of Year (if applicable)",
        "Parents of children involved (coordinator will decide timing)",
      ],
      timeframe: "Coordinator informed same day. Parents informed within 24 hours if serious.",
      legalBasis: "Decree 121/2010 (Balearic Islands) \u2014 School coexistence and conflict resolution.",
      externalReferral: { required: false, body: null },
    };
  }

  if (hasPsych) {
    return {
      tier: 2,
      severity: "serious",
      protocol: "Convivèxit",
      protocolFullName: "Convivèxit — School Coexistence and Anti-Bullying Protocol (Balearic Islands)",
      headline: "This is a Tier 2 psychological harm incident. Follow the Convivèxit process.",
      immediateSteps: [
        { step: 1, action: "Support the child", detail: "Take the child to a quiet, safe space. Let them know they have been heard and are not in trouble." },
        { step: 2, action: "Record what was observed or reported", detail: "Note the specific behaviours: threats, manipulation, exclusion, intimidation. Use the child's own words where possible." },
        { step: 3, action: "Check for a pattern", detail: "Has this happened before? safeskoolz will flag patterns automatically, but note any previous incidents you are aware of." },
        { step: 4, action: "Notify the coordinator", detail: "The coordinator has been auto-notified. They will review the pattern data and decide next steps." },
        { step: 5, action: "Monitor the child", detail: "Keep a closer watch on the child over the next few days. Note any changes in behaviour, mood, or attendance." },
      ],
      doNots: [
        "Do not dismiss psychological harm as 'just falling out'",
        "Do not tell the child to 'toughen up' or 'ignore it'",
        "Do not confront the alleged perpetrator without coordinator guidance",
        "Do not share details with other pupils or parents informally",
      ],
      whoToNotify: [
        "Safeguarding Coordinator (auto-notified)",
        "SENCO if the child has additional needs",
        "Form tutor / class teacher (for monitoring)",
      ],
      timeframe: "Coordinator informed same day. Monitoring plan within 48 hours.",
      legalBasis: "Decree 121/2010 (Balearic Islands) \u2014 School coexistence protocol.",
      externalReferral: { required: false, body: null },
    };
  }

  if (hasOnline) {
    return {
      tier: 2,
      severity: "serious",
      protocol: "Convivèxit + LOPIVI Digital",
      protocolFullName: "Convivèxit Protocol with LOPIVI Digital Safeguarding provisions",
      headline: "This is a Tier 2 online/cyber incident. Digital evidence must be preserved.",
      immediateSteps: [
        { step: 1, action: "Preserve the evidence", detail: "Screenshot or photograph any messages, posts, or images before they are deleted. Do not ask the child to delete anything." },
        { step: 2, action: "Support the child", detail: "Reassure the child that it is not their fault and they were right to tell someone." },
        { step: 3, action: "Record the platforms involved", detail: "Note which app, game, or website was used. Include usernames or group names if known." },
        { step: 4, action: "Notify the coordinator", detail: "The coordinator has been auto-notified. They will assess whether the content involves criminal offences (indecent images, threats)." },
        { step: 5, action: "Do not confiscate devices", detail: "You cannot confiscate a personal device without parental consent. If the device belongs to the school, secure it and pass to the coordinator." },
      ],
      doNots: [
        "Do not view or forward indecent images of minors \u2014 this is a criminal offence",
        "Do not ask the child to show you explicit content",
        "Do not contact the other party online",
        "Do not delete any evidence",
      ],
      whoToNotify: [
        "Safeguarding Coordinator (auto-notified)",
        "Head Teacher (auto-notified for Tier 2+)",
        "Police if indecent images of minors are involved (coordinator will refer)",
      ],
      timeframe: "Coordinator informed immediately. Evidence secured within 1 hour.",
      legalBasis: "LOPIVI Art. 46 \u2014 Digital protection of minors. LO 1/1982 on image rights.",
      externalReferral: { required: false, body: null },
    };
  }

  return null;
}

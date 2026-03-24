import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowRight, ArrowLeft, BookOpen, Users, Bell,
  Heart, Eye, AlertTriangle, TrendingDown, BarChart3, Megaphone,
  MessageSquare, Shield, ChevronDown, ChevronUp, Sparkles,
  UserCircle, GraduationCap, ClipboardCheck, BookHeart,
  FileText, Activity, Gauge, Send, Search, Zap, CheckCircle2,
  ArrowDown
} from "lucide-react";

interface StoryStep {
  id: string;
  week: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: any;
  narrative: string;
  screens: {
    role: string;
    roleIcon: any;
    roleColor: string;
    page: string;
    pageIcon: any;
    title: string;
    description: string;
    mockupElements: { type: "mood" | "form" | "alert" | "chart" | "notification" | "badge" | "action" | "timeline"; content: string; color?: string }[];
  }[];
}

const STEPS: StoryStep[] = [
  {
    id: "first-signs",
    week: "Week 1",
    title: "Something small happens",
    subtitle: "A single comment at lunch. Nobody thinks much of it.",
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/20",
    borderColor: "border-teal-200 dark:border-teal-800",
    icon: BookHeart,
    narrative: "Marcus calls Sofia stupid at lunch. A lunchtime supervisor sees it and logs it as a verbal incident. On its own, it looks minor. Sofia goes home and writes in her diary.",
    screens: [
      {
        role: "Lunchtime supervisor",
        roleIcon: GraduationCap,
        roleColor: "text-indigo-600",
        page: "Report Incident",
        pageIcon: FileText,
        title: "A single verbal incident is logged",
        description: "The supervisor logs what she saw. It takes 60 seconds. At this stage, it looks like a one-off comment between children.",
        mockupElements: [
          { type: "form", content: "Category: Verbal" },
          { type: "form", content: "Who was involved: Marcus \u2192 Sofia" },
          { type: "form", content: "\"Called her stupid at the lunch table. Sofia looked upset but carried on eating.\"" },
          { type: "badge", content: "Incident CS1-001 logged. Tier 1 \u2014 no escalation required.", color: "teal" },
        ],
      },
      {
        role: "Sofia (pupil)",
        roleIcon: Heart,
        roleColor: "text-teal-600",
        page: "Feelings Diary",
        pageIcon: BookHeart,
        title: "Sofia writes in her private diary",
        description: "Nobody else can see her diary. No teacher, parent, or coordinator has access. But the system quietly tracks her mood over time.",
        mockupElements: [
          { type: "mood", content: "\ud83d\ude10 Okay \u2014 3/5", color: "amber" },
          { type: "form", content: "\"Marcus said something mean at lunch. I didn't like it but it's probably nothing.\"" },
          { type: "badge", content: "Entry saved. This is private \u2014 only you can see it.", color: "teal" },
        ],
      },
      {
        role: "System",
        roleIcon: Zap,
        roleColor: "text-blue-600",
        page: "Pattern Engine",
        pageIcon: Activity,
        title: "The system records \u2014 but doesn't alert",
        description: "One incident, one diary entry. No pattern yet. The data is stored and waiting.",
        mockupElements: [
          { type: "chart", content: "Sofia: 1 incident as victim \u2022 Marcus: 1 incident as instigator" },
          { type: "badge", content: "No alerts triggered. Monitoring.", color: "teal" },
        ],
      },
    ],
  },
  {
    id: "escalates",
    week: "Weeks 2\u20133",
    title: "It happens again. And again.",
    subtitle: "Three more incidents from two different teachers. Marcus is recruiting.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    icon: FileText,
    narrative: "Week 2: Ms Rivera sees Marcus push Sofia in the corridor. She logs it. Week 3: Mr Davies sees Tyler exclude Sofia from group work \u2014 and notices Marcus watching from across the room. A different pupil anonymously reports that Jayden filmed Sofia being tripped.",
    screens: [
      {
        role: "Ms Rivera (teacher)",
        roleIcon: GraduationCap,
        roleColor: "text-indigo-600",
        page: "Report Incident",
        pageIcon: FileText,
        title: "Second incident \u2014 different teacher, physical this time",
        description: "Ms Rivera logs a physical incident. She doesn't know about the verbal incident from Week 1 \u2014 a different staff member logged that one.",
        mockupElements: [
          { type: "form", content: "Category: Physical" },
          { type: "form", content: "Who was involved: Marcus pushed Sofia in the corridor" },
          { type: "form", content: "Victim emotional state: Upset, crying" },
          { type: "badge", content: "Incident CS1-002 logged. Tier 2 \u2014 coordinator auto-notified.", color: "indigo" },
          { type: "alert", content: "Protocol guidance shown: \"This is a Tier 2 physical incident. Follow the Convivèxit process. Check for injuries. Separate the children.\"", color: "amber" },
        ],
      },
      {
        role: "Mr Davies (teacher)",
        roleIcon: GraduationCap,
        roleColor: "text-indigo-600",
        page: "Report Incident",
        pageIcon: FileText,
        title: "Third incident \u2014 a third teacher sees exclusion",
        description: "Mr Davies sees Tyler excluding Sofia from group work, with Marcus watching approvingly. He doesn't know Marcus pushed her last week. He logs it as relational.",
        mockupElements: [
          { type: "form", content: "Category: Relational" },
          { type: "form", content: "Who was involved: Tyler excluded Sofia from group work. Marcus was observing." },
          { type: "badge", content: "Incident CS1-003 logged.", color: "indigo" },
        ],
      },
      {
        role: "Anonymous pupil",
        roleIcon: Heart,
        roleColor: "text-teal-600",
        page: "Report a Concern",
        pageIcon: FileText,
        title: "Fourth report \u2014 anonymous, from a pupil",
        description: "A classmate reports anonymously that Jayden has been filming Sofia being bullied and sharing it in a group chat.",
        mockupElements: [
          { type: "form", content: "\"Jayden filmed Sofia getting tripped and put it in the group chat. Everyone saw it.\"" },
          { type: "badge", content: "Anonymous report received. Category: Online. Tier 2.", color: "indigo" },
        ],
      },
      {
        role: "Sofia's mum (parent)",
        roleIcon: Users,
        roleColor: "text-amber-600",
        page: "At home",
        pageIcon: Users,
        title: "At home, something is clearly wrong",
        description: "Sofia doesn't want to go to school. She mentions Marcus but says \"it's nothing\". Her mum is worried but has no evidence.",
        mockupElements: [
          { type: "timeline", content: "Week 2: \"I don't want to go tomorrow\" \u2014 but won't say why" },
          { type: "timeline", content: "Week 3: Stopped talking about school completely" },
          { type: "timeline", content: "Week 3: Found Sofia crying in her room after checking her phone" },
        ],
      },
    ],
  },
  {
    id: "pattern",
    week: "Week 3",
    title: "safeskoolz connects the dots",
    subtitle: "No single teacher saw the full picture. The system did.",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: AlertTriangle,
    narrative: "Four incidents logged by three different staff members and one anonymous pupil. No individual saw more than one event. But safeskoolz links them all: same victim, escalating severity, group forming around a ringleader, and a mood that's falling off a cliff.",
    screens: [
      {
        role: "System",
        roleIcon: Zap,
        roleColor: "text-red-600",
        page: "Pattern Alerts",
        pageIcon: Activity,
        title: "Three pattern alerts fire simultaneously",
        description: "The pattern detection engine links incidents across different reporters. No human could have connected these \u2014 they were logged by different staff on different days.",
        mockupElements: [
          { type: "alert", content: "\ud83d\udea8 RED: Same victim in 4 incidents \u2014 Sofia has been targeted in 4 separate incidents over 3 weeks, logged by 3 different staff", color: "red" },
          { type: "alert", content: "\ud83d\udea8 RED: Group targeting detected \u2014 Marcus (ringleader), Tyler (recruited Week 3), Jayden (recruited Week 3) acting together", color: "red" },
          { type: "alert", content: "\ud83d\udea8 AMBER: Escalating severity \u2014 Pattern has escalated from verbal (Week 1) \u2192 physical (Week 2) \u2192 relational + online (Week 3)", color: "amber" },
        ],
      },
      {
        role: "System",
        roleIcon: TrendingDown,
        roleColor: "text-blue-600",
        page: "Mood Analysis",
        pageIcon: BookHeart,
        title: "Diary mood decline detected",
        description: "Nobody has read Sofia's diary. But the system tracks the trend. Her mood has dropped from 3 to 1 in two weeks \u2014 a sustained decline that triggers a welfare flag.",
        mockupElements: [
          { type: "chart", content: "Week 1: \ud83d\ude10 3/5 \u2022 Week 2: \ud83d\ude1f 2/5 \u2022 Week 3: \ud83d\ude22 1/5" },
          { type: "alert", content: "\ud83d\udea8 AMBER: Sustained mood decline \u2014 average mood \u22642 over 5+ entries. SENCO + coordinator alerted.", color: "amber" },
        ],
      },
    ],
  },
  {
    id: "coordinator",
    week: "Week 4",
    title: "Mrs Chen sees the full picture",
    subtitle: "Four incidents. Three reporters. One clear pattern. One screen.",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: Shield,
    narrative: "Mrs Chen opens her coordinator dashboard. She doesn't see four unrelated incidents. She sees a ringleader who recruited two others, an escalating pattern from words to physical to online, and a child whose mood is collapsing. She initiates the Convivèxit protocol.",
    screens: [
      {
        role: "Mrs Chen (coordinator)",
        roleIcon: Shield,
        roleColor: "text-purple-600",
        page: "Coordinator Dashboard",
        pageIcon: BarChart3,
        title: "Everything connected on one screen",
        description: "Incidents, pattern alerts, diary mood trends, and behaviour points \u2014 linked together. Mrs Chen can see the full timeline of how Marcus recruited Tyler and Jayden.",
        mockupElements: [
          { type: "badge", content: "4 active alerts \u2022 4 linked incidents \u2022 1 mood decline flag \u2022 1 anonymous report", color: "purple" },
          { type: "chart", content: "Sofia: 4 incidents (verbal \u2192 physical \u2192 relational \u2192 online) \u2022 Severity: escalating" },
          { type: "timeline", content: "Week 1: Marcus alone \u2192 Week 2: Marcus alone (physical) \u2192 Week 3: Marcus + Tyler + Jayden (group)" },
        ],
      },
      {
        role: "Mrs Chen (coordinator)",
        roleIcon: Shield,
        roleColor: "text-purple-600",
        page: "Behaviour Tracker",
        pageIcon: Gauge,
        title: "Behaviour points tell the story",
        description: "Marcus has accumulated the most points as the instigator across all four incidents. Tyler and Jayden have fewer \u2014 they were recruited, not ringleaders. This distinction matters for the intervention.",
        mockupElements: [
          { type: "badge", content: "Marcus: 14 pts \u2014 Level 4 (Formal Warning + parent meeting)", color: "red" },
          { type: "badge", content: "Tyler: 5 pts \u2014 Level 2 (Verbal Warning)", color: "amber" },
          { type: "badge", content: "Jayden: 4 pts \u2014 Level 2 (Verbal Warning)", color: "amber" },
          { type: "badge", content: "Convivèxit protocol initiated \u2014 interviews scheduled", color: "purple" },
        ],
      },
    ],
  },
  {
    id: "intervene",
    week: "Weeks 4\u20135",
    title: "The school intervenes \u2014 differently for each child",
    subtitle: "Sofia gets a safe adult. Marcus's parents are called in. Tyler and Jayden get support.",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle2,
    narrative: "The Convivèxit protocol drives different actions for each child. Sofia gets a named safe adult. Marcus's parents are called for a formal meeting. Tyler and Jayden receive restorative conversations \u2014 the data shows they were coerced, not leading. Sofia's mum receives a private notification that the school has acted.",
    screens: [
      {
        role: "Sofia (pupil)",
        roleIcon: Heart,
        roleColor: "text-teal-600",
        page: "Messages",
        pageIcon: MessageSquare,
        title: "Sofia gets a named safe adult",
        description: "Ms Rivera is assigned as Sofia's safe adult. Sofia can message her privately through the platform, any time she needs to talk.",
        mockupElements: [
          { type: "notification", content: "You have a new safe contact: Ms Rivera. You can message her any time.", color: "teal" },
          { type: "form", content: "Message: \"Hi Ms Rivera, can I talk to you at break?\"" },
          { type: "badge", content: "Message delivered securely", color: "teal" },
        ],
      },
      {
        role: "Sofia's mum (parent)",
        roleIcon: Users,
        roleColor: "text-amber-600",
        page: "Notifications",
        pageIcon: Bell,
        title: "Sofia's mum is notified privately",
        description: "This is a targeted notification to Sofia's parents only \u2014 not a broadcast to all 47 families. It confirms the school has identified the problem and is acting.",
        mockupElements: [
          { type: "notification", content: "We are writing to let you know that a pattern of targeted behaviour towards Sofia has been identified and addressed. A Convivèxit protocol has been initiated. Sofia has been assigned a named safe adult (Ms Rivera). We would welcome the opportunity to discuss this with you.", color: "blue" },
          { type: "action", content: "Acknowledge \u00b7 Request meeting", color: "teal" },
        ],
      },
      {
        role: "Mrs Chen (coordinator)",
        roleIcon: Shield,
        roleColor: "text-purple-600",
        page: "Protocol Tracker",
        pageIcon: ClipboardCheck,
        title: "Each child gets a proportionate response",
        description: "The Convivèxit protocol requires different actions for ringleaders vs recruited participants. safeskoolz tracks each task and deadline.",
        mockupElements: [
          { type: "badge", content: "Marcus: Formal parent meeting \u2022 Behaviour contract \u2022 Daily check-in with Head of Year", color: "red" },
          { type: "badge", content: "Tyler: Restorative conversation with Sofia (with consent) \u2022 Mentoring sessions", color: "amber" },
          { type: "badge", content: "Jayden: Restorative conversation \u2022 Online safety session \u2022 Phone use reviewed", color: "amber" },
          { type: "badge", content: "Sofia: Safe adult assigned \u2022 Daily wellbeing check-in \u2022 Break/lunch buddy system", color: "teal" },
        ],
      },
    ],
  },
  {
    id: "diagnostics",
    week: "Week 6",
    title: "The school checks the bigger picture",
    subtitle: "Was Sofia's case isolated? Or is there a wider culture problem?",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    icon: ClipboardCheck,
    narrative: "Sofia's case raised a question: do children in this school actually trust the reporting system? Mrs Chen launches an anonymous diagnostic survey across all pupils, staff, and parents to find out.",
    screens: [
      {
        role: "All users",
        roleIcon: Users,
        roleColor: "text-amber-600",
        page: "Diagnostic Survey",
        pageIcon: ClipboardCheck,
        title: "Anonymous climate survey",
        description: "20 role-adaptive questions across 5 categories. Pupils, staff, and parents each get questions written for them.",
        mockupElements: [
          { type: "form", content: "\"If I report something, adults will take it seriously\" \u2014 Strongly Disagree \u2022 Disagree \u2022 Neutral \u2022 Agree \u2022 Strongly Agree" },
          { type: "form", content: "\"I know who to talk to if I see something wrong\" \u2014 Strongly Disagree \u2022 ... \u2022 Strongly Agree" },
          { type: "badge", content: "142 responses: 88 pupils \u2022 32 staff \u2022 22 parents", color: "amber" },
        ],
      },
      {
        role: "Mrs Chen (coordinator)",
        roleIcon: Shield,
        roleColor: "text-purple-600",
        page: "Diagnostic Results",
        pageIcon: BarChart3,
        title: "Perception gaps revealed",
        description: "The data shows that staff and parents think reporting works well. But pupils don't agree. The gap is 1.8 points \u2014 children don't trust the system the way adults assume they do.",
        mockupElements: [
          { type: "chart", content: "Trust & Reporting: Pupils 2.1 \u2022 Parents 3.9 \u2022 Staff 4.2" },
          { type: "alert", content: "1.8pt perception gap: Pupils scored 'reporting makes things better' at 2.1. Staff scored 4.2. Children don't believe reporting helps.", color: "amber" },
          { type: "timeline", content: "This explains why Sofia didn't tell anyone for a week \u2014 and why the anonymous pupil report was the breakthrough." },
        ],
      },
    ],
  },
  {
    id: "recovery",
    week: "Week 10",
    title: "The data shows it worked",
    subtitle: "Sofia's mood recovers. Incidents stop. The school has evidence.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    icon: Sparkles,
    narrative: "Six weeks after intervention. Sofia's diary mood is back to 4. Marcus has had no new incidents since the parent meeting. Tyler and Jayden completed restorative sessions. The PTA sees anonymised evidence that the safeguarding system is working.",
    screens: [
      {
        role: "Sofia (pupil)",
        roleIcon: Heart,
        roleColor: "text-teal-600",
        page: "Feelings Diary",
        pageIcon: BookHeart,
        title: "Mood recovery visible over time",
        description: "Sofia's diary tells the story nobody else can see: from fine, to declining, to rock bottom, to gradual recovery after intervention.",
        mockupElements: [
          { type: "chart", content: "Wk 1: \ud83d\ude10 3 \u2192 Wk 2: \ud83d\ude1f 2 \u2192 Wk 3: \ud83d\ude22 1 \u2192 Wk 5: \ud83d\ude10 3 \u2192 Wk 8: \ud83d\ude42 4 \u2192 Wk 10: \ud83d\ude04 5" },
          { type: "badge", content: "Mood trend: sustained recovery over 6 weeks", color: "green" },
        ],
      },
      {
        role: "Mrs Chen (coordinator)",
        roleIcon: Shield,
        roleColor: "text-purple-600",
        page: "Incident Timeline",
        pageIcon: Activity,
        title: "Incidents have stopped",
        description: "No new incidents involving Marcus, Tyler, Jayden, or Sofia since Week 5. The Convivèxit protocol is marked as resolved.",
        mockupElements: [
          { type: "chart", content: "Marcus: 0 incidents since Week 4 \u2022 Behaviour points declining \u2022 14 \u2192 8" },
          { type: "badge", content: "Convivèxit protocol: RESOLVED \u2014 all actions completed", color: "green" },
          { type: "badge", content: "Sofia: mood recovered \u2022 safe adult check-ins continuing \u2022 no new incidents", color: "green" },
        ],
      },
      {
        role: "PTA Chair",
        roleIcon: Users,
        roleColor: "text-emerald-600",
        page: "PTA Portal",
        pageIcon: BarChart3,
        title: "PTA sees anonymised evidence",
        description: "PTA members see aggregated, anonymised data. No names. Just evidence that the school identified a pattern, intervened proportionately, and achieved recovery.",
        mockupElements: [
          { type: "chart", content: "This term: 1 group bullying pattern identified \u2022 Resolved within 5 weeks of detection" },
          { type: "chart", content: "School-wide mood trend: 3.2 \u2192 3.8 (improving since diagnostic actions)" },
          { type: "notification", content: "Annual safeguarding summary: \"Pattern of escalating group behaviour identified through linked incident reports. Convivèxit protocol initiated. Victim assigned safe adult. All parties received proportionate intervention. Full recovery evidenced through mood data and zero re-offending.\"", color: "green" },
        ],
      },
    ],
  },
];

function MockupElement({ el }: { el: { type: string; content: string; color?: string } }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    red: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-400" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
    green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-400" },
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
    teal: { bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800", text: "text-teal-700 dark:text-teal-400" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-400" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-400" },
  };
  const c = colors[el.color || "teal"] || colors.teal;

  if (el.type === "alert") {
    return (
      <div className={`px-3 py-2.5 rounded-lg border ${c.bg} ${c.border} ${c.text} text-xs font-medium`}>
        {el.content}
      </div>
    );
  }
  if (el.type === "notification") {
    return (
      <div className={`px-3 py-2.5 rounded-lg border ${c.bg} ${c.border} text-xs`}>
        <div className="flex items-center gap-1.5 mb-1">
          <Bell size={12} className={c.text} />
          <span className={`font-bold uppercase tracking-wide ${c.text}`} style={{ fontSize: "10px" }}>Notification</span>
        </div>
        <p className="text-foreground/80">{el.content}</p>
      </div>
    );
  }
  if (el.type === "badge") {
    return (
      <div className={`px-3 py-2 rounded-lg ${c.bg} border ${c.border} ${c.text} text-xs font-bold flex items-center gap-1.5`}>
        <CheckCircle2 size={12} />
        {el.content}
      </div>
    );
  }
  if (el.type === "chart") {
    return (
      <div className="px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-xs">
        <div className="flex items-center gap-1.5 mb-1">
          <BarChart3 size={12} className="text-muted-foreground" />
          <span className="font-bold text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Data</span>
        </div>
        <p className="font-mono text-foreground/70">{el.content}</p>
      </div>
    );
  }
  if (el.type === "mood") {
    return (
      <div className="px-3 py-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
        {el.content}
      </div>
    );
  }
  if (el.type === "action") {
    return (
      <div className={`px-3 py-2 rounded-lg ${c.bg} border ${c.border} ${c.text} text-xs font-bold text-center cursor-default`}>
        {el.content}
      </div>
    );
  }
  if (el.type === "timeline") {
    return (
      <div className="flex items-start gap-2 px-3 py-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mt-1 shrink-0" />
        <span>{el.content}</span>
      </div>
    );
  }
  return (
    <div className="px-3 py-2 rounded-lg bg-card border border-border text-xs text-muted-foreground">
      {el.content}
    </div>
  );
}

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeScreen, setActiveScreen] = useState(0);
  const step = STEPS[activeStep];
  const screen = step.screens[activeScreen] || step.screens[0];
  const Icon = step.icon;
  const ScreenIcon = screen.pageIcon;

  const goTo = (idx: number) => {
    setActiveStep(idx);
    setActiveScreen(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft size={14} /> Back to login
          </Link>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg">
              <ShieldCheck size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-3">How safeskoolz works</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow Sofia's story through the actual platform &mdash; see every screen, every alert, every action that protects a child.
          </p>
        </div>

        <div className="relative mb-8">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border hidden sm:block" />
          <div className="flex justify-between gap-1 sm:gap-0 overflow-x-auto pb-2 sm:pb-0">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative flex flex-col items-center gap-1 px-2 sm:px-0 shrink-0 transition-all ${
                    i === activeStep ? "scale-110" : i < activeStep ? "opacity-70" : "opacity-40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    i === activeStep
                      ? `${s.bgColor} ${s.borderColor} ${s.color}`
                      : i < activeStep
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted border-border text-muted-foreground"
                  }`}>
                    <StepIcon size={18} />
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap ${
                    i === activeStep ? s.color : "text-muted-foreground"
                  }`}>
                    {s.week}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`rounded-2xl border-2 ${step.borderColor} overflow-hidden`}>
              <div className={`${step.bgColor} px-6 py-5`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl bg-white/60 dark:bg-black/10 ${step.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground">{step.week}</p>
                    <h2 className="text-xl font-bold">{step.title}</h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{step.subtitle}</p>
              </div>

              <div className="px-6 py-4 bg-card/50 border-t border-border/50">
                <p className="text-sm italic text-foreground/70">{step.narrative}</p>
              </div>

              {step.screens.length > 1 && (
                <div className="px-6 pt-4 flex gap-2 flex-wrap">
                  {step.screens.map((scr, i) => {
                    const RIcon = scr.roleIcon;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveScreen(i)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                          i === activeScreen
                            ? `${step.bgColor} ${step.borderColor} ${step.color}`
                            : "bg-card border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <RIcon size={14} />
                        <span>{scr.role}</span>
                        <span className="opacity-50">&middot;</span>
                        <span className="opacity-70">{scr.page}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeStep}-${activeScreen}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="px-6 py-5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ScreenIcon size={16} className={screen.roleColor} />
                    <span className={`text-xs font-bold ${screen.roleColor}`}>{screen.role}</span>
                    <span className="text-xs text-muted-foreground">&middot; {screen.page}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{screen.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{screen.description}</p>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="text-[10px] text-muted-foreground ml-2 font-mono">{screen.page}</span>
                    </div>
                    {screen.mockupElements.map((el, i) => (
                      <MockupElement key={i} el={el} />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => goTo(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          <span className="text-xs text-muted-foreground">{activeStep + 1} of {STEPS.length}</span>
          <button
            onClick={() => goTo(Math.min(STEPS.length - 1, activeStep + 1))}
            disabled={activeStep === STEPS.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4 text-center">
          <div className="p-5 rounded-xl bg-card border border-border">
            <FileText size={24} className="mx-auto text-indigo-500 mb-2" />
            <p className="font-bold text-sm">7 platform features</p>
            <p className="text-xs text-muted-foreground">Diary, incidents, alerts, behaviour, diagnostics, notifications, PTA portal</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <Users size={24} className="mx-auto text-amber-500 mb-2" />
            <p className="font-bold text-sm">4 perspectives</p>
            <p className="text-xs text-muted-foreground">Pupils, parents, teachers, and coordinators each see what they need</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <Shield size={24} className="mx-auto text-purple-500 mb-2" />
            <p className="font-bold text-sm">3 compliance frameworks</p>
            <p className="text-xs text-muted-foreground">LOPIVI, Convivèxit, and Machista Violence protocols built in</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Every school has stories like Sofia's.</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              The difference is whether anyone connects the dots in time. safeskoolz makes the invisible visible.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors cursor-pointer">
                  <ShieldCheck size={18} />
                  Try the demo
                </span>
              </Link>
              <Link href="/newsletter">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors cursor-pointer">
                  <Megaphone size={18} />
                  Bring safeskoolz to your school
                </span>
              </Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            All names are fictional. Scenarios are based on real patterns seen in schools across Europe.
            <br />
            Powered by <span className="font-semibold">Cloudworkz</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

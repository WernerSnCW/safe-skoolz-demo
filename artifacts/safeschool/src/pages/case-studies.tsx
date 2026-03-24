import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Users, AlertTriangle, Shield, Eye, Heart,
  ChevronDown, ChevronUp, Lightbulb, TrendingDown,
  UserX, Swords, DollarSign, Zap, ArrowRight,
  Activity, BookHeart, Gauge, FileText, ClipboardCheck
} from "lucide-react";

type RoleKey = "pupil" | "parent" | "teacher" | "coordinator" | "senco" | "head_teacher" | "head_of_year" | "support_staff" | "pta";

interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  narrative: string[];
  whatSafeskoolzShows: { label: string; detail: string }[];
  interventions: string[];
  roleInsights: Partial<Record<RoleKey, { heading: string; points: string[] }>>;
  linkedFeatures: { label: string; href: string; icon: any }[];
  refPrefix: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "ringleader",
    title: "Child A Creates New Bullies",
    subtitle: "How a ringleader recruits through fear",
    icon: UserX,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-900/50",
    narrative: [
      "Child A has a history of low-level bullying across different classmates.",
      "Children B and C previously had no incident history at all.",
      "Over a term, A, B, and C repeatedly target Child D, who also had no prior incidents.",
      "In interviews, B and C explain they joined in because they are scared of A and \"don't want to be next\".",
    ],
    whatSafeskoolzShows: [
      { label: "Pattern alert: same victim", detail: "\"Same victim in 3+ incidents\" fires for Child D after the third incident." },
      { label: "Pattern alert: group targeting", detail: "\"Group targeting detected\" fires for the trio A, B, C against D." },
      { label: "Pattern alert: repeat perpetrator", detail: "\"Repeat perpetrator\" fires for A as a frequent instigator across different victims." },
      { label: "Timeline view", detail: "Incidents show D as victim with A always present. B and C appear only in later incidents." },
      { label: "Diary data", detail: "D's mood entries drop from 4 to 1 over three weeks \u2014 from \"played with friends\" to \"I don't want to go to school\"." },
      { label: "Behaviour points", detail: "A accumulates 12 points (bullying category). B and C have lower points reflecting coerced participation." },
    ],
    interventions: [
      "Coordinator identifies A as the origin, B and C as coerced followers, D as primary victim.",
      "Restorative work and clear sanctions for A \u2014 the behaviour pattern is persistent and deliberate.",
      "Protective work with B and C about peer pressure, fear, and how to ask for help when they feel threatened.",
      "Safety plan and regular check-ins for D, including a named safe adult.",
      "PTA report shows the school is tackling \"ringleader plus recruited bullies\" patterns, not just isolated incidents.",
    ],
    roleInsights: {
      pupil: {
        heading: "What you should know",
        points: [
          "If someone is making you do things to other people because you're scared, that's not your fault \u2014 but you should tell a trusted adult.",
          "Being scared of someone doesn't mean you have to copy them. There are people who can help.",
          "If you're being targeted like Child D, writing in your diary helps the school see what's really happening.",
        ],
      },
      parent: {
        heading: "What you might notice at home",
        points: [
          "Your child suddenly has new friends who seem to get them into trouble.",
          "Your child talks about being scared of a particular classmate or suddenly stops wanting to go to school.",
          "Another parent's child may be the victim \u2014 the school's pattern detection ensures no child falls through the cracks.",
        ],
      },
      teacher: {
        heading: "What to look for in class",
        points: [
          "Watch for children who suddenly join in bullying they previously wouldn't do \u2014 they may be acting from fear.",
          "Log every low-level incident. On its own it seems minor, but the pattern engine links them together.",
          "Note which children are always present in incidents \u2014 the repeat perpetrator alert catches ringleaders.",
        ],
      },
      coordinator: {
        heading: "What the data reveals",
        points: [
          "Pattern alerts distinguish the orchestrator from recruited followers, enabling proportionate responses.",
          "Timeline view shows escalation: A acted alone first, then recruited B and C over subsequent weeks.",
          "Diary data provides emotional evidence that traditional incident logs miss.",
        ],
      },
    },
    linkedFeatures: [
      { label: "View Incidents", href: "/incidents", icon: FileText },
      { label: "Alerts Dashboard", href: "/alerts", icon: Activity },
      { label: "Behaviour Tracker", href: "/behaviour", icon: Gauge },
    ],
    refPrefix: "CS1",
  },
  {
    id: "retaliation",
    title: "Retaliation Kills Reporting",
    subtitle: "When reporting makes things worse",
    icon: Swords,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-900/50",
    narrative: [
      "Child X reports being bullied by Y and Z. The school intervenes, but word gets out.",
      "Y and Z start calling X a \"snitch\" in corridors. The mocking becomes public.",
      "Child E begins bullying Child F for staying friends with X \u2014 the retaliation is spreading.",
      "Other children who might report stop doing so \u2014 they're scared of being targeted too. Reporting drops sharply.",
    ],
    whatSafeskoolzShows: [
      { label: "Incident chain", detail: "Initial incidents: X victim, Y+Z perpetrators. Follow-on incidents: X and F as victims, E/Y/Z as perpetrators, with \"retaliation\" noted." },
      { label: "Trend analysis", detail: "After first intervention, total incidents don't drop \u2014 but new victims appear linked to the original reporter." },
      { label: "Diary data", detail: "X's diary goes from \"Glad I told my teacher\" (mood 4) to \"I'll never report anything again\" (mood 1) in two weeks." },
      { label: "Pattern alerts", detail: "Group targeting on X. Repeat perpetrator on Y and Z. Staff notes reference \"snitch\" language." },
    ],
    interventions: [
      "Coordinator sees a retaliation cluster, not \"problem solved\" \u2014 the initial intervention clearly failed.",
      "Explicit \"anti-retaliation\" policy communication in assemblies and to all parents.",
      "Stronger sanctions for Y, Z, and E focused specifically on retaliatory behaviour as a separate serious offence.",
      "Private reassurance to pupils who have reported or might report, with a named safe adult.",
      "PTA dashboard shows a short-term spike in incidents but improved follow-up, and later recovery in survey trust scores.",
    ],
    roleInsights: {
      pupil: {
        heading: "What you should know",
        points: [
          "If someone calls you a \"snitch\" or punishes you for reporting, that is a separate act of bullying \u2014 and the school takes it very seriously.",
          "Reporting something that's wrong is brave, not weak. The school's job is to protect you after you report.",
          "If you see someone being targeted for reporting, you can tell a trusted adult privately \u2014 you don't have to say it publicly.",
        ],
      },
      parent: {
        heading: "What you might notice at home",
        points: [
          "Your child was initially relieved after reporting but now seems worse \u2014 more anxious, reluctant to go to school.",
          "They mention being called a \"snitch\" or say \"it's not worth telling anyone\".",
          "Another child in the class has stopped reporting too \u2014 fear of retaliation spreads beyond the original victim.",
        ],
      },
      teacher: {
        heading: "What to look for in class",
        points: [
          "A sudden drop in incident reports from pupils doesn't always mean things are better \u2014 it can mean they're scared to report.",
          "Watch for new victims appearing who are connected to a previous reporter.",
          "Log any use of the word \"snitch\" or \"grass\" \u2014 these are indicators of a retaliation culture forming.",
        ],
      },
      coordinator: {
        heading: "What the data reveals",
        points: [
          "Timeline links show new victims are connected to the original reporter, revealing a retaliation cluster.",
          "The drop in reporting is itself a data signal \u2014 silence is evidence of a problem, not proof it's resolved.",
          "Effective intervention requires treating retaliation as a separate, escalated category with its own sanctions.",
        ],
      },
    },
    linkedFeatures: [
      { label: "View Incidents", href: "/incidents", icon: FileText },
      { label: "Alerts Dashboard", href: "/alerts", icon: Activity },
      { label: "Diagnostic Survey", href: "/diagnostics", icon: ClipboardCheck },
    ],
    refPrefix: "CS2",
  },
  {
    id: "material",
    title: "Material Bullying",
    subtitle: "When \"just teasing\" hides socio-economic targeting",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-900/50",
    narrative: [
      "Child Q regularly mocks classmates about their clothes, phones, brands, and holidays.",
      "Individual events seem minor \u2014 \"just teasing\" \u2014 so they're not joined up mentally by staff.",
      "Several children start avoiding Q. Some feel \"poor\" or \"left out\".",
      "One child throws away their packed lunch after Q mocks it publicly.",
    ],
    whatSafeskoolzShows: [
      { label: "Repeat perpetrator", detail: "Pattern alert fires for Q as a repeat perpetrator across multiple incidents." },
      { label: "Keyword clustering", detail: "Free-text analysis shows a cluster of incidents with similar keywords: \"clothes\", \"phone\", \"cheap\", \"holiday\", \"poor\"." },
      { label: "Multiple victims", detail: "Q targets different children in each incident, but the theme is always material status." },
      { label: "Behaviour points", detail: "Q's points accumulate from initial \"disrespect\" to escalated \"bullying\" category as the pattern becomes clear." },
    ],
    interventions: [
      "School identifies a theme: bullying around material status \u2014 not isolated \"teasing\" incidents.",
      "Direct work with Q on empathy, respect, and understanding the impact of comments about what others have.",
      "Class-wide PSHE units on money, equality, respect, and not judging people by possessions.",
      "Review of any reward systems or school events that may glorify visible wealth markers.",
      "PTA annual report notes: \"We identified a pattern of material-based bullying and implemented targeted responses.\"",
    ],
    roleInsights: {
      pupil: {
        heading: "What you should know",
        points: [
          "Nobody should make you feel bad about what you have or don't have. That's not \"just teasing\" \u2014 it's bullying.",
          "If someone mocks your clothes, phone, lunch, or holiday, that's worth reporting.",
          "Everyone is different and that's OK. Your value is about who you are, not what you own.",
        ],
      },
      parent: {
        heading: "What you might notice at home",
        points: [
          "Your child suddenly wants expensive brands or is embarrassed about their belongings.",
          "They refuse to take packed lunch or wear certain clothes to school.",
          "They say things like \"everyone has a better phone than me\" or \"we never go anywhere good\".",
        ],
      },
      teacher: {
        heading: "What to look for in class",
        points: [
          "\"Just teasing\" about material things can be systematic bullying when it's repeated by the same child.",
          "Watch for children who start hiding their belongings or not eating their packed lunch.",
          "Log these incidents even if they seem minor \u2014 the pattern engine connects them into a clear picture.",
        ],
      },
      coordinator: {
        heading: "What the data reveals",
        points: [
          "Keyword analysis in incident descriptions surfaces the material/socio-economic theme that individual reports miss.",
          "Repeat perpetrator alert identifies Q even though each incident involves a different victim.",
          "Diagnostic survey data showing low \"I feel respected\" and \"People don't judge me\" scores validates the pattern.",
        ],
      },
    },
    linkedFeatures: [
      { label: "View Incidents", href: "/incidents", icon: FileText },
      { label: "Behaviour Tracker", href: "/behaviour", icon: Gauge },
      { label: "Diagnostic Survey", href: "/diagnostics", icon: ClipboardCheck },
    ],
    refPrefix: "CS3",
  },
  {
    id: "volatility",
    title: "Classroom Volatility",
    subtitle: "When two children are fine alone but explosive together",
    icon: Zap,
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-900/50",
    narrative: [
      "Child P and Child T are fine separately \u2014 well-behaved, settled, no concerns.",
      "But when seated together or in the same group, they become highly disruptive.",
      "Teachers experience \"bad days\" but don't connect it to the P+T combination.",
      "Severity escalates each time: from talking, to throwing paper, to knocking over equipment, to throwing paint.",
    ],
    whatSafeskoolzShows: [
      { label: "Co-occurrence pattern", detail: "Every disruption incident lists both P and T as co-perpetrators. No incidents list either alone." },
      { label: "Same pair escalating", detail: "Custom pattern rule detects that when P and T are together, severity rises over time." },
      { label: "Behaviour point spikes", detail: "Points for both children spike on days they share a class group or table." },
      { label: "Staff notes", detail: "\"Neither pupil is like this individually\" \u2014 the combination is the trigger, not the children themselves." },
    ],
    interventions: [
      "Simple but powerful action: separate P and T in timetabling and seating across all lessons.",
      "Monitor post-change: incidents and behaviour points for both children drop to near-zero.",
      "No punitive escalation needed \u2014 the problem was structural, not behavioural.",
      "This becomes a micro-case study of how small adjustments, guided by data, reduce disruption and free up staff time.",
    ],
    roleInsights: {
      pupil: {
        heading: "What you should know",
        points: [
          "Sometimes you and a friend bring out the silly side in each other. That doesn't make either of you \"bad\".",
          "The school uses data to find the best solution \u2014 sometimes that's just sitting somewhere else, not punishment.",
          "If you notice you behave differently around certain people, it's OK to mention it to a teacher.",
        ],
      },
      parent: {
        heading: "What you might notice at home",
        points: [
          "Your child talks about \"bad days\" at school but can't explain why some days are worse than others.",
          "They mention a particular friend they always get in trouble with.",
          "After seating changes, you might notice an immediate improvement \u2014 small structural fixes can have big effects.",
        ],
      },
      teacher: {
        heading: "What to look for in class",
        points: [
          "If you notice disruption only happens when a particular pair are together, log both names in the incident.",
          "Consistent co-occurrence data lets the system surface the pattern that a single lesson can't show.",
          "Structural solutions (seating, grouping) are often more effective than sanctions for pair-based disruption.",
        ],
      },
      coordinator: {
        heading: "What the data reveals",
        points: [
          "The \"same pair escalating\" pattern links incidents that individual teachers experience in isolation.",
          "Neither child's individual record looks concerning \u2014 the pattern only emerges in combined data.",
          "Post-intervention monitoring proves the structural change worked, creating evidence for future decisions.",
        ],
      },
    },
    linkedFeatures: [
      { label: "View Incidents", href: "/incidents", icon: FileText },
      { label: "Behaviour Tracker", href: "/behaviour", icon: Gauge },
      { label: "Alerts Dashboard", href: "/alerts", icon: Activity },
    ],
    refPrefix: "CS4",
  },
  {
    id: "slow-collapse",
    title: "Slow Collapse",
    subtitle: "When a child's spirit breaks one small moment at a time",
    icon: TrendingDown,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-900/50",
    narrative: [
      "Child M starts the year as a settled, happy pupil with no incident history.",
      "Over several weeks, small things happen: eye-rolling, excluding from games, whispers about appearance.",
      "M doesn't report \u2014 they \"just feel bad about school\". No single event is big enough to trigger alarm.",
      "At home, parents notice M is quieter, more reluctant to go to school, but can't point to a single big event.",
      "M eventually feigns illness to avoid school. The emotional collapse happened in slow motion.",
    ],
    whatSafeskoolzShows: [
      { label: "Diary mood decline", detail: "M's diary entries drop from mood 5 (\"Great day! I love school\") to mood 1 (\"I don't want to go to school any more\") over four weeks." },
      { label: "Mood decline alert", detail: "\"Sustained mood decline\" fires when average mood drops to 2 or below over 5+ entries in 14 days." },
      { label: "Low-level incidents", detail: "Two to three minor incidents logged by teachers \u2014 exclusion, eye-rolling, whispers. None reaches \"red\" alone." },
      { label: "Combined picture", detail: "The system links repeated low mood + minor incidents + low diagnostic trust scores into an \"at-risk of withdrawal\" profile." },
    ],
    interventions: [
      "SENCO and coordinator proactively invite M for a check-in: \"We've noticed school seems harder lately \u2014 can we talk?\"",
      "They identify a small group who have been quietly excluding and mocking M.",
      "A named safe adult is assigned for M to message privately.",
      "Targeted work with the peers involved on inclusion and respect.",
      "Protective arrangements: buddy at break, seating that reduces exposure to the group.",
      "Over the next month, diary mood gradually rises back to 3\u20134. No new incidents. Diagnostic scores improve.",
    ],
    roleInsights: {
      pupil: {
        heading: "What you should know",
        points: [
          "You don't need a \"big thing\" to happen for your feelings to matter. If school feels bad, your diary entries help adults understand.",
          "Writing how you feel \u2014 even just a mood score \u2014 is one of the most powerful things you can do to get help.",
          "If you notice someone sitting alone or looking sad, being kind to them might matter more than you think.",
        ],
      },
      parent: {
        heading: "What you might notice at home",
        points: [
          "Your child becomes quieter about school. They used to talk about their day \u2014 now they don't.",
          "They're more reluctant to go in, may feign illness, or say vague things like \"nobody likes me\".",
          "There's no one big event to point to \u2014 but something has clearly changed. The diary data shows what happened.",
        ],
      },
      teacher: {
        heading: "What to look for in class",
        points: [
          "Watch for the child who stops putting their hand up, starts sitting alone, or becomes \"invisible\".",
          "Log low-level exclusion and eye-rolling \u2014 each seems trivial, but combined they paint a devastating picture.",
          "Mood diary data gives you context you'd never get from incidents alone \u2014 the emotional trajectory tells the real story.",
        ],
      },
      coordinator: {
        heading: "What the data reveals",
        points: [
          "This case is invisible to traditional incident logging. No single event is severe enough to trigger alerts.",
          "The mood decline alert catches what human observation misses \u2014 a consistent downward emotional trajectory.",
          "Combined diary + incident + diagnostic data creates an early warning system for emotional withdrawal before it becomes a crisis.",
        ],
      },
    },
    linkedFeatures: [
      { label: "Pupil Diary", href: "/diary", icon: BookHeart },
      { label: "View Incidents", href: "/incidents", icon: FileText },
      { label: "Alerts Dashboard", href: "/alerts", icon: Activity },
      { label: "Diagnostic Survey", href: "/diagnostics", icon: ClipboardCheck },
    ],
    refPrefix: "CS5",
  },
];

function getRoleInsight(cs: CaseStudy, role: string) {
  const r = role as RoleKey;
  if (cs.roleInsights[r]) return cs.roleInsights[r];
  if (["senco", "head_teacher", "head_of_year"].includes(r)) return cs.roleInsights.coordinator;
  if (r === "support_staff") return cs.roleInsights.teacher;
  if (r === "pta") return cs.roleInsights.parent;
  return cs.roleInsights.coordinator || cs.roleInsights.teacher;
}

export default function CaseStudiesPage() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const role = user?.role || "teacher";

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Case Studies</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Real patterns that safeskoolz detects and the interventions they enable.
          Each case study shows what was happening, what the data surfaced, and what the school did differently.
        </p>
        {role === "pupil" && (
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium flex items-center gap-2">
              <Heart size={16} className="text-primary" />
              These stories use made-up names, but the patterns are real. If anything feels familiar, talk to a trusted adult.
            </p>
          </div>
        )}
        {role === "parent" && (
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              These case studies show how safeskoolz helps the school spot patterns early and respond before things escalate.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {CASE_STUDIES.map((cs) => {
          const isExpanded = expandedId === cs.id;
          const insight = getRoleInsight(cs, role);
          const Icon = cs.icon;

          return (
            <div key={cs.id} className={`rounded-2xl border-2 ${cs.borderColor} overflow-hidden transition-all`}>
              <button
                onClick={() => toggle(cs.id)}
                className={`w-full text-left p-6 flex items-start gap-4 ${cs.bgColor} hover:brightness-95 transition-all`}
              >
                <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${cs.color}`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold font-display">{cs.title}</h2>
                  <p className="text-muted-foreground mt-1">{cs.subtitle}</p>
                </div>
                <div className="pt-1.5 text-muted-foreground">
                  {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-8 border-t border-border/50">
                      {insight && (
                        <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                          <h3 className="font-bold text-primary flex items-center gap-2 mb-3">
                            <Lightbulb size={18} />
                            {insight.heading}
                          </h3>
                          <ul className="space-y-2">
                            {insight.points.map((p, i) => (
                              <li key={i} className="flex gap-2 text-sm">
                                <ArrowRight size={14} className="text-primary mt-1 shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                          <BookOpen size={18} className="text-muted-foreground" />
                          What was happening
                        </h3>
                        <ul className="space-y-2">
                          {cs.narrative.map((point, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                              <span className="font-bold text-muted-foreground tabular-nums shrink-0">{i + 1}.</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                          <Shield size={18} className={cs.color} />
                          What safeskoolz surfaced
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {cs.whatSafeskoolzShows.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-card border border-border shadow-sm">
                              <p className="font-semibold text-sm mb-1">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                          <Users size={18} className="text-green-600" />
                          What the school did differently
                        </h3>
                        <ul className="space-y-2">
                          {cs.interventions.map((point, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {(role !== "pupil") && (
                        <div>
                          <h3 className="font-bold text-sm text-muted-foreground mb-3">Explore in safeskoolz</h3>
                          <div className="flex flex-wrap gap-2">
                            {cs.linkedFeatures.map((f, i) => (
                              <Link key={i} href={f.href}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer">
                                  <f.icon size={16} className="text-primary" />
                                  {f.label}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <h2 className="font-bold text-lg mb-2">Why case studies matter</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-2"><Heart size={16} className="text-red-500" /> Empathy</p>
            <p>Real stories help parents and teachers feel the reality of what children experience.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-2"><Eye size={16} className="text-blue-500" /> Clarity</p>
            <p>Data shows why a system is needed \u2014 patterns that no single teacher or parent could see alone.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-2"><Shield size={16} className="text-green-500" /> Credibility</p>
            <p>This is not just logging \u2014 it changes decisions. The intervention evidence proves the system works.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

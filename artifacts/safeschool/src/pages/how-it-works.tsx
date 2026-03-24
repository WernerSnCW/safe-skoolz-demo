import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowRight, ArrowLeft, BookOpen, Users, Bell,
  Heart, Eye, AlertTriangle, TrendingDown, BarChart3, Megaphone,
  MessageSquare, Shield, ChevronDown, ChevronUp, Sparkles,
  UserCircle, GraduationCap, ClipboardCheck
} from "lucide-react";

type Perspective = "sofia" | "parent" | "teacher" | "coordinator";

const PERSPECTIVES: { key: Perspective; label: string; icon: any; color: string; bgColor: string }[] = [
  { key: "sofia", label: "Sofia (pupil)", icon: Heart, color: "text-teal-600", bgColor: "bg-teal-50 dark:bg-teal-950/20" },
  { key: "parent", label: "Sofia's mum", icon: Users, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/20" },
  { key: "teacher", label: "Ms Rivera (teacher)", icon: GraduationCap, color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/20" },
  { key: "coordinator", label: "Mrs Chen (coordinator)", icon: Shield, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/20" },
];

interface StoryBeat {
  week: string;
  title: string;
  perspectives: Record<Perspective, { text: string; platform?: string }>;
}

const STORY: StoryBeat[] = [
  {
    week: "Week 1",
    title: "It starts small",
    perspectives: {
      sofia: {
        text: "Marcus called me stupid in front of everyone at lunch. Tyler and Jayden laughed. I felt so embarrassed. I wrote in my diary: \"Bad day. I don't like lunchtimes any more.\"",
        platform: "Sofia opens her safeskoolz diary and taps the sad face. She writes a short note about what happened.",
      },
      parent: {
        text: "Sofia seemed quiet tonight. She didn't mention anything specific \u2014 just said school was \"fine\". I noticed she didn't eat much dinner.",
      },
      teacher: {
        text: "I saw some disruption at lunchtime but it was over before I got there. Nothing formal to report \u2014 just kids being kids.",
      },
      coordinator: {
        text: "Nothing on my radar yet. No incidents logged, no alerts.",
      },
    },
  },
  {
    week: "Week 2",
    title: "The pattern builds",
    perspectives: {
      sofia: {
        text: "It happened again. Marcus told Tyler to trip me in the corridor. Jayden filmed it on his phone. I told Ms Rivera.",
        platform: "Ms Rivera logs the incident in safeskoolz. Sofia's diary now shows two weeks of declining mood: from 4 to 2.",
      },
      parent: {
        text: "Sofia says she doesn't want to go to school tomorrow. She mentioned a boy called Marcus but said \"it's nothing\". I'm worried but she won't tell me more.",
      },
      teacher: {
        text: "Sofia told me about the corridor incident. I logged it in safeskoolz with Marcus as instigator, Tyler as participant, and noted the filming. I also flagged that Sofia seemed upset.",
        platform: "Ms Rivera's incident report tags Marcus, Tyler, and Jayden. The system now has two incidents involving the same group.",
      },
      coordinator: {
        text: "I see a notification: second incident involving Marcus. Not yet at alert threshold, but I'm watching.",
      },
    },
  },
  {
    week: "Week 3",
    title: "safeskoolz connects the dots",
    perspectives: {
      sofia: {
        text: "Today Marcus told me nobody likes me and I should leave the school. Tyler and Jayden blocked me from sitting at my usual table. My diary mood is 1 \u2014 the lowest.",
        platform: "Three pattern alerts fire simultaneously in safeskoolz.",
      },
      parent: {
        text: "Sofia cried before school this morning. She finally told me about Marcus and what's been happening. I feel terrible \u2014 how long has this been going on?",
      },
      teacher: {
        text: "I logged a third incident. This time safeskoolz flagged it with a pattern alert: \"Same victim in 3+ incidents\" for Sofia. I also see \"Group targeting detected\" and \"Repeat perpetrator\" for Marcus.",
        platform: "Three alerts appear on Ms Rivera's dashboard. She escalates to the coordinator.",
      },
      coordinator: {
        text: "My alerts dashboard lights up. I can see the full picture: Marcus is the ringleader, Tyler and Jayden are recruited followers, Sofia is the primary victim. Her diary shows a sustained mood decline over three weeks. This isn't three separate incidents \u2014 it's a coordinated bullying pattern.",
        platform: "Mrs Chen reviews the pattern analysis, timeline view, diary mood graph, and behaviour points. She initiates the school's response plan.",
      },
    },
  },
  {
    week: "Week 4",
    title: "The school responds",
    perspectives: {
      sofia: {
        text: "Mrs Chen came to talk to me today. She said \"We know what's been happening, and we're going to make it stop.\" She gave me a safe adult I can message any time. I feel like someone finally listened.",
        platform: "Sofia's safe contact is set up in safeskoolz messaging. She can reach her named adult privately.",
      },
      parent: {
        text: "The school called me. They explained they'd detected the pattern through their monitoring system. They have a plan: restorative work with Marcus, support for the boys who were following him, and a safety plan for Sofia. I received a notification through the app.",
        platform: "Sofia's mum receives a school alert: \"We have identified and are addressing a pattern of targeted bullying. Your child has been assigned a named safe adult and we'd like to arrange a check-in with you.\"",
      },
      teacher: {
        text: "Mrs Chen briefed us in the staff meeting. She showed the pattern analysis \u2014 individually, these looked like minor incidents. Together, the data told a completely different story. I'll never dismiss 'small stuff' again.",
        platform: "Staff receive a broadcast notification about the school's updated anti-bullying response and what to watch for.",
      },
      coordinator: {
        text: "I've separated Marcus's sanctions from the support for Tyler and Jayden \u2014 they were coerced, not willing participants. Sofia has a safety plan. I've logged everything in the audit trail and scheduled follow-up reviews.",
        platform: "Actions, referrals, and follow-ups are tracked in safeskoolz. The PTA receives an anonymised update for their annual report.",
      },
    },
  },
  {
    week: "Week 8",
    title: "Recovery \u2014 the data proves it worked",
    perspectives: {
      sofia: {
        text: "School is better now. Marcus apologised. Tyler and Jayden are actually nice to me. My diary mood is back up to 4. I'm glad I wrote in my diary \u2014 it helped the school see what was really happening.",
      },
      parent: {
        text: "Sofia is herself again. She's eating properly, sleeping well, and talks about school with enthusiasm. The PTA annual report showed how the school handled several cases like this \u2014 I'm impressed by how seriously they take it.",
        platform: "PTA annual report shows: \"We identified and resolved a ringleader-plus-recruited-bullies pattern this term. Mood data showed full recovery within 5 weeks of intervention.\"",
      },
      teacher: {
        text: "Marcus's behaviour points have dropped from 12 to 2. Sofia is putting her hand up in class again. The post-intervention data proves the approach worked.",
        platform: "Behaviour tracker shows Marcus's points declining. Sofia's diary mood graph shows recovery. No new incidents involving the group.",
      },
      coordinator: {
        text: "The diagnostic survey shows improved trust scores. The follow-up data is clear: intervention worked. This case study goes into our evidence base for LOPIVI compliance.",
        platform: "Diagnostic comparison shows \"I feel safe at school\" scores have risen from 2.8 to 4.1 among affected pupils. Full audit trail is LOPIVI-compliant.",
      },
    },
  },
];

const MORE_STORIES = [
  {
    title: "Luna's Story",
    subtitle: "When reporting makes things worse \u2014 until the system catches retaliation",
    summary: "Luna reports bullying. Oliver and Noah call her a \"snitch\". safeskoolz detects the retaliation cluster and the school intervenes with stronger protections.",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    title: "Liam's Story",
    subtitle: "When \"just teasing\" about money hides something systematic",
    summary: "Liam mocks classmates about their clothes and phones. Each incident seems minor alone. safeskoolz links them into a clear material bullying pattern.",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
  },
  {
    title: "Mia's Story",
    subtitle: "When a child's spirit breaks one small moment at a time",
    summary: "Mia's mood drops from 5 to 1 over four weeks. No single incident is severe. safeskoolz's diary monitoring catches the decline before any adult could.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    title: "Year 9 Girls",
    subtitle: "When 'just banter' normalises gender-based disrespect",
    summary: "23 low-level incidents of body comments and 'rating' by the same group of boys. safeskoolz flags a Machista Violence pattern under LOPIVI. The school acts before it escalates.",
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
  },
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [activePerspective, setActivePerspective] = useState<Perspective>("sofia");
  const [showMoreStories, setShowMoreStories] = useState(false);

  const beat = STORY[activeStep];
  const perspective = beat.perspectives[activePerspective];
  const activeP = PERSPECTIVES.find(p => p.key === activePerspective)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
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
            Follow Sofia's real story through four perspectives &mdash; and see how the platform connects what no single person could see alone.
          </p>
        </div>

        <div className="flex justify-center gap-1 sm:gap-2 mb-8 flex-wrap">
          {STORY.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                i === activeStep
                  ? "bg-primary text-white shadow-md"
                  : i < activeStep
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {s.week}
            </button>
          ))}
        </div>

        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-center mb-1">{beat.title}</h2>
          <p className="text-center text-muted-foreground text-sm">{beat.week}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {PERSPECTIVES.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePerspective(p.key)}
              className={`p-3 rounded-xl text-left transition-all border ${
                activePerspective === p.key
                  ? `${p.bgColor} border-current ${p.color} shadow-sm`
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <p.icon size={20} className={activePerspective === p.key ? p.color : "text-muted-foreground"} />
              <p className="text-xs font-bold mt-1.5 truncate">{p.label}</p>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeStep}-${activePerspective}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`rounded-2xl border p-6 sm:p-8 ${activeP.bgColor} border-current/10`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full bg-white/80 dark:bg-black/20 ${activeP.color}`}>
                  <activeP.icon size={20} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${activeP.color}`}>{activeP.label}</p>
                  <p className="text-xs text-muted-foreground">{beat.week} &mdash; {beat.title}</p>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-black/10 rounded-xl p-5 mb-4">
                <p className="text-sm leading-relaxed italic">"{perspective.text}"</p>
              </div>

              {perspective.platform && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">What happens in safeskoolz</p>
                    <p className="text-sm text-foreground/80">{perspective.platform}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <span className="text-xs text-muted-foreground">
            {activeStep + 1} of {STORY.length}
          </span>

          <button
            onClick={() => setActiveStep(Math.min(STORY.length - 1, activeStep + 1))}
            disabled={activeStep === STORY.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-12 space-y-6">
          <button
            onClick={() => setShowMoreStories(!showMoreStories)}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <BookOpen size={16} />
            More real stories from schools like yours
            {showMoreStories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {showMoreStories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {MORE_STORIES.map((s, i) => (
                    <div key={i} className={`p-5 rounded-xl border ${s.bgColor} border-current/10`}>
                      <h3 className={`font-bold text-sm ${s.color}`}>{s.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{s.subtitle}</p>
                      <p className="text-sm">{s.summary}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Every school has these stories.</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              The difference is whether anyone connects the dots in time. safeskoolz makes the invisible visible \u2014 so schools can act before it's too late.
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

          <p className="text-xs text-muted-foreground">
            All names are fictional. Scenarios are based on real patterns seen in schools across Europe.
            <br />
            Compliant with LOPIVI, Convixit, and Machista Violence protocols.
            <br />
            Powered by <span className="font-semibold">Cloudworkz</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

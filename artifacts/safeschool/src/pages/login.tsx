import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { usePupilLogin, useStaffLogin, useParentLogin, useListSchools, useListPupilsBySchool } from "@workspace/api-client-react";
import { Button, Input, Label, Card, CardContent } from "@/components/ui-polished";
import { ShieldCheck, User, Users, GraduationCap, AlertTriangle, Play, X, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginDemoStep {
  title: string;
  description: string;
  benefit: string;
  icon: string;
}

const LOGIN_DEMO_STEPS: Record<string, LoginDemoStep[]> = {
  pupil: [
    { title: "Your Dashboard", description: "Your home page shows your safe contacts, quick actions to report something or get urgent help, and a way to request a chat with a trusted adult.", benefit: "Everything you need is right here — one click away.", icon: "🏠" },
    { title: "Report Something", description: "If something isn't right, tell us here. Pick what happened, where, and how you're feeling. You can even report anonymously — nobody will know it was you.", benefit: "Your voice matters. Reporting helps adults keep everyone safe.", icon: "🚨" },
    { title: "My Behaviour", description: "Check your behaviour record. The gauge shows your current level — green is great! You can see any points you've received and what they mean.", benefit: "Know where you stand and what you're doing well.", icon: "📊" },
    { title: "Messages", description: "Send a message to your teacher or a trusted adult. If you need help right now, use the urgent help button and adults will be alerted straight away.", benefit: "You're never alone — help is always one message away.", icon: "💬" },
    { title: "Learn About Staying Safe", description: "Read about what bullying is, what to do if it happens, and how to help a friend. There's also information about your feelings and your rights.", benefit: "Knowledge is power. Understanding helps you stay safe.", icon: "📚" },
    { title: "Training Guide", description: "Step-by-step guides showing you how to use every feature — from logging in to sending an urgent help message.", benefit: "Never get stuck — the answers are always here.", icon: "🎓" },
  ],
  staff: [
    { title: "Dashboard & Analytics", description: "Overview of your class/year group with recent incidents, active alerts, location hotspots, incident type breakdown, and monthly trend charts.", benefit: "Spot patterns early with at-a-glance analytics.", icon: "📊" },
    { title: "Log an Incident", description: "Record incidents with full detail — category, people involved, location, safeguarding checks, and professional notes. The system auto-assigns escalation tiers.", benefit: "Structured, consistent recording that meets LOPIVI compliance.", icon: "📝" },
    { title: "Behaviour Tracker", description: "View all pupils' behaviour records, issue points by category, and track the 7-level escalation system. Parents see their child's standing automatically.", benefit: "Fair, transparent behaviour management with a clear escalation path.", icon: "📈" },
    { title: "My Class & PIN Management", description: "See all your pupils at a glance. Generate unique login PINs, bulk reset for the whole class, print PIN slips, and unlock locked accounts.", benefit: "Secure pupil access with teacher-controlled PIN management.", icon: "👥" },
    { title: "Messages & Urgent Alerts", description: "View and respond to messages from pupils and parents. Urgent help requests are flagged with priority badges so you see them first.", benefit: "Never miss a child's cry for help — urgent messages surface immediately.", icon: "🔔" },
    { title: "Incident Management", description: "Browse and filter all incidents. Open any incident to add staff notes, witness statements, or a parent summary. Toggle parent visibility.", benefit: "Complete oversight with professional assessment tools.", icon: "📋" },
    { title: "Pattern Alerts", description: "The system automatically detects concerning patterns — repeat perpetrators, multi-victim incidents, welfare concerns. Each alert links to its triggering incidents.", benefit: "AI-assisted pattern detection catches what humans might miss.", icon: "⚡" },
    { title: "Formal Protocols", description: "Manage Convivèxit, LOPIVI, and Machista Violence protocols. Track phases, conduct interviews, complete risk assessments, and create case tasks.", benefit: "Full compliance with Balearic Islands safeguarding legislation.", icon: "🛡️" },
  ],
  parent: [
    { title: "Your Dashboard", description: "See an overview of your child's wellbeing at a glance — behaviour standing, incident statistics, monthly trends, and recent notifications.", benefit: "Stay informed about what matters most — your child's safety.", icon: "🏠" },
    { title: "Your Child's Incidents", description: "View all reported incidents involving your child. Each report shows what happened, when, where, how they were feeling, and what the school is doing about it.", benefit: "Full transparency on every incident — no surprises.", icon: "📋" },
    { title: "Behaviour Standing", description: "Track your child's behaviour record — current level, points received, categories, and the full escalation ladder from Good Standing through to exclusion.", benefit: "Catch issues early before they escalate.", icon: "📊" },
    { title: "Messages & Emergency Alerts", description: "Message your child's teachers directly. You'll also see any urgent help requests your child has sent to staff — so you know when they've raised an alarm.", benefit: "Direct line to school staff, plus peace of mind about urgent situations.", icon: "💬" },
    { title: "Report a Concern", description: "Submit a concern about your child yourself. Fill in the details and the school's safeguarding team will review and respond.", benefit: "Your concerns are heard and formally recorded.", icon: "🚨" },
    { title: "Safeguarding Resources", description: "Information about recognising bullying, talking to your child, what to do if they're being bullied, and how the school handles safeguarding.", benefit: "Practical advice to support your child at home.", icon: "📚" },
  ],
};

function LoginDemoModal({ role, onClose }: { role: "pupil" | "staff" | "parent"; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const steps = LOGIN_DEMO_STEPS[role];
  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const roleLabels: Record<string, string> = {
    pupil: "What pupils can do",
    staff: "What staff can do",
    parent: "What parents can do",
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); step < steps.length - 1 ? setStep(step + 1) : onClose(); }
      if (e.key === "ArrowLeft" && step > 0) { e.preventDefault(); setStep(step - 1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, steps.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{current.icon}</span>
              <div>
                <p className="text-white/70 text-xs font-medium">{roleLabels[role]} · {step + 1} of {steps.length}</p>
                <h3 className="text-white font-bold text-lg leading-tight">{current.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <div className="w-full h-1 bg-primary/20">
            <motion.div
              className="h-full bg-white/50"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6 space-y-4">
            <p className="text-foreground leading-relaxed">{current.description}</p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-primary">Why it matters:</p>
              <p className="text-sm text-primary/80 mt-1">{current.benefit}</p>
            </div>
          </div>

          <div className="px-6 pb-5 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} disabled={step === 0} className="gap-1">
              <ChevronLeft size={14} /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
                Close
              </Button>
              <Button size="sm" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()} className="gap-1">
                {step === steps.length - 1 ? "Done" : "Next"} {step < steps.length - 1 && <ChevronRight size={14} />}
              </Button>
            </div>
          </div>

          <div className="px-6 pb-4 flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const STAFF_ACCOUNTS = [
  { label: "Coordinator A", subtitle: "Coordinator", email: "coordinator@safeschool.dev", password: "password123" },
  { label: "Head Teacher A", subtitle: "Head Teacher", email: "head@safeschool.dev", password: "password123" },
  { label: "Teacher A", subtitle: "Head of Year · Y6 · 6A", email: "teacher@safeschool.dev", password: "password123" },
  { label: "Teacher B", subtitle: "Teacher · 5B", email: "teacher2@safeschool.dev", password: "password123" },
  { label: "Teacher C", subtitle: "Teacher · 4A", email: "teacher3@safeschool.dev", password: "password123" },
  { label: "Teacher D", subtitle: "Teacher · 3A", email: "teacher4@safeschool.dev", password: "password123" },
  { label: "SENCO A", subtitle: "SENCO", email: "senco@safeschool.dev", password: "password123" },
  { label: "Support Staff A", subtitle: "Support Staff", email: "support@safeschool.dev", password: "password123" },
];

const PARENT_ACCOUNTS = [
  { label: "Parent A", subtitle: "Parent of Boy A", email: "parent.a@safeschool.dev", password: "parent123" },
  { label: "Parent B", subtitle: "Parent of Boy B", email: "parent.b@safeschool.dev", password: "parent123" },
];

export default function Login() {
  const [_, setLocation] = useLocation();
  const { setToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"pupil" | "staff" | "parent">("pupil");
  const pupilLogin = usePupilLogin();
  const staffLogin = useStaffLogin();
  const parentLogin = useParentLogin();
  const { data: schools } = useListSchools();

  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedPupilId, setSelectedPupilId] = useState("");
  const [pin, setPin] = useState("");
  const [selectedStaffEmail, setSelectedStaffEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const { data: pupils } = useListPupilsBySchool(selectedSchoolId, {}, { query: { enabled: !!selectedSchoolId } });

  useEffect(() => {
    if (schools && schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let res;
      if (activeTab === "pupil") {
        if (!selectedSchoolId || !selectedPupilId || !pin) {
          setError("Please select your school, name, and enter your PIN.");
          return;
        }
        res = await pupilLogin.mutateAsync({
          data: { schoolId: selectedSchoolId, pupilId: selectedPupilId, pin }
        });
      } else if (activeTab === "staff") {
        const accounts = STAFF_ACCOUNTS;
        const selected = accounts.find(a => a.email === selectedStaffEmail);
        const loginEmail = selected?.email || email;
        const loginPassword = selected?.password || password;
        if (!loginEmail || !loginPassword) {
          setError("Please select your name or enter your credentials.");
          return;
        }
        res = await staffLogin.mutateAsync({
          data: { email: loginEmail, password: loginPassword }
        });
      } else {
        const accounts = PARENT_ACCOUNTS;
        const selected = accounts.find(a => a.email === selectedStaffEmail);
        const loginEmail = selected?.email || email;
        const loginPassword = selected?.password || password;
        if (!loginEmail || !loginPassword) {
          setError("Please select your name or enter your credentials.");
          return;
        }
        res = await parentLogin.mutateAsync({
          data: { email: loginEmail, password: loginPassword }
        });
      }

      setToken(res.token);
      setLocation("/");
    } catch (err: any) {
      const data = err?.data || err?.response?.data;
      if (data?.locked) {
        setError(data.message || "Account locked. Ask your teacher to reset your PIN.");
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError(data?.error || "Login failed. Please check your credentials.");
      }
    }
  };

  const isPending = pupilLogin.isPending || staffLogin.isPending || parentLogin.isPending;

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary/10 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20 mb-6 text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">SafeSchool</h1>
          <p className="mt-3 text-muted-foreground text-lg">A safe space to speak up and seek help.</p>
        </motion.div>

        <Card className="shadow-2xl shadow-primary/5 border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex p-2 gap-2 border-b border-border/50 bg-muted/30">
            {[
              { id: "pupil" as const, label: "I'm a Pupil", icon: User },
              { id: "staff" as const, label: "I'm Staff", icon: GraduationCap },
              { id: "parent" as const, label: "I'm a Parent", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(""); setSelectedStaffEmail(""); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-card shadow-sm text-primary"
                    : "text-muted-foreground hover:bg-black/5"
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              {activeTab === "pupil" ? (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <Label htmlFor="school">My School</Label>
                    <select
                      id="school"
                      value={selectedSchoolId}
                      onChange={e => { setSelectedSchoolId(e.target.value); setSelectedPupilId(""); }}
                      className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    >
                      <option value="">Select your school...</option>
                      {schools?.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="pupil">My Name</Label>
                    <select
                      id="pupil"
                      value={selectedPupilId}
                      onChange={e => setSelectedPupilId(e.target.value)}
                      className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                      disabled={!selectedSchoolId}
                    >
                      <option value="">Find my name...</option>
                      {pupils?.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.avatarValue ? `${p.avatarValue} ` : ""}{p.firstName} {p.lastName} ({p.className || p.yearGroup || ""})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="pin">Secret PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="****"
                      maxLength={4}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      required
                      className="tracking-widest text-center text-xl font-bold"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  {(() => {
                    const accounts = activeTab === "parent" ? PARENT_ACCOUNTS : STAFF_ACCOUNTS;
                    const selectedAccount = accounts.find(a => a.email === selectedStaffEmail);
                    return (
                      <>
                        <div>
                          <Label htmlFor="staffSelect">My Name</Label>
                          <select
                            id="staffSelect"
                            value={selectedStaffEmail}
                            onChange={e => {
                              setSelectedStaffEmail(e.target.value);
                              setEmail("");
                              setPassword("");
                            }}
                            className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">Find my name...</option>
                            {accounts.map(a => (
                              <option key={a.email} value={a.email}>
                                {a.label} — {a.subtitle}
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedAccount ? (
                          <div className="p-3 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm font-bold">{selectedAccount.label}</p>
                            <p className="text-xs text-muted-foreground">{selectedAccount.subtitle}</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 text-muted-foreground text-xs">
                              <div className="flex-1 h-px bg-border" />
                              <span>or enter manually</span>
                              <div className="flex-1 h-px bg-border" />
                            </div>
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="name@school.edu"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="password">Password</Label>
                              <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                              />
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              )}

              <Button type="submit" size="lg" className="w-full mt-6" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In securely"}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowDemo(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
              >
                <Play size={16} className="fill-primary/20" />
                {activeTab === "pupil" ? "See what I can do" : activeTab === "parent" ? "See what parents can do" : "See what staff can do"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Protected by SafeSchool. Your reports are confidential.
        </p>
      </div>

      <AnimatePresence>
        {showDemo && <LoginDemoModal role={activeTab} onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </div>
  );
}

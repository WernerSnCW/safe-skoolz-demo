import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useStaffLogin, useParentLogin, useListSchools } from "@workspace/api-client-react";
import { Button, Input, Label, Card, CardContent } from "@/components/ui-polished";
import { ShieldCheck, User, Users, GraduationCap, AlertTriangle, Play, UserCheck, Building2, ChevronRight, Lock, ArrowLeft, Heart, Shield, BarChart3, Bell, Eye, ClipboardCheck, Copy, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === "true";

type DemoAccount = { label: string; subtitle: string; email: string; password: string };

type PupilProfile = {
  loginKey: string;
  displayName: string;
  avatarType: string;
  avatarValue: string;
  yearGroup: string;
  className: string;
};

type PupilLoginStep = "school" | "accessCode" | "selectProfile" | "enterPin";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { setToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"pupil" | "staff" | "parent" | "pta">("pupil");
  const staffLogin = useStaffLogin();
  const parentLogin = useParentLogin();
  const { data: schools } = useListSchools();

  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedStaffEmail, setSelectedStaffEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  // Demo accounts — loaded dynamically so credentials never appear in production bundles
  const [demoAccounts, setDemoAccounts] = useState<{ staff: DemoAccount[]; parent: DemoAccount[]; pta: DemoAccount[] }>({ staff: [], parent: [], pta: [] });
  useEffect(() => {
    if (IS_DEMO) {
      import("./demo-accounts").then((mod) => {
        setDemoAccounts({ staff: mod.STAFF_ACCOUNTS, parent: mod.PARENT_ACCOUNTS, pta: mod.PTA_ACCOUNTS });
      });
    }
  }, []);

  const [pupilStep, setPupilStep] = useState<PupilLoginStep>("school");
  const [accessCode, setAccessCode] = useState("");
  const [loginSessionToken, setLoginSessionToken] = useState("");
  const [profiles, setProfiles] = useState<PupilProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PupilProfile | null>(null);
  const [pin, setPin] = useState("");
  const [pupilLoading, setPupilLoading] = useState(false);

  useEffect(() => {
    if (schools && schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0].id);
      if (schools.length === 1 && pupilStep === "school") {
        setPupilStep("accessCode");
      }
    }
  }, [schools, selectedSchoolId]);

  const apiBase = (() => {
    const b = import.meta.env.BASE_URL || "/";
    return b.endsWith("/") ? b : b + "/";
  })();

  const handleAccessCodeSubmit = async () => {
    setError("");
    setPupilLoading(true);
    try {
      const res = await fetch(`${apiBase}api/auth/pupil/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: selectedSchoolId, accessCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid access code. Check with your teacher.");
        setPupilLoading(false);
        return;
      }
      setLoginSessionToken(data.loginSessionToken);
      setProfiles(data.profiles);
      setPupilStep("selectProfile");
    } catch {
      setError("Could not connect. Please try again.");
    }
    setPupilLoading(false);
  };

  const handleProfileSelect = (profile: PupilProfile) => {
    setSelectedProfile(profile);
    setPin("");
    setError("");
    setPupilStep("enterPin");
  };

  const handlePupilPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !pin) return;
    setError("");
    setPupilLoading(true);
    try {
      const res = await fetch(`${apiBase}api/auth/pupil/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginSessionToken,
          loginKey: selectedProfile.loginKey,
          pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.locked) {
          setError(data.message || "Account locked. Ask your teacher to reset your PIN.");
        } else if (data.message) {
          setError(data.message);
        } else {
          setError(data.error || "Wrong PIN. Try again.");
        }
        setPupilLoading(false);
        return;
      }
      setToken(data.token);
      setLocation("/");
    } catch {
      setError("Could not connect. Please try again.");
    }
    setPupilLoading(false);
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let res;
      if (activeTab === "staff") {
        const accounts = demoAccounts.staff;
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
      } else if (activeTab === "parent") {
        const accounts = demoAccounts.parent;
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
      } else {
        const accounts = demoAccounts.pta;
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
      }

      setToken(res.token);
      setLocation("/");
    } catch (err: any) {
      const data = err?.data || err?.response?.data;
      if (data?.locked) {
        setError(data.message || "Account locked.");
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError(data?.error || "Login failed. Please check your credentials.");
      }
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setDemoLoading(activeTab);
    try {
      const res = await fetch(`${apiBase}api/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: activeTab }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Demo login failed");
        setDemoLoading(null);
        return;
      }
      const data = await res.json();
      sessionStorage.setItem("safeschool_start_demo", "true");
      setToken(data.token);
      setLocation("/");
    } catch {
      setError("Could not start demo. Please try again.");
      setDemoLoading(null);
    }
  };

  const isPending = staffLogin.isPending || parentLogin.isPending || pupilLoading;

  const resetPupilFlow = () => {
    if (schools && schools.length === 1) {
      setPupilStep("accessCode");
    } else {
      setPupilStep("school");
    }
    setAccessCode("");
    setLoginSessionToken("");
    setProfiles([]);
    setSelectedProfile(null);
    setPin("");
    setError("");
  };

  const profileSearch = useState("");

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
          <h1 className="text-4xl font-bold tracking-tight text-foreground">safeskoolz</h1>
          <p className="mt-3 text-muted-foreground text-lg">A safe space to speak up and seek help.</p>
        </motion.div>

        <Card className="shadow-2xl shadow-primary/5 border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="grid grid-cols-4 p-1.5 gap-1 border-b border-border/50 bg-muted/30" role="tablist" aria-label="Login type">
            {[
              { id: "pupil" as const, label: "Pupil", icon: User },
              { id: "staff" as const, label: "Staff", icon: GraduationCap },
              { id: "parent" as const, label: "Parent", icon: Users },
              { id: "pta" as const, label: "PTA", icon: UserCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => { setActiveTab(tab.id); setError(""); setSelectedStaffEmail(""); resetPupilFlow(); }}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-card shadow-sm text-primary"
                    : "text-muted-foreground hover:bg-black/5"
                }`}
              >
                <tab.icon size={16} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "pupil" && (
                <div className="px-6 sm:px-8 pt-5 pb-3 border-b border-border/30 bg-teal-50/30 dark:bg-teal-950/10">
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-400 mb-2">What safeskoolz does for you</p>
                  <div className="grid gap-1.5">
                    <div className="flex items-start gap-2">
                      <Heart size={13} className="text-teal-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For me</span> — A safe way to tell someone if something is wrong, even anonymously</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={13} className="text-teal-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For my friends</span> — Report things happening to someone else without anyone knowing it was you</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 size={13} className="text-teal-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For my school</span> — Helps adults see problems early so they can keep everyone safe</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "staff" && (
                <div className="px-6 sm:px-8 pt-5 pb-3 border-b border-border/30 bg-indigo-50/30 dark:bg-indigo-950/10">
                  <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2">What safeskoolz does for you</p>
                  <div className="grid gap-1.5">
                    <div className="flex items-start gap-2">
                      <ClipboardCheck size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For me</span> — Log incidents in 60 seconds with guided protocol steps for serious cases</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Eye size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For my pupils</span> — Spot patterns across classes that no single teacher could see alone</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For their parents</span> — Parents get notified privately when the school acts on something involving their child</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "parent" && (
                <div className="px-6 sm:px-8 pt-5 pb-3 border-b border-border/30 bg-amber-50/30 dark:bg-amber-950/10">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">What safeskoolz does for you</p>
                  <div className="grid gap-1.5">
                    <div className="flex items-start gap-2">
                      <Bell size={13} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For me</span> — Get private notifications when the school identifies or acts on something involving your child</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart size={13} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For my child</span> — Know your child has a safe, anonymous way to speak up if something is wrong</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 size={13} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For my school</span> — See real data on how safe children feel, not just promises</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "pta" && (
                <div className="px-6 sm:px-8 pt-5 pb-3 border-b border-border/30 bg-purple-50/30 dark:bg-purple-950/10">
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">What safeskoolz does for you</p>
                  <div className="grid gap-1.5">
                    <div className="flex items-start gap-2">
                      <BarChart3 size={13} className="text-purple-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For me</span> — Anonymised safeguarding data you can share at governor meetings with confidence</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={13} className="text-purple-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For parents</span> — Give families evidence that their concerns are heard and acted on</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield size={13} className="text-purple-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">For the school</span> — Hold leadership accountable with outcome data, not just policies</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <CardContent className="p-6 sm:p-8">
            <div role="alert" aria-live="assertive" aria-atomic="true">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} aria-hidden="true" />
                  {error}
                </div>
              )}
            </div>

            {activeTab === "pupil" ? (
              <AnimatePresence mode="wait">
                {pupilStep === "school" && (
                  <motion.div key="school" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                    <div>
                      <Label htmlFor="school">My School</Label>
                      <select
                        id="school"
                        value={selectedSchoolId}
                        onChange={e => { setSelectedSchoolId(e.target.value); }}
                        className="w-full h-14 rounded-xl border border-input bg-background px-4 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                        style={{ fontSize: "16px" }}
                        required
                      >
                        <option value="">Select your school...</option>
                        {schools?.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      size="lg"
                      className="w-full"
                      disabled={!selectedSchoolId}
                      onClick={() => { setError(""); setPupilStep("accessCode"); }}
                    >
                      Next
                    </Button>
                  </motion.div>
                )}

                {pupilStep === "accessCode" && (
                  <motion.div key="accessCode" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                    <button type="button" onClick={() => setPupilStep("school")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <div className="text-center py-2">
                      <Lock size={32} className="mx-auto text-primary/60 mb-2" />
                      <p className="text-sm text-muted-foreground">Enter the class access code your teacher gave you</p>
                    </div>
                    <div>
                      <Label htmlFor="accessCode">Class Access Code</Label>
                      <Input
                        id="accessCode"
                        type="text"
                        placeholder="e.g. 6A-MORNA"
                        value={accessCode}
                        onChange={e => setAccessCode(e.target.value.toUpperCase())}
                        required
                        autoComplete="off"
                        className="tracking-widest text-center text-lg font-bold uppercase"
                      />
                    </div>
                    <Button
                      type="button"
                      size="lg"
                      className="w-full"
                      disabled={!accessCode || pupilLoading}
                      onClick={handleAccessCodeSubmit}
                    >
                      {pupilLoading ? "Checking..." : "Enter"}
                    </Button>
                  </motion.div>
                )}

                {pupilStep === "selectProfile" && (
                  <motion.div key="selectProfile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                    <button type="button" onClick={resetPupilFlow} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <ArrowLeft size={14} /> Start over
                    </button>
                    <p className="text-sm font-semibold text-center">Find your name</p>
                    <Input
                      type="text"
                      placeholder="Search by name..."
                      value={profileSearch[0]}
                      onChange={e => profileSearch[1](e.target.value)}
                      className="text-sm"
                    />
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {profiles
                        .filter(p => !profileSearch[0] || p.displayName.toLowerCase().includes(profileSearch[0].toLowerCase()))
                        .map((p) => (
                        <button
                          key={p.loginKey}
                          type="button"
                          onClick={() => handleProfileSelect(p)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                        >
                          <span className="text-2xl">{p.avatarValue || "👤"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{p.displayName}</p>
                            <p className="text-xs text-muted-foreground">{p.className || p.yearGroup}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {pupilStep === "enterPin" && selectedProfile && (
                  <motion.div key="enterPin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                    <button type="button" onClick={() => { setPupilStep("selectProfile"); setPin(""); setError(""); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <ArrowLeft size={14} /> Change name
                    </button>
                    <div className="text-center py-2">
                      <span className="text-4xl block mb-2">{selectedProfile.avatarValue || "👤"}</span>
                      <p className="font-bold text-lg">{selectedProfile.displayName}</p>
                      <p className="text-xs text-muted-foreground">{selectedProfile.className || selectedProfile.yearGroup}</p>
                    </div>
                    <form onSubmit={handlePupilPinSubmit} className="space-y-4">
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
                          autoComplete="one-time-code"
                          className="tracking-widest text-center text-xl font-bold"
                          autoFocus
                        />
                      </div>
                      <Button type="submit" size="lg" className="w-full" disabled={pupilLoading || pin.length < 4}>
                        {pupilLoading ? "Signing in..." : "Sign In securely"}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <form onSubmit={handleStaffSubmit} className="space-y-5">
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  {(() => {
                    const accounts = activeTab === "parent" ? demoAccounts.parent : activeTab === "pta" ? demoAccounts.pta : demoAccounts.staff;
                    const selectedAccount = accounts.find(a => a.email === selectedStaffEmail);
                    const hasAccounts = accounts.length > 0;
                    return (
                      <>
                        {hasAccounts && (
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
                              className="w-full h-14 rounded-xl border border-input bg-background px-4 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                              style={{ fontSize: "16px" }}
                            >
                              <option value="">Find my name...</option>
                              {accounts.map(a => (
                                <option key={a.email} value={a.email}>
                                  {a.label} — {a.subtitle}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {selectedAccount ? (
                          <div className="p-3 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm font-bold">{selectedAccount.label}</p>
                            <p className="text-xs text-muted-foreground">{selectedAccount.subtitle}</p>
                          </div>
                        ) : (
                          <>
                            {hasAccounts && (
                              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                <div className="flex-1 h-px bg-border" />
                                <span>or enter manually</span>
                                <div className="flex-1 h-px bg-border" />
                              </div>
                            )}
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="name@school.edu"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
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
                                autoComplete="current-password"
                              />
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </motion.div>

                <Button type="submit" size="lg" className="w-full mt-6" disabled={isPending}>
                  {isPending ? "Signing in..." : "Sign In securely"}
                </Button>
              </form>
            )}

            {IS_DEMO && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={!!demoLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {demoLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      Starting demo...
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-primary/20" />
                      {activeTab === "pupil" ? "Show me around" : activeTab === "parent" ? "Show me around as a parent" : activeTab === "pta" ? "Show me around as PTA" : "Show me around as staff"}
                    </>
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {IS_DEMO && <DemoCredentialsCard demoAccounts={demoAccounts} onQuickLogin={async (email, password, role) => {
          setError("");
          try {
            let res;
            if (role === "parent") {
              res = await parentLogin.mutateAsync({ data: { email, password } });
            } else {
              res = await staffLogin.mutateAsync({ data: { email, password } });
            }
            setToken(res.token);
            setLocation("/");
          } catch {
            setError("Login failed. Please try again.");
          }
        }} />}

        <Link href="/how-it-works">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-200/50 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Play size={24} className="text-white fill-white/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">See how it works</p>
                <p className="text-sm text-indigo-200 mt-0.5">Follow Sofia's story &mdash; see how pupils, parents, teachers, and coordinators work together</p>
              </div>
              <ChevronRight size={20} className="text-indigo-200 flex-shrink-0" />
            </div>
          </motion.div>
        </Link>

        <Link href="/newsletter">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-5 text-white shadow-lg shadow-teal-200/50 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">Bring safeskoolz to your school</p>
                <p className="text-sm text-teal-100 mt-0.5">Schools & authorities — sign up to our newsletter and register your interest</p>
              </div>
              <ChevronRight size={20} className="text-teal-200 flex-shrink-0" />
            </div>
          </motion.div>
        </Link>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Protected by safeskoolz. Your reports are confidential.
        </p>
        <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
          Powered by Cloudworkz
        </p>
      </div>
    </div>
  );
}

function DemoCredentialsCard({ demoAccounts, onQuickLogin }: {
  demoAccounts: { staff: DemoAccount[]; parent: DemoAccount[]; pta: DemoAccount[] };
  onQuickLogin: (email: string, password: string, role: string) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleQuickLogin = async (email: string, password: string, role: string) => {
    setLoggingIn(email);
    try {
      await onQuickLogin(email, password, role);
    } finally {
      setLoggingIn(null);
    }
  };

  const sections: { title: string; labelClass: string; rowClass: string; btnClass: string; accounts: DemoAccount[]; role: string }[] = [
    {
      title: "Staff", role: "staff", accounts: demoAccounts.staff,
      labelClass: "text-indigo-600 dark:text-indigo-400",
      rowClass: "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/30 dark:border-indigo-800/30",
      btnClass: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      title: "Parents", role: "parent", accounts: demoAccounts.parent,
      labelClass: "text-amber-600 dark:text-amber-400",
      rowClass: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/30 dark:border-amber-800/30",
      btnClass: "bg-amber-600 hover:bg-amber-700",
    },
    {
      title: "PTA", role: "pta", accounts: demoAccounts.pta,
      labelClass: "text-purple-600 dark:text-purple-400",
      rowClass: "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/30 dark:border-purple-800/30",
      btnClass: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all text-sm font-semibold text-foreground"
      >
        <span className="flex items-center gap-2">
          <Lock size={16} className="text-primary" />
          Demo Account Credentials
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl bg-card border border-border/50 shadow-sm p-4 space-y-4">
              {/* Pupil credentials */}
              <div>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">Pupil Login</p>
                <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/30 dark:border-teal-800/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Access Codes:</span>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {["6A-MORNA", "5B-MORNA", "4A-MORNA", "3A-MORNA"].map(code => (
                        <button
                          key={code}
                          onClick={() => copyToClipboard(code, code)}
                          className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/40 transition-colors"
                        >
                          {copied === code ? <Check size={12} /> : code}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">PIN (all pupils):</span>
                    <button
                      onClick={() => copyToClipboard("1234", "pin")}
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/40 transition-colors flex items-center gap-1"
                    >
                      {copied === "pin" ? <Check size={12} /> : <>1234 <Copy size={10} /></>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff / Parent / PTA credentials */}
              {sections.map(({ title, labelClass, rowClass, btnClass, accounts, role }) => (
                <div key={title}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${labelClass}`}>{title}</p>
                  <div className="space-y-1.5">
                    {accounts.map(a => (
                      <div
                        key={a.email}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${rowClass}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{a.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{a.subtitle}</p>
                        </div>
                        <button
                          onClick={() => handleQuickLogin(a.email, a.password, role)}
                          disabled={!!loggingIn}
                          className={`ml-2 shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition-colors ${btnClass}`}
                        >
                          {loggingIn === a.email ? "..." : "Login"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

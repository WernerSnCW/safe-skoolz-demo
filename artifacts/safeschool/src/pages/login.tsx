import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { usePupilLogin, useStaffLogin, useParentLogin, useListSchools, useListPupilsBySchool } from "@workspace/api-client-react";
import { Button, Input, Label, Card, CardContent } from "@/components/ui-polished";
import { ShieldCheck, User, Users, GraduationCap, AlertTriangle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_ACCOUNTS = [
  { label: "Coordinator A", email: "coordinator@safeschool.dev", password: "password123", role: "coordinator", color: "bg-violet-500" },
  { label: "Head Teacher A", email: "head@safeschool.dev", password: "password123", role: "head_teacher", color: "bg-blue-500" },
  { label: "Teacher A (HoY)", email: "teacher@safeschool.dev", password: "password123", role: "head_of_year", color: "bg-emerald-500" },
  { label: "Teacher B", email: "teacher2@safeschool.dev", password: "password123", role: "teacher", color: "bg-green-500" },
  { label: "Support Staff A", email: "support@safeschool.dev", password: "password123", role: "support_staff", color: "bg-amber-500" },
  { label: "SENCO A", email: "senco@safeschool.dev", password: "password123", role: "senco", color: "bg-pink-500" },
  { label: "Parent A", email: "parent.a@safeschool.dev", password: "parent123", role: "parent", color: "bg-orange-500", isParent: true },
];

export default function Login() {
  const [_, setLocation] = useLocation();
  const { setToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"pupil" | "staff" | "parent">("pupil");
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const pupilLogin = usePupilLogin();
  const staffLogin = useStaffLogin();
  const parentLogin = useParentLogin();
  const { data: schools } = useListSchools();

  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedPupilId, setSelectedPupilId] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

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
        res = await staffLogin.mutateAsync({
          data: { email, password }
        });
      } else {
        res = await parentLogin.mutateAsync({
          data: { email, password }
        });
      }

      setToken(res.token);
      setLocation("/");
    } catch (err: any) {
      setError(err?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(account.email);
    setError("");
    try {
      const loginFn = account.isParent ? parentLogin : staffLogin;
      const res = await loginFn.mutateAsync({
        data: { email: account.email, password: account.password }
      });
      setToken(res.token);
      setLocation("/");
    } catch (err: any) {
      setError(err?.data?.error || "Demo login failed.");
    } finally {
      setDemoLoading(null);
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
                onClick={() => { setActiveTab(tab.id); setError(""); }}
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
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@school.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
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
                      required
                    />
                  </div>
                </motion.div>
              )}

              <Button type="submit" size="lg" className="w-full mt-6" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In securely"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <button
            onClick={() => setShowDemoPanel(!showDemoPanel)}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors py-2"
          >
            <Zap size={14} />
            {showDemoPanel ? "Hide Demo Logins" : "Quick Demo Login"}
          </button>

          <AnimatePresence>
            {showDemoPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="mt-2 border-dashed border-2 border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3 text-center font-medium">Click any role to log in instantly</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_ACCOUNTS.map((account) => (
                        <button
                          key={account.email}
                          onClick={() => handleDemoLogin(account)}
                          disabled={!!demoLoading}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left disabled:opacity-50"
                        >
                          <div className={`w-2 h-2 rounded-full ${account.color} shrink-0`} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {demoLoading === account.email ? "Logging in..." : account.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">{account.role.replace("_", " ")}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 text-center">
                      Pupils: select name above, PIN: <span className="font-mono font-bold">1234</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Protected by SafeSchool. Your reports are confidential.
        </p>
      </div>
    </div>
  );
}

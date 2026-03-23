import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui-polished";
import {
  ClipboardCheck, CheckCircle2, BarChart3, Users, AlertTriangle,
  ChevronRight, ChevronLeft, Play, Lock, TrendingUp, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const FACE_EMOJIS = [
  { value: 1, emoji: "\uD83D\uDE1E", label: "Not at all" },
  { value: 2, emoji: "\uD83D\uDE15", label: "A little" },
  { value: 3, emoji: "\uD83D\uDE10", label: "Sort of" },
  { value: 4, emoji: "\uD83D\uDE42", label: "Yes" },
  { value: 5, emoji: "\uD83D\uDE04", label: "Definitely!" },
];

const LIKERT_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

const CATEGORY_COLORS: Record<string, string> = {
  "Awareness & Prevalence": "bg-blue-500",
  "Trust & Reporting": "bg-teal-500",
  "Culture & Wellbeing": "bg-green-500",
  "Safeguarding Knowledge": "bg-purple-500",
  "System Readiness": "bg-amber-500",
};

const GROUP_COLORS: Record<string, string> = {
  pupil: "#0d9488",
  staff: "#6366f1",
  parent: "#f59e0b",
};

function fetchWithAuth(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("safeschool_token");
  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
}

export default function Diagnostics() {
  const { user } = useAuth();
  if (!user) return null;

  const isCoordinator = ["coordinator", "head_teacher"].includes(user.role);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <ClipboardCheck className="text-primary" size={32} />
          School Diagnostic
        </h1>
        <p className="text-muted-foreground mt-2">
          {isCoordinator
            ? "Understand your school's safeguarding culture through the eyes of pupils, staff, and parents."
            : "Help your school understand how everyone feels about safety, kindness, and bullying."}
        </p>
      </div>

      {isCoordinator ? <CoordinatorView user={user} /> : <RespondentView user={user} />}
    </div>
  );
}

function CoordinatorView({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const { data: activeData, isLoading: activeLoading } = useQuery({
    queryKey: ["/api/diagnostics/active"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/diagnostics/active");
      return res.json();
    },
  });

  const { data: allSurveys } = useQuery({
    queryKey: ["/api/diagnostics"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/diagnostics");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/diagnostics", {
        method: "POST",
        body: JSON.stringify({ title: "School Onboarding Diagnostic" }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostics/active"] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/diagnostics/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) throw new Error("Failed to close");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostics/active"] });
    },
  });

  if (activeLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
      </div>
    );
  }

  const activeSurvey = activeData?.survey;
  const hasCompleted = activeData?.alreadyCompleted;

  return (
    <div className="space-y-6">
      {!activeSurvey ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <ClipboardCheck size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No Active Diagnostic</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Launch a diagnostic survey to understand your school's safeguarding climate.
              Pupils, staff, and parents will each answer role-appropriate questions.
            </p>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              size="lg"
            >
              <Play size={18} className="mr-2" />
              {createMutation.isPending ? "Creating..." : "Launch Diagnostic"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{activeSurvey.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Active since {new Date(activeSurvey.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/diagnostics/${activeSurvey.id}/results`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 size={16} className="mr-2" /> View Results
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => closeMutation.mutate(activeSurvey.id)}
                  disabled={closeMutation.isPending}
                >
                  <Lock size={16} className="mr-2" />
                  {closeMutation.isPending ? "Closing..." : "Close Survey"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    closeMutation.mutate(activeSurvey.id, {
                      onSuccess: () => createMutation.mutate(),
                    });
                  }}
                  disabled={closeMutation.isPending || createMutation.isPending}
                >
                  <Play size={16} className="mr-2" />
                  New Diagnostic
                </Button>
              </div>
            </CardHeader>
          </Card>

          {!hasCompleted && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Your turn!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't completed the diagnostic yet. Your perspective as a coordinator is important.
                </p>
                <SurveyForm surveyId={activeSurvey.id} questions={activeData.questions} user={user} />
              </CardContent>
            </Card>
          )}
          {hasCompleted && (
            <div className="flex items-center gap-2 text-primary text-sm font-medium p-4 rounded-xl bg-primary/5 border border-primary/20">
              <CheckCircle2 size={18} />
              You have completed this diagnostic. View the results to see how different groups responded.
            </div>
          )}
        </>
      )}

      {allSurveys && allSurveys.filter((s: any) => s.status === "closed").length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">Previous Diagnostics</h3>
          <div className="space-y-2">
            {allSurveys.filter((s: any) => s.status === "closed").map((s: any) => (
              <Link key={s.id} href={`/diagnostics/${s.id}/results`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Closed {s.closedAt ? new Date(s.closedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionsLink({ surveyId }: { surveyId: string }) {
  const { data } = useQuery({
    queryKey: ["/api/diagnostics", surveyId, "actions"],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/diagnostics/${surveyId}/actions`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!surveyId,
  });

  if (!data?.isPublished || !data?.actions?.length) return null;

  return (
    <Link href={`/diagnostics/${surveyId}/results`}>
      <Card className="hover:border-primary/30 transition-colors cursor-pointer">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">View Agreed Actions</p>
            <p className="text-xs text-muted-foreground">
              See what the school has committed to based on the diagnostic
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

function RespondentView({ user }: { user: any }) {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/diagnostics/active"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/diagnostics/active");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!data?.survey) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ClipboardCheck size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {user.role === "pupil" ? "Nothing here yet!" : "No Active Diagnostic"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {user.role === "pupil"
              ? "Your school hasn't started a survey yet. Check back soon!"
              : "There's no active diagnostic survey at the moment. Your school coordinator will let you know when one is available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.alreadyCompleted) {
    const isPupil = user.role === "pupil";
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/20 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-5"
              >
                <span className="text-4xl">{isPupil ? "⭐" : "✅"}</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold mb-2 text-emerald-900 dark:text-emerald-100"
              >
                {isPupil ? "You're a star!" : "Thank you for responding!"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto text-sm leading-relaxed"
              >
                {isPupil
                  ? "Your answers help make your school a safer, happier place for everyone. That's really important!"
                  : "Your responses have been recorded and will help shape the school's safeguarding approach. The coordinator will share the combined results."}
              </motion.p>
              {isPupil && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 inline-flex items-center gap-2 bg-white/60 dark:bg-white/10 rounded-full px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300"
                >
                  <span className="text-lg">🎉</span>
                  Survey complete — well done!
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
        <ActionsLink surveyId={data.survey.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <SurveyForm surveyId={data.survey.id} questions={data.questions} user={user} />
        </CardContent>
      </Card>
      <ActionsLink surveyId={data.survey.id} />
    </div>
  );
}

function SurveyForm({ surveyId, questions, user }: { surveyId: string; questions: any[]; user: any }) {
  const queryClient = useQueryClient();
  const isPupil = user.role === "pupil";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const body = {
        answers: Object.entries(answers).map(([key, answer]) => ({ key, answer })),
      };
      const res = await fetchWithAuth(`/api/diagnostics/${surveyId}/respond`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostics/active"] });
    },
  });

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="text-center py-10"
      >
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/20 rounded-2xl p-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-5"
          >
            <span className="text-4xl">{isPupil ? "🌟" : "✅"}</span>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-2xl font-bold mb-2 text-emerald-900 dark:text-emerald-100"
          >
            {isPupil ? "Brilliant! You did it!" : "Thank you!"}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto text-sm leading-relaxed"
          >
            {isPupil
              ? "Your answers help your school be the best it can be. You should be really proud!"
              : "Your responses have been recorded. The coordinator will share the combined results."}
          </motion.p>
          {isPupil && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-5 flex justify-center gap-2 text-2xl"
            >
              {["🎉", "⭐", "🎉"].map((e, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  const allAnswered = questions.every(q => answers[q.key] !== undefined);
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  if (isPupil) {
    const currentQ = questions[currentIndex];
    if (!currentQ) return null;
    const categories = [...new Set(questions.map(q => q.category))];
    const currentCategory = currentQ.category;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm font-bold text-muted-foreground">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <div className="text-center mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${CATEGORY_COLORS[currentCategory] || "bg-primary"}`}>
            {currentCategory}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold mb-8 leading-relaxed">
              {currentQ.text}
            </h3>

            <div className="flex justify-center gap-3 md:gap-5 flex-wrap">
              {FACE_EMOJIS.map(face => (
                <button
                  key={face.value}
                  type="button"
                  onClick={() => {
                    setAnswers(prev => ({ ...prev, [currentQ.key]: face.value }));
                    if (currentIndex < questions.length - 1) {
                      setTimeout(() => setCurrentIndex(i => i + 1), 300);
                    }
                  }}
                  className={`flex flex-col items-center p-3 md:p-4 rounded-2xl border-2 transition-all min-w-[60px] ${
                    answers[currentQ.key] === face.value
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-border hover:border-primary/30 hover:scale-105"
                  }`}
                >
                  <span className="text-3xl md:text-4xl">{face.emoji}</span>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1">{face.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            size="sm"
          >
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>

          {currentIndex === questions.length - 1 && allAnswered ? (
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Sending..." : "All done!"}
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              size="sm"
            >
              Skip <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const grouped: Record<string, typeof questions> = {};
  for (const q of questions) {
    if (!grouped[q.category]) grouped[q.category] = [];
    grouped[q.category].push(q);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm font-bold text-muted-foreground">{progress}%</span>
      </div>

      {Object.entries(grouped).map(([category, qs]) => (
        <div key={category}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category] || "bg-primary"}`} />
            {category}
          </h3>
          <div className="space-y-4">
            {qs.map(q => (
              <div key={q.key} className="p-4 rounded-xl border border-border bg-card">
                <p className="font-medium mb-3">{q.text}</p>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAnswers(prev => ({ ...prev, [q.key]: val }))}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                        answers[q.key] === val
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
                  <span>{q.scale.low}</span>
                  <span>{q.scale.high}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!allAnswered || submitMutation.isPending}
          size="lg"
        >
          {submitMutation.isPending ? "Submitting..." : `Submit Responses (${Object.keys(answers).length}/${questions.length})`}
        </Button>
      </div>
      {submitMutation.isError && (
        <p className="text-destructive text-sm" role="alert">{(submitMutation.error as Error).message}</p>
      )}
    </div>
  );
}

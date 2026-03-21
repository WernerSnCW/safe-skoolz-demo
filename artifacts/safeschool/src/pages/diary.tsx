import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui-polished";
import { BookHeart, Trash2, Plus, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

const MOODS = [
  { value: 1, emoji: "\uD83D\uDE1E", label: "Really bad", color: "bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800" },
  { value: 2, emoji: "\uD83D\uDE1F", label: "Not great", color: "bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800" },
  { value: 3, emoji: "\uD83D\uDE10", label: "Okay", color: "bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800" },
  { value: 4, emoji: "\uD83D\uDE0A", label: "Good", color: "bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-800" },
  { value: 5, emoji: "\uD83D\uDE04", label: "Great!", color: "bg-emerald-100 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" },
];

function getMoodInfo(mood: number) {
  return MOODS.find(m => m.value === mood) || MOODS[2];
}

function groupEntriesByDate(entries: any[]) {
  const groups: Record<string, any[]> = {};
  for (const entry of entries) {
    const date = new Date(entry.createdAt).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
  }
  return Object.entries(groups);
}

export default function DiaryPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (user?.role !== "pupil") {
    setLocation("/");
    return null;
  }
  const [showForm, setShowForm] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/diary/entries"],
    queryFn: async () => {
      const token = localStorage.getItem("safeschool_token");
      const res = await fetch("/api/diary/entries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("safeschool_token");
      const res = await fetch("/api/diary/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mood: selectedMood, note: note.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary/entries"] });
      setShowForm(false);
      setSelectedMood(null);
      setNote("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("safeschool_token");
      const res = await fetch(`/api/diary/entries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary/entries"] });
    },
  });

  const toggleDay = (day: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const grouped = groupEntriesByDate(entries);
  const todayStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const hasEntryToday = entries.some((e: any) => {
    const d = new Date(e.createdAt).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    return d === todayStr;
  });

  const recentMoods = entries.slice(0, 14).map((e: any) => e.mood);
  const avgMood = recentMoods.length > 0
    ? (recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-lg w-48" />
        <div className="h-48 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <BookHeart className="text-pink-500" size={32} />
            My Feelings Diary
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Lock size={14} className="text-muted-foreground" />
            Private — only you and your parent can see this
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Plus size={16} className="mr-1" />
            {hasEntryToday ? "Add another" : "How am I feeling?"}
          </Button>
        )}
      </div>

      {avgMood && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="text-3xl">{getMoodInfo(Math.round(Number(avgMood))).emoji}</div>
          <div>
            <p className="text-sm font-bold">Recent average: {avgMood} / 5</p>
            <p className="text-xs text-muted-foreground">Based on your last {recentMoods.length} {recentMoods.length === 1 ? "entry" : "entries"}</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-pink-200 dark:border-pink-900/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 pb-3 border-b border-pink-100 dark:border-pink-900/30">
                <CardTitle className="text-lg">How are you feeling right now?</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-3">Pick a mood</p>
                  <div className="flex justify-center gap-3">
                    {MOODS.map(mood => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setSelectedMood(mood.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-w-[68px] ${
                          selectedMood === mood.value
                            ? `${mood.color} scale-110 shadow-md`
                            : "border-border hover:border-pink-300 hover:bg-muted/30"
                        }`}
                      >
                        <span className="text-3xl">{mood.emoji}</span>
                        <span className="text-[11px] font-bold">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-2">
                    Want to write about it? (optional)
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-sm focus-visible:outline-none focus-visible:border-pink-400 focus-visible:ring-4 focus-visible:ring-pink-100 dark:focus-visible:ring-pink-950/30 transition-all resize-none"
                    placeholder="What happened today? How does it make you feel?"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {note.length}/1000
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedMood(null);
                      setNote("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={!selectedMood || createMutation.isPending}
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                  >
                    {createMutation.isPending ? "Saving..." : "Save to diary"}
                  </Button>
                </div>

                {createMutation.isError && (
                  <p className="text-destructive text-xs text-center">Could not save. Please try again.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 && !showForm ? (
        <Card>
          <CardContent className="p-10 text-center">
            <BookHeart size={48} className="mx-auto text-pink-300 mb-4" />
            <h3 className="text-lg font-bold mb-2">Your diary is empty</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Start writing about how you feel. It's completely private and only your parent can see it.
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-pink-500 hover:bg-pink-600">
              <Plus size={16} className="mr-1" /> Write my first entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(([date, dayEntries]) => {
            const isExpanded = expandedDays.has(date) || date === todayStr;
            return (
              <Card key={date}>
                <button
                  type="button"
                  onClick={() => toggleDay(date)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {dayEntries.map((e: any) => (
                        <span key={e.id} className="text-xl">{getMoodInfo(e.mood).emoji}</span>
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{date === todayStr ? "Today" : date}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {dayEntries.map((entry: any) => {
                          const moodInfo = getMoodInfo(entry.mood);
                          return (
                            <div
                              key={entry.id}
                              className={`p-4 rounded-xl border-2 ${moodInfo.color}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{moodInfo.emoji}</span>
                                  <div>
                                    <p className="font-bold text-sm">{moodInfo.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(entry.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm("Delete this diary entry?")) {
                                      deleteMutation.mutate(entry.id);
                                    }
                                  }}
                                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                  aria-label="Delete entry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              {entry.note && (
                                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                                  {entry.note}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

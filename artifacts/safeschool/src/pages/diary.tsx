import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui-polished";
import { Trash2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { value: 1, emoji: "\uD83D\uDE22", label: "Sad" },
  { value: 2, emoji: "\uD83D\uDE1F", label: "Worried" },
  { value: 3, emoji: "\uD83D\uDE10", label: "Meh" },
  { value: 4, emoji: "\uD83D\uDE0A", label: "Happy" },
  { value: 5, emoji: "\uD83E\uDD29", label: "Amazing" },
];

const EXTRA_EMOJIS = [
  "\uD83D\uDE21", "\uD83D\uDE30", "\uD83D\uDE34", "\uD83E\uDD14",
  "\uD83D\uDE0D", "\uD83E\uDD2F", "\uD83D\uDE2D", "\uD83E\uDD17",
  "\uD83D\uDE24", "\uD83E\uDD73", "\uD83D\uDE31", "\uD83D\uDE44",
];

const PROMPTS = [
  "What happened today?",
  "Something on your mind?",
  "How was your day?",
  "What made you feel this way?",
  "Anything you want to remember?",
  "What are you looking forward to?",
  "Did something good happen?",
  "Is anything worrying you?",
];

function getMoodInfo(mood: number) {
  return MOODS.find(m => m.value === mood) || MOODS[2];
}

function getRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return date.toLocaleDateString("en-GB", { weekday: "long" });
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function groupEntriesByDate(entries: any[]) {
  const groups: Record<string, any[]> = {};
  for (const entry of entries) {
    const key = new Date(entry.createdAt).toLocaleDateString("en-GB");
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return Object.entries(groups);
}

export default function DiaryPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (user?.role !== "pupil") {
    setLocation("/");
    return null;
  }

  const [isWriting, setIsWriting] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [showExtraEmojis, setShowExtraEmojis] = useState(false);
  const [currentPrompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

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
      setIsWriting(false);
      setSelectedMood(null);
      setNote("");
      setShowExtraEmojis(false);
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

  useEffect(() => {
    if (isWriting && selectedMood && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isWriting, selectedMood]);

  const grouped = groupEntriesByDate(entries);
  const firstName = user?.firstName || "";
  const todayFull = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (isLoading) {
    return (
      <div className="diary-page max-w-lg mx-auto px-4 py-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-amber-100/50 rounded w-40" />
          <div className="h-48 bg-amber-50/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="diary-page max-w-lg mx-auto px-4 py-4">
      <style>{`
        .diary-page {
          font-family: 'Georgia', 'Times New Roman', 'Palatino', serif;
        }
        .diary-paper {
          background: linear-gradient(to bottom, transparent 27px, #e8d5b7 28px);
          background-size: 100% 28px;
          background-color: #fdf6e3;
          border: 1px solid #d4c4a0;
          border-radius: 8px;
          box-shadow: 2px 3px 12px rgba(139, 119, 80, 0.15), inset 0 0 40px rgba(139, 119, 80, 0.04);
          position: relative;
        }
        .diary-paper::before {
          content: '';
          position: absolute;
          left: 40px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #e8b4b8;
          opacity: 0.5;
        }
        .dark .diary-paper {
          background: linear-gradient(to bottom, transparent 27px, #3d3520 28px);
          background-size: 100% 28px;
          background-color: #2a2316;
          border-color: #4a3f2e;
          box-shadow: 2px 3px 12px rgba(0,0,0,0.3);
        }
        .dark .diary-paper::before {
          background: #6b3a3e;
        }
        .diary-cover {
          background: linear-gradient(135deg, #8B4513 0%, #654321 50%, #8B4513 100%);
          border: 2px solid #5a3210;
          border-radius: 10px;
          box-shadow: 3px 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          color: #f5e6c8;
          position: relative;
          overflow: hidden;
        }
        .diary-cover::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
        }
        .diary-entry-text {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 28px;
          color: #2c1810;
        }
        .dark .diary-entry-text {
          color: #d4c4a0;
        }
        .diary-date-tab {
          background: #d4a574;
          color: #3d2b1a;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 10px;
          border-radius: 0 0 6px 6px;
          display: inline-block;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .dark .diary-date-tab {
          background: #5a4530;
          color: #d4c4a0;
        }
      `}</style>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
              My Diary
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "#8B7355" }}>
              <Lock size={11} />
              <span>Private — only you and your parent can see this</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isWriting ? (
          <motion.div
            key="closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => setIsWriting(true)}
              className="w-full text-left diary-cover p-6 mb-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="text-center relative z-10">
                <p className="text-2xl mb-2">📖</p>
                <p className="font-bold text-base" style={{ fontFamily: "'Georgia', serif" }}>
                  {firstName ? `${firstName}'s Diary` : "My Diary"}
                </p>
                <p className="text-xs mt-2 opacity-70">{todayFull}</p>
                <p className="text-xs mt-3 opacity-60 italic">tap to write...</p>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="diary-paper p-5 pl-12 mb-6">
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8B7355" }}>
                  {todayFull}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#a89880" }}>
                  {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: "#5a4a3a" }}>How I'm feeling:</p>
                <div className="flex gap-1">
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all min-w-[48px] ${
                        selectedMood === mood.value
                          ? "bg-amber-100 dark:bg-amber-900/30 scale-110 shadow-sm ring-2 ring-amber-300 dark:ring-amber-700"
                          : "hover:bg-amber-50 dark:hover:bg-amber-950/20"
                      }`}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                      <span className="text-[9px]" style={{ color: "#8B7355" }}>{mood.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowExtraEmojis(!showExtraEmojis)}
                  className="text-[10px] mt-1.5 underline cursor-pointer"
                  style={{ color: "#a89880" }}
                >
                  {showExtraEmojis ? "less" : "more feelings..."}
                </button>

                <AnimatePresence>
                  {showExtraEmojis && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1 mt-2">
                        {EXTRA_EMOJIS.map((emoji, i) => (
                          <span key={i} className="text-lg cursor-default" title="Express yourself">{emoji}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {selectedMood !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-xs italic mb-2" style={{ color: "#a89880" }}>
                      {currentPrompt}
                    </p>
                    <textarea
                      ref={textareaRef}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={6}
                      maxLength={1000}
                      className="diary-entry-text w-full bg-transparent border-none outline-none resize-none text-sm p-0"
                      placeholder="Dear diary..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px]" style={{ color: "#a89880" }}>
                        {note.length > 0 ? `${note.length}/1000` : ""}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px dashed #d4c4a0" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsWriting(false);
                    setSelectedMood(null);
                    setNote("");
                    setShowExtraEmojis(false);
                  }}
                  className="text-xs px-3 py-1.5 rounded"
                  style={{ color: "#8B7355" }}
                >
                  Cancel
                </button>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!selectedMood || createMutation.isPending}
                  size="sm"
                  className="flex-1 text-xs"
                  style={{ background: "#8B4513", borderColor: "#654321" }}
                >
                  {createMutation.isPending ? "Saving..." : "Save entry ✓"}
                </Button>
              </div>

              {createMutation.isError && (
                <p className="text-red-600 text-xs text-center mt-2">Could not save. Please try again.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 && !isWriting && (
        <div className="text-center py-6">
          <p className="text-sm italic" style={{ color: "#a89880" }}>
            Your diary is empty — tap the cover above to start writing
          </p>
        </div>
      )}

      {grouped.length > 0 && (
        <div className="space-y-3">
          {grouped.map(([dateKey, dayEntries]) => {
            const firstEntry = dayEntries[0];
            const relDate = getRelativeDate(firstEntry.createdAt);

            return (
              <div key={dateKey}>
                <div className="diary-date-tab mb-0 ml-4">{relDate}</div>
                <div className="diary-paper pl-12 pr-5 py-4 space-y-4">
                  {dayEntries.map((entry: any) => {
                    const moodInfo = getMoodInfo(entry.mood);
                    const time = new Date(entry.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit", minute: "2-digit",
                    });

                    return (
                      <div key={entry.id} className="group">
                        <div className="flex items-start gap-2">
                          <span className="text-lg mt-0.5">{moodInfo.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] block mb-0.5" style={{ color: "#a89880" }}>
                              {time}
                            </span>
                            {entry.note ? (
                              <p className="diary-entry-text text-sm whitespace-pre-wrap">
                                {entry.note}
                              </p>
                            ) : (
                              <p className="text-xs italic" style={{ color: "#b8a890" }}>
                                {moodInfo.label} — no note
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Delete this entry?")) {
                                deleteMutation.mutate(entry.id);
                              }
                            }}
                            className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all p-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 rounded"
                            style={{ color: "#a89880" }}
                            aria-label="Delete entry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

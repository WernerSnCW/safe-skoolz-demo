import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui-polished";
import { MessageCircle, Send, ArrowLeft, Zap, AlertTriangle, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

function ConversationList({ onSelect, selectedId }: { onSelect: (id: string) => void; selectedId: string | null }) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
    queryFn: async () => {
      const token = localStorage.getItem("safeschool_token");
      const res = await fetch("/api/messages/conversations", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000,
  });

  if (isLoading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>;

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle size={48} className="mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground font-medium">No messages yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">When pupils send you messages, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv: any) => (
        <button
          key={conv.contactId}
          type="button"
          onClick={() => onSelect(conv.contactId)}
          className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-all text-left ${
            selectedId === conv.contactId ? "bg-primary/5 border-l-2 border-primary" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            {conv.contactName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm truncate">{conv.contactName}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(conv.lastMessageAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {conv.lastMessageType === "urgent_help" && <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">URGENT</span>}
              {conv.lastMessageType === "chat_request" && <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">CHAT REQ</span>}
              {conv.lastMessagePriority === "important" && conv.lastMessageType === "message" && <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">IMPORTANT</span>}
              <p className="text-xs text-muted-foreground truncate">
                {conv.lastMessageIsFromMe ? "You: " : ""}{conv.lastMessage}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{conv.contactRole} {conv.contactClass ? `· ${conv.contactClass}` : ""}</p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {conv.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function ConversationThread({ contactId }: { contactId: string }) {
  const [reply, setReply] = useState("");
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages", contactId],
    queryFn: async () => {
      const token = localStorage.getItem("safeschool_token");
      const res = await fetch(`/api/messages?contactId=${contactId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000,
  });

  const markedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!messages) return;
    const unread = messages.filter((m: any) => !m.readAt && !m.isFromMe && !markedRef.current.has(m.id));
    if (unread.length === 0) return;
    const token = localStorage.getItem("safeschool_token");
    for (const m of unread) {
      markedRef.current.add(m.id);
      fetch(`/api/messages/${m.id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } })
        .then(() => queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] }));
    }
  }, [messages]);

  const sendReply = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("safeschool_token");
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientId: contactId, body: reply.trim(), priority: "normal", type: "message" }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", contactId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  const sortedMessages = [...(messages || [])].reverse();
  const contactName = sortedMessages.find((m: any) => !m.isFromMe)?.senderName || sortedMessages[0]?.recipientName || "Student";

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/20">
        <h3 className="font-bold text-lg">{contactName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedMessages.map((m: any) => (
          <div key={m.id} className={`flex ${m.isFromMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              m.isFromMe
                ? "bg-primary text-primary-foreground rounded-br-md"
                : m.type === "urgent_help"
                  ? "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-200 rounded-bl-md border border-red-200 dark:border-red-800"
                  : m.type === "chat_request"
                    ? "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 rounded-bl-md border border-blue-200 dark:border-blue-800"
                    : m.priority === "important"
                      ? "bg-amber-50 dark:bg-amber-950/20 text-foreground rounded-bl-md border border-amber-200 dark:border-amber-800"
                      : "bg-muted text-foreground rounded-bl-md"
            }`}>
              {m.type === "urgent_help" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={14} />
                  <span className="text-xs font-bold uppercase">Urgent help request</span>
                </div>
              )}
              {m.type === "chat_request" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageCircle size={14} />
                  <span className="text-xs font-bold uppercase">Chat request</span>
                </div>
              )}
              <p className="text-sm">{m.body}</p>
              {m.location && (
                <div className="flex items-center gap-1 mt-1.5 text-xs opacity-70">
                  <MapPin size={12} />
                  {m.location.replace(/_/g, " ")}
                </div>
              )}
              <div className="flex items-center gap-1 mt-1.5">
                <Clock size={10} className="opacity-50" />
                <span className="text-[10px] opacity-50">{formatDate(m.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={e => { e.preventDefault(); if (reply.trim()) sendReply.mutate(); }} className="flex gap-2">
          <input
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
          />
          <Button type="submit" disabled={!reply.trim() || sendReply.isPending} size="default">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  if (!user) return null;

  const staffRoles = ["teacher", "head_of_year", "senco", "coordinator", "head_teacher", "support_staff"];
  if (!staffRoles.includes(user.role || "")) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Messages are available for staff members.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">View and respond to pupil messages</p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[600px]">
          <div className={`${selectedContactId ? "hidden md:block" : ""} w-full md:w-80 border-r border-border overflow-y-auto`}>
            <ConversationList onSelect={setSelectedContactId} selectedId={selectedContactId} />
          </div>
          <div className={`${selectedContactId ? "" : "hidden md:flex"} flex-1 flex flex-col`}>
            {selectedContactId ? (
              <>
                <div className="md:hidden p-2 border-b border-border">
                  <button onClick={() => setSelectedContactId(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>
                <ConversationThread contactId={selectedContactId} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle size={48} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-medium">Select a conversation</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Choose a pupil from the list to view their messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

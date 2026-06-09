"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircleIcon,
  SendIcon,
  BotIcon,
  RefreshCwIcon,
  SearchIcon,
  CheckCheckIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { firebaseReady } from "@/lib/firebase";
import {
  subscribeToAllThreads,
  subscribeToMessages,
  sendMessage,
  markThreadRead,
  type ChatThread,
  type ChatMessage,
} from "@/lib/firebase-chat";
import { PageHeader, AvatarBadge } from "@/components/meridian/primitives";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeLabel(date: Date | null): string {
  if (!date) return "";
  const now = Date.now();
  const diff = now - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (min < 1440) return `${Math.floor(min / 60)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Not configured ───────────────────────────────────────────────────────────

function NotConfigured() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 grid place-items-center">
        <MessageCircleIcon className="h-7 w-7 text-amber-500" />
      </div>
      <div>
        <div className="text-[14px] font-semibold text-gray-600 dark:text-gray-300">
          Firebase not configured
        </div>
        <div className="text-[12px] text-gray-400 mt-1.5 max-w-xs">
          Add your Firebase project credentials to{" "}
          <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
            .env
          </code>{" "}
          to enable live chat.
        </div>
        <div className="mt-3 text-[11.5px] text-gray-400 space-y-0.5">
          {[
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            "NEXT_PUBLIC_FIREBASE_APP_ID",
          ].map((k) => (
            <div
              key={k}
              className="font-mono bg-gray-100 dark:bg-white/8 rounded px-2 py-0.5 inline-block mx-0.5"
            >
              {k}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Thread list item ─────────────────────────────────────────────────────────

function ThreadItem({
  thread,
  active,
  onClick,
}: {
  thread: ChatThread;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition border-b border-gray-100 dark:border-white/8 last:border-0",
        active
          ? "bg-indigo-50 dark:bg-indigo-950/30"
          : "hover:bg-gray-50 dark:hover:bg-white/5",
      )}
    >
      <AvatarBadge name={thread.userName} size={36} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold truncate">
            {thread.userName}
          </span>
          <span className="text-[10.5px] text-gray-400 shrink-0">
            {timeLabel(thread.lastMessageAt)}
          </span>
        </div>
        <div className="text-[11.5px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {thread.lastMessage || "No messages yet"}
        </div>
      </div>
      {thread.unreadByAdmin > 0 && (
        <span className="h-5 min-w-5 px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">
          {thread.unreadByAdmin > 9 ? "9+" : thread.unreadByAdmin}
        </span>
      )}
    </button>
  );
}

// ─── Message bubble (admin view) ──────────────────────────────────────────────

function AdminBubble({ msg }: { msg: ChatMessage }) {
  const isAdmin = msg.sender === "admin";
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        isAdmin ? "items-end" : "items-start",
      )}
    >
      {!isAdmin && (
        <div className="flex items-center gap-1.5 px-1">
          <AvatarBadge name={msg.senderName} size={18} />
          <span className="text-[10.5px] text-gray-500 font-medium">
            {msg.senderName}
          </span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed",
          isAdmin
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-gray-100 rounded-bl-sm",
        )}
      >
        {msg.content}
      </div>
      <div
        className={cn(
          "flex items-center gap-1 px-1",
          isAdmin ? "flex-row-reverse" : "",
        )}
      >
        <span className="text-[10px] text-gray-400">
          {msg.createdAt?.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }) ?? ""}
        </span>
        {isAdmin && <CheckCheckIcon className="h-3 w-3 text-indigo-400" />}
      </div>
    </div>
  );
}

// ─── Admin chat page ──────────────────────────────────────────────────────────

export function AdminChatPage() {
  const adminUser = useAuth();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActive] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const totalUnread = threads.reduce((s, t) => s + t.unreadByAdmin, 0);

  // Subscribe to all threads
  useEffect(() => {
    if (!firebaseReady) return;
    return subscribeToAllThreads(setThreads);
  }, []);

  // Subscribe to active thread's messages
  useEffect(() => {
    if (!firebaseReady || !activeThread) return;
    setMessages([]);
    const unsub = subscribeToMessages(activeThread.userId, setMessages);
    markThreadRead(activeThread.userId).catch(() => {});
    return unsub;
  }, [activeThread?.userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update active thread data when threads list refreshes
  useEffect(() => {
    if (!activeThread) return;
    const fresh = threads.find((t) => t.userId === activeThread.userId);
    if (fresh) setActive(fresh);
  }, [threads]);

  async function handleSend() {
    if (!input.trim() || !activeThread || !firebaseReady || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await sendMessage({
        userId: activeThread.userId,
        userName: activeThread.userName,
        userEmail: activeThread.userEmail,
        content: text,
        sender: "admin",
        senderName: adminUser.name,
      });
    } catch (e) {
      console.error("Admin send error:", e);
    } finally {
      setSending(false);
    }
  }

  const filteredThreads = threads.filter(
    (t) =>
      !search ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        eyebrow="Admin · Support"
        title="Live chat."
        subtitle={
          firebaseReady
            ? `${threads.length} conversations${totalUnread > 0 ? ` · ${totalUnread} unread` : ""}`
            : "Firebase not configured"
        }
        actions={
          totalUnread > 0 ? (
            <span className="text-[10.5px] font-bold px-2.5 py-1 bg-rose-500 text-white rounded-full animate-pulse">
              {totalUnread} unread
            </span>
          ) : undefined
        }
      />

      {!firebaseReady ? (
        <NotConfigured />
      ) : (
        <div
          className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden"
          style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
        >
          <div className="flex h-full">
            {/* ── Left: thread list ── */}
            <div
              className={cn(
                "shrink-0 border-r border-gray-200 dark:border-white/10 flex flex-col h-full",
                "w-full md:w-70",
                activeThread ? "hidden md:flex" : "flex",
              )}
            >
              {/* Search */}
              <div className="px-3 py-3 border-b border-gray-100 dark:border-white/8">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 h-8">
                  <SearchIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <input
                    className="flex-1 bg-transparent text-[12px] placeholder:text-gray-400 outline-none"
                    placeholder="Search users…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Threads */}
              <div className="flex-1 overflow-y-auto">
                {filteredThreads.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageCircleIcon className="h-8 w-8 text-gray-200 dark:text-white/10 mx-auto mb-2" />
                    <div className="text-[12px] text-gray-400">
                      {search ? "No matches" : "No conversations yet"}
                    </div>
                  </div>
                ) : (
                  filteredThreads.map((t) => (
                    <ThreadItem
                      key={t.userId}
                      thread={t}
                      active={activeThread?.userId === t.userId}
                      onClick={() => setActive(t)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ── Right: message pane ── */}
            <div
              className={cn(
                "flex-1 flex flex-col h-full min-w-0",
                activeThread ? "flex" : "hidden md:flex",
              )}
            >
              {!activeThread ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 grid place-items-center">
                    <MessageCircleIcon className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-gray-600 dark:text-gray-300">
                      Select a conversation
                    </div>
                    <div className="text-[12.5px] text-gray-400 mt-1">
                      Choose a user from the left to view and reply to their
                      messages.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Conversation header */}
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/8 shrink-0">
                    <button
                      onClick={() => setActive(null)}
                      className="md:hidden h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition grid place-items-center shrink-0 -ml-1"
                    >
                      <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
                    </button>
                    <AvatarBadge name={activeThread.userName} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold truncate">
                        {activeThread.userName}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">
                        {activeThread.userEmail}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] text-gray-500">Live</span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scroll-smooth">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <BotIcon className="h-8 w-8 text-gray-200 dark:text-white/10" />
                        <div className="text-[12.5px] text-gray-400">
                          No messages yet. The user hasn&apos;t sent anything.
                        </div>
                      </div>
                    ) : (
                      messages.map((m) => <AdminBubble key={m.id} msg={m} />)
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply input */}
                  <div className="border-t border-gray-100 dark:border-white/10 px-4 py-3 flex items-center gap-2 shrink-0">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={`Reply to ${activeThread.userName}…`}
                      disabled={sending}
                      className="flex-1 bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition grid place-items-center shrink-0"
                    >
                      {sending ? (
                        <RefreshCwIcon className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <SendIcon className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

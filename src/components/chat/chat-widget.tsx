"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircleIcon, XIcon, SendIcon, MinusIcon, BotIcon, ImagePlusIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SITE_TITLE } from "@/lib/site"
import { useAuth } from "@/contexts/auth-context"
import { firebaseReady } from "@/lib/firebase"
import {
  subscribeToMessages,
  sendMessage,
  type ChatMessage,
} from "@/lib/firebase-chat"

// ─── Timestamp helper ─────────────────────────────────────────────────────────

function timeLabel(date: Date | null): string {
  if (!date) return ""
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.sender === "user"
  return (
    <div className={cn("flex flex-col gap-0.5", isUser ? "items-end" : "items-start")}>
      {!isUser && (
        <div className="flex items-center gap-1.5 px-1">
          <div className="h-5 w-5 rounded-full bg-indigo-600 grid place-items-center shrink-0">
            <BotIcon className="h-3 w-3 text-white" />
          </div>
          <span className="text-[10.5px] text-gray-500 font-medium">{msg.senderName}</span>
        </div>
      )}
      <div className={cn(
        "max-w-[85%] rounded-2xl text-[13px] leading-relaxed overflow-hidden",
        msg.attachmentId ? "" : "px-3.5 py-2.5",
        isUser
          ? "bg-indigo-600 text-white rounded-br-sm"
          : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-gray-100 rounded-bl-sm"
      )}>
        {msg.attachmentId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/chat/attachments/${msg.attachmentId}`}
            alt="Attachment"
            className="block max-w-full max-h-60 object-contain"
          />
        )}
        {msg.content && (
          <div className={msg.attachmentId ? "px-3.5 py-2.5" : ""}>{msg.content}</div>
        )}
      </div>
      <span className={cn(
        "text-[10.5px] text-gray-400 px-1",
        isUser ? "text-right" : "text-left"
      )}>
        {timeLabel(msg.createdAt)}
      </span>
    </div>
  )
}

// ─── Not configured placeholder ───────────────────────────────────────────────

function NotConfigured() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 grid place-items-center">
        <MessageCircleIcon className="h-6 w-6 text-amber-600" />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Chat not configured</div>
        <div className="text-[11.5px] text-gray-400 mt-1">
          Add Firebase credentials to <code className="bg-gray-100 dark:bg-white/10 px-1 rounded">.env</code> to enable live chat.
        </div>
      </div>
    </div>
  )
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export function ChatWidget() {
  const user = useAuth()
  const [open, setOpen]         = useState(false)
  const [minimized, setMin]     = useState(false)
  const [input, setInput]       = useState("")
  const [sending, setSending]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [unread, setUnread]     = useState(0)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)
  const fileInputRef             = useRef<HTMLInputElement>(null)

  // Subscribe to messages
  useEffect(() => {
    if (!firebaseReady) return
    const unsub = subscribeToMessages(user.id, (msgs) => {
      setMessages(msgs)
      // Count unread admin messages when chat is closed
      if (!open) {
        const adminMsgs = msgs.filter((m) => m.sender === "admin")
        setUnread((prev) => {
          const newCount = adminMsgs.length
          return newCount > prev ? newCount : prev
        })
      }
    })
    return unsub
  }, [user.id, open])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, open, minimized])

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, minimized])

  function handleOpen() {
    setOpen(true)
    setMin(false)
    setUnread(0)
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || sending || !firebaseReady) return
    setInput("")
    setSending(true)
    try {
      await sendMessage({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        content: text,
        sender: "user",
        senderName: user.name,
      })
    } catch (e) {
      console.error("Chat send error:", e)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || uploading || !firebaseReady) return

    const caption = input.trim()
    setInput("")
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("chatUserId", user.id)
      const res = await fetch("/api/chat/attachments", { method: "POST", body: form })
      if (!res.ok) throw new Error("Upload failed")
      const attachment = await res.json() as { id: string; mimeType: string }

      await sendMessage({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        content: caption,
        sender: "user",
        senderName: user.name,
        attachmentId: attachment.id,
        attachmentMimeType: attachment.mimeType,
      })
    } catch (err) {
      console.error("Chat attachment upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className={cn(
          "w-[calc(100vw-24px)] sm:w-[360px] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-gray-900 flex flex-col overflow-hidden transition-all duration-200",
          minimized ? "h-14" : "h-[min(520px,calc(100dvh-100px))]"
        )}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white shrink-0">
            <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center shrink-0">
              <BotIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold leading-tight">{SITE_TITLE} Support</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10.5px] text-white/75">
                  {firebaseReady ? "Live · typically replies in minutes" : "Offline"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setMin((v) => !v)}
              className="text-white/70 hover:text-white transition shrink-0 p-1"
              title={minimized ? "Expand" : "Minimize"}
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition shrink-0 p-1"
              title="Close"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
                {!firebaseReady ? (
                  <NotConfigured />
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 grid place-items-center">
                      <MessageCircleIcon className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Hi, {user.name.split(" ")[0]} 👋</div>
                      <div className="text-[12px] text-gray-400 mt-1 max-w-[220px]">
                        Send a message and your teacher will respond here.
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((m) => <Bubble key={m.id} msg={m} />)
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 dark:border-white/10 px-3 py-3 flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!firebaseReady || uploading}
                  title="Attach image"
                  className="h-9 w-9 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition grid place-items-center shrink-0"
                >
                  {uploading ? (
                    <Loader2Icon className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <ImagePlusIcon className="h-4.5 w-4.5" />
                  )}
                </button>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={firebaseReady ? "Type a message…" : "Firebase not configured"}
                  disabled={!firebaseReady || sending}
                  className="flex-1 bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-[13px] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !firebaseReady || sending}
                  className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition grid place-items-center shrink-0"
                >
                  <SendIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating bubble */}
      {!open && (
        <button
          onClick={handleOpen}
          className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 grid place-items-center relative group"
          title="Open support chat"
        >
          <MessageCircleIcon className="h-6 w-6 text-white" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center animate-bounce">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
    </div>
  )
}

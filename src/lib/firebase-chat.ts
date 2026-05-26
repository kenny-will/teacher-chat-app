import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  increment,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "admin"
  senderName: string
  createdAt: Date | null
}

export interface ChatThread {
  userId: string
  userName: string
  userEmail: string
  lastMessage: string
  lastMessageAt: Date | null
  unreadByAdmin: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(ts: unknown): Date | null {
  if (!ts) return null
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return null
}

// ─── Subscribe to messages in a thread ───────────────────────────────────────

export function subscribeToMessages(
  userId: string,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe {
  if (!db) return () => {}
  const q = query(
    collection(db, "chats", userId, "messages"),
    orderBy("createdAt", "asc"),
  )
  return onSnapshot(q, (snap) => {
    const msgs: ChatMessage[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        content: data.content ?? "",
        sender: data.sender ?? "user",
        senderName: data.senderName ?? "",
        createdAt: toDate(data.createdAt),
      }
    })
    callback(msgs)
  })
}

// ─── Send a message ───────────────────────────────────────────────────────────

export async function sendMessage(params: {
  userId: string
  userName: string
  userEmail: string
  content: string
  sender: "user" | "admin"
  senderName: string
}): Promise<void> {
  if (!db) throw new Error("Firebase not configured")

  const { userId, userName, userEmail, content, sender, senderName } = params

  // Write message to subcollection
  await addDoc(collection(db, "chats", userId, "messages"), {
    content,
    sender,
    senderName,
    createdAt: serverTimestamp(),
  })

  // Upsert thread metadata
  await setDoc(
    doc(db, "chats", userId),
    {
      userId,
      userName,
      userEmail,
      lastMessage: content,
      lastSender: sender,
      lastMessageAt: serverTimestamp(),
      unreadByAdmin: sender === "user" ? increment(1) : 0,
    },
    { merge: true },
  )
}

// ─── Subscribe to all chat threads (admin inbox) ──────────────────────────────

export function subscribeToAllThreads(
  callback: (threads: ChatThread[]) => void,
): Unsubscribe {
  if (!db) return () => {}
  const q = query(collection(db, "chats"), orderBy("lastMessageAt", "desc"))
  return onSnapshot(q, (snap) => {
    const threads: ChatThread[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        userId: data.userId ?? d.id,
        userName: data.userName ?? "Unknown",
        userEmail: data.userEmail ?? "",
        lastMessage: data.lastMessage ?? "",
        lastSender: data.lastSender ?? "user",
        lastMessageAt: toDate(data.lastMessageAt),
        unreadByAdmin: data.unreadByAdmin ?? 0,
      }
    })
    callback(threads)
  })
}

// ─── Mark thread as read by admin ─────────────────────────────────────────────

export async function markThreadRead(userId: string): Promise<void> {
  if (!db) return
  await setDoc(doc(db, "chats", userId), { unreadByAdmin: 0 }, { merge: true })
}
